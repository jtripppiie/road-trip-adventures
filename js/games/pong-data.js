/*
 * Road Pong settings and difficulty data.
 *
 * Centralized game tuning so difficulty can be adjusted without touching
 * the core game logic.
 */
(() => {
  const defaultSettings = Object.freeze({
    opponentMode: 'computer',
    difficulty: 'normal',
  });

  const difficulties = Object.freeze({
    easy: Object.freeze({
      label: 'Easy',
      description: 'Relaxed play for beginners.',

      targetScore: 5,

      paddleHeight: 108,
      humanSpeed: 7,

      ballSpeed: 4.0,

      aiSpeed: 3.8,
      aiError: 36,
      reactionDelay: 180, // ms
      trackingChance: 0.75,
      aiPerfect: false,
    }),

    normal: Object.freeze({
      label: 'Normal',
      description: 'Balanced challenge.',

      targetScore: 7,

      paddleHeight: 96,
      humanSpeed: 7,

      ballSpeed: 4.5,

      aiSpeed: 5.8,
      aiError: 16,
      reactionDelay: 90,
      trackingChance: 0.9,
      aiPerfect: false,
    }),

    hard: Object.freeze({
      label: 'Hard',
      description: 'Little room for mistakes.',

      targetScore: 7,

      paddleHeight: 86,
      humanSpeed: 7,

      ballSpeed: 5.0,

      aiSpeed: 7.4,
      aiError: 6,
      reactionDelay: 40,
      trackingChance: 0.97,
      aiPerfect: false,
    }),

    deathmatch: Object.freeze({
      label: 'Death Match',
      description: 'The AI never blinks.',

      targetScore: 7,

      paddleHeight: 112, // slight handicap for player
      humanSpeed: 7,

      ballSpeed: 5.4,

      aiSpeed: 14,
      aiError: 0,
      reactionDelay: 0,
      trackingChance: 1,
      aiPerfect: true,
    }),
  });

  function normalizeSettings(settings = {}) {
    const opponentMode =
      settings.opponentMode === 'local'
        ? 'local'
        : defaultSettings.opponentMode;

    const difficulty =
      difficulties[settings.difficulty]
        ? settings.difficulty
        : defaultSettings.difficulty;

    return {
      opponentMode,
      difficulty,
    };
  }

  function getDifficultyConfig(difficulty = defaultSettings.difficulty) {
    return difficulties[difficulty] || difficulties.normal;
  }

  function getDifficultyList() {
    return Object.entries(difficulties).map(([id, config]) => ({
      id,
      label: config.label,
      description: config.description,
    }));
  }

  window.RTA_PONG_DATA = Object.freeze({
    defaultSettings,
    difficulties,
    normalizeSettings,
    getDifficultyConfig,
    getDifficultyList,
  });
})();