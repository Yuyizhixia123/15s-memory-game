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
        "advanced_detail",
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
    { id: "riceball", name: "饭团", icon: "饭", type: "riceball", count: 2, x: 34, y: 338 },
    { id: "chips", name: "薯片", icon: "薯片", type: "chips", count: 2, x: 34, y: 276 },
    { id: "bento", name: "便当", icon: "便当", type: "bento", count: 2, x: 148, y: 338 },
    { id: "candy", name: "糖果", icon: "糖", type: "candy", count: 2, x: 148, y: 276 }
  ],
  randomInitialItemIds: ["riceball", "chips"],
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
let initialRoundSceneState = null;

if (typeof window !== "undefined") {
  window.eventLog = eventLog;
  window.getInitialRoundSceneState = getInitialRoundSceneState;
}

function createInitialSceneState() {
  return {
    customers: [],
    departingCustomers: [],
    items: DataConfig.items.map((item) => {
      const count = getInitialItemCount(item);

      return { ...item, count, initialCount: count };
    }),
    changedItemIds: [],
    removingItems: [],
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

function captureInitialRoundSceneState() {
  initialRoundSceneState = {
    items: sceneState.items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      area: item.area || "",
      count: item.count,
      initialCount: item.initialCount
    })),
    customers: sceneState.customers.map((customer) => ({ ...customer })),
    clockTime: sceneState.clockTime,
    cashierAmount: sceneState.cashierAmount,
    round: GameState.round
  };
}

function getInitialRoundSceneState() {
  return initialRoundSceneState;
}

