(function () {
  const data = window.HideSeekHouseData;
  const renderer = window.HideSeekHouseRender;
  if (!data || !renderer) return;

  const { HOUSE, PHASES, createInitialState, getSpotById } = data;

  const canvas = document.getElementById('house-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!canvas || !ctx) return;

  const elements = {
    playerOneInput: document.getElementById('house-player-1'),
    playerTwoInput: document.getElementById('house-player-2'),
    roundsInput: document.getElementById('house-rounds'),
    hideTimeInput: document.getElementById('house-hide-time'),
    seekTimeInput: document.getElementById('house-seek-time'),
    startButton: document.getElementById('house-start'),
    resetButton: document.getElementById('house-reset'),
    passButton: document.getElementById('house-pass'),
    nextRoundButton: document.getElementById('house-next-round'),
    fullscreenButton: document.getElementById('house-fullscreen'),
    phaseText: document.getElementById('house-phase-text'),
    roundChip: document.getElementById('house-round-chip'),
    timerChip: document.getElementById('house-timer-chip'),
    roomBadge: document.getElementById('house-room-badge'),
    status: document.getElementById('house-status'),
    navigation: document.getElementById('house-navigation'),
    spots: document.getElementById('house-spots'),
    scoreboard: document.getElementById('house-scoreboard'),
    log: document.getElementById('house-log'),
  };

  let state = createInitialState();
  let timerId = null;

  function getHiderName() {
    return state.players[state.hiderIndex];
  }

  function getSeekerName() {
    return state.players[state.seekerIndex];
  }

  function appendLog(text) {
    state.log.unshift(text);
    state.log = state.log.slice(0, 8);
  }

  function readSetup() {
    state.players = [
      (elements.playerOneInput.value || 'Player 1').trim() || 'Player 1',
      (elements.playerTwoInput.value || 'Player 2').trim() || 'Player 2',
    ];
    state.totalRounds = Number(elements.roundsInput.value) || 5;
    state.hideSeconds = Number(elements.hideTimeInput.value) || 30;
    state.seekSeconds = Number(elements.seekTimeInput.value) || 60;
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function render() {
    renderer.renderScreen({
      canvas,
      ctx,
      state,
      elements,
      helpers: {
        getHiderName,
        getSeekerName,
        onRoomChange: setRoom,
        onHideSelect: selectHideSpot,
        onInspect: inspectSpot,
      },
    });
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

  function startTimerTick() {
    stopTimer();
    timerId = window.setInterval(() => {
      state.timer = Math.max(0, state.timer - 1);
      if (state.timer === 0) handleTimerExpired();
      render();
    }, 1000);
  }

  function startSeekerTurn() {
    if (!state.hiddenSpotId) return;
    stopTimer();
    state.phase = PHASES.PASS;
    state.timer = state.seekSeconds;
    appendLog(`Pass the device to ${getSeekerName()}.`);
    render();
  }

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
      const spot = getSpotById(state.hiddenRoom, state.hiddenSpotId);
      const difficulty = spot ? spot.difficulty : 1;
      const hiderPoints = 120 + state.hideSeconds * 2 + difficulty * 40;
      state.scores[state.hiderIndex] += hiderPoints;
      state.phase = state.round >= state.totalRounds ? PHASES.MATCH_END : PHASES.ROUND_END;
      appendLog(`${getHiderName()} stayed hidden and earns ${hiderPoints} points.`);
      render();
    }
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

  function confirmPass() {
    if (state.phase !== PHASES.PASS) return;
    state.phase = PHASES.SEEKER;
    state.currentRoom = 'foyer';
    appendLog(`${getSeekerName()} begins in the foyer.`);
    startTimerTick();
    render();
  }

  function setRoom(roomId) {
    if (!HOUSE[roomId]) return;
    state.currentRoom = roomId;
    render();
  }

  function selectHideSpot(spotId) {
    if (state.phase !== PHASES.HIDER) return;
    state.hiddenRoom = state.currentRoom;
    state.hiddenSpotId = spotId;
    appendLog(`${getHiderName()} locked in a hiding spot in the ${HOUSE[state.currentRoom].label}.`);
    startSeekerTurn();
  }

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
    const spot = getSpotById(state.currentRoom, spotId);
    appendLog(`${getSeekerName()} checked the ${spot ? spot.label : 'spot'}. Wrong spot, minus 8 seconds.`);
    if (state.timer === 0) handleTimerExpired();
    render();
  }

  elements.startButton.addEventListener('click', startMatch);
  elements.resetButton.addEventListener('click', resetMatch);
  elements.passButton.addEventListener('click', confirmPass);
  elements.nextRoundButton.addEventListener('click', () => {
    if (state.phase === PHASES.MATCH_END) startMatch();
    else startNextRound();
  });
  elements.fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        elements.fullscreenButton.textContent = 'Exit Fullscreen';
      } else {
        await document.exitFullscreen();
        elements.fullscreenButton.textContent = 'Fullscreen';
      }
    } catch (error) {
      appendLog('Fullscreen is unavailable on this browser.');
      render();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    elements.fullscreenButton.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
  });

  render();
})();
