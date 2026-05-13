// Timeline playback and transient event visual feedback.

const TimelinePlayer = {
  timers: [],
  transientTimers: [],
  itemFlashTokens: {},
  doorMotionToken: 0,
  scheduledEvents: [],
  startedAt: 0,
  pausedElapsed: 0,
  isPaused: false,

  start(events) {
    this.stop();
    this.scheduledEvents = events.map((event) => ({ event, played: false }));
    this.startedAt = performance.now();
    this.pausedElapsed = 0;
    this.isPaused = false;
    this.schedulePendingEvents(0);
  },

  schedulePendingEvents(elapsedSeconds) {
    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.timers = [];

    this.scheduledEvents.forEach((entry) => {
      if (entry.played) {
        return;
      }

      const delay = Math.max(0, (entry.event.time - elapsedSeconds) * 1000);
      const timerId = setTimeout(() => {
        if (this.isPaused || entry.played) {
          return;
        }

        entry.played = true;
        this.playEvent(entry.event);
      }, delay);

      this.timers.push(timerId);
    });
  },

  pause() {
    if (this.isPaused) {
      return;
    }

    this.pausedElapsed = Math.max(0, (performance.now() - this.startedAt) / 1000);
    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.timers = [];
    this.isPaused = true;
  },

  resume() {
    if (!this.isPaused) {
      return;
    }

    this.startedAt = performance.now() - this.pausedElapsed * 1000;
    this.isPaused = false;
    this.schedulePendingEvents(this.pausedElapsed);
  },

  stop() {
    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.transientTimers.forEach((timerId) => clearTimeout(timerId));
    this.timers = [];
    this.transientTimers = [];
    this.itemFlashTokens = {};
    this.doorMotionToken = 0;
    this.scheduledEvents = [];
    this.startedAt = 0;
    this.pausedElapsed = 0;
    this.isPaused = false;
  },

  playEvent(event) {
    if (GameState.phase !== "observe" || PauseManager.isPaused()) {
      return;
    }

    const doorLinkedEvents = ["customer_enter", "customer_exit", "door_auto_open"];

    if (!doorLinkedEvents.includes(event.type)) {
      SoundManager.play("event");
    }

    if (event.type === "customer_enter") {
      this.applyCustomerEnter(event);
    }

    if (event.type === "item_taken") {
      this.applyItemTaken(event);
    }

    if (event.type === "light_flash") {
      this.applyLightFlash(event);
    }

    if (event.type === "door_auto_open") {
      this.applyDoorAutoOpen(event);
    }

    if (event.type === "customer_exit") {
      this.applyCustomerExit(event);
    }

    if (event.type === "shelf_item_disappear") {
      this.applyShelfItemDisappear(event);
    }

    if (event.type === "clock_change") {
      this.applyClockChange(event);
    }

    if (event.type === "cashier_amount_change") {
      this.applyCashierAmountChange(event);
    }

    if (event.type === "monitor_shadow") {
      this.applyMonitorShadow(event);
    }
  },

  applyCustomerEnter(event) {
    const slot = DataConfig.areas.customerSlots[sceneState.customers.length % DataConfig.areas.customerSlots.length];
    const enterDelay = 170;

    this.triggerDoorMotion(1080);
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      customerId: event.customerId,
      color: event.color,
      customerColor: event.color,
      label: event.label
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip"], 1200);

    const timerId = setTimeout(() => {
      const existingCustomer = sceneState.customers.find((customer) => customer.id === event.customerId);

      if (!existingCustomer) {
        sceneState.customers.push({
          id: event.customerId,
          name: event.label,
          color: event.color,
          style: event.style,
          x: slot.x,
          y: slot.y
        });
      }

      sceneState.lastCustomerId = event.customerId;
      SceneRenderer.render(sceneState);
      this.clearTransientState(["lastCustomerId"], 900);
    }, enterDelay);

    this.transientTimers.push(timerId);
  },

  applyItemTaken(event) {
    const item = sceneState.items.find((sceneItem) => sceneItem.id === event.itemId);

    if (item && item.count > 0) {
      this.trackRemovingItem(event.id, event.itemId, "taken");
      item.count = Math.max(0, item.count - 1);

      if (item.area === "fridge") {
        sceneState.fridgeCount = Math.max(0, sceneState.fridgeCount - 1);
      }
    }

    sceneState.lastTakenItemId = event.itemId;
    this.markItemChanged(event.itemId);
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      customerId: event.customerId,
      item: event.item
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "lastTakenItemId"], 1200);
  },

  applyLightFlash(event) {
    sceneState.lightFlashCount += event.count;
    sceneState.lightState = `闪烁${sceneState.lightFlashCount}次`;
    sceneState.lightFlashActive = true;
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      count: event.count
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "lightFlashActive"], 900);
  },

  applyDoorAutoOpen(event) {
    this.triggerDoorMotion(1080);
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      count: event.count
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip"], 1100);
  },

  applyCustomerExit(event) {
    const exitingCustomer = sceneState.customers.find((customer) => customer.id === event.customerId);

    this.triggerDoorMotion(1080);

    if (exitingCustomer) {
      sceneState.departingCustomers = sceneState.departingCustomers
        .filter((customer) => customer.id !== event.customerId);
      sceneState.departingCustomers.push({ ...exitingCustomer });
    }

    sceneState.customers = sceneState.customers.filter((customer) => customer.id !== event.customerId);
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      customerId: event.customerId,
      color: event.color,
      label: event.label
    });

    SceneRenderer.render(sceneState);
    this.clearDepartingCustomer(event.customerId, 620);
    this.clearTransientState(["activeTip"], 1200);
  },

  triggerDoorMotion(duration = 1080) {
    const token = this.doorMotionToken + 1;

    this.doorMotionToken = token;
    sceneState.doorAutoOpenActive = true;
    SoundManager.play("doorChime");

    const timerId = setTimeout(() => {
      if (this.doorMotionToken !== token) {
        return;
      }

      sceneState.doorAutoOpenActive = false;
      SceneRenderer.render(sceneState);
    }, duration);

    this.transientTimers.push(timerId);
  },

  applyShelfItemDisappear(event) {
    const item = sceneState.items.find((sceneItem) => sceneItem.id === event.itemId);

    if (item && item.count > 0) {
      this.trackRemovingItem(event.id, event.itemId, "disappeared");
      item.count = Math.max(0, item.count - 1);
    }

    sceneState.lastDisappearedItemId = event.itemId;
    this.markItemChanged(event.itemId);
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      itemId: event.itemId,
      item: event.item
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "lastDisappearedItemId"], 1200);
  },

  applyClockChange(event) {
    sceneState.clockTime = event.clockTime;
    sceneState.highlightedInfo = "clock";
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      clockTime: event.clockTime
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "highlightedInfo"], 1200);
  },

  applyCashierAmountChange(event) {
    sceneState.cashierAmount = event.cashierAmount;
    sceneState.highlightedInfo = "cashier";
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      cashierAmount: event.cashierAmount
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "highlightedInfo"], 1200);
  },

  applyMonitorShadow(event) {
    sceneState.monitorState = "黑影出现";
    sceneState.monitorShadowActive = true;
    sceneState.monitorShadowLocation = event.location;
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      location: event.location
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "monitorShadowActive", "monitorShadowLocation"], 1100);
  },

  clearTransientState(keys, delay) {
    const timerId = setTimeout(() => {
      keys.forEach((key) => {
        if (typeof sceneState[key] === "boolean") {
          sceneState[key] = false;
        } else {
          sceneState[key] = "";
        }
      });

      SceneRenderer.render(sceneState);
    }, delay);

    this.transientTimers.push(timerId);
  },

  clearDepartingCustomer(customerId, delay) {
    const timerId = setTimeout(() => {
      sceneState.departingCustomers = sceneState.departingCustomers
        .filter((customer) => customer.id !== customerId);

      SceneRenderer.render(sceneState);
    }, delay);

    this.transientTimers.push(timerId);
  },

  trackRemovingItem(eventId, itemId, effect) {
    const item = sceneState.items.find((sceneItem) => sceneItem.id === itemId);

    if (!item) {
      return;
    }

    const removingItemId = `${eventId}-${effect}`;
    sceneState.removingItems = sceneState.removingItems
      .filter((removingItem) => removingItem.id !== removingItemId);
    sceneState.removingItems.push({
      id: removingItemId,
      itemId,
      type: item.type,
      effect
    });

    const timerId = setTimeout(() => {
      sceneState.removingItems = sceneState.removingItems
        .filter((removingItem) => removingItem.id !== removingItemId);

      SceneRenderer.render(sceneState);
    }, 680);

    this.transientTimers.push(timerId);
  },

  markItemChanged(itemId) {
    const token = (this.itemFlashTokens[itemId] || 0) + 1;
    this.itemFlashTokens[itemId] = token;
    sceneState.changedItemIds = sceneState.changedItemIds
      .filter((changedItemId) => changedItemId !== itemId);
    sceneState.changedItemIds.push(itemId);
    sceneState.itemFlashDuration = DifficultyManager.getItemFlashDuration(GameState.round);

    const flashTotalMs = Math.ceil(sceneState.itemFlashDuration * 2 * 1000);
    const timerId = setTimeout(() => {
      if (this.itemFlashTokens[itemId] !== token) {
        return;
      }

      sceneState.changedItemIds = sceneState.changedItemIds
        .filter((changedItemId) => changedItemId !== itemId);

      SceneRenderer.render(sceneState);
    }, flashTotalMs + 80);

    this.transientTimers.push(timerId);
  }
};

if (typeof window !== "undefined") {
  window.TimelinePlayer = TimelinePlayer;
}

