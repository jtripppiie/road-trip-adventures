/*
 * Road Pong settings and difficulty data.
 *
 * Kept outside script.js so levels can be tuned without digging through the
 * main application flow.
 */
(function () {
  const defaultSettings = {
    opponentMode: 'computer',
    difficulty: 'normal',
  };

  const difficulties = {
    easy: {
      label: 'Easy',
      targetScore: 5,
      paddleHeight: 100,
      humanSpeed: 7,
      aiSpeed: 3.6,
      aiError: 34,
      reaction: 0.14,
      ballSpeed: 4.0,
      aiPerfect: false,
    },
    normal: {
      label: 'Normal',
      targetScore: 7,
      paddleHeight: 92,
      humanSpeed: 7,
      aiSpeed: 5.6,
      aiError: 16,
      reaction: 0.08,
      ballSpeed: 4.5,
      aiPerfect: false,
    },
    hard: {
      label: 'Hard',
      targetScore: 7,
      paddleHeight: 84,
      humanSpeed: 7,
      aiSpeed: 7.6,
      aiError: 5,
      reaction: 0.03,
      ballSpeed: 5.0,
      aiPerfect: false,
    },
    deathmatch: {
      label: 'Death Match',
      targetScore: 7,
      paddleHeight: 112,
      humanSpeed: 7,
      aiSpeed: 14,
      aiError: 0,
      reaction: 0,
      ballSpeed: 5.4,
      aiPerfect: true,
    },
  };

  function normalizeSettings(settings) {
    const merged = Object.assign({}, defaultSettings, settings || {});
    merged.opponentMode = merged.opponentMode === 'local' ? 'local' : 'computer';
    merged.difficulty = Object.prototype.hasOwnProperty.call(difficulties, merged.difficulty)
      ? merged.difficulty
      : defaultSettings.difficulty;
    return merged;
  }

  function getDifficultyConfig(difficulty) {
    return difficulties[difficulty] || difficulties[defaultSettings.difficulty];
  }

  window.RTA_PONG_DATA = {
    defaultSettings,
    difficulties,
    getDifficultyConfig,
    normalizeSettings,
  };
})();
