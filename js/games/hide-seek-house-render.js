(function () {
  const data = window.HideSeekHouseData;
  if (!data) return;

  const { HOUSE, ROOM_ORDER, PHASES, getSpotLabel } = data;

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function drawHouse(ctx, canvas, state) {
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

      room.spots.forEach((spot) => drawSpot(ctx, state, roomId, spot));
    });

    drawHallLines(ctx);
  }

  function drawHallLines(ctx) {
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

  function drawObjectBadge(ctx, spot, radius) {
    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.strokeStyle = '#16314f';
    ctx.fillStyle = 'rgba(21,49,79,0.08)';
    ctx.lineWidth = 2.5;

    if (spot.objectType === 'couch') {
      ctx.fillRect(-radius * 0.8, -4, radius * 1.6, radius * 0.65);
      ctx.strokeRect(-radius * 0.8, -4, radius * 1.6, radius * 0.65);
      ctx.strokeRect(-radius * 0.95, -radius * 0.2, radius * 0.22, radius * 0.75);
      ctx.strokeRect(radius * 0.73, -radius * 0.2, radius * 0.22, radius * 0.75);
    } else if (spot.objectType === 'desk') {
      ctx.strokeRect(-radius * 0.8, -radius * 0.35, radius * 1.6, radius * 0.55);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.55, radius * 0.2);
      ctx.lineTo(-radius * 0.55, radius * 0.85);
      ctx.moveTo(radius * 0.55, radius * 0.2);
      ctx.lineTo(radius * 0.55, radius * 0.85);
      ctx.stroke();
    } else if (spot.objectType === 'rack' || spot.objectType === 'stand') {
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.75);
      ctx.lineTo(0, radius * 0.7);
      ctx.moveTo(-radius * 0.45, -radius * 0.25);
      ctx.lineTo(radius * 0.45, -radius * 0.25);
      ctx.moveTo(-radius * 0.55, radius * 0.72);
      ctx.lineTo(radius * 0.55, radius * 0.72);
      ctx.stroke();
    } else if (spot.objectType === 'bookshelf' || spot.objectType === 'toolbox' || spot.objectType === 'pantry' || spot.objectType === 'fridge') {
      ctx.strokeRect(-radius * 0.65, -radius * 0.75, radius * 1.3, radius * 1.5);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.45, -radius * 0.25);
      ctx.lineTo(radius * 0.45, -radius * 0.25);
      ctx.moveTo(-radius * 0.45, radius * 0.2);
      ctx.lineTo(radius * 0.45, radius * 0.2);
      ctx.stroke();
    } else if (spot.objectType === 'curtain' || spot.objectType === 'sheet-stack') {
      ctx.beginPath();
      ctx.moveTo(-radius * 0.7, -radius * 0.75);
      ctx.quadraticCurveTo(0, -radius * 0.45, radius * 0.7, -radius * 0.75);
      ctx.lineTo(radius * 0.55, radius * 0.75);
      ctx.lineTo(-radius * 0.55, radius * 0.75);
      ctx.closePath();
      ctx.stroke();
    } else if (spot.objectType === 'boxes' || spot.objectType === 'bin' || spot.objectType === 'trunk') {
      ctx.strokeRect(-radius * 0.7, -radius * 0.45, radius * 1.4, radius * 0.95);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.7, -radius * 0.05);
      ctx.lineTo(radius * 0.7, -radius * 0.05);
      ctx.stroke();
    } else if (spot.objectType === 'wheel') {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
      ctx.moveTo(-radius * 0.7, 0);
      ctx.lineTo(radius * 0.7, 0);
      ctx.moveTo(0, -radius * 0.7);
      ctx.lineTo(0, radius * 0.7);
      ctx.stroke();
    } else if (spot.objectType === 'chair' || spot.objectType === 'window-seat' || spot.objectType === 'bench' || spot.objectType === 'stools') {
      ctx.strokeRect(-radius * 0.6, -radius * 0.15, radius * 1.2, radius * 0.45);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.45, radius * 0.3);
      ctx.lineTo(-radius * 0.45, radius * 0.85);
      ctx.moveTo(radius * 0.45, radius * 0.3);
      ctx.lineTo(radius * 0.45, radius * 0.85);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSpot(ctx, state, roomId, spot) {
    const isInspected = state.inspectedSpots.includes(spot.id);
    const isFound = state.foundSpotId === spot.id;
    const isActual = state.hiddenSpotId === spot.id && state.hiddenRoom === roomId;
    const radius = 22 + spot.difficulty * 4;

    ctx.beginPath();
    ctx.fillStyle = isFound ? '#f58220' : isInspected ? '#9fb2c6' : '#ffffff';
    ctx.arc(spot.x, spot.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16314f';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawObjectBadge(ctx, spot, radius);

    if (isFound && isActual) {
      ctx.fillStyle = '#16314f';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.phase !== PHASES.SEEKER && state.phase !== PHASES.PASS && isActual && (state.phase === PHASES.ROUND_END || state.phase === PHASES.MATCH_END)) {
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

  function renderNavigation(root, state, onRoomChange) {
    if (!root) return;
    root.innerHTML = '';
    const room = HOUSE[state.currentRoom];
    room.doors.forEach((targetId) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'house-nav-button';
      button.textContent = `Go to ${HOUSE[targetId].label}`;
      button.disabled = !(state.phase === PHASES.HIDER || state.phase === PHASES.SEEKER);
      button.addEventListener('click', () => onRoomChange(targetId));
      root.appendChild(button);
    });
  }

  function renderSpots(root, state, onHideSelect, onInspect) {
    if (!root) return;
    root.innerHTML = '';
    const room = HOUSE[state.currentRoom];
    room.spots.forEach((spot) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'house-spot-button';
      if (state.hiddenSpotId === spot.id && state.phase === PHASES.HIDER) button.classList.add('is-hidden');
      if (state.foundSpotId === spot.id) button.classList.add('is-found');
      button.innerHTML = `<strong>${spot.label}</strong><span>Cover ${spot.difficulty}/3</span>`;
      if (state.phase === PHASES.HIDER) {
        button.addEventListener('click', () => onHideSelect(spot.id));
      } else if (state.phase === PHASES.SEEKER) {
        button.disabled = state.inspectedSpots.includes(spot.id);
        button.addEventListener('click', () => onInspect(spot.id));
      } else {
        button.disabled = true;
      }
      root.appendChild(button);
    });
  }

  function renderScoreboard(root, state) {
    if (!root) return;
    root.innerHTML = '';
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
      root.appendChild(card);
    });
  }

  function renderLog(root, state) {
    if (!root) return;
    root.innerHTML = '';
    state.log.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = entry;
      root.appendChild(item);
    });
  }

  function renderScreen(deps) {
    const {
      canvas,
      ctx,
      state,
      elements,
      helpers,
    } = deps;

    drawHouse(ctx, canvas, state);
    renderNavigation(elements.navigation, state, helpers.onRoomChange);
    renderSpots(elements.spots, state, helpers.onHideSelect, helpers.onInspect);
    renderScoreboard(elements.scoreboard, state);
    renderLog(elements.log, state);

    setText(elements.roundChip, `${state.round} / ${state.totalRounds}`);
    setText(elements.timerChip, state.phase === PHASES.HIDER ? `${state.timer}s` : '--');
    setText(
      elements.searchesChip,
      state.phase === PHASES.SEEKER || state.phase === PHASES.ROUND_END || state.phase === PHASES.MATCH_END
        ? String(state.searchesRemaining)
        : '--'
    );
    setText(elements.roomBadge, HOUSE[state.currentRoom].label);

    if (state.phase === PHASES.IDLE) {
      setText(elements.phaseText, 'Pick your players, choose the round settings, and start a new match.');
      setText(elements.status, 'Waiting to begin.');
    } else if (state.phase === PHASES.HIDER) {
      setText(elements.phaseText, `${helpers.getHiderName()} is hiding. Move through the house and choose one spot before time runs out.`);
      setText(elements.status, 'Choose a room, then tap a hiding spot.');
    } else if (state.phase === PHASES.PASS) {
      setText(elements.phaseText, `${helpers.getHiderName()} is hidden. Hand the device to ${helpers.getSeekerName()} and start the search.`);
      setText(elements.status, `${helpers.getSeekerName()} will begin in the foyer. The seeker should not peek.`);
    } else if (state.phase === PHASES.SEEKER) {
      setText(elements.phaseText, `${helpers.getSeekerName()} is searching. Each wrong unique inspection uses one search.`);
      setText(elements.status, `${state.searchesRemaining} searches left. Move room to room and inspect carefully.`);
    } else if (state.phase === PHASES.ROUND_END) {
      setText(elements.phaseText, 'Round complete. Check the score, then start the next round.');
      setText(
        elements.status,
        state.lastRoundResult
          ? state.lastRoundResult.summary
          : state.foundSpotId
            ? `${helpers.getSeekerName()} found ${helpers.getHiderName()} in the ${getSpotLabel(state.hiddenSpotId)}.`
            : `${helpers.getHiderName()} stayed hidden in the ${getSpotLabel(state.hiddenSpotId)}.`
      );
    } else if (state.phase === PHASES.MATCH_END) {
      const winner = state.scores[0] === state.scores[1]
        ? 'The match ends in a tie.'
        : `${state.scores[0] > state.scores[1] ? state.players[0] : state.players[1]} wins the match.`;
      setText(elements.phaseText, 'Match complete.');
      setText(
        elements.status,
        state.lastRoundResult
          ? `${state.lastRoundResult.summary} ${winner}`
          : winner
      );
    }

    if (elements.passButton) {
      elements.passButton.disabled = state.phase !== PHASES.PASS;
    }
    if (elements.nextRoundButton) {
      elements.nextRoundButton.disabled = !(state.phase === PHASES.ROUND_END || state.phase === PHASES.MATCH_END);
      elements.nextRoundButton.textContent = state.phase === PHASES.MATCH_END ? 'Play Another Match' : 'Next Round';
    }
  }

  window.HideSeekHouseRender = {
    renderScreen,
  };
})();
