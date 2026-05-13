// Shared runtime state for rounds, score, scene snapshots, and event logs.

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
  hasSavedCurrentResult: false,
  currentResultIsNewRecord: false,
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
    this.hasSavedCurrentResult = false;
    this.currentResultIsNewRecord = false;
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
