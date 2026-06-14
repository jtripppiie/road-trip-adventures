(function () {
  // This game is intentionally self-contained:
  // - no external assets
  // - no frameworks
  // - one state object that drives both UI and canvas rendering
  const canvas = document.getElementById('house-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!canvas || !ctx) return;

  const playerOneInput = document.getElementById('house-player-1');
  const playerTwoInput = document.getElementById('house-player-2');
  const roundsInput = document.getElementById('house-rounds');
  const hideTimeInput = document.getElementById('house-hide-time');
  const seekTimeInput = document.getElementById('house-seek-time');
  const startButton = document.getElementById('house-start');
  const resetButton = document.getElementById('house-reset');
  const passButton = document.getElementById('house-pass');
  const nextRoundButton = document.getElementById('house-next-round');
  const fullscreenButton = document.getElementById('house-fullscreen');
  const phaseText = document.getElementById('house-phase-text');
  const roundChip = document.getElementById('house-round-chip');
  const timerChip = document.getElementById('house-timer-chip');
  const roomBadge = document.getElementById('house-room-badge');
  const status = document.getElementById('house-status');
  const navigation = document.getElementById('house-navigation');
  const spots = document.getElementById('house-spots');
  const scoreboard = document.getElementById('house-scoreboard');
  const log = document.getElementById('house-log');

  // Each room owns its own visible hiding spots and door connections.
  const HOUSE = {
    foyer: {
      label: 'Foyer',
      x: 70, y: 90, w: 260, h: 220, color: '#f7d9bf',
      doors: ['lounge', 'study'],
      spots: [
        { id: 'umbrella-stand', label: 'Umbrella stand', x: 105, y: 230, difficulty: 1 },
        { id: 'shoe-bench', label: 'Shoe bench', x: 205, y: 250, difficulty: 2 },
        { id: 'coat-rack', label: 'Coat rack', x: 280, y: 155, difficulty: 2 },
      ],
    },
    lounge: {
      label: 'Lounge',
      x: 360, y: 90, w: 300, h: 220, color: '#cfe7f6',
      doors: ['foyer', 'kitchen', 'attic'],
      spots: [
        { id: 'blue-couch', label: 'Blue couch', x: 425, y: 240, difficulty: 3 },
        { id: 'book-nook', label: 'Book nook', x: 540, y: 130, difficulty: 2 },
        { id: 'curtain-fold', label: 'Curtain fold', x: 620, y: 180, difficulty: 2 },
      ],
    },
    kitchen: {
      label: 'Kitchen',
      x: 690, y: 90, w: 320, h: 220, color: '#f5efc9',
      doors: ['lounge', 'garage'],
      spots: [
        { id: 'pantry-door', label: 'Pantry door', x: 915, y: 140, difficulty: 2 },
        { id: 'island-stools', label: 'Island stools', x: 790, y: 240, difficulty: 1 },
        { id: 'fridge-shadow', label: 'Fridge shadow', x: 945, y: 240, difficulty: 2 },
      ],
    },
    study: {
      label: 'Study',
      x: 90, y: 360, w: 280, h: 250, color: '#e8d7f5',
      doors: ['foyer', 'garage'],
      spots: [
        { id: 'desk-knee-space', label: 'Desk knee space', x: 170, y: 520, difficulty: 2 },
        { id: 'reading-chair', label: 'Reading chair', x: 285, y: 470, difficulty: 2 },
        { id: 'stacked-boxes', label: 'Stacked boxes', x: 135, y: 410, difficulty: 3 },
      ],
    },
    attic: {
      label: 'Attic',
      x: 410, y: 360, w: 250, h: 250, color: '#f3d1cf',
      doors: ['lounge'],
      spots: [
        { id: 'old-trunk', label: 'Old trunk', x: 470, y: 520, difficulty: 3 },
        { id: 'sheet-ghosts', label: 'Sheeted furniture', x: 570, y: 450, difficulty: 3 },
        { id: 'window-seat', label: 'Window seat', x: 525, y: 395, difficulty: 2 },
      ],
    },
    garage: {
      label: 'Garage',
      x: 700, y: 360, w: 290, h: 250, color: '#d8dde4',
      doors: ['study', 'kitchen'],
      spots: [
        { id: 'tool-cabinet', label: 'Tool cabinet', x: 930, y: 430, difficulty: 2 },
        { id: 'wagon-wheel', label: 'Wagon wheel', x: 815, y: 545, difficulty: 1 },
        { id: 'camping-bin', label: 'Camping bin', x: 760, y: 445, difficulty: 2 },
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

  let state = createInitialState();
  let timerId = null;

  function createInitialState() {
    return {
      players: ['Hider', 'Seeker'],
      scores: [0, 0],
      round: 0,
      totalRounds: 5,
      hideSeconds: 30,
      seekSeconds: 60,
      timer: 0,
      phase: PHASES.IDLE,
      hiderIndex: 0,
      seekerIndex: 1,
      currentRoom: 'foyer',
      hiddenRoom: null,
      hiddenSpotId: null,
      foundSpotId: null,
      inspectedSpots: [],
      log: ['Welcome to Hide & Seek House.'],
    };
  }

  function readSetup() {
    state.players = [
      (playerOneInput.value || 'Player 1').trim() || 'Player 1',
      (playerTwoInput.value || 'Player 2').trim() || 'Player 2',
    ];
    state.totalRounds = Number(roundsInput.value) || 5;
    state.hideSeconds = Number(hideTimeInput.value) || 30;
    state.seekSeconds = Number(seekTimeInput.value) || 60;
  }

  function resetStateForRound() {
    state.currentRoom = 'foyer';
    state.hiddenRoom = null;
    state.hiddenSpotId = null;
    state.foundSpotId = null;
    state.inspectedSpots = [];
    state.timer = state.hideSeconds;
    state.phase = PHASES.HIDER;
    appendLog(`${getHiderName()} is hiding. ${state.hideSeconds} seconds on the clock.`);
  }

  function startMatch() {
    stopTimer();
    state = createInitialState();
    readSetup();
    state.round = 1;
    resetStateForRound();
    startTimerTick();
    render();
  }

  function resetMatch() {
    stopTimer();
    state = createInitialState();
    render();
  }

  function startNextRound() {
    if (state.round >= state.totalRounds) {
      state.phase = PHASES.MATCH_END;
      render();
      return;
    }
    state.hiderIndex = state.hiderIndex === 0 ? 1 : 0;
    state.seekerIndex = state.hiderIndex === 0 ? 1 : 0;
    state.round += 1;
    resetStateForRound();
    startTimerTick();
    render();
  }

  function startSeekerTurn() {
    if (!state.hiddenSpotId) return;
    stopTimer();
    state.phase = PHASES.PASS;
    state.timer = state.seekSeconds;
    appendLog(`Pass the device to ${getSeekerName()}.`);
    render();
  }

  function confirmPass() {
    if (state.phase !== PHASES.PASS) return;
    state.phase = PHASES.SEEKER;
    state.currentRoom = 'foyer';
    appendLog(`${getSeekerName()} begins in the foyer.`);
    startTimerTick();
    render();
  }

  // A single timer powers both the hide phase and the seek phase.
  function startTimerTick() {
    stopTimer();
    timerId = window.setInterval(() => {
      state.timer = Math.max(0, state.timer - 1);
      if (state.timer === 0) {
        handleTimerExpired();
      }
      render();
    }, 1000);
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  // When time runs out, the result depends on which phase is active.
  function handleTimerExpired() {
    stopTimer();
    if (state.phase === PHASES.HIDER) {
      appendLog(`${getHiderName()} ran out of hiding time.`);
      if (!state.hiddenSpotId) {
        const fallback = HOUSE[state.currentRoom].spots[0];
        selectHideSpot(fallback.id);
        return;
      }
      startSeekerTurn();
      return;
    }
    if (state.phase === PHASES.SEEKER) {
      const hiderPoints = 120 + state.hideSeconds * 2 + (HOUSE[state.hiddenRoom].spots.find(spot => spot.id === state.hiddenSpotId).difficulty * 40);
      state.scores[state.hiderIndex] += hiderPoints;
      state.phase = state.round >= state.totalRounds ? PHASES.MATCH_END : PHASES.ROUND_END;
      appendLog(`${getHiderName()} stayed hidden and earns ${hiderPoints} points.`);
      render();
    }
  }

  function setRoom(roomId) {
    state.currentRoom = roomId;
    render();
  }

  // The hider locks in exactly one hiding spot for the round.
  function selectHideSpot(spotId) {
    if (state.phase !== PHASES.HIDER) return;
    state.hiddenRoom = state.currentRoom;
    state.hiddenSpotId = spotId;
    appendLog(`${getHiderName()} locked in a hiding spot in the ${HOUSE[state.currentRoom].label}.`);
    startSeekerTurn();
  }

  // The seeker can inspect each spot once. Wrong guesses burn time.
  function inspectSpot(spotId) {
    if (state.phase !== PHASES.SEEKER) return;
    if (state.inspectedSpots.includes(spotId)) return;
    state.inspectedSpots.push(spotId);
    if (spotId === state.hiddenSpotId && state.currentRoom === state.hiddenRoom) {
      const seekerPoints = Math.max(80, 220 + state.timer * 3 - (state.inspectedSpots.length - 1) * 18);
      state.scores[state.seekerIndex] += seekerPoints;
      state.foundSpotId = spotId;
      state.phase = state.round >= state.totalRounds ? PHASES.MATCH_END : PHASES.ROUND_END;
      stopTimer();
      appendLog(`${getSeekerName()} found the hiding spot and earns ${seekerPoints} points.`);
      render();
      return;
    }
    state.timer = Math.max(0, state.timer - 8);
    appendLog(`${getSeekerName()} checked the ${getSpotLabel(spotId)}. Wrong spot, minus 8 seconds.`);
    if (state.timer === 0) handleTimerExpired();
    render();
  }

  function getSpotLabel(spotId) {
    for (const room of ROOM_ORDER) {
      const found = HOUSE[room].spots.find(spot => spot.id === spotId);
      if (found) return found.label;
    }
    return 'spot';
  }

  function appendLog(text) {
    state.log.unshift(text);
    state.log = state.log.slice(0, 8);
  }

  function getHiderName() {
    return state.players[state.hiderIndex];
  }

  function getSeekerName() {
    return state.players[state.seekerIndex];
  }

  // Canvas rendering starts here. The rest of the draw helpers only read state.
  function drawHouse() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#dceaf7');
    bg.addColorStop(1, '#f7fbff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8fb670';
    ctx.fillRect(0, 630, canvas.width, 90);

    ROOM_ORDER.forEach((roomId) => {
      const room = HOUSE[roomId];
      const isCurrent = state.currentRoom === roomId;
      ctx.fillStyle = room.color;
      ctx.fillRect(room.x, room.y, room.w, room.h);
      ctx.strokeStyle = isCurrent ? '#f58220' : '#16314f';
      ctx.lineWidth = isCurrent ? 8 : 4;
      ctx.strokeRect(room.x, room.y, room.w, room.h);

      ctx.fillStyle = '#16314f';
      ctx.font = '700 28px Atkinson Hyperlegible, sans-serif';
      ctx.fillText(room.label, room.x + 18, room.y + 36);

      room.spots.forEach((spot) => drawSpot(roomId, room, spot));
    });

    drawHallLines();
  }

  function drawHallLines() {
    ctx.strokeStyle = 'rgba(22, 49, 79, 0.15)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(330, 200);
    ctx.lineTo(360, 200);
    ctx.moveTo(660, 200);
    ctx.lineTo(690, 200);
    ctx.moveTo(230, 310);
    ctx.lineTo(230, 360);
    ctx.moveTo(830, 310);
    ctx.lineTo(830, 360);
    ctx.moveTo(535, 310);
    ctx.lineTo(535, 360);
    ctx.stroke();
  }

  function drawSpot(roomId, room, spot) {
    const isInspected = state.inspectedSpots.includes(spot.id);
    const isFound = state.foundSpotId === spot.id;
    const isActual = state.hiddenSpotId === spot.id && state.hiddenRoom === roomId;
    const radius = 22 + spot.difficulty * 4;

    ctx.beginPath();
    ctx.fillStyle = isFound
      ? '#f58220'
      : isInspected
        ? '#9fb2c6'
        : '#ffffff';
    ctx.arc(spot.x, spot.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16314f';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (state.phase !== PHASES.HIDER && isActual && (state.phase === PHASES.ROUND_END || state.phase === PHASES.MATCH_END)) {
      ctx.fillStyle = '#16314f';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#16314f';
    ctx.font = '600 16px Atkinson Hyperlegible, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(spot.label, spot.x, spot.y + radius + 24);
    ctx.textAlign = 'left';
  }

  function renderNavigation() {
    navigation.innerHTML = '';
    const room = HOUSE[state.currentRoom];
    room.doors.forEach((targetId) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'house-nav-button';
      button.textContent = `Go to ${HOUSE[targetId].label}`;
      button.disabled = !(state.phase === PHASES.HIDER || state.phase === PHASES.SEEKER);
      button.addEventListener('click', () => setRoom(targetId));
      navigation.appendChild(button);
    });
  }

  function renderSpots() {
    spots.innerHTML = '';
    const room = HOUSE[state.currentRoom];
    room.spots.forEach((spot) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'house-spot-button';
      if (state.hiddenSpotId === spot.id && state.phase === PHASES.HIDER) button.classList.add('is-hidden');
      if (state.foundSpotId === spot.id) button.classList.add('is-found');
      button.innerHTML = `<strong>${spot.label}</strong><span>Cover ${spot.difficulty}/3</span>`;
      if (state.phase === PHASES.HIDER) {
        button.addEventListener('click', () => selectHideSpot(spot.id));
      } else if (state.phase === PHASES.SEEKER) {
        button.disabled = state.inspectedSpots.includes(spot.id);
        button.addEventListener('click', () => inspectSpot(spot.id));
      } else {
        button.disabled = true;
      }
      spots.appendChild(button);
    });
  }

  function renderScoreboard() {
    scoreboard.innerHTML = '';
    state.players.forEach((name, index) => {
      const card = document.createElement('div');
      card.className = `team-score player-score player-${index + 1}`;
      const label = document.createElement('span');
      label.className = 'team-label';
      label.textContent = name;
      const value = document.createElement('strong');
      value.textContent = String(state.scores[index]);
      card.appendChild(label);
      card.appendChild(value);
      scoreboard.appendChild(card);
    });
  }

  function renderLog() {
    log.innerHTML = '';
    state.log.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = entry;
      log.appendChild(item);
    });
  }

  // render() is the single place where DOM text, buttons, and the canvas are refreshed.
  function render() {
    drawHouse();
    renderNavigation();
    renderSpots();
    renderScoreboard();
    renderLog();

    roundChip.textContent = `${state.round} / ${state.totalRounds}`;
    timerChip.textContent = state.phase === PHASES.IDLE ? '--' : `${state.timer}s`;
    roomBadge.textContent = HOUSE[state.currentRoom].label;

    if (state.phase === PHASES.IDLE) {
      phaseText.textContent = 'Pick your players, set the clocks, and start a new match.';
      status.textContent = 'Waiting to begin.';
    } else if (state.phase === PHASES.HIDER) {
      phaseText.textContent = `${getHiderName()} is hiding. Move through the house and choose one spot before time runs out.`;
      status.textContent = 'Choose a room, then tap a hiding spot.';
    } else if (state.phase === PHASES.PASS) {
      phaseText.textContent = `${getHiderName()} is hidden. Hand the device to ${getSeekerName()} and start the search.`;
      status.textContent = `Hidden in ${HOUSE[state.hiddenRoom].label}. The seeker should not peek.`;
    } else if (state.phase === PHASES.SEEKER) {
      phaseText.textContent = `${getSeekerName()} is searching. Wrong inspections cost 8 seconds.`;
      status.textContent = 'Move room to room and inspect the best-looking spot.';
    } else if (state.phase === PHASES.ROUND_END) {
      phaseText.textContent = 'Round complete. Check the score, then start the next round.';
      status.textContent = state.foundSpotId
        ? `${getSeekerName()} found ${getHiderName()} in the ${getSpotLabel(state.hiddenSpotId)}.`
        : `${getHiderName()} stayed hidden in the ${getSpotLabel(state.hiddenSpotId)}.`;
    } else if (state.phase === PHASES.MATCH_END) {
      const winner = state.scores[0] === state.scores[1]
        ? 'The match ends in a tie.'
        : `${state.scores[0] > state.scores[1] ? state.players[0] : state.players[1]} wins the match.`;
      phaseText.textContent = 'Match complete.';
      status.textContent = winner;
    }

    passButton.disabled = state.phase !== PHASES.PASS;
    nextRoundButton.disabled = !(state.phase === PHASES.ROUND_END || state.phase === PHASES.MATCH_END);
    nextRoundButton.textContent = state.phase === PHASES.MATCH_END ? 'Play Another Match' : 'Next Round';
  }

  startButton.addEventListener('click', startMatch);
  resetButton.addEventListener('click', resetMatch);
  passButton.addEventListener('click', confirmPass);
  nextRoundButton.addEventListener('click', () => {
    if (state.phase === PHASES.MATCH_END) {
      startMatch();
    } else {
      startNextRound();
    }
  });
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        fullscreenButton.textContent = 'Exit Fullscreen';
      } else {
        await document.exitFullscreen();
        fullscreenButton.textContent = 'Fullscreen';
      }
    } catch (error) {
      appendLog('Fullscreen is unavailable on this browser.');
      renderLog();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
  });

  render();
})();
