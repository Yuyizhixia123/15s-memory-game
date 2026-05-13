// Shared game configuration and utility helpers.

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
