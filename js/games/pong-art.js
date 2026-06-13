/*
 * Road Pong canvas/state helpers.
 *
 * The main script still owns input, scoring flow, and animation. This file owns
 * the board state shape and how the board is rendered.
 */
(function () {
  function createState(canvas, config) {
    const width = canvas.width;
    const height = canvas.height;
    return {
      width,
      height,
      paddleWidth: 14,
      paddleHeight: config.paddleHeight,
      leftY: height / 2 - config.paddleHeight / 2,
      rightY: height / 2 - config.paddleHeight / 2,
      ballX: width / 2,
      ballY: height / 2,
      ballVX: config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      ballVY: (config.ballSpeed * 0.55) * (Math.random() > 0.5 ? 1 : -1),
      ballSize: 12,
      leftScore: 0,
      rightScore: 0,
      targetScore: config.targetScore,
    };
  }

  function resetBall(state, config, direction) {
    state.ballX = state.width / 2;
    state.ballY = state.height / 2;
    state.ballVX = config.ballSpeed * direction;
    state.ballVY = (config.ballSpeed * 0.55) * (Math.random() > 0.5 ? 1 : -1);
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawPaddle(ctx, x, y, width, height, color, glowColor) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 16;
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255,255,255,0.92)');
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, x, y, width, height, width / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(6,21,36,0.22)';
    ctx.fillRect(x + width * 0.25, y + height * 0.08, Math.max(2, width * 0.18), height * 0.84);
    ctx.restore();
  }

  function drawBall(ctx, state) {
    const radius = state.ballSize / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 18;
    const ball = ctx.createRadialGradient(state.ballX - radius * 0.35, state.ballY - radius * 0.35, 1, state.ballX, state.ballY, radius);
    ball.addColorStop(0, '#ffffff');
    ball.addColorStop(1, '#ffd166');
    ctx.fillStyle = ball;
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCourt(ctx, state) {
    const court = ctx.createLinearGradient(0, 0, state.width, state.height);
    court.addColorStop(0, '#061524');
    court.addColorStop(0.48, '#08284a');
    court.addColorStop(1, '#171143');
    ctx.fillStyle = court;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 1;
    for (let x = 48; x < state.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    for (let y = 42; y < state.height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let y = 12; y < state.height; y += 28) {
      drawRoundedRect(ctx, state.width / 2 - 2, y, 4, 14, 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 12, 12, state.width - 24, state.height - 24, 14);
    ctx.stroke();
  }

  function draw(canvas, state) {
    if (!canvas || !state) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, state.width, state.height);
    drawCourt(ctx, state);
    drawPaddle(ctx, 22, state.leftY, state.paddleWidth, state.paddleHeight, '#f58220', 'rgba(245,130,32,0.85)');
    drawPaddle(ctx, state.width - 36, state.rightY, state.paddleWidth, state.paddleHeight, '#7c4dff', 'rgba(124,77,255,0.85)');
    drawBall(ctx, state);
  }

  window.RTA_PONG_ART = {
    createState,
    draw,
    resetBall,
  };
})();
