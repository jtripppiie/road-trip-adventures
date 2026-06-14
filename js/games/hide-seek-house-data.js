(function () {
  const HOUSE = {
    foyer: {
      label: 'Foyer',
      x: 70, y: 90, w: 260, h: 220, color: '#f7d9bf',
      doors: ['lounge', 'study'],
      spots: [
        { id: 'umbrella-stand', label: 'Umbrella stand', objectType: 'stand', x: 105, y: 230, difficulty: 1 },
        { id: 'shoe-bench', label: 'Shoe bench', objectType: 'bench', x: 205, y: 250, difficulty: 2 },
        { id: 'coat-rack', label: 'Coat rack', objectType: 'rack', x: 280, y: 155, difficulty: 2 },
      ],
    },
    lounge: {
      label: 'Lounge',
      x: 360, y: 90, w: 300, h: 220, color: '#cfe7f6',
      doors: ['foyer', 'kitchen', 'attic'],
      spots: [
        { id: 'blue-couch', label: 'Blue couch', objectType: 'couch', x: 425, y: 240, difficulty: 3 },
        { id: 'book-nook', label: 'Book nook', objectType: 'bookshelf', x: 540, y: 130, difficulty: 2 },
        { id: 'curtain-fold', label: 'Curtain fold', objectType: 'curtain', x: 620, y: 180, difficulty: 2 },
      ],
    },
    kitchen: {
      label: 'Kitchen',
      x: 690, y: 90, w: 320, h: 220, color: '#f5efc9',
      doors: ['lounge', 'garage'],
      spots: [
        { id: 'pantry-door', label: 'Pantry door', objectType: 'pantry', x: 915, y: 140, difficulty: 2 },
        { id: 'island-stools', label: 'Island stools', objectType: 'stools', x: 790, y: 240, difficulty: 1 },
        { id: 'fridge-shadow', label: 'Fridge shadow', objectType: 'fridge', x: 945, y: 240, difficulty: 2 },
      ],
    },
    study: {
      label: 'Study',
      x: 90, y: 360, w: 280, h: 250, color: '#e8d7f5',
      doors: ['foyer', 'garage'],
      spots: [
        { id: 'desk-knee-space', label: 'Desk knee space', objectType: 'desk', x: 170, y: 520, difficulty: 2 },
        { id: 'reading-chair', label: 'Reading chair', objectType: 'chair', x: 285, y: 470, difficulty: 2 },
        { id: 'stacked-boxes', label: 'Stacked boxes', objectType: 'boxes', x: 135, y: 410, difficulty: 3 },
      ],
    },
    attic: {
      label: 'Attic',
      x: 410, y: 360, w: 250, h: 250, color: '#f3d1cf',
      doors: ['lounge'],
      spots: [
        { id: 'old-trunk', label: 'Old trunk', objectType: 'trunk', x: 470, y: 520, difficulty: 3 },
        { id: 'sheet-ghosts', label: 'Sheeted furniture', objectType: 'sheet-stack', x: 570, y: 450, difficulty: 3 },
        { id: 'window-seat', label: 'Window seat', objectType: 'window-seat', x: 525, y: 395, difficulty: 2 },
      ],
    },
    garage: {
      label: 'Garage',
      x: 700, y: 360, w: 290, h: 250, color: '#d8dde4',
      doors: ['study', 'kitchen'],
      spots: [
        { id: 'tool-cabinet', label: 'Tool cabinet', objectType: 'toolbox', x: 930, y: 430, difficulty: 2 },
        { id: 'wagon-wheel', label: 'Wagon wheel', objectType: 'wheel', x: 815, y: 545, difficulty: 1 },
        { id: 'camping-bin', label: 'Camping bin', objectType: 'bin', x: 760, y: 445, difficulty: 2 },
      ],
    },
  };

  const ROOM_ORDER = Object.keys(HOUSE);

  const PHASES = {
    IDLE: 'idle',
    HIDER: 'hider',
    PASS: 'pass',
    SEEKER: 'seeker',
    ROUND_END: 'round-end',
    MATCH_END: 'match-end',
  };

  const SEARCH_COUNTS = {
    easy: 10,
    normal: 8,
    hard: 6,
  };

  function createInitialState() {
    return {
      players: ['Hider', 'Seeker'],
      scores: [0, 0],
      round: 0,
      totalRounds: 5,
      difficulty: 'normal',
      hideSeconds: 30,
      timer: 0,
      searchesRemaining: SEARCH_COUNTS.normal,
      totalSearchesUsed: 0,
      phase: PHASES.IDLE,
      hiderIndex: 0,
      seekerIndex: 1,
      currentRoom: 'foyer',
      hiddenRoom: null,
      hiddenSpotId: null,
      foundSpotId: null,
      inspectedSpots: [],
      lastRoundResult: null,
      log: ['Welcome to Hide & Seek House.'],
    };
  }

  function getSpotLabel(spotId) {
    for (const roomId of ROOM_ORDER) {
      const spot = HOUSE[roomId].spots.find((item) => item.id === spotId);
      if (spot) return spot.label;
    }
    return 'spot';
  }

  function getSpotById(roomId, spotId) {
    if (!HOUSE[roomId]) return null;
    return HOUSE[roomId].spots.find((spot) => spot.id === spotId) || null;
  }

  window.HideSeekHouseData = {
    HOUSE,
    ROOM_ORDER,
    PHASES,
    SEARCH_COUNTS,
    createInitialState,
    getSpotById,
    getSpotLabel,
  };
})();
