const DataConfig = {
  observeDuration: 15,
  eventsPerRound: 5,
  difficultyTiers: [
    {
      minRound: 1,
      maxRound: 2,
      eventCount: 3,
      observeDuration: 15,
      itemFlashDuration: 0.72,
      eventTypes: ["customer_enter", "item_taken", "light_flash", "door_auto_open"],
      questionTypes: ["last_customer_color", "item_taken", "light_flash_count", "door_auto_open_count"]
    },
    {
      minRound: 3,
      maxRound: 5,
      eventCount: 5,
      observeDuration: 15,
      itemFlashDuration: 0.52,
      eventTypes: [
        "customer_enter",
        "item_taken",
        "light_flash",
        "door_auto_open",
        "customer_exit",
        "shelf_item_disappear",
        "clock_change",
        "cashier_amount_change"
      ],
      questionTypes: [
        "last_customer_color",
        "item_taken",
        "light_flash_count",
        "door_auto_open_count",
        "final_customer_count",
        "shelf_item_disappear",
        "clock_change",
        "cashier_amount"
      ]
    },
    {
      minRound: 6,
      maxRound: Infinity,
      eventCount: 7,
      observeDuration: 15,
      itemFlashDuration: 0.36,
      eventTypes: [
        "customer_enter",
        "item_taken",
        "light_flash",
        "door_auto_open",
        "customer_exit",
        "shelf_item_disappear",
        "clock_change",
        "cashier_amount_change",
        "monitor_shadow"
      ],
      questionTypes: [
        "last_customer_color",
        "item_taken",
        "light_flash_count",
        "door_auto_open_count",
        "final_customer_count",
        "shelf_item_disappear",
        "clock_change",
        "cashier_amount",
        "monitor_shadow",
        "first_customer_enter",
        "first_changed_area",
        "last_event_type"
      ]
    }
  ],
  eventTypeLabels: {
    customer_enter: "顾客进店",
    item_taken: "商品被拿走",
    light_flash: "灯光闪烁",
    door_auto_open: "门自动开合",
    customer_exit: "顾客离店",
    shelf_item_disappear: "货架商品消失",
    clock_change: "时钟变化",
    cashier_amount_change: "收银金额变化",
    monitor_shadow: "异常影子出现"
  },
  eventAreaLabels: {
    customer_enter: "门口顾客区",
    customer_exit: "门口顾客区",
    door_auto_open: "门口区域",
    item_taken: "商品货架区",
    shelf_item_disappear: "商品货架区",
    light_flash: "灯光区",
    clock_change: "墙上时钟区",
    cashier_amount_change: "收银台区",
    monitor_shadow: "监控屏区"
  },
  surveillanceTips: [
    "画面抖了一下",
    "信号短暂波动",
    "录像出现噪点",
    "角落有变化",
    "注意刚才那一帧"
  ],
  correctFeedbackMessages: [
    "监控记录确认无误。",
    "你抓住了那一瞬间。",
    "细节对上了。"
  ],
  wrongFeedbackMessages: [
    "你刚才漏看了。",
    "监控不会说谎。",
    "再仔细一点。",
    "那一瞬间你可能错过了。"
  ],
  customers: [
    { id: "red_customer", color: "红色", label: "红衣顾客", style: "red" },
    { id: "blue_customer", color: "蓝色", label: "蓝衣顾客", style: "blue" },
    { id: "yellow_customer", color: "黄色", label: "黄衣顾客", style: "yellow" },
    { id: "black_customer", color: "黑色", label: "黑衣顾客", style: "black" },
    { id: "hat_customer", color: "棕色", label: "戴帽子顾客", style: "hat" }
  ],
  items: [
    { id: "water", name: "水", icon: "水", type: "water", count: 2, x: 34, bottom: 110, area: "fridge" },
    { id: "milk", name: "牛奶", icon: "奶", type: "milk", count: 2, x: 86, bottom: 110, area: "fridge" },
    { id: "riceball", name: "饭团", icon: "饭", type: "riceball", count: 2, x: 34, y: 326 },
    { id: "chips", name: "薯片", icon: "薯片", type: "chips", count: 2, x: 34, y: 264 },
    { id: "bento", name: "便当", icon: "便当", type: "bento", count: 2, x: 148, y: 326 },
    { id: "candy", name: "糖果", icon: "糖", type: "candy", count: 2, x: 148, y: 264 }
  ],
  clockTimes: ["14:31", "14:44", "15:05", "15:17"],
  cashierAmounts: ["¥18", "¥23", "¥31", "¥46", "¥59"],
  monitorShadowLocations: ["监控屏左侧", "监控屏中央", "监控屏右侧", "监控屏下方"],
  areas: {
    customerSlots: [
      { x: 282, y: 226 },
      { x: 246, y: 226 },
      { x: 318, y: 226 }
    ]
  }
};

