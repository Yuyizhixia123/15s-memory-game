// Difficulty tier lookup and round-based pacing rules.

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
