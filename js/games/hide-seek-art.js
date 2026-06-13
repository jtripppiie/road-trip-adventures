/*
 * Hide & Seek Adventure canvas art helpers.
 *
 * Drawing functions receive small tool callbacks from script.js so this file
 * can stay framework-free and still reuse the app's existing canvas helpers.
 */
(function () {
  function drawSoftCushion(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, w * 0.22, h * 0.4);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.12, x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.92, x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function fillSoftCushion(ctx, x, y, w, h, radius) {
    drawSoftCushion(ctx, x, y, w, h, radius);
    ctx.fill();
  }

  function strokeSoftCushion(ctx, x, y, w, h, radius) {
    drawSoftCushion(ctx, x, y, w, h, radius);
    ctx.stroke();
  }

  function drawAngledLeg(ctx, x, y, w, h, lean) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18 + lean, y);
    ctx.lineTo(x + w * 0.82 + lean, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
  }

  function drawCouchWrinkles(ctx, x, y, w, h) {
    [
      [0.26, 0.61, 0.055, 0.2, 1.55],
      [0.36, 0.66, 0.05, -0.2, 1.25],
      [0.62, 0.61, 0.052, 1.7, 3.05],
      [0.75, 0.67, 0.045, 1.75, 2.9],
      [0.32, 0.32, 0.052, 0.12, 1.3],
      [0.69, 0.34, 0.048, 1.75, 3.0],
    ].forEach(([cx, cy, r, start, end]) => {
      ctx.beginPath();
      ctx.arc(x + w * cx, y + h * cy, w * r, start, end);
      ctx.stroke();
    });
  }

  function drawCouchPillow(ctx, centerX, centerY, width, height, angle, color, accent, tools) {
    const { fillRoundedRect, strokeRoundedRect } = tools;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    const x = -width / 2;
    const y = -height / 2;
    const pillow = ctx.createLinearGradient(0, y, 0, y + height);
    pillow.addColorStop(0, color);
    pillow.addColorStop(1, accent);
    ctx.fillStyle = pillow;
    fillRoundedRect(ctx, x, y, width, height, Math.min(width, height) * 0.18);
    ctx.strokeStyle = 'rgba(6,21,36,0.24)';
    ctx.lineWidth = Math.max(1, width * 0.035);
    strokeRoundedRect(ctx, x, y, width, height, Math.min(width, height) * 0.18);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(1, width * 0.025);
    ctx.beginPath();
    ctx.moveTo(x + width * 0.18, y + height * 0.25);
    ctx.quadraticCurveTo(0, y + height * 0.42, x + width * 0.82, y + height * 0.24);
    ctx.stroke();
    ctx.restore();
  }

  function drawCouchFabricTexture(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let line = -h; line < w; line += Math.max(8, w * 0.055)) {
      ctx.beginPath();
      ctx.moveTo(x + line, y + h * 0.12);
      ctx.lineTo(x + line + h * 0.8, y + h * 0.86);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(6,21,36,0.07)';
    const dotCount = 46;
    for (let index = 0; index < dotCount; index += 1) {
      const px = x + ((index * 37) % 100) / 100 * w;
      const py = y + h * 0.12 + ((index * 53) % 100) / 100 * h * 0.72;
      ctx.fillRect(px, py, 1, 1);
    }
    ctx.restore();
  }

  function drawDeterministicSpeckles(ctx, x, y, w, h, count, color) {
    ctx.save();
    ctx.fillStyle = color;
    for (let index = 0; index < count; index += 1) {
      const px = x + ((index * 43 + 17) % 100) / 100 * w;
      const py = y + ((index * 59 + 29) % 100) / 100 * h;
      ctx.fillRect(px, py, 1, 1);
    }
    ctx.restore();
  }

  function drawWoodGrain(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.012);
    for (let index = 0; index < 4; index += 1) {
      const lineY = y + h * (0.22 + index * 0.18);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.08, lineY);
      ctx.quadraticCurveTo(x + w * 0.38, lineY + h * 0.06 * (index % 2 ? -1 : 1), x + w * 0.72, lineY);
      ctx.quadraticCurveTo(x + w * 0.86, lineY + h * 0.035, x + w * 0.94, lineY - h * 0.01);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSticker(ctx, x, y, w, h, color, tools) {
    const { fillRoundedRect } = tools;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(-0.08);
    ctx.fillStyle = color;
    fillRoundedRect(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.2);
    ctx.strokeStyle = 'rgba(6,21,36,0.24)';
    ctx.lineWidth = Math.max(1, w * 0.04);
    ctx.strokeRect(-w * 0.3, -h * 0.16, w * 0.6, h * 0.32);
    ctx.restore();
  }

  function drawSmallStar(ctx, cx, cy, radius) {
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const r = point % 2 ? radius * 0.45 : radius;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawCouch(ctx, x, y, w, h, tools) {
    const { fillRoundedRect, strokeRoundedRect } = tools;

    ctx.save();
    ctx.lineJoin = 'round';

    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 1.03, w * 0.49, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    const base = ctx.createLinearGradient(x, y + h * 0.46, x, y + h * 0.9);
    base.addColorStop(0, '#285d86');
    base.addColorStop(0.58, '#173f65');
    base.addColorStop(1, '#0b294b');
    ctx.fillStyle = base;
    fillRoundedRect(ctx, x + w * 0.067, y + h * 0.5, w * 0.866, h * 0.39, h * 0.07);

    const back = ctx.createLinearGradient(x, y + h * 0.08, x, y + h * 0.56);
    back.addColorStop(0, '#a9e6f5');
    back.addColorStop(0.48, '#62bfdc');
    back.addColorStop(1, '#337fae');
    ctx.fillStyle = back;
    fillSoftCushion(ctx, x + w * 0.118, y + h * 0.105, w * 0.357, h * 0.455, h * 0.09);
    fillSoftCushion(ctx, x + w * 0.505, y + h * 0.116, w * 0.382, h * 0.445, h * 0.09);

    const seat = ctx.createLinearGradient(x, y + h * 0.48, x, y + h * 0.8);
    seat.addColorStop(0, '#c2f1fb');
    seat.addColorStop(0.48, '#76d0e6');
    seat.addColorStop(1, '#429bbf');
    ctx.fillStyle = seat;
    fillSoftCushion(ctx, x + w * 0.11, y + h * 0.5, w * 0.377, h * 0.29, h * 0.08);
    fillSoftCushion(ctx, x + w * 0.503, y + h * 0.506, w * 0.385, h * 0.28, h * 0.08);

    const arms = ctx.createLinearGradient(x, y + h * 0.28, x, y + h * 0.88);
    arms.addColorStop(0, '#215d8a');
    arms.addColorStop(1, '#071f39');
    ctx.fillStyle = arms;
    fillRoundedRect(ctx, x, y + h * 0.31, w * 0.117, h * 0.56, h * 0.08);
    fillRoundedRect(ctx, x + w * 0.883, y + h * 0.31, w * 0.117, h * 0.56, h * 0.08);

    ctx.strokeStyle = 'rgba(4, 18, 34, 0.48)';
    ctx.lineWidth = Math.max(1.5, w * 0.01);
    tools.strokeRoundedRect(ctx, x, y + h * 0.31, w * 0.117, h * 0.56, h * 0.08);
    tools.strokeRoundedRect(ctx, x + w * 0.883, y + h * 0.31, w * 0.117, h * 0.56, h * 0.08);

    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    fillRoundedRect(ctx, x + w * 0.12, y + h * 0.74, w * 0.77, h * 0.045, h * 0.02);
    fillRoundedRect(ctx, x + w * 0.105, y + h * 0.54, w * 0.012, h * 0.27, h * 0.01);
    fillRoundedRect(ctx, x + w * 0.883, y + h * 0.54, w * 0.012, h * 0.27, h * 0.01);

    ctx.strokeStyle = '#d6b37f';
    ctx.lineWidth = Math.max(1.1, w * 0.008);
    strokeSoftCushion(ctx, x + w * 0.118, y + h * 0.105, w * 0.357, h * 0.455, h * 0.09);
    strokeSoftCushion(ctx, x + w * 0.505, y + h * 0.116, w * 0.382, h * 0.445, h * 0.09);
    strokeSoftCushion(ctx, x + w * 0.11, y + h * 0.5, w * 0.377, h * 0.29, h * 0.08);
    strokeSoftCushion(ctx, x + w * 0.503, y + h * 0.506, w * 0.385, h * 0.28, h * 0.08);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = Math.max(1, w * 0.006);
    [
      [0.15, 0.55, 0.32, 0.015],
      [0.545, 0.555, 0.31, 0.015],
      [0.16, 0.165, 0.29, 0.015],
      [0.545, 0.176, 0.31, 0.015],
    ].forEach(([sx, sy, sw, sh]) => {
      ctx.beginPath();
      ctx.moveTo(x + w * sx, y + h * sy);
      ctx.lineTo(x + w * (sx + sw), y + h * (sy + sh));
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = Math.max(1.2, w * 0.012);
    [
      [0.3, 0.28, 0.13],
      [0.7, 0.28, 0.13],
      [0.3, 0.61, 0.13],
      [0.7, 0.61, 0.13],
    ].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(x + w * cx, y + h * cy, w * r, Math.PI, Math.PI * 1.82);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = Math.max(1.4, w * 0.012);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.14);
    ctx.lineTo(x + w * 0.5, y + h * 0.78);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.13)';
    ctx.lineWidth = Math.max(1, w * 0.007);
    drawCouchWrinkles(ctx, x, y, w, h);

    drawCouchPillow(ctx, x + w * 0.36, y + h * 0.47, w * 0.16, h * 0.24, -0.09, '#f4c96b', '#d6a33d', tools);
    drawCouchPillow(ctx, x + w * 0.64, y + h * 0.46, w * 0.15, h * 0.22, 0.1, '#fff2d8', '#d6b37f', tools);

    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.31, y + h * 0.18, w * 0.12, h * 0.035, -0.1, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.71, y + h * 0.18, w * 0.12, h * 0.035, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a2918';
    drawAngledLeg(ctx, x + w * 0.072, y + h * 0.83, w * 0.07, h * 0.125, -w * 0.015);
    drawAngledLeg(ctx, x + w * 0.858, y + h * 0.83, w * 0.07, h * 0.125, w * 0.015);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    drawAngledLeg(ctx, x + w * 0.086, y + h * 0.84, w * 0.018, h * 0.075, -w * 0.005);
    drawAngledLeg(ctx, x + w * 0.872, y + h * 0.84, w * 0.018, h * 0.075, w * 0.005);

    ctx.fillStyle = 'rgba(6,21,36,0.42)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.31, y + h * 0.94, w * 0.03, h * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4c96b';
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.86, Math.max(2, w * 0.018), 0, Math.PI * 2);
    ctx.fill();

    drawCouchFabricTexture(ctx, x + w * 0.05, y + h * 0.1, w * 0.9, h * 0.76);

    ctx.restore();
  }

  function drawTruckWheel(ctx, cx, cy, radius) {
    ctx.fillStyle = '#10151d';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#d0d4d8';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.56, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#727b86';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4b5563';
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 / 6) * index;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * radius * 0.36, cy + Math.sin(angle) * radius * 0.36, Math.max(1.2, radius * 0.055), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPickupTruck(ctx, x, y, w, h, tools) {
    const { fillRoundedRect, strokeRoundedRect } = tools;

    ctx.save();
    ctx.lineJoin = 'round';

    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.88, w * 0.48, h * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();

    const paint = ctx.createLinearGradient(x, y, x + w, y + h);
    paint.addColorStop(0, '#f04836');
    paint.addColorStop(0.5, '#b71c1c');
    paint.addColorStop(1, '#651010');
    ctx.fillStyle = paint;
    ctx.fillRect(x + w * 0.37, y + h * 0.29, w * 0.47, h * 0.36);
    ctx.fillRect(x + w * 0.48, y + h * 0.11, w * 0.25, h * 0.48);
    ctx.fillRect(x + w * 0.1, y + h * 0.25, w * 0.39, h * 0.4);

    ctx.strokeStyle = 'rgba(56, 0, 0, 0.62)';
    ctx.lineWidth = Math.max(1.5, w * 0.01);
    ctx.strokeRect(x + w * 0.1, y + h * 0.25, w * 0.74, h * 0.4);

    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(x + w * 0.1, y + h * 0.58, w * 0.74, h * 0.12);

    ctx.fillStyle = '#c82020';
    fillRoundedRect(ctx, x + w * 0.45, y + h * 0.04, w * 0.31, h * 0.17, h * 0.05);

    ctx.fillStyle = '#9ed7f5';
    fillRoundedRect(ctx, x + w * 0.51, y + h * 0.17, w * 0.1, h * 0.23, h * 0.04);
    fillRoundedRect(ctx, x + w * 0.63, y + h * 0.17, w * 0.1, h * 0.23, h * 0.04);

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.525, y + h * 0.19);
    ctx.lineTo(x + w * 0.6, y + h * 0.19);
    ctx.lineTo(x + w * 0.535, y + h * 0.37);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#d6d6d6';
    ctx.lineWidth = Math.max(1.4, w * 0.012);
    strokeRoundedRect(ctx, x + w * 0.51, y + h * 0.17, w * 0.1, h * 0.23, h * 0.04);
    strokeRoundedRect(ctx, x + w * 0.63, y + h * 0.17, w * 0.1, h * 0.23, h * 0.04);

    ctx.strokeStyle = '#5a0000';
    ctx.lineWidth = Math.max(1.2, w * 0.01);
    ctx.strokeRect(x + w * 0.61, y + h * 0.13, w * 0.14, h * 0.43);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.37, y + h * 0.29);
    ctx.lineTo(x + w * 0.84, y + h * 0.29);
    ctx.stroke();

    ctx.fillStyle = '#cfcfcf';
    ctx.fillRect(x + w * 0.7, y + h * 0.43, w * 0.035, h * 0.02);

    ctx.fillStyle = '#bfc4c9';
    ctx.fillRect(x + w * 0.02, y + h * 0.34, w * 0.09, h * 0.24);
    ctx.strokeStyle = '#747b84';
    ctx.lineWidth = Math.max(1, w * 0.008);
    for (let index = 0; index < 5; index += 1) {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.025, y + h * (0.37 + index * 0.045));
      ctx.lineTo(x + w * 0.105, y + h * (0.37 + index * 0.045));
      ctx.stroke();
    }

    ctx.fillStyle = '#fff6c5';
    [
      [0.047, 0.41],
      [0.047, 0.5],
      [0.082, 0.41],
      [0.082, 0.5],
    ].forEach(([lightX, lightY]) => {
      ctx.beginPath();
      ctx.arc(x + w * lightX, y + h * lightY, Math.max(2.5, w * 0.018), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#d8d8d8';
    fillRoundedRect(ctx, x, y + h * 0.62, w * 0.12, h * 0.08, h * 0.03);
    fillRoundedRect(ctx, x + w * 0.82, y + h * 0.62, w * 0.1, h * 0.08, h * 0.03);

    const wheelRadius = Math.min(w * 0.12, h * 0.18);
    const frontWheelX = x + w * 0.25;
    const rearWheelX = x + w * 0.72;
    const wheelY = y + h * 0.73;
    ctx.fillStyle = '#1f2933';
    ctx.beginPath();
    ctx.arc(frontWheelX, wheelY, wheelRadius * 1.25, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rearWheelX, wheelY, wheelRadius * 1.25, Math.PI, 0);
    ctx.fill();
    drawTruckWheel(ctx, frontWheelX, wheelY, wheelRadius);
    drawTruckWheel(ctx, rearWheelX, wheelY, wheelRadius);

    ctx.fillStyle = '#e6c35c';
    ctx.fillRect(x + w * 0.16, y + h * 0.48, w * 0.63, h * 0.025);
    ctx.fillStyle = '#d6b447';
    ctx.fillRect(x + w * 0.035, y + h * 0.47, w * 0.052, h * 0.025);
    ctx.fillRect(x + w * 0.05, y + h * 0.44, w * 0.024, h * 0.085);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1.2, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18, y + h * 0.31);
    ctx.quadraticCurveTo(x + w * 0.32, y + h * 0.27, x + w * 0.46, y + h * 0.32);
    ctx.moveTo(x + w * 0.5, y + h * 0.12);
    ctx.quadraticCurveTo(x + w * 0.62, y + h * 0.08, x + w * 0.73, y + h * 0.13);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56,0,0,0.34)';
    ctx.lineWidth = Math.max(1, w * 0.005);
    [
      [0.17, 0.38, 0.26, 0.36],
      [0.4, 0.62, 0.56, 0.6],
      [0.67, 0.29, 0.8, 0.31],
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x + w * x1, y + h * y1);
      ctx.lineTo(x + w * x2, y + h * y2);
      ctx.stroke();
    });

    drawSticker(ctx, x + w * 0.41, y + h * 0.36, w * 0.09, h * 0.08, '#fff2d8', tools);
    drawDeterministicSpeckles(ctx, x + w * 0.1, y + h * 0.25, w * 0.74, h * 0.43, 34, 'rgba(255,255,255,0.09)');

    ctx.restore();
  }

  function drawBench(ctx, x, y, w, h, tools) {
    const { fillRoundedRect, strokeRoundedRect } = tools;
    ctx.save();
    const wood = ctx.createLinearGradient(x, y, x, y + h);
    wood.addColorStop(0, '#a7663b');
    wood.addColorStop(1, '#58311f');
    ctx.fillStyle = wood;
    fillSoftCushion(ctx, x + w * 0.08, y + h * 0.38, w * 0.84, h * 0.2, h * 0.08);
    fillSoftCushion(ctx, x + w * 0.14, y + h * 0.11, w * 0.72, h * 0.21, h * 0.08);
    ctx.fillStyle = '#3c2116';
    drawAngledLeg(ctx, x + w * 0.18, y + h * 0.58, w * 0.08, h * 0.34, -w * 0.01);
    drawAngledLeg(ctx, x + w * 0.74, y + h * 0.58, w * 0.08, h * 0.34, w * 0.01);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.012);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18, y + h * 0.2);
    ctx.lineTo(x + w * 0.82, y + h * 0.2);
    ctx.moveTo(x + w * 0.16, y + h * 0.47);
    ctx.lineTo(x + w * 0.84, y + h * 0.47);
    ctx.stroke();
    drawWoodGrain(ctx, x + w * 0.14, y + h * 0.11, w * 0.72, h * 0.21, 'rgba(255,255,255,0.18)');
    drawWoodGrain(ctx, x + w * 0.08, y + h * 0.38, w * 0.84, h * 0.2, 'rgba(34,16,8,0.24)');
    ctx.fillStyle = '#d6b37f';
    ctx.beginPath();
    ctx.arc(x + w * 0.36, y + h * 0.46, Math.max(2, w * 0.015), 0, Math.PI * 2);
    ctx.arc(x + w * 0.65, y + h * 0.45, Math.max(2, w * 0.015), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,14,8,0.44)';
    strokeRoundedRect(ctx, x + w * 0.08, y + h * 0.38, w * 0.84, h * 0.2, h * 0.08);
    ctx.restore();
  }

  function drawDesk(ctx, x, y, w, h, tools) {
    const { fillRoundedRect } = tools;
    ctx.save();
    const body = ctx.createLinearGradient(x, y, x, y + h);
    body.addColorStop(0, '#d99046');
    body.addColorStop(1, '#6f3f1f');
    ctx.fillStyle = body;
    fillRoundedRect(ctx, x, y + h * 0.28, w, h * 0.62, h * 0.12);
    ctx.fillStyle = '#f9dfa8';
    fillRoundedRect(ctx, x + w * 0.08, y + h * 0.09, w * 0.84, h * 0.24, h * 0.1);
    ctx.fillStyle = 'rgba(6,21,36,0.24)';
    fillRoundedRect(ctx, x + w * 0.1, y + h * 0.48, w * 0.36, h * 0.22, h * 0.03);
    fillRoundedRect(ctx, x + w * 0.54, y + h * 0.48, w * 0.36, h * 0.22, h * 0.03);
    ctx.fillStyle = '#09233f';
    fillRoundedRect(ctx, x + w * 0.66, y + h * 0.42, w * 0.18, h * 0.36, h * 0.05);
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(x + w * 0.28, y + h * 0.6, Math.max(2, w * 0.018), 0, Math.PI * 2);
    ctx.arc(x + w * 0.72, y + h * 0.6, Math.max(2, w * 0.018), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(6,21,36,0.16)';
    fillRoundedRect(ctx, x + w * 0.15, y + h * 0.73, w * 0.7, h * 0.08, h * 0.03);
    drawWoodGrain(ctx, x + w * 0.08, y + h * 0.09, w * 0.84, h * 0.24, 'rgba(118,60,22,0.28)');
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = Math.max(1, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.14, y + h * 0.42);
    ctx.lineTo(x + w * 0.86, y + h * 0.42);
    ctx.moveTo(x + w * 0.5, y + h * 0.45);
    ctx.lineTo(x + w * 0.5, y + h * 0.77);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.01);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h * 0.19);
    ctx.lineTo(x + w * 0.9, y + h * 0.19);
    ctx.stroke();
    ctx.restore();
  }

  function drawShelf(ctx, x, y, w, h, tools) {
    const { fillRoundedRect } = tools;
    ctx.save();
    const shelf = ctx.createLinearGradient(x, y, x, y + h);
    shelf.addColorStop(0, '#8d98a6');
    shelf.addColorStop(1, '#364351');
    ctx.fillStyle = shelf;
    fillRoundedRect(ctx, x, y, w, h, h * 0.06);
    ctx.fillStyle = '#061524';
    for (let row = 0; row < 3; row += 1) {
      const rowY = y + h * (0.24 + row * 0.25);
      ctx.fillRect(x + w * 0.08, rowY, w * 0.84, Math.max(4, h * 0.035));
    }
    [
      ['#f58220', 0.16, 0.14, 0.14, 0.18],
      ['#2ec7d3', 0.36, 0.16, 0.16, 0.2],
      ['#fff2d8', 0.58, 0.42, 0.14, 0.18],
      ['#7b4ee6', 0.76, 0.66, 0.14, 0.18],
      ['#ffd166', 0.23, 0.68, 0.18, 0.13],
    ].forEach(([color, bx, by, bw, bh]) => {
      ctx.fillStyle = color;
      fillRoundedRect(ctx, x + w * bx, y + h * by, w * bw, h * bh, h * 0.025);
    });
    ctx.fillStyle = '#f4c96b';
    drawSmallStar(ctx, x + w * 0.83, y + h * 0.2, Math.max(4, w * 0.04));
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = Math.max(1, w * 0.008);
    for (let col = 0; col < 3; col += 1) {
      ctx.beginPath();
      ctx.moveTo(x + w * (0.28 + col * 0.22), y + h * 0.08);
      ctx.lineTo(x + w * (0.28 + col * 0.22), y + h * 0.9);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + w * 0.08, y + h * 0.06, w * 0.84, Math.max(3, h * 0.025));
    ctx.restore();
  }

  function drawBed(ctx, x, y, w, h, tools) {
    const { fillRoundedRect } = tools;
    ctx.save();
    ctx.fillStyle = '#4a2d24';
    fillRoundedRect(ctx, x, y + h * 0.42, w, h * 0.56, h * 0.12);
    const blanket = ctx.createLinearGradient(x, y, x, y + h);
    blanket.addColorStop(0, '#b294ff');
    blanket.addColorStop(1, '#5c34bf');
    ctx.fillStyle = blanket;
    fillRoundedRect(ctx, x + w * 0.04, y + h * 0.26, w * 0.92, h * 0.62, h * 0.14);
    ctx.fillStyle = '#fff2d8';
    fillRoundedRect(ctx, x + w * 0.08, y + h * 0.12, w * 0.34, h * 0.34, h * 0.08);
    ctx.fillStyle = 'rgba(6,21,36,0.12)';
    fillRoundedRect(ctx, x + w * 0.12, y + h * 0.74, w * 0.78, h * 0.08, h * 0.04);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.01);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * 0.5);
    ctx.lineTo(x + w * 0.88, y + h * 0.5);
    ctx.moveTo(x + w * 0.55, y + h * 0.34);
    ctx.lineTo(x + w * 0.82, y + h * 0.8);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y + h * 0.6, w * 0.06, 0.1, 1.6);
    ctx.arc(x + w * 0.68, y + h * 0.64, w * 0.05, 1.7, 3.0);
    ctx.stroke();
    ctx.restore();
  }

  function drawCurtain(ctx, x, y, w, h, tools, isCloset) {
    const { fillRoundedRect, shadeColor } = tools;
    ctx.save();
    const base = isCloset ? '#6b4634' : '#7b4ee6';
    const fabric = ctx.createLinearGradient(x, y, x + w, y);
    fabric.addColorStop(0, shadeColor(base, -16));
    fabric.addColorStop(0.35, shadeColor(base, 18));
    fabric.addColorStop(0.7, shadeColor(base, -4));
    fabric.addColorStop(1, shadeColor(base, -18));
    ctx.fillStyle = fabric;
    fillSoftCushion(ctx, x, y, w, h, h * 0.06);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    fillRoundedRect(ctx, x + w * 0.06, y + h * 0.84, w * 0.88, h * 0.08, h * 0.02);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let fold = x + w * 0.14; fold < x + w * 0.92; fold += Math.max(14, w * 0.18)) {
      ctx.fillRect(fold, y + h * 0.06, Math.max(3, w * 0.035), h * 0.88);
    }
    ctx.strokeStyle = 'rgba(6,21,36,0.18)';
    ctx.lineWidth = Math.max(1, w * 0.01);
    for (let fold = x + w * 0.22; fold < x + w * 0.88; fold += Math.max(18, w * 0.24)) {
      ctx.beginPath();
      ctx.moveTo(fold, y + h * 0.08);
      ctx.quadraticCurveTo(fold - w * 0.05, y + h * 0.46, fold + w * 0.02, y + h * 0.9);
      ctx.stroke();
    }
    if (isCloset) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(x + w * 0.56, y + h * 0.52, Math.max(3, w * 0.035), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      fillRoundedRect(ctx, x + w * 0.12, y + h * 0.12, w * 0.22, h * 0.72, h * 0.025);
    } else {
      ctx.fillStyle = '#d8d8d8';
      fillRoundedRect(ctx, x + w * 0.08, y, w * 0.84, Math.max(5, h * 0.04), h * 0.02);
      ctx.fillStyle = '#f4c96b';
      ctx.beginPath();
      ctx.arc(x + w * 0.28, y + h * 0.92, Math.max(2, w * 0.022), 0, Math.PI * 2);
      ctx.arc(x + w * 0.72, y + h * 0.91, Math.max(2, w * 0.02), 0, Math.PI * 2);
      ctx.fill();
    }
    drawDeterministicSpeckles(ctx, x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.82, 28, 'rgba(255,255,255,0.07)');
    ctx.restore();
  }

  function drawBox(ctx, x, y, w, h, tools, isLuggage) {
    const { fillRoundedRect, shadeColor } = tools;
    ctx.save();
    const color = isLuggage ? '#2ec7d3' : '#c47b32';
    ctx.fillStyle = shadeColor(color, -16);
    fillRoundedRect(ctx, x, y + h * 0.1, w, h * 0.88, h * 0.08);
    ctx.fillStyle = color;
    fillSoftCushion(ctx, x + w * 0.06, y, w * 0.88, h * 0.86, h * 0.08);
    ctx.fillStyle = 'rgba(9,35,63,0.26)';
    ctx.fillRect(x + w * 0.12, y + h * 0.17, w * 0.76, Math.max(5, h * 0.08));
    ctx.fillRect(x + w * 0.48, y + h * 0.08, Math.max(5, w * 0.05), h * 0.72);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.01);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.14, y + h * 0.08);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.15, x + w * 0.84, y + h * 0.08);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(6,21,36,0.16)';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18, y + h * 0.62);
    ctx.lineTo(x + w * 0.82, y + h * 0.58);
    ctx.stroke();
    if (isLuggage) {
      ctx.strokeStyle = '#09233f';
      ctx.lineWidth = Math.max(2, w * 0.018);
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.02, w * 0.18, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#09233f';
      ctx.beginPath();
      ctx.arc(x + w * 0.24, y + h * 0.92, Math.max(3, w * 0.035), 0, Math.PI * 2);
      ctx.arc(x + w * 0.76, y + h * 0.92, Math.max(3, w * 0.035), 0, Math.PI * 2);
      ctx.fill();
      drawSticker(ctx, x + w * 0.22, y + h * 0.38, w * 0.24, h * 0.18, '#fff2d8', tools);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x + w * 0.18, y + h * 0.3, w * 0.22, h * 0.08);
      drawDeterministicSpeckles(ctx, x + w * 0.1, y + h * 0.1, w * 0.78, h * 0.72, 22, 'rgba(83,45,18,0.14)');
    }
    ctx.restore();
  }

  function drawTreeOrBush(ctx, x, y, w, h, tools, isTree) {
    const { fillRoundedRect, shadeColor } = tools;
    ctx.save();
    if (isTree) {
      ctx.fillStyle = '#70411f';
      fillRoundedRect(ctx, x + w * 0.42, y + h * 0.42, w * 0.18, h * 0.58, h * 0.035);
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = Math.max(1, w * 0.012);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.49, y + h * 0.48);
      ctx.quadraticCurveTo(x + w * 0.44, y + h * 0.66, x + w * 0.5, y + h * 0.92);
      ctx.moveTo(x + w * 0.54, y + h * 0.5);
      ctx.quadraticCurveTo(x + w * 0.59, y + h * 0.66, x + w * 0.55, y + h * 0.9);
      ctx.stroke();
    }
    const leafColor = isTree ? '#1f9f68' : '#2fa86f';
    [[0.5, 0.24, 0.44, 0.26], [0.34, 0.43, 0.34, 0.22], [0.66, 0.43, 0.34, 0.22], [0.5, 0.58, 0.45, 0.24]].forEach((blob, index) => {
      ctx.fillStyle = shadeColor(leafColor, index === 0 ? 16 : -index * 5);
      ctx.beginPath();
      ctx.ellipse(x + w * blob[0], y + h * blob[1], w * blob[2], h * blob[3], 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.012);
    ctx.beginPath();
    ctx.arc(x + w * 0.44, y + h * 0.28, w * 0.16, Math.PI * 1.1, Math.PI * 1.78);
    ctx.stroke();
    ctx.fillStyle = isTree ? '#f4c96b' : '#ffd166';
    ctx.beginPath();
    ctx.arc(x + w * 0.67, y + h * 0.36, Math.max(2, w * 0.022), 0, Math.PI * 2);
    ctx.arc(x + w * 0.31, y + h * 0.5, Math.max(2, w * 0.018), 0, Math.PI * 2);
    ctx.fill();
    drawDeterministicSpeckles(ctx, x + w * 0.08, y + h * 0.12, w * 0.84, h * 0.58, 34, 'rgba(6,21,36,0.09)');
    ctx.restore();
  }

  function drawFountain(ctx, x, y, w, h) {
    ctx.save();
    const stone = ctx.createLinearGradient(x, y, x, y + h);
    stone.addColorStop(0, '#7fa0ad');
    stone.addColorStop(1, '#34505d');
    ctx.fillStyle = stone;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dff8ff';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 3, h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(9,35,63,0.16)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.58, w * 0.28, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(46,199,211,0.75)';
    ctx.lineWidth = Math.max(2, w * 0.02);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 5, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.42, y + h * 0.38, w * 0.08, h * 0.035, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = Math.max(1, w * 0.01);
    for (let index = 0; index < 4; index += 1) {
      ctx.beginPath();
      ctx.moveTo(x + w * (0.2 + index * 0.16), y + h * 0.26);
      ctx.lineTo(x + w * (0.3 + index * 0.12), y + h * 0.74);
      ctx.stroke();
    }
    ctx.fillStyle = '#d6b37f';
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.7, Math.max(2, w * 0.025), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLocker(ctx, x, y, w, h, tools) {
    const { fillRoundedRect } = tools;
    ctx.save();
    const locker = ctx.createLinearGradient(x, y, x, y + h);
    locker.addColorStop(0, '#55718e');
    locker.addColorStop(1, '#1f3146');
    ctx.fillStyle = locker;
    fillRoundedRect(ctx, x, y, w, h, h * 0.04);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1.5, w * 0.012);
    for (let door = x + w / 3; door < x + w; door += w / 3) {
      ctx.beginPath();
      ctx.moveTo(door, y + h * 0.06);
      ctx.lineTo(door, y + h * 0.94);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffd166';
    for (let handle = x + w * 0.13; handle < x + w * 0.92; handle += w / 3) {
      fillRoundedRect(ctx, handle, y + h * 0.44, w * 0.035, h * 0.1, w * 0.012);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    for (let vent = 0; vent < 3; vent += 1) {
      ctx.fillRect(x + w * 0.1, y + h * (0.12 + vent * 0.045), w * 0.18, Math.max(2, h * 0.012));
      ctx.fillRect(x + w * 0.44, y + h * (0.12 + vent * 0.045), w * 0.18, Math.max(2, h * 0.012));
      ctx.fillRect(x + w * 0.77, y + h * (0.12 + vent * 0.045), w * 0.18, Math.max(2, h * 0.012));
    }
    ctx.fillStyle = '#f4c96b';
    drawSmallStar(ctx, x + w * 0.2, y + h * 0.72, Math.max(4, w * 0.035));
    drawSticker(ctx, x + w * 0.56, y + h * 0.68, w * 0.17, h * 0.09, '#fff2d8', tools);
    ctx.strokeStyle = 'rgba(6,21,36,0.24)';
    ctx.lineWidth = Math.max(1, w * 0.006);
    [
      [0.09, 0.34, 0.27, 0.36],
      [0.43, 0.3, 0.58, 0.33],
      [0.75, 0.36, 0.91, 0.34],
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x + w * x1, y + h * y1);
      ctx.lineTo(x + w * x2, y + h * y2);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawObject(ctx, spot, tools) {
    const x = spot.x;
    const y = spot.y;
    const w = spot.width;
    const h = spot.height;

    if (spot.kind === 'bench') drawBench(ctx, x, y, w, h, tools);
    else if (spot.kind === 'desk') drawDesk(ctx, x, y, w, h, tools);
    else if (spot.kind === 'shelf') drawShelf(ctx, x, y, w, h, tools);
    else if (spot.kind === 'bed') drawBed(ctx, x, y, w, h, tools);
    else if (spot.kind === 'closet') drawCurtain(ctx, x, y, w, h, tools, true);
    else if (spot.kind === 'curtain') drawCurtain(ctx, x, y, w, h, tools, false);
    else if (spot.kind === 'box') drawBox(ctx, x, y, w, h, tools, false);
    else if (spot.kind === 'luggage') drawBox(ctx, x, y, w, h, tools, true);
    else if (spot.kind === 'tree') drawTreeOrBush(ctx, x, y, w, h, tools, true);
    else if (spot.kind === 'bush') drawTreeOrBush(ctx, x, y, w, h, tools, false);
    else if (spot.kind === 'fountain') drawFountain(ctx, x, y, w, h);
    else if (spot.kind === 'locker') drawLocker(ctx, x, y, w, h, tools);
    else if (spot.kind === 'couch') drawCouch(ctx, x, y, w, h, tools);
    else if (spot.kind === 'car') drawPickupTruck(ctx, x, y, w, h, tools);
    else return false;
    return true;
  }

  function drawRoomBackdrop(ctx, map, room, palette, tools) {
    const { fillRoundedRect, shadeColor } = tools;
    const wallGradient = ctx.createLinearGradient(0, 0, 0, 450);
    wallGradient.addColorStop(0, shadeColor(palette.wall, 18));
    wallGradient.addColorStop(0.58, palette.wall);
    wallGradient.addColorStop(1, shadeColor(palette.wall, -18));
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, 800, 450);

    if (map.id === 'roadside-lodge' && room.id === 'garage') {
      ctx.fillStyle = 'rgba(6, 21, 36, 0.32)';
      ctx.fillRect(72, 78, 246, 132);
      ctx.fillStyle = '#8f6a46';
      fillRoundedRect(ctx, 88, 92, 214, 96, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      for (let dotY = 108; dotY < 178; dotY += 15) {
        for (let dotX = 104; dotX < 288; dotX += 16) {
          ctx.fillRect(dotX, dotY, 3, 3);
        }
      }
      ctx.strokeStyle = '#d8d8d8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(122, 132);
      ctx.lineTo(168, 132);
      ctx.moveTo(144, 112);
      ctx.lineTo(144, 155);
      ctx.moveTo(208, 116);
      ctx.lineTo(262, 168);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 246, 197, 0.24)';
      ctx.beginPath();
      ctx.ellipse(504, 86, 230, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff6c5';
      fillRoundedRect(ctx, 392, 68, 224, 12, 6);
      ctx.strokeStyle = 'rgba(6,21,36,0.34)';
      ctx.lineWidth = 3;
      for (let x = 362; x <= 694; x += 84) {
        ctx.beginPath();
        ctx.moveTo(x, 92);
        ctx.lineTo(x + 42, 144);
        ctx.stroke();
      }
    } else if (map.id === 'roadside-lodge' && room.id === 'lobby') {
      ctx.fillStyle = '#fff2d8';
      fillRoundedRect(ctx, 92, 84, 134, 92, 8);
      ctx.fillStyle = '#f58220';
      ctx.fillRect(104, 96, 110, 68);
      ctx.fillStyle = 'rgba(9,35,63,0.2)';
      ctx.fillRect(104, 128, 110, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.24)';
      ctx.beginPath();
      ctx.moveTo(112, 104);
      ctx.lineTo(166, 104);
      ctx.lineTo(122, 160);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.ellipse(598, 104, 190, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (map.id === 'alaska-train') {
      ctx.fillStyle = '#dff8ff';
      fillRoundedRect(ctx, 78, 92, 170, 82, 10);
      ctx.fillStyle = '#8ac8e8';
      fillRoundedRect(ctx, 88, 102, 150, 62, 6);
      ctx.fillStyle = '#f7fbff';
      ctx.beginPath();
      ctx.moveTo(88, 164);
      ctx.lineTo(150, 118);
      ctx.lineTo(220, 164);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.ellipse(582, 108, 190, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(6,21,36,0.28)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(58, 208);
      ctx.lineTo(742, 208);
      ctx.stroke();
    } else if (map.id === 'campground') {
      ctx.fillStyle = '#123f33';
      for (let i = 0; i < 7; i += 1) {
        const treeX = 65 + i * 95;
        ctx.beginPath();
        ctx.moveTo(treeX, 172);
        ctx.lineTo(treeX + 35, 88);
        ctx.lineTo(treeX + 70, 172);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,209,102,0.22)';
      ctx.beginPath();
      ctx.arc(674, 86, 38, 0, Math.PI * 2);
      ctx.fill();
    } else if (map.id === 'rest-stop') {
      ctx.fillStyle = '#f7fbff';
      fillRoundedRect(ctx, 610, 88, 92, 68, 6);
      ctx.fillStyle = '#f58220';
      ctx.fillRect(620, 100, 72, 10);
      ctx.fillStyle = '#09233f';
      ctx.fillRect(620, 120, 72, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      fillRoundedRect(ctx, 92, 82, 142, 88, 8);
      ctx.fillStyle = 'rgba(9,35,63,0.18)';
      ctx.fillRect(110, 102, 106, 12);
      ctx.fillRect(110, 126, 76, 12);
    } else if (map.id === 'school-night') {
      ctx.fillStyle = '#d7dce4';
      for (let i = 0; i < 4; i += 1) {
        const hallX = 95 + i * 135;
        ctx.fillRect(hallX, 92, 86, 70);
        ctx.fillStyle = i % 2 ? '#9aa4b2' : '#ffd166';
        ctx.fillRect(hallX + 10, 104, 66, 46);
        ctx.fillStyle = '#d7dce4';
      }
      ctx.fillStyle = 'rgba(255, 209, 102, 0.18)';
      ctx.beginPath();
      ctx.ellipse(410, 210, 275, 70, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(6,21,36,0.22)';
      ctx.fillRect(0, 0, 800, 34);
    } else {
      ctx.fillStyle = '#fff2d8';
      ctx.fillRect(92, 88, 122, 82);
      ctx.fillStyle = '#f58220';
      ctx.fillRect(102, 98, 102, 62);
      ctx.fillStyle = 'rgba(9,35,63,0.2)';
      ctx.fillRect(102, 128, 102, 8);
    }

    return true;
  }

  function drawFloorDetail(ctx, map, room) {
    if (map.id !== 'roadside-lodge' || room.id !== 'garage') return false;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.32)';
    ctx.lineWidth = 5;
    ctx.setLineDash([28, 22]);
    ctx.beginPath();
    ctx.moveTo(502, 330);
    ctx.lineTo(728, 330);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(9, 35, 63, 0.18)';
    ctx.beginPath();
    ctx.ellipse(610, 330, 130, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    for (let x = 78; x < 740; x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x + 74, 398);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  window.RTA_HIDE_SEEK_ART = {
    drawCouch,
    drawFloorDetail,
    drawObject,
    drawPickupTruck,
    drawRoomBackdrop,
  };
})();
