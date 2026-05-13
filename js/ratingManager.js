// Final performance rating thresholds and copy.

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
