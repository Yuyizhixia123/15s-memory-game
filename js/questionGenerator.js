// Question generation based only on the current round event log.

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

  getPlayableEvents(log) {
    return log.filter((event) => event.type !== "initial_inventory_snapshot");
  },

  getInitialInventorySnapshot(log) {
    return log.find((event) => event.type === "initial_inventory_snapshot");
  },

  buildInitialQuantityQuestion({ log }) {
    const initialState = this.getInitialInventorySnapshot(log);

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
      sourceEventId: initialState.id,
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
    const playableEvents = this.getPlayableEvents(log);

    if (playableEvents.length === 0) {
      return null;
    }

    const firstEvent = playableEvents[0];
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
    const playableEvents = this.getPlayableEvents(log);

    if (playableEvents.length === 0) {
      return null;
    }

    const lastEvent = playableEvents[playableEvents.length - 1];
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
    const playableEvents = this.getPlayableEvents(log);
    const answer = `${playableEvents.length}个`;

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
