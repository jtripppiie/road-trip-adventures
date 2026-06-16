/*
 * Road Pong canvas/state helpers.
 *
 * The main script still owns input, scoring flow, and animation. This file owns
 * the board state shape and how the board is rendered.
 */
(() => {
  const COURT = Object.freeze({
    padding: 12,
    borderRadius: 14,
    gridX: 48,
    gridY: 42,
    centerDashWidth: 4,
    centerDashHeight: 14,
    centerDashGap: 14,
  });

  const HUD = Object.freeze({
    top: 20,
    radius: 18,
    maxWidth: 240,
  });

  const PADDLES = Object.freeze({
    width: 14,
    leftX: 22,
    rightOffset: 36,
  });

  function randomServeVelocity(speed, direction = 1) {
    // Limit the angle so serves aren't nearly vertical.
    const angle = (Math.random() - 0.5) * 0.9;

    return {
      vx: Math.cos(angle) * speed * direction,
      vy: Math.sin(angle) * speed,
    };
  }

  function createGameState(canvas, config) {
    const width = canvas.width;
    const height = canvas.height;

    const serve = randomServeVelocity(
      config.ballSpeed,
      Math.random() > 0.5 ? 1 : -1
    );

    return {
      canvas,
      ctx: canvas.getContext('2d'),

      width,
      height,

      paddleWidth: PADDLES.width,
      paddleHeight: config.paddleHeight,

      leftPaddle: {
        y: height / 2 - config.paddleHeight / 2,
        score: 0,
        flashFrames: 0,
      },

      rightPaddle: {
        y: height / 2 - config.paddleHeight / 2,
        score: 0,
        flashFrames: 0,
      },

      ball: {
        x: width / 2,
        y: height / 2,
        vx: serve.vx,
        vy: serve.vy,
        size: 12,
      },

      ballTrail: [],
      shakeFrames: 0,

      targetScore: config.targetScore,
    };
  }

  function resizeState(state) {
    const { canvas } = state;

    state.width = canvas.width;
    state.height = canvas.height;
  }

  function resetBall(state, config, direction) {
    const serve = randomServeVelocity(config.ballSpeed, direction);

    state.ball.x = state.width / 2;
    state.ball.y = state.height / 2;

    state.ball.vx = serve.vx;
    state.ball.vy = serve.vy;

    state.ballTrail.length = 0;
  }

  function updateEffects(state) {
    if (state.leftPaddle.flashFrames > 0) {
      state.leftPaddle.flashFrames--;
    }

    if (state.rightPaddle.flashFrames > 0) {
      state.rightPaddle.flashFrames--;
    }

    if (state.shakeFrames > 0) {
      state.shakeFrames--;
    }

    state.ballTrail.push({
      x: state.ball.x,
      y: state.ball.y,
    });

    if (state.ballTrail.length > 8) {
      state.ballTrail.shift();
    }
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();

    ctx.moveTo(x + r, y);

    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);

    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );

    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);

    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

    ctx.closePath();
  }

  function drawCourt(ctx, state) {
    const court = ctx.createLinearGradient(
      0,
      0,
      state.width,
      state.height
    );

    court.addColorStop(0, '#061524');
    court.addColorStop(0.48, '#08284a');
    court.addColorStop(1, '#171143');

    ctx.fillStyle = court;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 1;

    for (let x = COURT.gridX; x < state.width; x += COURT.gridX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }

    for (let y = COURT.gridY; y < state.height; y += COURT.gridY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.28)';

    const dashStep =
      COURT.centerDashHeight + COURT.centerDashGap;

    for (
      let y = COURT.padding;
      y < state.height;
      y += dashStep
    ) {
      drawRoundedRect(
        ctx,
        state.width / 2 - COURT.centerDashWidth / 2,
        y,
        COURT.centerDashWidth,
        COURT.centerDashHeight,
        2
      );

      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 3;

    drawRoundedRect(
      ctx,
      COURT.padding,
      COURT.padding,
      state.width - COURT.padding * 2,
      state.height - COURT.padding * 2,
      COURT.borderRadius
    );

    ctx.stroke();
  }

  function drawScoreHud(ctx, state) {
    const hudWidth = Math.min(
      HUD.maxWidth,
      state.width * 0.34
    );

    const hudHeight = Math.max(
      52,
      state.height * 0.12
    );

    const hudX = state.width / 2 - hudWidth / 2;
    const hudY = HUD.top;

    ctx.save();

    ctx.fillStyle = 'rgba(3,12,24,0.72)';
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;

    drawRoundedRect(
      ctx,
      hudX,
      hudY,
      hudWidth,
      hudHeight,
      HUD.radius
    );

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.28)';

    ctx.fillRect(
      state.width / 2 - 1.5,
      hudY + 10,
      3,
      hudHeight - 20
    );

    const scoreFontSize = Math.max(
      24,
      Math.min(44, state.width * 0.042)
    );

    const labelFontSize = Math.max(
      10,
      Math.min(13, state.width * 0.015)
    );

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.font =
      `700 ${labelFontSize}px system-ui, sans-serif`;

    ctx.fillStyle = 'rgba(255,255,255,0.76)';

    ctx.fillText(
      'LEFT',
      hudX + hudWidth * 0.25,
      hudY + hudHeight * 0.28
    );

    ctx.fillText(
      'RIGHT',
      hudX + hudWidth * 0.75,
      hudY + hudHeight * 0.28
    );

    ctx.font =
      `800 ${scoreFontSize}px system-ui, sans-serif`;

    ctx.fillStyle = '#f7fafc';

    ctx.fillText(
      String(state.leftPaddle.score),
      hudX + hudWidth * 0.25,
      hudY + hudHeight * 0.68
    );

    ctx.fillText(
      String(state.rightPaddle.score),
      hudX + hudWidth * 0.75,
      hudY + hudHeight * 0.68
    );

    ctx.restore();
  }

  function drawPaddle(
    ctx,
    x,
    y,
    width,
    height,
    color,
    glowColor,
    flashFrames
  ) {
    ctx.save();

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = flashFrames > 0 ? 28 : 16;

    const gradient = ctx.createLinearGradient(
      x,
      y,
      x + width,
      y
    );

    gradient.addColorStop(0, color);
    gradient.addColorStop(
      1,
      'rgba(255,255,255,0.92)'
    );

    ctx.fillStyle = gradient;

    drawRoundedRect(
      ctx,
      x,
      y,
      width,
      height,
      width / 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(6,21,36,0.22)';

    ctx.fillRect(
      x + width * 0.25,
      y + height * 0.08,
      Math.max(2, width * 0.18),
      height * 0.84
    );

    ctx.restore();
  }

  function drawBall(ctx, state) {
    const radius = state.ball.size / 2;

    ctx.save();

    state.ballTrail.forEach((point, index) => {
      ctx.globalAlpha =
        (index + 1) / state.ballTrail.length * 0.25;

      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = '#ffd166';
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 18;

    const ballGradient =
      ctx.createRadialGradient(
        state.ball.x - radius * 0.35,
        state.ball.y - radius * 0.35,
        1,
        state.ball.x,
        state.ball.y,
        radius
      );

    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(1, '#ffd166');

    ctx.fillStyle = ballGradient;

    ctx.beginPath();

    ctx.arc(
      state.ball.x,
      state.ball.y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  function draw(state) {
    if (!state || !state.ctx) {
      return;
    }

    const ctx = state.ctx;

    ctx.save();

    if (state.shakeFrames > 0) {
      const intensity =
        state.shakeFrames * 0.25;

      ctx.translate(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity
      );
    }

    ctx.clearRect(
      0,
      0,
      state.width,
      state.height
    );

    drawCourt(ctx, state);

    drawScoreHud(ctx, state);

    drawPaddle(
      ctx,
      PADDLES.leftX,
      state.leftPaddle.y,
      state.paddleWidth,
      state.paddleHeight,
      '#f58220',
      'rgba(245,130,32,0.85)',
      state.leftPaddle.flashFrames
    );

    drawPaddle(
      ctx,
      state.width - PADDLES.rightOffset,
      state.rightPaddle.y,
      state.paddleWidth,
      state.paddleHeight,
      '#7c4dff',
      'rgba(124,77,255,0.85)',
      state.rightPaddle.flashFrames
    );

    drawBall(ctx, state);

    ctx.restore();
  }

  window.RTA_PONG_ART = Object.freeze({
    createGameState,
    resizeState,
    resetBall,
    updateEffects,
    draw,
    drawCourt,
    drawScoreHud,
    drawPaddle,
    drawBall,
  });
})();
