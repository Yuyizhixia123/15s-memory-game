// Round event generation logic.

const EventGenerator = {
  generate(round) {
    const virtualState = this.createVirtualState();
    const events = [];
    const eventCount = DifficultyManager.getEventCount(round);
    const allowedTypes = DifficultyManager.getAllowedEventTypes(round);
    const times = this.createEventTimes(eventCount, DifficultyManager.getObserveDuration(round));

    for (let index = 0; index < eventCount; index += 1) {
      const type = index === 0
        ? this.pickOpeningEventType(allowedTypes)
        : this.pickEventType(virtualState, allowedTypes);
      const event = this.buildEvent(type, round, index, times[index], virtualState);

      events.push(event);
      this.applyVirtualEvent(event, virtualState);
    }

    return events.sort((a, b) => a.time - b.time);
  },

  createVirtualState() {
    const initialItems = sceneState.items.length > 0 ? sceneState.items : DataConfig.items;

    return {
      insideCustomers: [],
      itemCounts: Object.fromEntries(initialItems.map((item) => [item.id, item.count])),
      fridgeCount: DataConfig.items.filter((item) => item.area === "fridge").length,
      clockTime: "14:30",
      cashierAmount: "¥23"
    };
  },

  createEventTimes(count, observeDuration) {
    const startTime = 1.8;
    const endTime = Math.max(startTime + 1, observeDuration - 1);
    const segment = (endTime - startTime) / count;

    return Array.from({ length: count }, (_, index) => {
      const min = startTime + index * segment;
      const max = Math.min(endTime, min + segment * 0.72);
      return randomTime(min, max);
    });
  },

  pickOpeningEventType(allowedTypes) {
    const openingTypes = allowedTypes.filter(
      (type) => type !== "customer_exit" && type !== "item_taken"
    );

    return randomFrom(openingTypes.length > 0 ? openingTypes : allowedTypes);
  },

  pickEventType(virtualState, allowedTypes) {
    const maxVisibleCustomers = DataConfig.areas.customerSlots.length;
    const types = allowedTypes.filter((type) => {
      if (type === "customer_exit") {
        return virtualState.insideCustomers.length > 0;
      }

      if (type === "customer_enter") {
        return virtualState.insideCustomers.length < maxVisibleCustomers;
      }

      if (type === "item_taken") {
        return virtualState.insideCustomers.length > 0 || virtualState.insideCustomers.length < maxVisibleCustomers;
      }

      return true;
    });

    return randomFrom(types.length > 0 ? types : allowedTypes);
  },

  buildEvent(type, round, index, time, virtualState) {
    const eventBuilders = {
      customer_enter: () => this.buildCustomerEnterEvent(round, index, time, virtualState),
      customer_exit: () => this.buildCustomerExitEvent(round, index, time, virtualState),
      item_taken: () => this.buildItemTakenEvent(round, index, time, virtualState),
      light_flash: () => this.buildLightFlashEvent(round, index, time),
      door_auto_open: () => this.buildDoorAutoOpenEvent(round, index, time),
      shelf_item_disappear: () => this.buildShelfItemDisappearEvent(round, index, time, virtualState),
      clock_change: () => this.buildClockChangeEvent(round, index, time, virtualState),
      cashier_amount_change: () => this.buildCashierAmountChangeEvent(round, index, time, virtualState),
      monitor_shadow: () => this.buildMonitorShadowEvent(round, index, time)
    };

    return eventBuilders[type]();
  },

  buildCustomerEnterEvent(round, index, time, virtualState) {
    const outsideCustomers = DataConfig.customers.filter(
      (customer) => !virtualState.insideCustomers.includes(customer.id)
    );
    const customer = randomFrom(outsideCustomers.length > 0 ? outsideCustomers : DataConfig.customers);

    return {
      id: `round-${round}-${index}-customer-enter`,
      time,
      type: "customer_enter",
      customerId: customer.id,
      color: customer.color,
      label: customer.label,
      style: customer.style,
      round
    };
  },

  buildCustomerExitEvent(round, index, time, virtualState) {
    if (virtualState.insideCustomers.length === 0) {
      return this.buildCustomerEnterEvent(round, index, time, virtualState);
    }

    const customerId = randomFrom(virtualState.insideCustomers);
    const customer = DataConfig.customers.find((entry) => entry.id === customerId);

    return {
      id: `round-${round}-${index}-customer-exit`,
      time,
      type: "customer_exit",
      customerId: customer.id,
      color: customer.color,
      label: customer.label,
      round
    };
  },

  buildItemTakenEvent(round, index, time, virtualState) {
    if (virtualState.insideCustomers.length === 0) {
      return this.buildCustomerEnterEvent(round, index, time, virtualState);
    }

    const availableItems = DataConfig.items.filter((item) => virtualState.itemCounts[item.id] > 0);
    const item = randomFrom(availableItems.length > 0 ? availableItems : DataConfig.items);
    const customerId = randomFrom(virtualState.insideCustomers);

    return {
      id: `round-${round}-${index}-item-taken`,
      time,
      type: "item_taken",
      customerId,
      itemId: item.id,
      item: item.name,
      round
    };
  },

  buildLightFlashEvent(round, index, time) {
    return {
      id: `round-${round}-${index}-light-flash`,
      time,
      type: "light_flash",
      count: 1,
      round
    };
  },

  buildDoorAutoOpenEvent(round, index, time) {
    return {
      id: `round-${round}-${index}-door-auto-open`,
      time,
      type: "door_auto_open",
      count: 1,
      round
    };
  },

  buildShelfItemDisappearEvent(round, index, time, virtualState) {
    const shelfItems = DataConfig.items.filter(
      (item) => item.area !== "fridge" && virtualState.itemCounts[item.id] > 0
    );
    const item = randomFrom(shelfItems.length > 0 ? shelfItems : DataConfig.items.filter((entry) => entry.area !== "fridge"));

    return {
      id: `round-${round}-${index}-shelf-item-disappear`,
      time,
      type: "shelf_item_disappear",
      itemId: item.id,
      item: item.name,
      round
    };
  },

  buildClockChangeEvent(round, index, time, virtualState) {
    const clockTime = randomFrom(DataConfig.clockTimes.filter((timeText) => timeText !== virtualState.clockTime));

    return {
      id: `round-${round}-${index}-clock-change`,
      time,
      type: "clock_change",
      clockTime,
      round
    };
  },

  buildCashierAmountChangeEvent(round, index, time, virtualState) {
    const cashierAmount = randomFrom(
      DataConfig.cashierAmounts.filter((amount) => amount !== virtualState.cashierAmount)
    );

    return {
      id: `round-${round}-${index}-cashier-amount-change`,
      time,
      type: "cashier_amount_change",
      cashierAmount,
      round
    };
  },

  buildMonitorShadowEvent(round, index, time) {
    const location = randomFrom(DataConfig.monitorShadowLocations);

    return {
      id: `round-${round}-${index}-monitor-shadow`,
      time,
      type: "monitor_shadow",
      location,
      round
    };
  },

  applyVirtualEvent(event, virtualState) {
    if (event.type === "customer_enter" && !virtualState.insideCustomers.includes(event.customerId)) {
      virtualState.insideCustomers.push(event.customerId);
    }

    if (event.type === "customer_exit") {
      virtualState.insideCustomers = virtualState.insideCustomers.filter((id) => id !== event.customerId);
    }

    if (event.type === "item_taken" || event.type === "shelf_item_disappear") {
      virtualState.itemCounts[event.itemId] = Math.max(0, virtualState.itemCounts[event.itemId] - 1);
    }

    if (event.type === "item_taken") {
      const item = DataConfig.items.find((entry) => entry.id === event.itemId);

      if (item && item.area === "fridge") {
        virtualState.fridgeCount = Math.max(0, virtualState.fridgeCount - 1);
      }
    }

    if (event.type === "clock_change") {
      virtualState.clockTime = event.clockTime;
    }

    if (event.type === "cashier_amount_change") {
      virtualState.cashierAmount = event.cashierAmount;
    }
  }
};

if (typeof window !== "undefined") {
  window.DataConfig = DataConfig;
  window.DifficultyManager = DifficultyManager;
  window.RatingManager = RatingManager;
  window.LeaderboardService = LeaderboardService;
  window.EventGenerator = EventGenerator;
}
