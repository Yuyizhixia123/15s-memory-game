// Game flow entry points and bootstrapping.

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

function recordInitialInventorySnapshot() {
  eventLog.push({
    id: `round-${GameState.round}-initial-inventory-snapshot`,
    time: 0,
    type: "initial_inventory_snapshot",
    round: GameState.round,
    items: sceneState.items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      area: item.area || "",
      count: item.count,
      initialCount: item.initialCount
    }))
  });
}

function startObservePhase() {
  GameState.clearTimer();
  GameState.clearDelayedActions();
  TimelinePlayer.stop();
  PauseManager.forceClose();
  resetSceneState();
  resetEventLog();
  recordInitialInventorySnapshot();
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
  GameState.reset();
  resetSceneState();
  resetEventLog();
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
}

function restartGameFromScratch() {
  PauseManager.forceClose();
  LeaderboardUI.close();
  GameState.reset();
  startObservePhase();
}

function returnToHome() {
  PauseManager.forceClose();
  LeaderboardUI.close();
  resetGame();
  UIController.showScreen("home");
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
  LeaderboardUI.init();
  PauseManager.init();
  DebugPanel.init();
  SceneRenderer.render(sceneState);
  UIController.updateStatus();
  UIController.updateControls();
  SoundManager.updateBGMForPhase(GameState.phase);

  document.getElementById("startButton").addEventListener("click", startGame);
  document.getElementById("nextRoundButton").addEventListener("click", goToNextRound);
  document.getElementById("restartButton").addEventListener("click", restartGameFromScratch);

  const finalHomeButton = document.getElementById("finalHomeButton");

  if (finalHomeButton) {
    finalHomeButton.addEventListener("click", returnToHome);
  }
});