const eventLog = [];

if (typeof window !== "undefined") {
  window.eventLog = eventLog;
}

function createInitialSceneState() {
  return {
    customers: [],
    departingCustomers: [],
    items: DataConfig.items.map((item) => ({ ...item })),
    changedItemIds: [],
    itemFlashDuration: DataConfig.difficultyTiers[0].itemFlashDuration,
    fridgeCount: DataConfig.items.filter((item) => item.area === "fridge").length,
    clockTime: "14:30",
    cashierAmount: "¥23",
    lightState: "微弱闪烁",
    monitorState: "信号正常",
    lightFlashCount: 0,
    lightFlashActive: false,
    doorAutoOpenActive: false,
    monitorShadowActive: false,
    monitorShadowLocation: "",
    activeTip: "",
    lastCustomerId: "",
    lastTakenItemId: "",
    lastDisappearedItemId: "",
    highlightedInfo: ""
  };
}

const sceneState = createInitialSceneState();

if (typeof window !== "undefined") {
  window.sceneState = sceneState;
}

function resetSceneState() {
  const freshState = createInitialSceneState();

  Object.keys(sceneState).forEach((key) => {
    delete sceneState[key];
  });
  Object.assign(sceneState, freshState);
}

function resetEventLog() {
  eventLog.length = 0;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomTime(min, max) {
  return Number((min + Math.random() * (max - min)).toFixed(1));
}

function shuffleList(list) {
  const shuffled = [...list];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function getSurveillanceTip() {
  return randomFrom(DataConfig.surveillanceTips);
}

function buildUniqueOptions(answer, wrongAnswers) {
  const options = [answer];

  wrongAnswers.forEach((wrongAnswer) => {
    if (options.length < 4 && wrongAnswer !== answer && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer);
    }
  });

  return shuffleList(options);
}

const DifficultyManager = {
  getTier(round) {
    return DataConfig.difficultyTiers.find(
      (tier) => round >= tier.minRound && round <= tier.maxRound
    ) || DataConfig.difficultyTiers[0];
  },

  getEventCount(round) {
    return this.getTier(round).eventCount;
  },

  getAllowedEventTypes(round) {
    return [...this.getTier(round).eventTypes];
  },

  getAllowedQuestionTypes(round) {
    return [...this.getTier(round).questionTypes];
  },

  getObserveDuration(round) {
    return this.getTier(round).observeDuration || DataConfig.observeDuration;
  },

  getItemFlashDuration(round) {
    return this.getTier(round).itemFlashDuration || 0.5;
  }
};

const RatingManager = {
  ratings: [
    { min: 50, title: "非人类反应", detail: "你已经把监控画面看成了慢动作。" },
    { min: 35, title: "人类高玩", detail: "细节变化很难从你眼前溜走。" },
    { min: 25, title: "极限挑战者", detail: "高强度录像也压不住你的记忆。" },
    { min: 20, title: "记忆高手", detail: "你开始稳定抓住连续变化。" },
    { min: 15, title: "反应在线", detail: "节奏已经跟上，失误越来越少。" },
    { min: 10, title: "节奏入门", detail: "你刚进入状态，后面才是真正考验。" },
    { min: 5, title: "手感预热", detail: "你已经摸到这个现场的节奏。" },
    { min: 0, title: "刚摸到门", detail: "监控画面还在试探你的注意力。" }
  ],

  getGameRating(completedRounds) {
    return this.ratings.find((rating) => completedRounds >= rating.min);
  }
};

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
    return {
      insideCustomers: [],
      itemCounts: Object.fromEntries(DataConfig.items.map((item) => [item.id, item.count])),
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
  window.EventGenerator = EventGenerator;
}

const QuestionGenerator = {
  generate(log, state, round = 1) {
    const allowedQuestionTypes = DifficultyManager.getAllowedQuestionTypes(round);
    const builders = {
      last_customer_color: () => this.buildCustomerColorQuestion(log),
      item_taken: () => this.buildItemTakenQuestion(log),
      light_flash_count: () => this.buildLightFlashQuestion(log),
      door_auto_open_count: () => this.buildDoorAutoOpenQuestion(log),
      final_customer_count: () => this.buildFinalCustomerCountQuestion(log, state),
      shelf_item_disappear: () => this.buildShelfItemDisappearQuestion(log),
      clock_change: () => this.buildClockChangeQuestion(log, state),
      cashier_amount: () => this.buildCashierAmountQuestion(log, state),
      monitor_shadow: () => this.buildMonitorShadowQuestion(log),
      first_customer_enter: () => this.buildFirstCustomerEnterQuestion(log),
      first_changed_area: () => this.buildFirstChangedAreaQuestion(log),
      last_event_type: () => this.buildLastEventTypeQuestion(log)
    };
    const candidates = allowedQuestionTypes
      .map((questionType) => builders[questionType] && builders[questionType]())
      .filter(Boolean);

    if (candidates.length > 0) {
      return randomFrom(candidates);
    }

    return this.buildFallbackQuestion(log, state);
  },

  buildCustomerColorQuestion(log) {
    const customerEvents = log.filter((event) => event.type === "customer_enter");

    if (customerEvents.length === 0) {
      return null;
    }

    const lastCustomerEvent = customerEvents[customerEvents.length - 1];
    const answer = lastCustomerEvent.color;
    const wrongAnswers = DataConfig.customers.map((customer) => customer.color);

    return {
      text: "最后进店的顾客穿什么颜色？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      sourceEventId: lastCustomerEvent.id
    };
  },

  buildItemTakenQuestion(log) {
    const itemEvents = log.filter((event) => event.type === "item_taken");

    if (itemEvents.length === 0) {
      return null;
    }

    const lastItemEvent = itemEvents[itemEvents.length - 1];
    const answer = lastItemEvent.item;
    const wrongAnswers = DataConfig.items.map((item) => item.name);

    return {
      text: "哪个商品被拿走了？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      sourceEventId: lastItemEvent.id
    };
  },

  buildLightFlashQuestion(log) {
    const lightEvents = log.filter((event) => event.type === "light_flash");

    if (lightEvents.length === 0) {
      return null;
    }

    const totalFlashCount = lightEvents.reduce((sum, event) => sum + event.count, 0);
    const answer = `${totalFlashCount}次`;
    const wrongAnswers = [1, 2, 3, 4, 5]
      .filter((count) => count !== totalFlashCount)
      .map((count) => `${count}次`);

    return {
      text: "刚才灯闪了几次？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      sourceEventId: lightEvents[lightEvents.length - 1].id
    };
  },

  buildDoorAutoOpenQuestion(log) {
    const doorEvents = log.filter((event) => event.type === "door_auto_open");

    if (doorEvents.length === 0) {
      return null;
    }

    const totalOpenCount = doorEvents.reduce((sum, event) => sum + event.count, 0);
    const answer = `${totalOpenCount}次`;
    const wrongAnswers = [1, 2, 3, 4, 5, 6, 7]
      .filter((count) => count !== totalOpenCount)
      .map((count) => `${count}次`);

    return {
      text: "刚才门自动开合了几次？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      sourceEventId: doorEvents[doorEvents.length - 1].id
    };
  },

  buildFinalCustomerCountQuestion(log, state) {
    const customerEvents = log.filter(
      (event) => event.type === "customer_enter" || event.type === "customer_exit"
    );

    if (customerEvents.length === 0) {
      return null;
    }

    const insideCustomers = new Set();
    customerEvents.forEach((event) => {
      if (event.type === "customer_enter") {
        insideCustomers.add(event.customerId);
      }

      if (event.type === "customer_exit") {
        insideCustomers.delete(event.customerId);
      }
    });
    const answer = `${insideCustomers.size}名`;
    const wrongAnswers = [0, 1, 2, 3, 4, 5]
      .filter((count) => `${count}名` !== answer)
      .map((count) => `${count}名`);

    return {
      text: "最后店里有几名顾客？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      sourceEventId: customerEvents[customerEvents.length - 1].id
    };
  },

  buildShelfItemDisappearQuestion(log) {
    const disappearEvents = log.filter((event) => event.type === "shelf_item_disappear");

    if (disappearEvents.length === 0) {
      return null;
    }

    const lastDisappearEvent = disappearEvents[disappearEvents.length - 1];
    const answer = lastDisappearEvent.item;
    const wrongAnswers = DataConfig.items
      .filter((item) => item.area !== "fridge")
      .map((item) => item.name);

    return {
      text: "哪个商品从货架消失了？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      sourceEventId: lastDisappearEvent.id
    };
  },

  buildClockChangeQuestion(log, state) {
    const clockEvents = log.filter((event) => event.type === "clock_change");

    if (clockEvents.length === 0) {
      return null;
    }

    const lastClockEvent = clockEvents[clockEvents.length - 1];

    return {
      text: "时钟最后显示几点？",
      options: buildUniqueOptions(lastClockEvent.clockTime, DataConfig.clockTimes),
      answer: lastClockEvent.clockTime,
      sourceEventId: lastClockEvent.id
    };
  },

  buildCashierAmountQuestion(log, state) {
    const cashierEvents = log.filter((event) => event.type === "cashier_amount_change");

    if (cashierEvents.length === 0) {
      return null;
    }

    const lastCashierEvent = cashierEvents[cashierEvents.length - 1];

    return {
      text: "收银台最后显示多少钱？",
      options: buildUniqueOptions(lastCashierEvent.cashierAmount, DataConfig.cashierAmounts),
      answer: lastCashierEvent.cashierAmount,
      sourceEventId: lastCashierEvent.id
    };
  },

  buildMonitorShadowQuestion(log) {
    const shadowEvents = log.filter((event) => event.type === "monitor_shadow");

    if (shadowEvents.length === 0) {
      return null;
    }

    const lastShadowEvent = shadowEvents[shadowEvents.length - 1];

    return {
      text: "异常影子出现在哪里？",
      options: buildUniqueOptions(lastShadowEvent.location, DataConfig.monitorShadowLocations),
      answer: lastShadowEvent.location,
      sourceEventId: lastShadowEvent.id
    };
  },

  buildFirstCustomerEnterQuestion(log) {
    const customerEvents = log.filter((event) => event.type === "customer_enter");

    if (customerEvents.length === 0) {
      return null;
    }

    const firstCustomerEvent = customerEvents[0];

    return {
      text: "第一个进店的人是谁？",
      options: buildUniqueOptions(
        firstCustomerEvent.label,
        DataConfig.customers.map((customer) => customer.label)
      ),
      answer: firstCustomerEvent.label,
      sourceEventId: firstCustomerEvent.id
    };
  },

  buildFirstChangedAreaQuestion(log) {
    if (log.length === 0) {
      return null;
    }

    const firstEvent = log[0];
    const answer = DataConfig.eventAreaLabels[firstEvent.type];

    if (!answer) {
      return null;
    }

    return {
      text: "第一个发生变化的区域是什么？",
      options: buildUniqueOptions(answer, Object.values(DataConfig.eventAreaLabels)),
      answer,
      sourceEventId: firstEvent.id
    };
  },

  buildLastEventTypeQuestion(log) {
    if (log.length === 0) {
      return null;
    }

    const lastEvent = log[log.length - 1];
    const answer = DataConfig.eventTypeLabels[lastEvent.type];

    if (!answer) {
      return null;
    }

    return {
      text: "最后发生的事件是什么类型？",
      options: buildUniqueOptions(answer, Object.values(DataConfig.eventTypeLabels)),
      answer,
      sourceEventId: lastEvent.id
    };
  },

  buildFallbackQuestion(log) {
    const answer = `${log.length}个`;

    return {
      text: "本轮记录到了多少个事件？",
      options: buildUniqueOptions(answer, ["0个", "1个", "2个", "3个"]),
      answer,
      sourceEventId: "fallback-event-count"
    };
  }
};

if (typeof window !== "undefined") {
  window.QuestionGenerator = QuestionGenerator;
}

const TimelinePlayer = {
  timers: [],
  transientTimers: [],
  itemFlashTokens: {},

  start(events) {
    this.stop();
    events.forEach((event) => {
      const timerId = setTimeout(() => {
        this.playEvent(event);
      }, event.time * 1000);

      this.timers.push(timerId);
    });
  },

  stop() {
    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.transientTimers.forEach((timerId) => clearTimeout(timerId));
    this.timers = [];
    this.transientTimers = [];
    this.itemFlashTokens = {};
  },

  playEvent(event) {
    if (GameState.phase !== "observe") {
      return;
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
    this.clearTransientState(["activeTip", "lastCustomerId"], 1200);
  },

  applyItemTaken(event) {
    const item = sceneState.items.find((sceneItem) => sceneItem.id === event.itemId);

    if (item) {
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
    sceneState.doorAutoOpenActive = true;
    sceneState.activeTip = getSurveillanceTip();
    eventLog.push({
      id: event.id,
      time: event.time,
      type: event.type,
      count: event.count
    });

    SceneRenderer.render(sceneState);
    this.clearTransientState(["activeTip", "doorAutoOpenActive"], 1100);
  },

  applyCustomerExit(event) {
    const exitingCustomer = sceneState.customers.find((customer) => customer.id === event.customerId);

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

  applyShelfItemDisappear(event) {
    const item = sceneState.items.find((sceneItem) => sceneItem.id === event.itemId);

    if (item) {
      item.count = 0;
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

const SceneRenderer = {
  layers: {},
  root: null,

  init() {
    this.root = document.getElementById("convenienceScene");
    this.layers = {
      backgroundLayer: document.getElementById("backgroundLayer"),
      characterLayer: document.getElementById("characterLayer"),
      itemLayer: document.getElementById("itemLayer"),
      infoLayer: document.getElementById("infoLayer"),
      anomalyLayer: document.getElementById("anomalyLayer")
    };
  },

  render(state) {
    this.root.classList.toggle("scene-light-flash", state.lightFlashActive);
    this.clearLayers();
    this.renderBackground(state);
    this.renderItems(state.items);
    this.renderCharacters(state.customers);
    this.renderInfo(state);
    this.renderAnomalies(state);
  },

  clearLayers() {
    Object.values(this.layers).forEach((layer) => {
      layer.innerHTML = "";
    });
  },

  createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;

    if (text) {
      element.textContent = text;
    }

    return element;
  },

  renderBackground(state) {
    const wall = this.createElement("div", "scene-part store-wall");
    const floor = this.createElement("div", "scene-part store-floor");
    const floorMat = this.createElement("div", "scene-part entry-mat", "入口");
    const doorClass = state.doorAutoOpenActive
      ? "scene-part store-door store-door-opening"
      : "scene-part store-door";
    const door = this.createElement("div", doorClass);
    const counter = this.createElement("div", "scene-part checkout-counter");
    const register = this.createElement("div", "register-machine");
    const scanner = this.createElement("div", "counter-scanner");
    const leftShelf = this.createShelf("scene-part store-shelf store-shelf-left");
    const midShelf = this.createShelf("scene-part store-shelf store-shelf-mid");
    const fridgeClass = state.highlightedInfo === "fridge"
      ? "scene-part fridge info-highlight"
      : "scene-part fridge";
    const fridge = this.createElement("div", fridgeClass);

    fridge.dataset.count = state.fridgeCount;
    counter.append(register, scanner);

    this.layers.backgroundLayer.append(
      wall,
      floor,
      floorMat,
      door,
      counter,
      leftShelf,
      midShelf,
      fridge
    );
  },

  createShelf(className) {
    const shelf = this.createElement("div", className);

    for (let i = 0; i < 3; i += 1) {
      const board = this.createElement("div", "shelf-board");
      const tag = this.createElement("span", "shelf-price-tag", i === 0 ? "SALE" : `¥${i + 3}`);

      board.appendChild(tag);
      shelf.appendChild(board);
    }

    return shelf;
  },

  renderItems(items) {
    items.forEach((item) => {
      const classNames = [
        "scene-item",
        "product-group",
        `item-${item.type}`,
        item.area === "fridge" ? "fridge-product" : ""
      ].filter(Boolean);
      const itemElement = this.createElement("div", classNames.join(" "));
      const rackClassNames = [
        "product-rack",
        item.count <= 0 ? "item-depleted" : "",
        sceneState.changedItemIds.includes(item.id) ? "item-highlight" : "",
        sceneState.lastTakenItemId === item.id ? "item-just-taken" : "",
        sceneState.lastDisappearedItemId === item.id ? "item-disappeared" : ""
      ].filter(Boolean);
      const itemRack = this.createElement("div", rackClassNames.join(" "));
      const itemLabel = this.createElement("div", "product-label", item.name);
      const visibleCount = Math.max(0, item.count);

      for (let i = 0; i < visibleCount; i += 1) {
        const product = this.createElement("span", `product-unit product-${item.type}`);

        itemRack.appendChild(product);
      }

      itemElement.dataset.itemId = item.id;
      itemElement.title = item.name;
      itemElement.style.left = `${item.x}px`;
      if (item.area === "fridge" && typeof item.bottom === "number") {
        itemElement.style.bottom = `${item.bottom}px`;
      } else {
        itemElement.style.top = `${item.y}px`;
      }
      itemElement.style.setProperty("--item-flash-duration", `${sceneState.itemFlashDuration}s`);
      itemElement.append(itemRack, itemLabel);

      this.layers.itemLayer.appendChild(itemElement);
    });
  },

  renderCharacters(customers) {
    const customerArea = this.createElement("div", "scene-part customer-area", "门口通道");
    const cashier = this.createPersonElement("cashier", "店员", ["cashier-person"]);

    this.layers.characterLayer.append(customerArea, cashier);

    customers.forEach((customer) => {
      const classNames = [
        "customer-person",
        `customer-${customer.style}`,
        sceneState.lastCustomerId === customer.id ? "customer-entered" : ""
      ].filter(Boolean);
      const customerElement = this.createPersonElement("customer", customer.name, classNames);

      customerElement.dataset.customerId = customer.id;
      customerElement.style.left = `${customer.x}px`;
      customerElement.style.bottom = `${customer.y}px`;
      this.layers.characterLayer.appendChild(customerElement);
    });

    sceneState.departingCustomers.forEach((customer) => {
      const classNames = [
        "customer-person",
        "customer-exiting",
        `customer-${customer.style}`
      ];
      const customerElement = this.createPersonElement("customer", customer.name, classNames);

      customerElement.dataset.customerId = customer.id;
      customerElement.style.left = `${customer.x}px`;
      customerElement.style.bottom = `${customer.y}px`;
      this.layers.characterLayer.appendChild(customerElement);
    });
  },

  createPersonElement(role, label, classNames = []) {
    const person = this.createElement("div", ["scene-person", `${role}-figure`, ...classNames].join(" "));
    const head = this.createElement("span", "person-head");
    const body = this.createElement("span", "person-body");
    const legs = this.createElement("span", "person-legs");
    const tag = this.createElement("span", "person-label", label);

    person.append(head, body, legs, tag);
    return person;
  },

  renderInfo(state) {
    const clockClass = state.highlightedInfo === "clock"
      ? "scene-info wall-clock info-highlight"
      : "scene-info wall-clock";
    const amountClass = state.highlightedInfo === "cashier"
      ? "scene-info cashier-amount info-highlight"
      : "scene-info cashier-amount";
    const clock = this.createElement("div", clockClass, `时钟 ${state.clockTime}`);
    const amount = this.createElement("div", amountClass, state.cashierAmount);
    const monitor = this.createElement("div", "scene-info monitor-text", `监控 ${state.monitorState}`);
    const sign = this.createElement("div", "scene-info door-sign", "OPEN 24H");

    this.layers.infoLayer.append(clock, amount, monitor, sign);
  },

  renderAnomalies(state) {
    const lightClass = state.lightFlashActive
      ? "scene-anomaly light-placeholder light-active"
      : "scene-anomaly light-placeholder";
    const light = this.createElement("div", lightClass, `灯光${state.lightState}`);
    const shadowClass = [
      "scene-anomaly",
      "monitor-shadow",
      this.getShadowLocationClass(state.monitorShadowLocation),
      state.monitorShadowActive ? "monitor-shadow-active" : ""
    ].filter(Boolean).join(" ");
    const shadow = this.createElement("div", shadowClass);
    const noise = this.createElement("div", "scene-anomaly red-noise");

    this.layers.anomalyLayer.append(light, shadow, noise);
  },

  getShadowLocationClass(location) {
    const locationClasses = {
      "监控屏左侧": "monitor-shadow-left",
      "监控屏中央": "monitor-shadow-center",
      "监控屏右侧": "monitor-shadow-right",
      "监控屏下方": "monitor-shadow-bottom"
    };

    return locationClasses[location] || "monitor-shadow-center";
  }
};

const GameState = {
  score: 0,
  lives: 3,
  round: 1,
  phase: "home",
  countdown: DifficultyManager.getObserveDuration(1),
  timerId: null,
  resultTimerId: null,
  transitionTimerId: null,
  answerLocked: false,
  lastFeedbackMessage: "",
  currentQuestion: {
    text: "",
    options: [],
    answer: ""
  },

  reset() {
    this.score = 0;
    this.lives = 3;
    this.round = 1;
    this.phase = "home";
    this.countdown = DifficultyManager.getObserveDuration(this.round);
    this.answerLocked = false;
    this.lastFeedbackMessage = "";
    this.currentQuestion = {
      text: "",
      options: [],
      answer: ""
    };
    this.clearTimer();
    this.clearDelayedActions();
    TimelinePlayer.stop();
  },

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  clearDelayedActions() {
    if (this.resultTimerId) {
      clearTimeout(this.resultTimerId);
      this.resultTimerId = null;
    }

    if (this.transitionTimerId) {
      clearTimeout(this.transitionTimerId);
      this.transitionTimerId = null;
    }
  }
};

const UIController = {
  screens: {},

  init() {
    this.screens = {
      home: document.getElementById("homeScreen"),
      observe: document.getElementById("observeScreen"),
      question: document.getElementById("questionScreen"),
      result: document.getElementById("resultScreen"),
      gameOver: document.getElementById("gameOverScreen")
    };
  },

  showScreen(screenName) {
    Object.values(this.screens).forEach((screen) => {
      screen.classList.remove("screen-active");
    });
    this.screens[screenName].classList.add("screen-active");
    GameState.phase = screenName;
  },

  updateStatus() {
    document.getElementById("timerText").textContent = GameState.countdown;
    document.getElementById("scoreText").textContent = GameState.score;
    document.getElementById("lifeText").textContent = GameState.lives;
    document.getElementById("roundText").textContent = GameState.round;

    const cameraTimeText = document.getElementById("cameraTimeText");
    const cameraRoundText = document.getElementById("cameraRoundText");

    if (cameraTimeText) {
      const elapsedSeconds = DifficultyManager.getObserveDuration(GameState.round) - GameState.countdown;
      cameraTimeText.textContent = `CAM-03 14:30:${String(Math.max(0, elapsedSeconds)).padStart(2, "0")}`;
    }

    if (cameraRoundText) {
      cameraRoundText.textContent = `ROUND ${GameState.round}`;
    }
  },

  renderQuestion(question) {
    const questionText = document.getElementById("questionText");
    const answerOptions = document.getElementById("answerOptions");

    GameState.answerLocked = false;
    questionText.textContent = question.text;
    answerOptions.innerHTML = "";

    question.options.forEach((option) => {
      const normalizedOption = typeof option === "string"
        ? { label: option, value: option }
        : option;
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.dataset.answer = normalizedOption.value;
      button.textContent = normalizedOption.label;
      button.addEventListener("click", () => handleAnswer(normalizedOption.value, button));
      answerOptions.appendChild(button);
    });
  },

  renderResult(isCorrect) {
    const resultPanel = document.querySelector(".result-panel");

    if (resultPanel) {
      resultPanel.classList.toggle("result-correct", isCorrect);
      resultPanel.classList.toggle("result-wrong", !isCorrect);
    }

    document.getElementById("resultTitle").textContent = isCorrect ? "答对了" : "答错了";
    document.getElementById("resultDetail").textContent = isCorrect ? "分数 +10" : "生命 -1";
    document.getElementById("resultFeedbackText").textContent = GameState.lastFeedbackMessage;
    document.getElementById("resultScoreText").textContent = GameState.score;
    document.getElementById("resultLifeText").textContent = GameState.lives;
    document.getElementById("resultRoundText").textContent = GameState.round;

    const nextRoundButton = document.getElementById("nextRoundButton");
    nextRoundButton.textContent = GameState.lives > 0 ? "下一轮" : "查看结算";
  },

  renderGameOver() {
    const completedRounds = Math.max(0, GameState.round - 1);
    const rating = RatingManager.getGameRating(completedRounds);

    document.getElementById("finalScoreText").textContent = GameState.score;
    document.getElementById("finalRoundText").textContent = completedRounds;
    document.getElementById("finalRatingTitle").textContent = rating.title;
    document.getElementById("finalRatingDetail").textContent = rating.detail;
  },

  playObserveEndTransition(callback) {
    const scene = document.getElementById("convenienceScene");

    if (!scene) {
      callback();
      return;
    }

    scene.classList.add("scene-ending");
    GameState.transitionTimerId = setTimeout(() => {
      GameState.transitionTimerId = null;
      scene.classList.remove("scene-ending");
      callback();
    }, 460);
  }
};

const DebugPanel = {
  isOpen: false,
  refreshTimerId: null,
  toggleButton: null,
  panel: null,
  content: null,

  init() {
    this.toggleButton = document.getElementById("debugToggleButton");
    this.panel = document.getElementById("debugPanel");
    this.content = document.getElementById("debugContent");

    if (!this.toggleButton || !this.panel || !this.content) {
      return;
    }

    this.toggleButton.addEventListener("click", () => this.toggle());
    this.render();
  },

  toggle() {
    if (this.isOpen) {
      this.close();
      return;
    }

    this.open();
  },

  open() {
    this.isOpen = true;
    this.panel.hidden = false;
    this.toggleButton.setAttribute("aria-expanded", "true");
    this.render();
    this.startAutoRefresh();
  },

  close() {
    this.isOpen = false;
    this.panel.hidden = true;
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.stopAutoRefresh();
  },

  startAutoRefresh() {
    this.stopAutoRefresh();
    this.refreshTimerId = setInterval(() => this.render(), 300);
  },

  stopAutoRefresh() {
    if (this.refreshTimerId) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  },

  getSnapshot() {
    return {
      phase: GameState.phase,
      round: GameState.round,
      score: GameState.score,
      lives: GameState.lives,
      sceneState,
      eventLog,
      currentQuestion: GameState.currentQuestion
    };
  },

  render() {
    if (!this.content) {
      return;
    }

    this.content.textContent = JSON.stringify(this.getSnapshot(), null, 2);
  }
};

function startGame() {
  if (GameState.phase !== "home") {
    return;
  }

  GameState.reset();
  startObservePhase();
}

function startObservePhase() {
  GameState.clearTimer();
  GameState.clearDelayedActions();
  TimelinePlayer.stop();
  resetSceneState();
  resetEventLog();
  GameState.countdown = DifficultyManager.getObserveDuration(GameState.round);
  document.getElementById("convenienceScene").classList.remove("scene-ending");
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
  UIController.showScreen("observe");

  const events = EventGenerator.generate(GameState.round);
  TimelinePlayer.start(events);

  GameState.timerId = setInterval(() => {
    GameState.countdown -= 1;
    UIController.updateStatus();

    if (GameState.countdown <= 0) {
      GameState.clearTimer();
      TimelinePlayer.stop();
      UIController.playObserveEndTransition(() => {
        if (GameState.phase === "observe") {
          showQuestionPhase();
        }
      });
    }
  }, 1000);
}

function showQuestionPhase() {
  if (GameState.phase !== "observe") {
    return;
  }

  GameState.currentQuestion = QuestionGenerator.generate(eventLog, sceneState, GameState.round);
  UIController.renderQuestion(GameState.currentQuestion);
  UIController.showScreen("question");
}

function handleAnswer(answer, selectedButton) {
  if (GameState.phase !== "question" || GameState.answerLocked) {
    return;
  }

  GameState.answerLocked = true;
  const correctAnswer = GameState.currentQuestion.answer || GameState.currentQuestion.correctAnswer;
  const isCorrect = answer === correctAnswer;
  const answerButtons = document.querySelectorAll(".answer-button");

  answerButtons.forEach((button) => {
    button.disabled = true;
  });

  if (selectedButton) {
    selectedButton.classList.add("answer-selected", isCorrect ? "answer-correct" : "answer-wrong");
  }

  if (isCorrect) {
    GameState.score += 10;
    GameState.lastFeedbackMessage = randomFrom(DataConfig.correctFeedbackMessages);
  } else {
    GameState.lives -= 1;
    GameState.lastFeedbackMessage = randomFrom(DataConfig.wrongFeedbackMessages);
  }

  GameState.resultTimerId = setTimeout(() => {
    GameState.resultTimerId = null;

    if (GameState.phase === "question") {
      showResult(isCorrect);
    }
  }, 380);
}

function showResult(isCorrect) {
  if (GameState.phase !== "question") {
    return;
  }

  UIController.renderResult(isCorrect);
  UIController.showScreen("result");
}

function resetGame() {
  GameState.reset();
  resetSceneState();
  resetEventLog();
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
  UIController.showScreen("home");
}

function goToNextRound() {
  if (GameState.phase !== "result") {
    return;
  }

  if (GameState.lives <= 0) {
    UIController.renderGameOver();
    UIController.showScreen("gameOver");
    return;
  }

  GameState.round += 1;
  startObservePhase();
}

document.addEventListener("DOMContentLoaded", () => {
  UIController.init();
  SceneRenderer.init();
  DebugPanel.init();
  SceneRenderer.render(sceneState);
  UIController.updateStatus();

  document.getElementById("startButton").addEventListener("click", startGame);
  document.getElementById("nextRoundButton").addEventListener("click", goToNextRound);
  document.getElementById("restartButton").addEventListener("click", resetGame);
});
