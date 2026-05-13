// Local leaderboard persistence and score statistics.

const LeaderboardService = {
  storageKey: "convenience_memory_leaderboard",
  maxStoredScores: 50,

  saveScore(result) {
    const scores = this.readScores();
    const safeResult = this.normalizeScore(result);

    scores.push(safeResult);
    this.writeScores(scores.slice(-this.maxStoredScores));

    return safeResult;
  },

  getBestRound() {
    const topScores = this.getTopScores();

    return topScores[0] || null;
  },

  getRecentScores() {
    return this.readScores()
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  },

  getTopScores(limit = 10) {
    return this.readScores()
      .sort((a, b) => {
        if (b.round !== a.round) {
          return b.round - a.round;
        }

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return b.date - a.date;
      })
      .slice(0, limit);
  },

  clearScores() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      // localStorage is optional. Failures must not interrupt the game.
    }
  },

  getStats() {
    const scores = this.readScores();
    const totalGames = scores.length;
    const bestRound = this.getBestRound();
    const bestScore = scores.reduce((best, score) => Math.max(best, score.score), 0);
    const averageRound = totalGames === 0
      ? 0
      : scores.reduce((sum, score) => sum + score.round, 0) / totalGames;

    return {
      totalGames,
      bestRound: bestRound ? bestRound.round : 0,
      bestScore,
      averageRound
    };
  },

  readScores() {
    try {
      const rawScores = localStorage.getItem(this.storageKey);
      const scores = JSON.parse(rawScores || "[]");

      if (!Array.isArray(scores)) {
        return [];
      }

      return scores
        .filter((score) => score && typeof score === "object")
        .map((score) => this.normalizeScore(score))
        .filter((score) => Number.isFinite(score.round) && Number.isFinite(score.score));
    } catch (error) {
      return [];
    }
  },

  writeScores(scores) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(scores));
    } catch (error) {
      // localStorage is optional. Failures must not interrupt the game.
    }
  },

  normalizeScore(result) {
    const source = result || {};
    const date = typeof source.date === "number"
      ? source.date
      : Date.now();

    return {
      round: Math.max(0, Number(source.round) || 0),
      score: Math.max(0, Number(source.score) || 0),
      rating: String(source.rating || ""),
      date
    };
  }
};
