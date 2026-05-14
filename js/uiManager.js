// Screen switching, controls, modals, pause menu, and leaderboard UI.

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
    SoundManager.updateBGMForPhase(screenName);
  },

  updateControls() {
    const pauseButton = document.getElementById("pauseButton");

    if (pauseButton) {
      const canPause = GameState.phase === "observe" || GameState.phase === "question";
      pauseButton.hidden = !canPause || PauseManager.isPaused();
    }

    SoundManager.updateToggle();
    SoundManager.updateBGMToggle();
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
    const previousBest = LeaderboardService.getBestRound();

    if (!GameState.hasSavedCurrentResult) {
      GameState.currentResultIsNewRecord = !previousBest || completedRounds > previousBest.round;
      LeaderboardService.saveScore({
        round: completedRounds,
        score: GameState.score,
        rating: rating.title,
        date: Date.now()
      });
      GameState.hasSavedCurrentResult = true;
    }

    const bestRound = LeaderboardService.getBestRound();

    document.getElementById("finalScoreText").textContent = GameState.score;
    document.getElementById("finalRoundText").textContent = completedRounds;
    document.getElementById("finalRatingTitle").textContent = rating.title;
    document.getElementById("finalRatingDetail").textContent = rating.detail;

    const bestRoundText = document.getElementById("bestRoundText");
    const newRecordText = document.getElementById("newRecordText");

    if (bestRoundText) {
      bestRoundText.textContent = bestRound ? `${bestRound.round}轮` : "0轮";
    }

    if (newRecordText) {
      newRecordText.hidden = !GameState.currentResultIsNewRecord;
    }

    LeaderboardUI.render();
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

const LeaderboardUI = {
  overlay: null,
  list: null,
  stats: null,
  closeButton: null,
  clearButton: null,

  init() {
    this.overlay = document.getElementById("leaderboardOverlay");
    this.list = document.getElementById("leaderboardList");
    this.stats = document.getElementById("leaderboardStats");
    this.closeButton = document.getElementById("closeLeaderboardButton");
    this.clearButton = document.getElementById("clearLeaderboardButton");

    const openButton = document.getElementById("viewLeaderboardButton");
    const homeOpenButton = document.getElementById("homeLeaderboardButton");

    if (openButton) {
      openButton.addEventListener("click", () => this.open());
    }

    if (homeOpenButton) {
      homeOpenButton.addEventListener("click", () => this.open());
    }

    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.close());
    }

    if (this.clearButton) {
      this.clearButton.addEventListener("click", () => {
        ConfirmDialog.showConfirmDialog("clearLeaderboard", () => {
          LeaderboardService.clearScores();
          this.render();
          this.renderClearedFinalSummary();
        });
      });
    }

    this.render();
  },

  open() {
    this.render();

    if (this.overlay) {
      this.overlay.hidden = false;
    }
  },

  close() {
    if (this.overlay) {
      this.overlay.hidden = true;
    }
  },

  render() {
    this.renderStats();
    this.renderList();
  },

  renderStats() {
    if (!this.stats) {
      return;
    }

    const stats = LeaderboardService.getStats();

    this.stats.innerHTML = "";
    [
      ["最高轮数", `${stats.bestRound}轮`],
      ["最高分", `${stats.bestScore}`],
      ["游戏次数", `${stats.totalGames}`],
      ["平均轮数", stats.averageRound.toFixed(1)]
    ].forEach(([label, value]) => {
      const item = document.createElement("span");
      const labelElement = document.createElement("small");
      const valueElement = document.createElement("strong");

      labelElement.textContent = label;
      valueElement.textContent = value;
      item.append(labelElement, valueElement);
      this.stats.appendChild(item);
    });
  },

  renderList() {
    if (!this.list) {
      return;
    }

    const scores = LeaderboardService.getTopScores(10);

    this.list.innerHTML = "";

    if (scores.length === 0) {
      const empty = document.createElement("p");

      empty.className = "leaderboard-empty";
      empty.textContent = "暂无记录";
      this.list.appendChild(empty);
      return;
    }

    scores.forEach((score, index) => {
      const row = document.createElement("div");
      const rank = document.createElement("strong");
      const main = document.createElement("span");
      const meta = document.createElement("small");

      row.className = "leaderboard-row";
      rank.className = "leaderboard-rank";
      rank.textContent = `#${index + 1}`;
      main.textContent = `${score.round}轮 · ${score.score}分 · ${score.rating || "未评级"}`;
      meta.textContent = this.formatDate(score.date);
      row.append(rank, main, meta);
      this.list.appendChild(row);
    });
  },

  renderClearedFinalSummary() {
    const bestRoundText = document.getElementById("bestRoundText");
    const newRecordText = document.getElementById("newRecordText");

    if (bestRoundText) {
      bestRoundText.textContent = "0轮";
    }

    if (newRecordText) {
      newRecordText.hidden = true;
    }
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
    const configs = {
      restart: {
        title: "确认重新开始？",
        message: "当前进度会丢失。",
        acceptText: "确认重新开始"
      },
      exit: {
        title: "确认退出？",
        message: "当前游戏进度不会保存。",
        acceptText: "确认退出"
      },
      clearLeaderboard: {
        title: "清空本地记录？",
        message: "本地排行榜会被清空，此操作不会影响当前游戏。",
        acceptText: "确认清空"
      }
    };
    const config = configs[type] || configs.exit;

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
    const musicButton = document.getElementById("musicToggleButton");

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
        ConfirmDialog.showConfirmDialog("exit", () => returnToHome());
      });
    }

    if (soundButton) {
      soundButton.addEventListener("click", () => SoundManager.toggleMute());
    }

    if (musicButton) {
      musicButton.addEventListener("click", () => SoundManager.toggleBGM());
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