function clearInitialRoundSceneState() {
  initialRoundSceneState = null;
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

function getInitialItemCount(item) {
  if (!DataConfig.randomInitialItemIds.includes(item.id)) {
    return item.count;
  }

  return 1 + Math.floor(Math.random() * 3);
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
    { min: 30, title: "神之领域", detail: "你已经把监控画面看成了慢动作。" },
    { min: 25, title: "动态视力MAX", detail: "细节变化很难从你眼前溜走。" },
    { min: 20, title: "大脑超频", detail: "高强度录像也压不住你的记忆。" },
    { min: 15, title: "肌肉记忆", detail: "你开始稳定抓住连续变化。" },
    { min: 12, title: "渐入佳境", detail: "节奏已经跟上，失误越来越少。" },
    { min: 9, title: "神经递质激活", detail: "你刚进入状态，后面才是真正考验。" },
    { min: 5, title: "引擎预热", detail: "你已经摸到这个现场的节奏。" },
    { min: 0, title: "梦游状态", detail: "监控画面还在试探你的注意力。" }
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
  window.EventGenerator = EventGenerator;
}

const AdvancedQuestionState = {
  lastAdvancedQuestionRound: 0
};

const QuestionGenerator = {
  generate(log, state, round = 1) {
    const allowedQuestionTypes = DifficultyManager.getAllowedQuestionTypes(round);
    const advancedQuestion = allowedQuestionTypes.includes("advanced_detail")
      ? this.generateAdvancedDetailQuestion({ log, state, round })
      : null;

    if (advancedQuestion) {
      return advancedQuestion;
    }

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

  shouldUseAdvancedQuestion(round) {
    if (round < 15 || round - AdvancedQuestionState.lastAdvancedQuestionRound <= 2) {
      return false;
    }

    const roll = Math.random();

    if (round >= 25) {
      return roll < 0.4;
    }

    if (round >= 20) {
      return roll < 0.3;
    }

    return roll < 0.2;
  },

  generateAdvancedDetailQuestion(context) {
    if (!this.shouldUseAdvancedQuestion(context.round)) {
      return null;
    }

    const candidates = [
      this.buildInitialQuantityQuestion(context),
      this.buildMissingCustomerColorQuestion(context)
    ].filter(Boolean);

    if (candidates.length === 0) {
      return null;
    }

    const question = randomFrom(candidates);
    AdvancedQuestionState.lastAdvancedQuestionRound = context.round;

    return question;
  },

  buildInitialQuantityQuestion() {
    const initialState = getInitialRoundSceneState();

    if (!initialState || !Array.isArray(initialState.items)) {
      return null;
    }

    const variableItems = initialState.items.filter((item) => {
      const configItem = DataConfig.items.find((entry) => entry.id === item.id);

      return configItem && configItem.area !== "fridge" && DataConfig.randomInitialItemIds.includes(item.id);
    });

    if (variableItems.length === 0) {
      return null;
    }

    const item = randomFrom(variableItems);
    const answer = `${item.count}个`;
    const wrongAnswers = [1, 2, 3, 4]
      .filter((count) => count !== item.count)
      .map((count) => `${count}个`);

    return {
      text: `刚才观察开始时，货架上有几个${item.name}？`,
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      questionType: "advanced_initial_quantity",
      sourceEventId: "initial-round-scene",
      sourceItemId: item.id
    };
  },

  buildMissingCustomerColorQuestion({ log }) {
    const customerColorOptions = DataConfig.customers
      .map((customer) => customer.color)
      .filter((color, index, colors) => colors.indexOf(color) === index);

    if (customerColorOptions.length < 3) {
      return null;
    }

    const enteredColors = log
      .filter((event) => event.type === "customer_enter")
      .map((event) => event.customerColor || event.color)
      .filter(Boolean);
    const uniqueEnteredColors = enteredColors
      .filter((color, index, colors) => colors.indexOf(color) === index);

    if (uniqueEnteredColors.length < 3 || uniqueEnteredColors.length >= customerColorOptions.length) {
      return null;
    }

    const missingColors = customerColorOptions.filter((color) => !uniqueEnteredColors.includes(color));

    if (missingColors.length === 0) {
      return null;
    }

    const answer = randomFrom(missingColors);
    const wrongAnswers = uniqueEnteredColors;

    return {
      text: "以下哪种颜色衣服的顾客没有进入过商店？",
      options: buildUniqueOptions(answer, wrongAnswers),
      answer,
      questionType: "advanced_missing_customer_color",
      sourceEventId: "current-round-customer-enter",
      enteredColors: uniqueEnteredColors
    };
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
  window.AdvancedQuestionState = AdvancedQuestionState;
  window.QuestionGenerator = QuestionGenerator;
}

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
    [
      this.layers.characterLayer,
      this.layers.itemLayer,
      this.layers.infoLayer,
      this.layers.anomalyLayer
    ].forEach((layer) => {
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
    const existingDoor = this.layers.backgroundLayer.querySelector(".store-door");

    if (existingDoor) {
      existingDoor.classList.toggle("store-door-opening", state.doorAutoOpenActive);

      const fridge = this.layers.backgroundLayer.querySelector(".fridge");

      if (fridge) {
        fridge.classList.toggle("info-highlight", state.highlightedInfo === "fridge");
        fridge.dataset.count = state.fridgeCount;
      }

      return;
    }

    const wall = this.createElement("div", "scene-part store-wall");
    const floor = this.createElement("div", "scene-part store-floor");
    const floorMat = this.createElement("div", "scene-part entry-mat", "入口");
    const door = this.createElement("div", "scene-part store-door");
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
    door.classList.toggle("store-door-opening", state.doorAutoOpenActive);
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

      shelf.appendChild(board);
    }

    return shelf;
  },

  renderItems(items) {
    items.forEach((item) => {
      const removingItems = (sceneState.removingItems || [])
        .filter((removingItem) => removingItem.itemId === item.id);
      const classNames = [
        "scene-item",
        "product-group",
        `item-${item.type}`,
        item.area === "fridge" ? "fridge-product" : ""
      ].filter(Boolean);
      const itemElement = this.createElement("div", classNames.join(" "));
      const rackClassNames = [
        "product-rack",
        item.count <= 0 && removingItems.length === 0 ? "item-depleted" : ""
      ].filter(Boolean);
      const itemRack = this.createElement("div", rackClassNames.join(" "));
      const itemLabel = this.createElement("div", "product-label", item.name);
      const visibleCount = Math.max(0, item.count);
      const totalSlots = Math.max(item.initialCount || item.count, visibleCount + removingItems.length);

      for (let slotIndex = 0; slotIndex < totalSlots; slotIndex += 1) {
        if (slotIndex < visibleCount) {
          const product = this.createElement("span", `product-unit product-${item.type}`);

          itemRack.appendChild(product);
          continue;
        }

        const removingItem = removingItems[slotIndex - visibleCount];

        if (removingItem) {
          const effectClass = removingItem.effect === "taken"
            ? "product-taken-highlight"
            : "product-vanishing";
          const product = this.createElement(
            "span",
            `product-unit product-${removingItem.type} product-removing ${effectClass}`
          );

          product.dataset.removingId = removingItem.id;
          itemRack.appendChild(product);
          continue;
        }

        const placeholder = this.createElement("span", `product-unit product-${item.type} product-placeholder`);

        itemRack.appendChild(placeholder);
      }

      itemElement.dataset.itemId = item.id;
      itemElement.dataset.count = String(totalSlots);
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
    const amount = this.createElement("div", amountClass, `收银金额: ${state.cashierAmount}`);
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
    AdvancedQuestionState.lastAdvancedQuestionRound = 0;
    clearInitialRoundSceneState();
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
    this.updateControls();
  },

  updateControls() {
    const pauseButton = document.getElementById("pauseButton");

    if (pauseButton) {
      const canPause = GameState.phase === "observe" || GameState.phase === "question";
      pauseButton.hidden = !canPause || PauseManager.isPaused();
    }

    SoundManager.updateToggle();
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

const SoundManager = {
  storageKey: "memoryGameSoundMuted",
  muted: false,
  audioContext: null,

  init() {
    try {
      this.muted = localStorage.getItem(this.storageKey) === "true";
    } catch (error) {
      this.muted = false;
    }

    this.updateToggle();
    document.addEventListener("pointerdown", () => this.unlock(), { once: true });
    document.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        this.play("button");
      }
    });
  },

  unlock() {
    if (this.audioContext) {
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      this.audioContext = new AudioContextClass();
    } catch (error) {
      this.audioContext = null;
    }
  },

  isMuted() {
    return this.muted;
  },

  toggleMute() {
    this.muted = !this.muted;

    try {
      localStorage.setItem(this.storageKey, String(this.muted));
    } catch (error) {
      // localStorage may be unavailable in some embedded browsers.
    }

    this.updateToggle();

    if (!this.muted) {
      this.play("resume");
    }
  },

  updateToggle() {
    const button = document.getElementById("soundToggleButton");

    if (!button) {
      return;
    }

    button.textContent = this.muted ? "音效：关" : "音效：开";
    button.setAttribute("aria-pressed", String(!this.muted));
  },

  play(type) {
    if (this.muted) {
      return;
    }

    try {
      this.unlock();

      if (!this.audioContext || this.audioContext.state === "suspended") {
        return;
      }

      const patterns = {
        button: [{ frequency: 520, duration: 0.045, volume: 0.28 }],
        observeStart: [
          { frequency: 330, duration: 0.08, volume: 0.36 },
          { frequency: 520, duration: 0.1, delay: 0.06, volume: 0.32 }
        ],
        event: [{ frequency: 760, duration: 0.055, type: "triangle", volume: 0.22 }],
        doorChime: [
          { frequency: 660, duration: 0.08, type: "sine", volume: 0.28 },
          { frequency: 990, duration: 0.1, delay: 0.06, type: "triangle", volume: 0.22 }
        ],
        correct: [
          { frequency: 520, duration: 0.08, volume: 0.32 },
          { frequency: 780, duration: 0.12, delay: 0.07, volume: 0.28 }
        ],
        wrong: [
          { frequency: 240, duration: 0.12, type: "sawtooth", volume: 0.18 },
          { frequency: 170, duration: 0.16, delay: 0.08, type: "sawtooth", volume: 0.14 }
        ],
        lifeLost: [{ frequency: 120, duration: 0.18, type: "square", volume: 0.12 }],
        gameOver: [
          { frequency: 260, duration: 0.12, volume: 0.24 },
          { frequency: 190, duration: 0.16, delay: 0.11, volume: 0.2 },
          { frequency: 120, duration: 0.24, delay: 0.24, volume: 0.18 }
        ],
        pause: [{ frequency: 300, duration: 0.09, type: "triangle", volume: 0.24 }],
        resume: [{ frequency: 620, duration: 0.09, type: "triangle", volume: 0.24 }]
      };

      (patterns[type] || patterns.button).forEach((tone) => this.playTone(tone));
    } catch (error) {
      // Sound is optional. Playback failures must not affect the game.
    }
  },

  playTone({ frequency, duration, delay = 0, type = "sine", volume = 0.24 }) {
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + delay;
    const endTime = startTime + duration;
    const safeVolume = Math.min(0.04, 0.04 * volume);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(safeVolume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
  }
};

const ConfirmDialog = {
  overlay: null,
  title: null,
  message: null,
  acceptButton: null,
  cancelButton: null,
  onConfirm: null,

  init() {
    this.overlay = document.getElementById("confirmOverlay");
    this.title = document.getElementById("confirmTitle");
    this.message = document.getElementById("confirmMessage");
    this.acceptButton = document.getElementById("confirmAcceptButton");
    this.cancelButton = document.getElementById("confirmCancelButton");

    if (!this.overlay || !this.acceptButton || !this.cancelButton) {
      return;
    }

    this.cancelButton.addEventListener("click", () => this.hideConfirmDialog());
    this.acceptButton.addEventListener("click", () => {
      const callback = this.onConfirm;

      this.hideConfirmDialog();

      if (callback) {
        callback();
      }
    });
  },

  showConfirmDialog(type, onConfirm) {
    const config = type === "restart"
      ? {
        title: "确认重新开始？",
        message: "当前进度会丢失。",
        acceptText: "确认重新开始"
      }
      : {
        title: "确认退出？",
        message: "当前游戏进度不会保存。",
        acceptText: "确认退出"
      };

    this.onConfirm = onConfirm;
    this.title.textContent = config.title;
    this.message.textContent = config.message;
    this.acceptButton.textContent = config.acceptText;
    this.overlay.hidden = false;
  },

  hideConfirmDialog() {
    if (this.overlay) {
      this.overlay.hidden = true;
    }

    this.onConfirm = null;
  }
};

const PauseManager = {
  paused: false,
  pausedPhase: "",
  overlay: null,

  init() {
    this.overlay = document.getElementById("pauseOverlay");

    const pauseButton = document.getElementById("pauseButton");
    const resumeButton = document.getElementById("resumeButton");
    const restartButton = document.getElementById("pauseRestartButton");
    const exitButton = document.getElementById("pauseExitButton");
    const soundButton = document.getElementById("soundToggleButton");

    if (pauseButton) {
      pauseButton.addEventListener("click", () => this.pauseGame());
    }

    if (resumeButton) {
      resumeButton.addEventListener("click", () => this.resumeGame());
    }

    if (restartButton) {
      restartButton.addEventListener("click", () => {
        ConfirmDialog.showConfirmDialog("restart", () => restartGameFromScratch());
      });
    }

    if (exitButton) {
      exitButton.addEventListener("click", () => {
        ConfirmDialog.showConfirmDialog("exit", () => resetGame());
      });
    }

    if (soundButton) {
      soundButton.addEventListener("click", () => SoundManager.toggleMute());
    }
  },

  isPaused() {
    return this.paused;
  },

  pauseGame() {
    if (this.paused || (GameState.phase !== "observe" && GameState.phase !== "question")) {
      return;
    }

    this.paused = true;
    this.pausedPhase = GameState.phase;

    if (this.pausedPhase === "observe") {
      GameState.clearTimer();
      TimelinePlayer.pause();
    }

    this.setAnswerButtonsDisabled(true);
    this.showPauseMenu();
    SoundManager.play("pause");
    UIController.updateControls();
  },

  resumeGame() {
    if (!this.paused) {
      return;
    }

    const phase = this.pausedPhase;
    this.paused = false;
    this.pausedPhase = "";
    this.hidePauseMenu();

    if (phase === "observe" && GameState.phase === "observe") {
      TimelinePlayer.resume();
      startCountdownTimer();
    }

    if (phase === "question" && GameState.phase === "question" && !GameState.answerLocked) {
      this.setAnswerButtonsDisabled(false);
    }

    SoundManager.play("resume");
    UIController.updateControls();
  },

  forceClose() {
    this.paused = false;
    this.pausedPhase = "";
    this.hidePauseMenu();
    ConfirmDialog.hideConfirmDialog();
    this.setAnswerButtonsDisabled(false);
    UIController.updateControls();
  },

  showPauseMenu() {
    document.querySelector(".app-shell")?.classList.add("game-paused");

    if (this.overlay) {
      this.overlay.hidden = false;
    }
  },

  hidePauseMenu() {
    document.querySelector(".app-shell")?.classList.remove("game-paused");

    if (this.overlay) {
      this.overlay.hidden = true;
    }
  },

  setAnswerButtonsDisabled(disabled) {
    document.querySelectorAll(".answer-button").forEach((button) => {
      button.disabled = disabled;
    });
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
      initialRoundSceneState: getInitialRoundSceneState(),
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

function startCountdownTimer() {
  GameState.clearTimer();

  GameState.timerId = setInterval(() => {
    if (PauseManager.isPaused()) {
      return;
    }

    GameState.countdown -= 1;
    UIController.updateStatus();

    if (GameState.countdown <= 0) {
      GameState.clearTimer();
      TimelinePlayer.stop();
      UIController.updateControls();
      UIController.playObserveEndTransition(() => {
        if (GameState.phase === "observe" && !PauseManager.isPaused()) {
          showQuestionPhase();
        }
      });
    }
  }, 1000);
}

function startObservePhase() {
  GameState.clearTimer();
  GameState.clearDelayedActions();
  TimelinePlayer.stop();
  PauseManager.forceClose();
  resetSceneState();
  resetEventLog();
  captureInitialRoundSceneState();
  GameState.countdown = DifficultyManager.getObserveDuration(GameState.round);
  document.getElementById("convenienceScene").classList.remove("scene-ending");
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
  UIController.showScreen("observe");

  const events = EventGenerator.generate(GameState.round);
  TimelinePlayer.start(events);
  SoundManager.play("observeStart");
  startCountdownTimer();
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
  if (GameState.phase !== "question" || GameState.answerLocked || PauseManager.isPaused()) {
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
    SoundManager.play("correct");
  } else {
    GameState.lives -= 1;
    GameState.lastFeedbackMessage = randomFrom(DataConfig.wrongFeedbackMessages);
    SoundManager.play("wrong");
    SoundManager.play("lifeLost");
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
  PauseManager.forceClose();
  GameState.reset();
  resetSceneState();
  resetEventLog();
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
  UIController.showScreen("home");
}

function restartGameFromScratch() {
  PauseManager.forceClose();
  GameState.reset();
  startObservePhase();
}

function goToNextRound() {
  if (GameState.phase !== "result") {
    return;
  }

  if (GameState.lives <= 0) {
    UIController.renderGameOver();
    UIController.showScreen("gameOver");
    SoundManager.play("gameOver");
    return;
  }

  GameState.round += 1;
  startObservePhase();
}

document.addEventListener("DOMContentLoaded", () => {
  UIController.init();
  SceneRenderer.init();
  SoundManager.init();
  ConfirmDialog.init();
  PauseManager.init();
  DebugPanel.init();
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
  UIController.updateControls();

  document.getElementById("startButton").addEventListener("click", startGame);
  document.getElementById("nextRoundButton").addEventListener("click", goToNextRound);
  document.getElementById("restartButton").addEventListener("click", resetGame);
});
