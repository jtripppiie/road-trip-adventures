/*
 * Hide & Seek Adventure canvas art helpers.
 *
 * Drawing functions receive small tool callbacks from script.js so this file
 * can stay framework-free and still reuse the app's existing canvas helpers.
 */
(function () {
  const DETAIL_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };

  const ART_THEMES = {
    couch: {
      base: ['#285d86', '#173f65', '#0b294b'],
      back: ['#a9e6f5', '#62bfdc', '#337fae'],
      seat: ['#c2f1fb', '#76d0e6', '#429bbf'],
      arms: ['#215d8a', '#071f39'],
      piping: '#d6b37f',
      leg: '#4a2918',
      accent: '#f4c96b',
      shadow: 'rgba(0,0,0,0.32)',
      outline: 'rgba(4, 18, 34, 0.48)',
    },
    truck: {
      paint: ['#f04836', '#b71c1c', '#651010'],
      roof: '#c82020',
      trim: '#f4f4f4',
      gold: '#e6c35c',
      glass: '#9ed7f5',
      chrome: '#d6d6d6',
      grille: '#bfc4c9',
      tire: '#10151d',
      rim: '#d0d4d8',
      outline: 'rgba(56, 0, 0, 0.62)',
      shadow: 'rgba(0,0,0,0.32)',
    },
    desk: {
      body: ['#d99046', '#6f3f1f'],
      top: '#f9dfa8',
      inset: 'rgba(6,21,36,0.24)',
      book: '#09233f',
      knob: '#ffd166',
      grain: 'rgba(118,60,22,0.28)',
      highlight: 'rgba(255,255,255,0.2)',
    },
    frontDesk: {
      body: ['#e5a45c', '#85502a'],
      top: '#ffe1a8',
      inset: 'rgba(6,21,36,0.2)',
      book: '#153f63',
      knob: '#ffd166',
      grain: 'rgba(118,60,22,0.24)',
      highlight: 'rgba(255,255,255,0.24)',
      sign: '#fff2d8',
      bell: '#f4c96b',
    },
    tree: {
      trunk: '#70411f',
      leaves: '#1f9f68',
      bushLeaves: '#2fa86f',
      fruit: '#f4c96b',
      shadow: 'rgba(6,21,36,0.09)',
    },
  };

  const ART_LAYOUTS = {
    couch: {
      base: { x: 0.067, y: 0.5, w: 0.866, h: 0.39, r: 0.07 },
      backs: [
        { x: 0.118, y: 0.105, w: 0.357, h: 0.455, r: 0.09 },
        { x: 0.505, y: 0.116, w: 0.382, h: 0.445, r: 0.09 },
      ],
      seats: [
        { x: 0.11, y: 0.5, w: 0.377, h: 0.29, r: 0.08 },
        { x: 0.503, y: 0.506, w: 0.385, h: 0.28, r: 0.08 },
      ],
      arms: [
        { x: 0, y: 0.31, w: 0.117, h: 0.56, r: 0.08 },
        { x: 0.883, y: 0.31, w: 0.117, h: 0.56, r: 0.08 },
      ],
      occlusion: [
        { x: 0.12, y: 0.74, w: 0.77, h: 0.045, r: 0.02 },
        { x: 0.105, y: 0.54, w: 0.012, h: 0.27, r: 0.01 },
        { x: 0.883, y: 0.54, w: 0.012, h: 0.27, r: 0.01 },
      ],
      seams: [
        { x1: 0.15, y1: 0.55, x2: 0.47, y2: 0.565 },
        { x1: 0.545, y1: 0.555, x2: 0.855, y2: 0.57 },
        { x1: 0.16, y1: 0.165, x2: 0.45, y2: 0.18 },
        { x1: 0.545, y1: 0.176, x2: 0.855, y2: 0.191 },
      ],
      highlights: [
        { cx: 0.3, cy: 0.28, r: 0.13 },
        { cx: 0.7, cy: 0.28, r: 0.13 },
        { cx: 0.3, cy: 0.61, r: 0.13 },
        { cx: 0.7, cy: 0.61, r: 0.13 },
      ],
      pillows: [
        { cx: 0.36, cy: 0.47, w: 0.16, h: 0.24, angle: -0.09, color: '#f4c96b', accent: '#d6a33d' },
        { cx: 0.64, cy: 0.46, w: 0.15, h: 0.22, angle: 0.1, color: '#fff2d8', accent: '#d6b37f' },
      ],
      legs: [
        { x: 0.072, y: 0.83, w: 0.07, h: 0.125, lean: -0.015, shineX: 0.086 },
        { x: 0.858, y: 0.83, w: 0.07, h: 0.125, lean: 0.015, shineX: 0.872 },
      ],
    },
    truck: {
      bodyRects: [
        { x: 0.37, y: 0.29, w: 0.47, h: 0.36 },
        { x: 0.48, y: 0.11, w: 0.25, h: 0.48 },
        { x: 0.1, y: 0.25, w: 0.39, h: 0.4 },
      ],
      roof: { x: 0.45, y: 0.04, w: 0.31, h: 0.17, r: 0.05 },
      windows: [
        { x: 0.51, y: 0.17, w: 0.1, h: 0.23, r: 0.04 },
        { x: 0.63, y: 0.17, w: 0.1, h: 0.23, r: 0.04 },
      ],
      headlights: [
        { cx: 0.047, cy: 0.41 },
        { cx: 0.047, cy: 0.5 },
        { cx: 0.082, cy: 0.41 },
        { cx: 0.082, cy: 0.5 },
      ],
      wheels: [
        { cx: 0.25, cy: 0.73 },
        { cx: 0.72, cy: 0.73 },
      ],
      panelLines: [
        { x1: 0.17, y1: 0.38, x2: 0.26, y2: 0.36 },
        { x1: 0.4, y1: 0.62, x2: 0.56, y2: 0.6 },
        { x1: 0.67, y1: 0.29, x2: 0.8, y2: 0.31 },
      ],
    },
    desk: {
      body: { x: 0, y: 0.28, w: 1, h: 0.62, r: 0.12 },
      top: { x: 0.08, y: 0.09, w: 0.84, h: 0.24, r: 0.1 },
      drawers: [
        { x: 0.1, y: 0.48, w: 0.36, h: 0.22, r: 0.03, knob: 0.28 },
        { x: 0.54, y: 0.48, w: 0.36, h: 0.22, r: 0.03, knob: 0.72 },
      ],
      book: { x: 0.66, y: 0.42, w: 0.18, h: 0.36, r: 0.05 },
      shadow: { x: 0.15, y: 0.73, w: 0.7, h: 0.08, r: 0.03 },
      seams: [
        { x1: 0.14, y1: 0.42, x2: 0.86, y2: 0.42 },
        { x1: 0.5, y1: 0.45, x2: 0.5, y2: 0.77 },
        { x1: 0.1, y1: 0.19, x2: 0.9, y2: 0.19, highlight: true },
      ],
    },
    tree: {
      trunk: { x: 0.42, y: 0.42, w: 0.18, h: 0.58, r: 0.035 },
      leafBlobs: [
        { cx: 0.5, cy: 0.24, rx: 0.44, ry: 0.26, shade: 16 },
        { cx: 0.34, cy: 0.43, rx: 0.34, ry: 0.22, shade: -5 },
        { cx: 0.66, cy: 0.43, rx: 0.34, ry: 0.22, shade: -10 },
        { cx: 0.5, cy: 0.58, rx: 0.45, ry: 0.24, shade: -15 },
      ],
      barkLines: [
        { x1: 0.49, y1: 0.48, cx: 0.44, cy: 0.66, x2: 0.5, y2: 0.92 },
        { x1: 0.54, y1: 0.5, cx: 0.59, cy: 0.66, x2: 0.55, y2: 0.9 },
      ],
      fruit: [
        { cx: 0.67, cy: 0.36, r: 0.022 },
        { cx: 0.31, cy: 0.5, r: 0.018 },
      ],
    },
  };

  function getDetailLevel(width) {
    if (width >= 220) return DETAIL_LEVELS.HIGH;
    if (width >= 120) return DETAIL_LEVELS.MEDIUM;
    return DETAIL_LEVELS.LOW;
  }

  function makeGradient(ctx, x1, y1, x2, y2, stops) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach((stop, index) => {
      if (Array.isArray(stop)) gradient.addColorStop(stop[0], stop[1]);
      else gradient.addColorStop(index / Math.max(1, stops.length - 1), stop);
    });
    return gradient;
  }

  function makeVerticalGradient(ctx, x, y, h, stops) {
    return makeGradient(ctx, x, y, x, y + h, stops);
  }

  function makeDiagonalGradient(ctx, x, y, w, h, stops) {
    return makeGradient(ctx, x, y, x + w, y + h, stops);
  }

  function ratioRect(frame, rect) {
    return {
      x: frame.x + frame.w * rect.x,
      y: frame.y + frame.h * rect.y,
      w: frame.w * rect.w,
      h: frame.h * rect.h,
      r: frame.h * (rect.r || 0),
    };
  }

  function drawRatioLine(ctx, frame, line) {
    ctx.beginPath();
    ctx.moveTo(frame.x + frame.w * line.x1, frame.y + frame.h * line.y1);
    ctx.lineTo(frame.x + frame.w * line.x2, frame.y + frame.h * line.y2);
    ctx.stroke();
  }

  function seededUnit(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

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
      const px = x + seededUnit(index + 1) * w;
      const py = y + seededUnit(index + 101) * h;
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

  function drawCouchShadow(ctx, frame, theme) {
    ctx.fillStyle = theme.shadow;
    ctx.beginPath();
    ctx.ellipse(frame.x + frame.w / 2, frame.y + frame.h * 1.03, frame.w * 0.49, frame.h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCouchStructure(ctx, frame, tools, theme, layout) {
    const { fillRoundedRect, strokeRoundedRect } = tools;
    const base = ratioRect(frame, layout.base);
    ctx.fillStyle = makeVerticalGradient(ctx, base.x, base.y, base.h, theme.base);
    fillRoundedRect(ctx, base.x, base.y, base.w, base.h, base.r);

    ctx.fillStyle = makeVerticalGradient(ctx, frame.x, frame.y + frame.h * 0.08, frame.h * 0.48, theme.back);
    layout.backs.forEach((rect) => {
      const back = ratioRect(frame, rect);
      fillSoftCushion(ctx, back.x, back.y, back.w, back.h, back.r);
    });

    ctx.fillStyle = makeVerticalGradient(ctx, frame.x, frame.y + frame.h * 0.48, frame.h * 0.32, theme.seat);
    layout.seats.forEach((rect) => {
      const seat = ratioRect(frame, rect);
      fillSoftCushion(ctx, seat.x, seat.y, seat.w, seat.h, seat.r);
    });

    ctx.fillStyle = makeVerticalGradient(ctx, frame.x, frame.y + frame.h * 0.28, frame.h * 0.6, theme.arms);
    layout.arms.forEach((rect) => {
      const arm = ratioRect(frame, rect);
      fillRoundedRect(ctx, arm.x, arm.y, arm.w, arm.h, arm.r);
    });

    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = Math.max(1.5, frame.w * 0.01);
    layout.arms.forEach((rect) => {
      const arm = ratioRect(frame, rect);
      strokeRoundedRect(ctx, arm.x, arm.y, arm.w, arm.h, arm.r);
    });
  }

  function drawCouchDepth(ctx, frame, tools, layout) {
    const { fillRoundedRect } = tools;
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    layout.occlusion.forEach((rect) => {
      const shadow = ratioRect(frame, rect);
      fillRoundedRect(ctx, shadow.x, shadow.y, shadow.w, shadow.h, shadow.r);
    });
  }

  function drawCouchSeamsAndHighlights(ctx, frame, theme, layout, detail) {
    ctx.strokeStyle = theme.piping;
    ctx.lineWidth = Math.max(1.1, frame.w * 0.008);
    layout.backs.concat(layout.seats).forEach((rect) => {
      const cushion = ratioRect(frame, rect);
      strokeSoftCushion(ctx, cushion.x, cushion.y, cushion.w, cushion.h, cushion.r);
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = Math.max(1, frame.w * 0.006);
    layout.seams.forEach((line) => drawRatioLine(ctx, frame, line));

    if (detail === DETAIL_LEVELS.LOW) return;

    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = Math.max(1.2, frame.w * 0.012);
    layout.highlights.forEach(({ cx, cy, r }) => {
      ctx.beginPath();
      ctx.arc(frame.x + frame.w * cx, frame.y + frame.h * cy, frame.w * r, Math.PI, Math.PI * 1.82);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = Math.max(1.4, frame.w * 0.012);
    ctx.beginPath();
    ctx.moveTo(frame.x + frame.w * 0.5, frame.y + frame.h * 0.14);
    ctx.lineTo(frame.x + frame.w * 0.5, frame.y + frame.h * 0.78);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.13)';
    ctx.lineWidth = Math.max(1, frame.w * 0.007);
    drawCouchWrinkles(ctx, frame.x, frame.y, frame.w, frame.h);
  }

  function drawCouchDetails(ctx, frame, tools, theme, layout, detail) {
    if (detail !== DETAIL_LEVELS.LOW) {
      layout.pillows.forEach((pillow) => {
        drawCouchPillow(
          ctx,
          frame.x + frame.w * pillow.cx,
          frame.y + frame.h * pillow.cy,
          frame.w * pillow.w,
          frame.h * pillow.h,
          pillow.angle,
          pillow.color,
          pillow.accent,
          tools
        );
      });
    }

    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    ctx.beginPath();
    ctx.ellipse(frame.x + frame.w * 0.31, frame.y + frame.h * 0.18, frame.w * 0.12, frame.h * 0.035, -0.1, 0, Math.PI * 2);
    ctx.ellipse(frame.x + frame.w * 0.71, frame.y + frame.h * 0.18, frame.w * 0.12, frame.h * 0.035, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.leg;
    layout.legs.forEach((leg) => {
      drawAngledLeg(ctx, frame.x + frame.w * leg.x, frame.y + frame.h * leg.y, frame.w * leg.w, frame.h * leg.h, frame.w * leg.lean);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    layout.legs.forEach((leg) => {
      drawAngledLeg(ctx, frame.x + frame.w * leg.shineX, frame.y + frame.h * 0.84, frame.w * 0.018, frame.h * 0.075, frame.w * leg.lean * 0.34);
    });

    ctx.fillStyle = 'rgba(6,21,36,0.42)';
    ctx.beginPath();
    ctx.ellipse(frame.x + frame.w * 0.31, frame.y + frame.h * 0.94, frame.w * 0.03, frame.h * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(frame.x + frame.w * 0.72, frame.y + frame.h * 0.86, Math.max(2, frame.w * 0.018), 0, Math.PI * 2);
    ctx.fill();

    if (detail !== DETAIL_LEVELS.LOW) {
      drawCouchFabricTexture(ctx, frame.x + frame.w * 0.05, frame.y + frame.h * 0.1, frame.w * 0.9, frame.h * 0.76);
    }
  }

  function drawCouch(ctx, x, y, w, h, tools) {
    const frame = { x, y, w, h };
    const theme = ART_THEMES.couch;
    const layout = ART_LAYOUTS.couch;
    const detail = getDetailLevel(w);

    ctx.save();
    ctx.lineJoin = 'round';
    drawCouchShadow(ctx, frame, theme);
    drawCouchStructure(ctx, frame, tools, theme, layout);
    drawCouchDepth(ctx, frame, tools, layout);
    drawCouchSeamsAndHighlights(ctx, frame, theme, layout, detail);
    drawCouchDetails(ctx, frame, tools, theme, layout, detail);
    ctx.restore();
  }

  function drawTruckWheel(ctx, cx, cy, radius, theme) {
    ctx.fillStyle = theme ? theme.tire : '#10151d';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = theme ? theme.rim : '#d0d4d8';
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

  function drawTruckBody(ctx, frame, tools, theme, layout) {
    const { fillRoundedRect } = tools;
    ctx.fillStyle = makeDiagonalGradient(ctx, frame.x, frame.y, frame.w, frame.h, theme.paint);
    layout.bodyRects.forEach((rect) => {
      const body = ratioRect(frame, rect);
      ctx.fillRect(body.x, body.y, body.w, body.h);
    });

    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = Math.max(1.5, frame.w * 0.01);
    ctx.strokeRect(frame.x + frame.w * 0.1, frame.y + frame.h * 0.25, frame.w * 0.74, frame.h * 0.4);

    ctx.fillStyle = theme.trim;
    ctx.fillRect(frame.x + frame.w * 0.1, frame.y + frame.h * 0.58, frame.w * 0.74, frame.h * 0.12);

    const roof = ratioRect(frame, layout.roof);
    ctx.fillStyle = theme.roof;
    fillRoundedRect(ctx, roof.x, roof.y, roof.w, roof.h, roof.r);
  }

  function drawTruckWindows(ctx, frame, tools, theme, layout) {
    const { fillRoundedRect, strokeRoundedRect } = tools;
    ctx.fillStyle = theme.glass;
    layout.windows.forEach((rect) => {
      const window = ratioRect(frame, rect);
      fillRoundedRect(ctx, window.x, window.y, window.w, window.h, window.r);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.moveTo(frame.x + frame.w * 0.525, frame.y + frame.h * 0.19);
    ctx.lineTo(frame.x + frame.w * 0.6, frame.y + frame.h * 0.19);
    ctx.lineTo(frame.x + frame.w * 0.535, frame.y + frame.h * 0.37);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = theme.chrome;
    ctx.lineWidth = Math.max(1.4, frame.w * 0.012);
    layout.windows.forEach((rect) => {
      const window = ratioRect(frame, rect);
      strokeRoundedRect(ctx, window.x, window.y, window.w, window.h, window.r);
    });
  }

  function drawTruckDetails(ctx, frame, tools, theme, layout, detail) {
    const { fillRoundedRect } = tools;
    ctx.strokeStyle = '#5a0000';
    ctx.lineWidth = Math.max(1.2, frame.w * 0.01);
    ctx.strokeRect(frame.x + frame.w * 0.61, frame.y + frame.h * 0.13, frame.w * 0.14, frame.h * 0.43);
    drawRatioLine(ctx, frame, { x1: 0.37, y1: 0.29, x2: 0.84, y2: 0.29 });

    ctx.fillStyle = '#cfcfcf';
    ctx.fillRect(frame.x + frame.w * 0.7, frame.y + frame.h * 0.43, frame.w * 0.035, frame.h * 0.02);

    ctx.fillStyle = theme.grille;
    ctx.fillRect(frame.x + frame.w * 0.02, frame.y + frame.h * 0.34, frame.w * 0.09, frame.h * 0.24);
    ctx.strokeStyle = '#747b84';
    ctx.lineWidth = Math.max(1, frame.w * 0.008);
    for (let index = 0; index < 5; index += 1) {
      drawRatioLine(ctx, frame, { x1: 0.025, y1: 0.37 + index * 0.045, x2: 0.105, y2: 0.37 + index * 0.045 });
    }

    ctx.fillStyle = '#fff6c5';
    layout.headlights.forEach(({ cx, cy }) => {
      ctx.beginPath();
      ctx.arc(frame.x + frame.w * cx, frame.y + frame.h * cy, Math.max(2.5, frame.w * 0.018), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#d8d8d8';
    fillRoundedRect(ctx, frame.x, frame.y + frame.h * 0.62, frame.w * 0.12, frame.h * 0.08, frame.h * 0.03);
    fillRoundedRect(ctx, frame.x + frame.w * 0.82, frame.y + frame.h * 0.62, frame.w * 0.1, frame.h * 0.08, frame.h * 0.03);

    ctx.fillStyle = theme.gold;
    ctx.fillRect(frame.x + frame.w * 0.16, frame.y + frame.h * 0.48, frame.w * 0.63, frame.h * 0.025);
    ctx.fillStyle = '#d6b447';
    ctx.fillRect(frame.x + frame.w * 0.035, frame.y + frame.h * 0.47, frame.w * 0.052, frame.h * 0.025);
    ctx.fillRect(frame.x + frame.w * 0.05, frame.y + frame.h * 0.44, frame.w * 0.024, frame.h * 0.085);

    if (detail === DETAIL_LEVELS.LOW) return;

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1.2, frame.w * 0.006);
    ctx.beginPath();
    ctx.moveTo(frame.x + frame.w * 0.18, frame.y + frame.h * 0.31);
    ctx.quadraticCurveTo(frame.x + frame.w * 0.32, frame.y + frame.h * 0.27, frame.x + frame.w * 0.46, frame.y + frame.h * 0.32);
    ctx.moveTo(frame.x + frame.w * 0.5, frame.y + frame.h * 0.12);
    ctx.quadraticCurveTo(frame.x + frame.w * 0.62, frame.y + frame.h * 0.08, frame.x + frame.w * 0.73, frame.y + frame.h * 0.13);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56,0,0,0.34)';
    ctx.lineWidth = Math.max(1, frame.w * 0.005);
    layout.panelLines.forEach((line) => drawRatioLine(ctx, frame, line));

    drawSticker(ctx, frame.x + frame.w * 0.41, frame.y + frame.h * 0.36, frame.w * 0.09, frame.h * 0.08, '#fff2d8', tools);
    drawDeterministicSpeckles(ctx, frame.x + frame.w * 0.1, frame.y + frame.h * 0.25, frame.w * 0.74, frame.h * 0.43, 34, 'rgba(255,255,255,0.09)');
  }

  function drawTruckWheels(ctx, frame, theme, layout) {
    const wheelRadius = Math.min(frame.w * 0.12, frame.h * 0.18);
    ctx.fillStyle = '#1f2933';
    layout.wheels.forEach(({ cx, cy }) => {
      const wheelX = frame.x + frame.w * cx;
      const wheelY = frame.y + frame.h * cy;
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, wheelRadius * 1.25, Math.PI, 0);
      ctx.fill();
      drawTruckWheel(ctx, wheelX, wheelY, wheelRadius, theme);
    });
  }

  function drawPickupTruck(ctx, x, y, w, h, tools) {
    const frame = { x, y, w, h };
    const theme = ART_THEMES.truck;
    const layout = ART_LAYOUTS.truck;
    const detail = getDetailLevel(w);

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = theme.shadow;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.88, w * 0.48, h * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();

    drawTruckBody(ctx, frame, tools, theme, layout);
    drawTruckWindows(ctx, frame, tools, theme, layout);
    drawTruckDetails(ctx, frame, tools, theme, layout, detail);
    drawTruckWheels(ctx, frame, theme, layout);
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

  function drawDeskStructure(ctx, frame, tools, theme, layout) {
    const { fillRoundedRect } = tools;
    const body = ratioRect(frame, layout.body);
    const top = ratioRect(frame, layout.top);

    ctx.fillStyle = makeVerticalGradient(ctx, frame.x, frame.y, frame.h, theme.body);
    fillRoundedRect(ctx, body.x, body.y, body.w, body.h, body.r);
    ctx.fillStyle = theme.top;
    fillRoundedRect(ctx, top.x, top.y, top.w, top.h, top.r);
  }

  function drawDeskDrawers(ctx, frame, tools, theme, layout) {
    const { fillRoundedRect } = tools;
    ctx.fillStyle = theme.inset;
    layout.drawers.forEach((drawer) => {
      const drawerRect = ratioRect(frame, drawer);
      fillRoundedRect(ctx, drawerRect.x, drawerRect.y, drawerRect.w, drawerRect.h, drawerRect.r);
    });

    const book = ratioRect(frame, layout.book);
    ctx.fillStyle = theme.book;
    fillRoundedRect(ctx, book.x, book.y, book.w, book.h, book.r);

    ctx.fillStyle = theme.knob;
    layout.drawers.forEach((drawer) => {
      ctx.beginPath();
      ctx.arc(frame.x + frame.w * drawer.knob, frame.y + frame.h * 0.6, Math.max(2, frame.w * 0.018), 0, Math.PI * 2);
      ctx.fill();
    });

    const shadow = ratioRect(frame, layout.shadow);
    ctx.fillStyle = 'rgba(6,21,36,0.16)';
    fillRoundedRect(ctx, shadow.x, shadow.y, shadow.w, shadow.h, shadow.r);
  }

  function drawDeskLines(ctx, frame, theme, layout, detail) {
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = Math.max(1, frame.w * 0.008);
    layout.seams.filter((line) => !line.highlight).forEach((line) => drawRatioLine(ctx, frame, line));

    ctx.strokeStyle = theme.highlight;
    ctx.lineWidth = Math.max(1, frame.w * 0.01);
    layout.seams.filter((line) => line.highlight).forEach((line) => drawRatioLine(ctx, frame, line));

    if (detail === DETAIL_LEVELS.LOW) return;
    drawWoodGrain(ctx, frame.x + frame.w * 0.08, frame.y + frame.h * 0.09, frame.w * 0.84, frame.h * 0.24, theme.grain);
  }

  function drawFrontDeskExtras(ctx, frame, tools, theme, detail) {
    if (!theme.sign || detail === DETAIL_LEVELS.LOW) return;
    const { fillRoundedRect } = tools;
    ctx.fillStyle = theme.sign;
    fillRoundedRect(ctx, frame.x + frame.w * 0.22, frame.y + frame.h * 0.34, frame.w * 0.28, frame.h * 0.11, frame.h * 0.025);
    ctx.fillStyle = 'rgba(9,35,63,0.3)';
    ctx.fillRect(frame.x + frame.w * 0.26, frame.y + frame.h * 0.385, frame.w * 0.2, Math.max(2, frame.h * 0.012));

    ctx.fillStyle = theme.bell;
    ctx.beginPath();
    ctx.ellipse(frame.x + frame.w * 0.76, frame.y + frame.h * 0.34, frame.w * 0.055, frame.h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.36)';
    ctx.beginPath();
    ctx.arc(frame.x + frame.w * 0.74, frame.y + frame.h * 0.325, Math.max(1.5, frame.w * 0.012), 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDesk(ctx, x, y, w, h, tools, spot) {
    const frame = { x, y, w, h };
    const isFrontDesk = spot && (spot.id === 'lobby-front-desk' || spot.id === 'front-desk');
    const theme = isFrontDesk ? ART_THEMES.frontDesk : ART_THEMES.desk;
    const layout = ART_LAYOUTS.desk;
    const detail = getDetailLevel(w);

    ctx.save();
    drawDeskStructure(ctx, frame, tools, theme, layout);
    drawDeskDrawers(ctx, frame, tools, theme, layout);
    drawFrontDeskExtras(ctx, frame, tools, theme, detail);
    drawDeskLines(ctx, frame, theme, layout, detail);
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

  function drawTreeTrunk(ctx, frame, tools, theme, layout) {
    const { fillRoundedRect } = tools;
    const trunk = ratioRect(frame, layout.trunk);
    ctx.fillStyle = theme.trunk;
    fillRoundedRect(ctx, trunk.x, trunk.y, trunk.w, trunk.h, trunk.r);

    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = Math.max(1, frame.w * 0.012);
    layout.barkLines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(frame.x + frame.w * line.x1, frame.y + frame.h * line.y1);
      ctx.quadraticCurveTo(frame.x + frame.w * line.cx, frame.y + frame.h * line.cy, frame.x + frame.w * line.x2, frame.y + frame.h * line.y2);
      ctx.stroke();
    });
  }

  function drawTreeLeaves(ctx, frame, tools, theme, layout, isTree) {
    const { shadeColor } = tools;
    const leafColor = isTree ? theme.leaves : theme.bushLeaves;
    layout.leafBlobs.forEach((blob) => {
      ctx.fillStyle = shadeColor(leafColor, blob.shade);
      ctx.beginPath();
      ctx.ellipse(frame.x + frame.w * blob.cx, frame.y + frame.h * blob.cy, frame.w * blob.rx, frame.h * blob.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawTreeDetails(ctx, frame, theme, layout, detail, isTree) {
    if (detail !== DETAIL_LEVELS.LOW) {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = Math.max(1, frame.w * 0.012);
      ctx.beginPath();
      ctx.arc(frame.x + frame.w * 0.44, frame.y + frame.h * 0.28, frame.w * 0.16, Math.PI * 1.1, Math.PI * 1.78);
      ctx.stroke();
    }

    ctx.fillStyle = isTree ? theme.fruit : '#ffd166';
    ctx.beginPath();
    layout.fruit.forEach((fruit) => {
      ctx.moveTo(frame.x + frame.w * fruit.cx + Math.max(2, frame.w * fruit.r), frame.y + frame.h * fruit.cy);
      ctx.arc(frame.x + frame.w * fruit.cx, frame.y + frame.h * fruit.cy, Math.max(2, frame.w * fruit.r), 0, Math.PI * 2);
    });
    ctx.fill();

    if (detail !== DETAIL_LEVELS.LOW) {
      drawDeterministicSpeckles(ctx, frame.x + frame.w * 0.08, frame.y + frame.h * 0.12, frame.w * 0.84, frame.h * 0.58, 34, theme.shadow);
    }
  }

  function drawTreeOrBush(ctx, x, y, w, h, tools, isTree) {
    const frame = { x, y, w, h };
    const theme = ART_THEMES.tree;
    const layout = ART_LAYOUTS.tree;
    const detail = getDetailLevel(w);

    ctx.save();
    if (isTree) drawTreeTrunk(ctx, frame, tools, theme, layout);
    drawTreeLeaves(ctx, frame, tools, theme, layout, isTree);
    drawTreeDetails(ctx, frame, theme, layout, detail, isTree);
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
    else if (spot.kind === 'desk') drawDesk(ctx, x, y, w, h, tools, spot);
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

  function drawBackdropWindow(ctx, x, y, w, h, frameColor, skyTop, skyBottom) {
    ctx.save();
    ctx.fillStyle = frameColor;
    ctx.fillRect(x, y, w, h);
    const sky = ctx.createLinearGradient(x, y, x, y + h);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(1, skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.26)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 10);
    ctx.lineTo(x + w / 2, y + h - 10);
    ctx.moveTo(x + 10, y + h / 2);
    ctx.lineTo(x + w - 10, y + h / 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawBackdropFrames(ctx, frames) {
    frames.forEach((frame) => {
      ctx.fillStyle = frame.outer;
      ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
      ctx.fillStyle = frame.inner;
      ctx.fillRect(frame.x + 8, frame.y + 8, frame.w - 16, frame.h - 16);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(frame.x + 12, frame.y + 12, frame.w - 24, frame.h - 24);
    });
  }

  function drawMountainRange(ctx, baseY, peaks, color, highlight) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    peaks.forEach((peak, index) => {
      const prevX = index === 0 ? 0 : peaks[index - 1].x;
      ctx.lineTo(prevX, baseY);
      ctx.lineTo(peak.x, peak.y);
    });
    ctx.lineTo(800, baseY);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = highlight;
    peaks.forEach((peak) => {
      ctx.beginPath();
      ctx.moveTo(peak.x - 16, peak.y + 18);
      ctx.lineTo(peak.x, peak.y);
      ctx.lineTo(peak.x + 18, peak.y + 20);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  function drawStringLights(ctx, x1, x2, y, droop, count, wireColor) {
    ctx.save();
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo((x1 + x2) / 2, y + droop, x2, y);
    ctx.stroke();
    const bulbs = ['#ffd166', '#f58220', '#2ec7d3', '#fff2d8'];
    for (let index = 0; index < count; index += 1) {
      const t = index / Math.max(1, count - 1);
      const bx = x1 + (x2 - x1) * t;
      const by = y + droop * Math.sin(Math.PI * t) * 0.8;
      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + 12);
      ctx.stroke();
      ctx.fillStyle = bulbs[index % bulbs.length];
      ctx.beginPath();
      ctx.arc(bx, by + 17, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAurora(ctx, bands) {
    ctx.save();
    bands.forEach((band) => {
      const gradient = ctx.createLinearGradient(band.x1, band.y1, band.x2, band.y2);
      gradient.addColorStop(0, band.start);
      gradient.addColorStop(0.5, band.mid);
      gradient.addColorStop(1, band.end);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = band.width;
      ctx.beginPath();
      ctx.moveTo(band.x1, band.y1);
      ctx.quadraticCurveTo(band.cx, band.cy, band.x2, band.y2);
      ctx.stroke();
    });
    ctx.restore();
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
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let beam = 72; beam < 740; beam += 72) {
        ctx.fillRect(beam, 64, 8, 154);
      }
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
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(616, 88, 58, 8);
      ctx.fillRect(624, 106, 42, 8);
      ctx.fillStyle = '#f58220';
      ctx.beginPath();
      ctx.arc(670, 118, 11, 0, Math.PI * 2);
      ctx.fill();
    } else if (map.id === 'roadside-lodge' && room.id === 'lobby') {
      drawBackdropWindow(ctx, 86, 84, 146, 102, '#fff2d8', '#7ec7ef', '#f7c36b');
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
      drawBackdropFrames(ctx, [
        { x: 520, y: 74, w: 78, h: 56, outer: '#85502a', inner: '#ffe1a8' },
        { x: 614, y: 78, w: 84, h: 48, outer: '#6f3f1f', inner: '#f58220' },
      ]);
      drawStringLights(ctx, 288, 710, 66, 18, 8, 'rgba(255,255,255,0.2)');
      ctx.fillStyle = '#2fa86f';
      ctx.beginPath();
      ctx.ellipse(730, 160, 18, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#70411f';
      ctx.fillRect(726, 176, 8, 22);
    } else if (map.id === 'alaska-train') {
      drawBackdropWindow(ctx, 72, 82, 210, 96, '#d7eef8', '#6dc9f0', '#f7fbff');
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
      drawAurora(ctx, [
        { x1: 310, y1: 74, cx: 460, cy: 24, x2: 676, y2: 96, width: 20, start: 'rgba(46,199,211,0.06)', mid: 'rgba(125,244,184,0.28)', end: 'rgba(255,255,255,0.02)' },
        { x1: 348, y1: 110, cx: 510, cy: 54, x2: 732, y2: 122, width: 14, start: 'rgba(123,78,230,0.04)', mid: 'rgba(46,199,211,0.18)', end: 'rgba(255,255,255,0.01)' },
      ]);
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      [332, 396, 452, 540, 612, 708].forEach((starX, index) => {
        ctx.beginPath();
        ctx.arc(starX, 72 + (index % 3) * 12, index % 2 ? 1.4 : 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (map.id === 'campground') {
      drawMountainRange(ctx, 198, [
        { x: 96, y: 112 },
        { x: 208, y: 86 },
        { x: 356, y: 126 },
        { x: 520, y: 78 },
        { x: 708, y: 118 },
      ], 'rgba(8,28,34,0.32)', 'rgba(255,255,255,0.18)');
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
      drawStringLights(ctx, 120, 674, 84, 14, 7, 'rgba(255,255,255,0.12)');
      ctx.fillStyle = 'rgba(245,130,32,0.36)';
      ctx.beginPath();
      ctx.arc(404, 338, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (map.id === 'rest-stop') {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let tileX = 78; tileX < 736; tileX += 48) {
        ctx.fillRect(tileX, 78, 2, 126);
      }
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
      drawBackdropFrames(ctx, [
        { x: 260, y: 86, w: 92, h: 58, outer: '#7b4ee6', inner: '#fff2d8' },
        { x: 370, y: 90, w: 106, h: 54, outer: '#09233f', inner: '#2ec7d3' },
      ]);
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
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(328, 20, 144, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let lamp = 104; lamp < 748; lamp += 160) {
        ctx.beginPath();
        ctx.arc(lamp, 46, 18, 0, Math.PI * 2);
        ctx.fill();
      }
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
