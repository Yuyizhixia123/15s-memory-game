// Runtime debug panel snapshots.

const DebugPanel = {
  isOpen: false,
  refreshTimerId: null,
  container: null,
  toggleButton: null,
  panel: null,
  content: null,

  init() {
    this.container = document.getElementById("debugTools");
    this.toggleButton = document.getElementById("debugToggleButton");
    this.panel = document.getElementById("debugPanel");
    this.content = document.getElementById("debugContent");

    if (!this.isDebugEnabled()) {
      this.disable();
      return;
    }

    if (!this.container || !this.toggleButton || !this.panel || !this.content) {
      return;
    }

    this.container.hidden = false;
    this.toggleButton.addEventListener("click", () => this.toggle());
    this.render();
  },

  isDebugEnabled() {
    let enabledByUrl = false;
    let enabledByStorage = false;

    try {
      enabledByUrl = new URLSearchParams(window.location.search).get("debug") === "1";
    } catch (error) {
      enabledByUrl = false;
    }

    try {
      enabledByStorage = localStorage.getItem("debugMode") === "true";
    } catch (error) {
      enabledByStorage = false;
    }

    return enabledByUrl || enabledByStorage;
  },

  disable() {
    this.close();

    if (this.container) {
      this.container.hidden = true;
    }
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
