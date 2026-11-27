
/* opening_video_r1 opening_video_r5.js (code-animated canvas + 12 embedded webp, DeaRz approved 14:59): window.playOpeningVideo(onDone,opts) */
/* Lanternfall opening video r5 - painted backgrounds (ChatGPT stills) + code motion; code-only fallback; 75 s, skippable.
   API: playOpeningVideo(onDone, opts)  opts: {low:bool, mute:bool, startAt:sec, freeze:bool}
   onDone is called exactly once (video end or skip). No external files. */
(function () {
  'use strict';
  var W = 1280, H = 720, DUR = 75;
  var SUBS = [
    [1.5, 6.2, 'ครั้งหนึ่ง โลกมีตะเกียงดวงใหญ่ตั้งอยู่บนยอดหอคอยสูงเสียดฟ้า'],
    [7.6, 12.4, 'แสงของมันกั้นความมืดและหมอกไว้ทั้งแผ่นดิน'],
    [14, 19.4, 'ใต้แสงนั้น ผู้คนสี่เผ่าสร้างเมืองและค้าขาย'],
    [20, 26.4, 'พวกเขานับปีจากวันที่ตะเกียงถูกจุด'],
    [29, 34.5, 'แล้วคืนหนึ่ง แสงก็เริ่มริบหรี่'],
    [44.4, 49, 'ตะเกียงแตก ประกายไฟร่วงทั่วแผ่นดิน'],
    [50, 54.6, 'ผู้คนเรียกคืนนั้นว่า Lanternfall'],
    [56, 61.8, 'ผู้รอดชีวิตหนีมารวมกันที่ Sylva จุดตะเกียงเล็กกันหมอก'],
    [63, 69.4, 'และมีผู้หนึ่งเก็บประกายดวงเดียวไว้ เพื่อรอใครสักคน']
  ];
  var running = false;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  // ---------- static data ----------
  var R = mulberry(20261112), LOW = false;
  var stars = [], i;
  for (i = 0; i < 220; i++) stars.push([R() * W, R() * 470, R() * 1.4 + .4, R() * 6.3]);
  var sparks = [];
  for (i = 0; i < 420; i++) {
    var ang = R() * 6.28, sp = 40 + R() * 260;
    var kind = R() < .22 ? 1 + Math.floor(R() * 4) : 0;
    sparks.push({ t0: .25 + R() * 6.5, x: 640 + (R() - .5) * 40, y: 215 + (R() - .5) * 30, vx: Math.cos(ang) * sp * .9, vy: Math.sin(ang) * sp * .6 - 60, g: 70 + R() * 90, s: 1 + R() * 2.6, k: kind, ph: R() * 6 });
  }
  var shards = [];
  for (i = 0; i < 34; i++) { var a2 = R() * 6.28, s2 = 120 + R() * 420; shards.push({ vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2 - 80, r: R() * 6, vr: (R() - .5) * 10, z: 4 + R() * 10 }); }
  var COL = ['#fff3c4', '#ff7a2e', '#8fe0ff', '#ffe94a', '#86d96a'];
  var eyes = [];
  for (i = 0; i < 14; i++) eyes.push([60 + R() * 1160, 560 + R() * 140, 4 + R() * 7, R() * 10]);
  var mistB = [];
  for (i = 0; i < 26; i++) mistB.push([R() * W, R(), 160 + R() * 220, R() * 6.3]);
  var windows = [];
  for (i = 0; i < 90; i++) windows.push(R());

  // ---------- helpers ----------
  function glow(c, x, y, r, rgb, a) {
    if (a <= 0.003) return;
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
    g.addColorStop(.35, 'rgba(' + rgb + ',' + a * .4 + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function sky(c, top, mid, bot) {
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(.6, mid); g.addColorStop(1, bot);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function drawStars(c, t, a) {
    c.fillStyle = '#fff';
    for (var k = 0; k < stars.length; k++) {
      var s = stars[k]; c.globalAlpha = a * (.35 + .65 * Math.abs(Math.sin(t * .8 + s[3])));
      c.fillRect(s[0], s[1], s[2], s[2]);
    }
    c.globalAlpha = 1;
  }
  function tower(c, x, topY, baseY, col) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - 46, baseY); c.lineTo(x - 22, topY + 40); c.lineTo(x - 30, topY + 40); c.lineTo(x - 30, topY + 20);
    c.lineTo(x + 30, topY + 20); c.lineTo(x + 30, topY + 40); c.lineTo(x + 22, topY + 40); c.lineTo(x + 46, baseY); c.closePath(); c.fill();
    c.fillRect(x - 36, topY + 14, 72, 8);
  }
  function lantern(c, x, y, s, lit, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#1a1626';
    c.beginPath(); c.moveTo(-18, -26); c.lineTo(0, -44); c.lineTo(18, -26); c.closePath(); c.fill();
    c.fillRect(-20, -28, 40, 5);
    c.fillStyle = 'rgba(255,214,120,' + (.25 + .7 * lit) + ')';
    c.beginPath(); c.moveTo(-14, -24); c.lineTo(14, -24); c.lineTo(18, 0); c.lineTo(14, 22); c.lineTo(-14, 22); c.lineTo(-18, 0); c.closePath(); c.fill();
    c.strokeStyle = '#1a1626'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(-6, -24); c.lineTo(-8, 22); c.moveTo(6, -24); c.lineTo(8, 22); c.stroke();
    c.fillStyle = '#1a1626'; c.fillRect(-18, 22, 36, 6);
    c.fillStyle = 'rgba(255,255,235,' + lit + ')';
    c.beginPath(); c.ellipse(0, 0, 5 + 2 * Math.sin(t * 9), 10, 0, 0, 6.3); c.fill();
    c.restore();
  }
  function person(c, x, y, s, type, ph, col, raise) {
    var bob = Math.abs(Math.sin(ph)) * 2.2 * s;
    c.save(); c.translate(x, y - bob); c.scale(s, s);
    c.fillStyle = col; c.strokeStyle = 'rgba(255,205,130,.55)'; c.lineWidth = 1.4;
    var sw = Math.sin(ph) * 5;
    c.fillRect(-7 + sw, -26, 5, 26); c.fillRect(2 - sw, -26, 5, 26);
    c.beginPath(); c.moveTo(-11, -24); c.lineTo(-8, -52); c.lineTo(8, -52); c.lineTo(11, -24); c.closePath(); c.fill(); c.stroke();
    if (raise) {
      c.save(); c.translate(7, -50); c.rotate(-2.2); c.fillRect(0, -2.5, 22, 5); c.restore();
    } else { c.fillRect(-12, -50, 4, 20); c.fillRect(8, -50, 4, 20); }
    c.beginPath(); c.arc(0, -61, 10, 0, 6.3); c.fill(); c.stroke();
    if (type === 1) { c.beginPath(); c.moveTo(-7, -68); c.lineTo(-9, -80); c.lineTo(-2, -70); c.moveTo(7, -68); c.lineTo(9, -80); c.lineTo(2, -70); c.fill(); }
    if (type === 1 || type === 3) { c.lineWidth = 3.4; c.strokeStyle = col; c.beginPath(); c.moveTo(-8, -26); c.quadraticCurveTo(-26, -22 + sw, -28, -42); c.stroke(); }
    if (type === 2) { c.beginPath(); c.moveTo(-8, -64); c.lineTo(-26, -70); c.lineTo(-8, -58); c.moveTo(8, -64); c.lineTo(26, -70); c.lineTo(8, -58); c.fill(); }
    if (type === 3) { c.beginPath(); c.moveTo(-9, -66); c.lineTo(-8, -80); c.lineTo(-1, -70); c.moveTo(9, -66); c.lineTo(8, -80); c.lineTo(1, -70); c.fill(); }
    c.restore();
  }
  function mist(c, t, x0, x1, yBase, alpha, col, tall) {
    for (var k = 0; k < mistB.length; k++) {
      var b = mistB[k]; var x = x0 + (b[0] / W) * (x1 - x0) + Math.sin(t * .25 + b[3]) * 24;
      var y = yBase - b[1] * (tall || 90) + Math.cos(t * .2 + b[3]) * 10;
      var r = b[2] * (LOW ? 1.3 : 1);
      var g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + col + ',' + alpha + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  function hills(c, base, amp, col, ph) {
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (var x = 0; x <= W; x += 40) c.lineTo(x, base + Math.sin(x * .006 + ph) * amp + Math.sin(x * .017 + ph * 2) * amp * .35);
    c.lineTo(W, H); c.closePath(); c.fill();
  }
  function house(c, x, y, w, h, col, idx, lit, dim) {
    c.fillStyle = col; c.fillRect(x, y - h, w, h);
    c.beginPath(); c.moveTo(x - 8, y - h); c.lineTo(x + w / 2, y - h - w * .5); c.lineTo(x + w + 8, y - h); c.closePath(); c.fill();
    var n = Math.max(1, Math.floor(w / 34));
    for (var k = 0; k < n; k++) {
      var on = windows[(idx * 7 + k) % windows.length] < .72;
      if (on) { c.fillStyle = 'rgba(255,205,110,' + (.85 * lit) + ')'; c.fillRect(x + 12 + k * 32, y - h * .62, 14, 18); }
    }
  }
  function vignette(c, a) {
    var g = c.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + a + ')');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }

  // ---------- scenes ----------
  function sceneBig(c, t) { // 0-13
    sky(c, '#04081a', '#0c1838', '#2a2f55');
    drawStars(c, t, clamp(t / 3, 0, 1) * .9);
    var s = lerp(6.5, 1, ease(t / 9.5));
    var fade = clamp((t - .15) / 1.2, 0, 1);
    c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-640, -215);
    glow(c, 640, 215, 520, '255,200,110', .32 * fade);
    // ground + city under light
    hills(c, 600, 18, '#070b18', 1);
    for (var k = 0; k < 14; k++) house(c, 330 + k * 46, 640, 30, 22 + (k % 3) * 10, '#0a0f20', k, fade, 1);
    tower(c, 640, 230, 650, '#090d1c');
    lantern(c, 640, 205, .95, fade, t);
    c.globalCompositeOperation = 'lighter';
    glow(c, 640, 215, 300, '255,214,140', .4 * fade);
    glow(c, 640, 640, 460, '255,190,90', .22 * fade * ease((t - 4) / 5));
    c.globalCompositeOperation = 'source-over';
    // golden rays sweeping
    if (t > 3) {
      c.globalCompositeOperation = 'lighter';
      for (k = 0; k < 7; k++) {
        var aa = (k / 7) * 6.28 + t * .05; c.fillStyle = 'rgba(255,215,140,' + (.035 * fade) + ')';
        c.beginPath(); c.moveTo(640, 215); c.lineTo(640 + Math.cos(aa - .07) * 900, 215 + Math.sin(aa - .07) * 900); c.lineTo(640 + Math.cos(aa + .07) * 900, 215 + Math.sin(aa + .07) * 900); c.closePath(); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
    }
    // mist stops at the edge of the golden light
    var mv = ease((t - 4) / 6);
    mist(c, t, -260, 190 + (1 - mv) * 20, 690, .5 * mv, '120,140,190', 120);
    mist(c, t, 1090 - (1 - mv) * 20, 1540, 690, .5 * mv, '120,140,190', 120);
    c.restore();
    vignette(c, .55);
  }

  function mixc(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return 'rgb(' + pa.map(function (v, i) { return Math.round(lerp(v, pb[i], t)); }).join(',') + ')';
  }
  var HAIR = ['#5a3a22', '#2a2a3a', '#c9822e', '#e8c15a', '#7a3a5a', '#3a6a4a'];
  var SHIRT = ['#e86a5a', '#4f8fd8', '#f0b43a', '#6ab86a', '#b070d0', '#f08ab0', '#40b8b0'];
  function kid(c, x, y, s, type, ph, shirt, hair, run, raise, dir) {
    var jump = run ? Math.abs(Math.sin(ph)) * 18 * s : Math.abs(Math.sin(ph)) * 2.4 * s, skin = '#f6d3b0';
    c.save(); c.translate(x, y - jump); c.scale(s * (dir < 0 ? -1 : 1), s);
    var sw = Math.sin(ph) * (run ? 9 : 5);
    c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(0, jump / s + 2, 16, 4, 0, 0, 6.3); c.fill();
    c.strokeStyle = '#4a4a6a'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4, -26); c.lineTo(-4 + sw, -2); c.moveTo(4, -26); c.lineTo(4 - sw, -2); c.stroke();
    if (type === 1 || type === 3) { c.strokeStyle = type === 1 ? '#a03a3a' : hair; c.lineWidth = 4; c.beginPath(); c.moveTo(-7, -28); c.quadraticCurveTo(-26, -22 + sw, -26, -42); c.stroke(); }
    c.fillStyle = shirt; c.beginPath(); c.moveTo(-11, -22); c.lineTo(-8, -52); c.lineTo(8, -52); c.lineTo(11, -22); c.closePath(); c.fill();
    c.strokeStyle = skin; c.lineWidth = 4.5;
    c.beginPath();
    if (raise) { c.moveTo(7, -48); c.lineTo(15, -70); c.moveTo(-8, -48); c.lineTo(-11, -30); }
    else if (run) { c.moveTo(8, -48); c.lineTo(20, -64 + sw); c.moveTo(-8, -48); c.lineTo(-20, -64 - sw); }
    else { c.moveTo(8, -48); c.lineTo(10 + sw * .6, -30); c.moveTo(-8, -48); c.lineTo(-10 - sw * .6, -30); }
    c.stroke();
    c.fillStyle = skin; c.beginPath(); c.arc(0, -61, 11, 0, 6.3); c.fill();
    if (type === 2) { c.beginPath(); c.moveTo(-10, -62); c.lineTo(-24, -70); c.lineTo(-9, -55); c.moveTo(10, -62); c.lineTo(24, -70); c.lineTo(9, -55); c.fill(); }
    c.fillStyle = hair; c.beginPath(); c.arc(0, -63, 11.5, Math.PI, 0); c.fill();
    if (type === 3) { c.beginPath(); c.moveTo(-10, -68); c.lineTo(-9, -82); c.lineTo(-2, -72); c.moveTo(10, -68); c.lineTo(9, -82); c.lineTo(2, -72); c.fill(); }
    if (type === 1) { c.fillStyle = '#f2ead8'; c.beginPath(); c.moveTo(-8, -70); c.lineTo(-10, -82); c.lineTo(-3, -72); c.moveTo(8, -70); c.lineTo(10, -82); c.lineTo(3, -72); c.fill(); }
    c.fillStyle = '#2a2030'; c.fillRect(2, -62, 2.4, 3); c.fillRect(-5, -62, 2.4, 3);
    c.strokeStyle = '#b0503a'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -57, 4, .15, 2.99); c.stroke();
    c.restore();
  }
  function tree(c, x, y, s, tm, k) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#7a5434'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-5, -90); c.lineTo(5, -90); c.lineTo(9, 0); c.closePath(); c.fill();
    var sway = Math.sin(tm * .9 + k) * 3, gs = ['#3f9a50', '#52b361', '#66c471'];
    var pos = [[-34, -110, 46], [34, -112, 44], [0, -150, 54], [-14, -120, 48], [20, -128, 42]];
    for (var q = 0; q < pos.length; q++) { c.fillStyle = gs[q % 3]; c.beginPath(); c.arc(pos[q][0] + sway * (pos[q][1] / -150), pos[q][1], pos[q][2], 0, 6.3); c.fill(); }
    c.restore();
  }
  function townScene(c, tt, dim, tm) {
    var pan = lerp(0, -640, ease(tt / 15)), k;
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5fb8f4'); g.addColorStop(.55, '#aee0fb'); g.addColorStop(1, '#fff0c8');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // distant great lantern glowing at the top of its tower
    c.fillStyle = 'rgba(150,175,215,.55)'; c.beginPath(); c.moveTo(618, 330); c.lineTo(632, 112); c.lineTo(648, 112); c.lineTo(662, 330); c.fill();
    c.globalCompositeOperation = 'lighter'; glow(c, 640, 96, 150, '255,235,170', .75); c.globalCompositeOperation = 'source-over';
    lantern(c, 640, 100, .38, 1, tm);
    // clouds
    for (k = 0; k < 6; k++) {
      var cx = ((k * 290 + tm * (8 + k * 2)) % 1700) - 200, cy = 70 + (k % 3) * 60;
      c.fillStyle = 'rgba(255,255,255,.8)';
      [[0, 0, 44], [40, 6, 34], [-40, 8, 32], [10, -14, 30]].forEach(function (p) { c.beginPath(); c.arc(cx + p[0], cy + p[1], p[2], 0, 6.3); c.fill(); });
    }
    // kite
    var kx = 1100 + Math.sin(tm * .7) * 40 + pan * .3, ky = 150 + Math.sin(tm * 1.1) * 12;
    c.save(); c.translate(kx, ky); c.rotate(Math.sin(tm * 1.3) * .15);
    c.fillStyle = '#ef5a5a'; c.beginPath(); c.moveTo(0, -26); c.lineTo(18, 0); c.lineTo(0, 30); c.lineTo(-18, 0); c.closePath(); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -26); c.lineTo(0, 30); c.moveTo(-18, 0); c.lineTo(18, 0); c.stroke();
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(kx, ky + 30); c.quadraticCurveTo(kx - 40, ky + 200, 700 + pan * .3 + 300, 520); c.stroke();
    // far hills
    c.fillStyle = '#9ad59a'; c.beginPath(); c.moveTo(0, 470);
    for (var x = 0; x <= W; x += 40) c.lineTo(x, 420 + Math.sin(x * .006) * 26 + Math.sin(x * .02) * 8);
    c.lineTo(W, 520); c.lineTo(0, 520); c.closePath(); c.fill();
    var WALL = ['#f6e4c6', '#efd0a8', '#dfeaf2', '#f3d6d6'], ROOF = ['#c95f4a', '#4f7fb8', '#d99a3a', '#6aa56a'];
    c.save(); c.translate(pan * .5, 0);
    for (k = 0; k < 20; k++) { var hh = 40 + (k * 37 % 50); c.fillStyle = mixc(WALL[k % 4], '#9fb4d6', .45); c.fillRect(k * 100, 480 - hh, 70, hh); c.fillStyle = mixc(ROOF[k % 4], '#9fb4d6', .45); c.beginPath(); c.moveTo(k * 100 - 6, 480 - hh); c.lineTo(k * 100 + 35, 480 - hh - 34); c.lineTo(k * 100 + 76, 480 - hh); c.fill(); }
    c.restore();
    c.save(); c.translate(pan, 0);
    for (k = 0; k < 15; k++) {
      var hx = k * 150 + 10, h = 90 + (k * 53 % 60), w = 110;
      c.fillStyle = WALL[k % 4]; c.fillRect(hx, 540 - h, w, h);
      c.fillStyle = ROOF[(k + 1) % 4]; c.beginPath(); c.moveTo(hx - 10, 540 - h); c.lineTo(hx + w / 2, 540 - h - 52); c.lineTo(hx + w + 10, 540 - h); c.closePath(); c.fill();
      c.fillStyle = '#9ad0ee'; c.fillRect(hx + 14, 540 - h * .66, 22, 26); c.fillRect(hx + w - 36, 540 - h * .66, 22, 26);
      c.fillStyle = '#8a5a3a'; c.fillRect(hx + w / 2 - 10, 540 - 40, 20, 40);
      c.fillStyle = k % 2 ? '#e86a8a' : '#f0c040'; c.fillRect(hx + 16, 540 - 8, 14, 8);
    }
    // bunting
    for (k = 0; k < 14; k++) {
      var bx = 20 + k * 140; c.strokeStyle = '#6a4a3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx, 380); c.quadraticCurveTo(bx + 70, 410, bx + 140, 380); c.stroke();
      for (var f = 0; f < 6; f++) { var fx = bx + 14 + f * 21, fy = 380 + Math.sin((f + .6) / 6 * 3.14) * 24; c.fillStyle = ['#ef5a5a', '#f0c040', '#4f8fd8', '#6ab86a'][(f + k) % 4]; c.beginPath(); c.moveTo(fx - 7, fy); c.lineTo(fx + 7, fy); c.lineTo(fx, fy + 15); c.fill(); }
    }
    // ground: grass + path
    c.fillStyle = '#7cc576'; c.fillRect(-100, 540, 2200, 70);
    c.fillStyle = '#ead7b0'; c.fillRect(-100, 600, 2200, 130);
    for (k = 0; k < 50; k++) { c.fillStyle = 'rgba(160,120,70,.25)'; c.fillRect((k * 61) % 2000, 610 + (k * 17) % 100, 22, 4); }
    for (k = 0; k < 40; k++) { c.fillStyle = ['#ffffff', '#f6c1d6', '#ffe28a'][k % 3]; c.beginPath(); c.arc((k * 97) % 2000, 552 + (k * 13) % 40, 3, 0, 6.3); c.fill(); }
    // trees
    var tx = [160, 480, 900, 1280, 1700];
    for (k = 0; k < tx.length; k++) tree(c, tx[k], 590, .95 + (k % 2) * .15, tm, k);
    // villagers walking
    for (k = 0; k < 12; k++) {
      var px = 60 + k * 150, dir = k % 2 ? 1 : -1, xx = px + dir * Math.sin(tm * .35 + k) * 60;
      kid(c, xx, 640 + (k % 3) * 10, 1.15 + (k % 3) * .05, k % 4, tm * 4 + k, SHIRT[k % 7], HAIR[k % 6], false, false, Math.cos(tm * .35 + k) * dir);
    }
    // children running and playing
    for (k = 0; k < 9; k++) {
      var cx2 = 220 + k * 190, spd = .9 + (k % 3) * .25, xx2 = cx2 + Math.sin(tm * spd + k * 1.7) * 130;
      kid(c, xx2, 665 + (k % 3) * 12, .78, (k + 1) % 4, tm * 8 + k, SHIRT[(k + 2) % 7], HAIR[(k + 3) % 6], true, false, Math.cos(tm * spd + k * 1.7));
    }
    // a bouncing ball
    var bxp = 800 + Math.sin(tm * 1.1) * 120; c.fillStyle = '#ef5a5a'; c.beginPath(); c.arc(bxp, 650 - Math.abs(Math.sin(tm * 5)) * 60, 9, 0, 6.3); c.fill();
    // the child who reaches for the light
    kid(c, 1500, 640, 1.0, 0, 0.5, '#ffd36a', '#e8c15a', false, true, 1);
    c.globalCompositeOperation = 'lighter'; glow(c, 1516, 570, 44 + 6 * Math.sin(tm * 5), '255,225,140', .9 * dim); c.globalCompositeOperation = 'source-over';
    c.restore();
    vignette(c, .18 + .5 * (1 - dim));
    if (dim < 1) { c.fillStyle = 'rgba(6,8,34,' + (1 - dim) * .78 + ')'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'lighter'; glow(c, 640, 96, 220, '255,220,150', .4 * (1 - dim)); c.globalCompositeOperation = 'source-over'; }
  }

  function sceneDark(c, u, t) { // u 0..9.5 sky, streak toward lantern
    var dim = lerp(.45, .12, ease(u / 9));
    sky(c, '#02040e', '#0a1026', '#1c2038');
    drawStars(c, t, .5);
    // clouds
    for (var k = 0; k < 8; k++) {
      var cx = ((k * 237 + t * (20 + k * 6)) % 1500) - 100, cy = 120 + k * 50;
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, 260);
      g.addColorStop(0, 'rgba(10,12,28,.55)'); g.addColorStop(1, 'rgba(10,12,28,0)'); c.fillStyle = g; c.fillRect(cx - 260, cy - 260, 520, 520);
    }
    var fl = dim * (.75 + .25 * Math.sin(t * 17) * Math.sin(t * 5.3));
    c.globalCompositeOperation = 'lighter'; glow(c, 640, 215, 420, '255,200,110', .45 * fl); c.globalCompositeOperation = 'source-over';
    hills(c, 610, 16, '#05070f', 2);
    tower(c, 640, 230, 650, '#06080f');
    lantern(c, 640 + Math.sin(t * 31) * (1.5 + (u > 6.35 ? 5 * clamp(1 - (u - 6.35) / 2, 0, 1) : 0)), 205, .95, clamp(fl * 1.4, 0, 1) * (u > 6.35 ? .55 + .45 * Math.abs(Math.sin(t * 23)) : 1), t);
    // black lance: a straight, violent line from the ground through the lantern and out the top
    var hp = Math.pow(seg(u, 5.9, 6.75), 2), tp = ease(seg(u, 6.55, 8.4));
    var Px = -120, Py = 490, Qx = 1400, Qy = -60;
    if (hp > 0 && tp < 1) {
      var hx = Px + (Qx - Px) * hp, hy = Py + (Qy - Py) * hp, tx2 = Px + (Qx - Px) * Math.min(tp, hp), ty2 = Py + (Qy - Py) * Math.min(tp, hp);
      c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      c.strokeStyle = 'rgba(120,60,190,.35)'; c.lineWidth = 34; c.beginPath(); c.moveTo(tx2, ty2); c.lineTo(hx, hy); c.stroke();
      c.strokeStyle = 'rgba(200,150,255,.5)'; c.lineWidth = 16; c.beginPath(); c.moveTo(tx2, ty2); c.lineTo(hx, hy); c.stroke();
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = '#000'; c.lineWidth = 9; c.beginPath(); c.moveTo(tx2, ty2); c.lineTo(hx, hy); c.stroke();
    }
    if (u > 6.35) { // impact: white-hot burst and falling flicker
      var ia = clamp(1 - (u - 6.35) / 1.1, 0, 1);
      c.globalCompositeOperation = 'lighter'; glow(c, 645, 215, 120 + (1 - ia) * 520, '255,245,220', ia * .95);
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = 'rgba(255,255,255,' + ia * .3 + ')'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,230,170,' + clamp(1 - (u - 6.35) / 2.5, 0, 1) + ')'; c.lineWidth = 2;
      for (k = 0; k < 8; k++) { var an = k * .785 + .3; c.beginPath(); c.moveTo(645, 215); c.lineTo(645 + Math.cos(an) * (40 + 220 * (1 - ia)), 215 + Math.sin(an) * (40 + 220 * (1 - ia))); c.stroke(); }
    }
    vignette(c, .75);
    if (u > 8.6) { var w = (u - 8.6) / .9; c.fillStyle = 'rgba(0,0,0,' + clamp(w, 0, 1) * .0 + ')'; c.fillRect(0, 0, W, H); }
  }

  function sceneFall(c, u, t) { // 14 s
    var darkK = ease(u / 6);
    sky(c, 'rgb(' + lerp(8, 2, darkK) + ',' + lerp(12, 3, darkK) + ',' + lerp(30, 8, darkK) + ')', '#0a0f22', '#171a2c');
    drawStars(c, t, .35 * (1 - darkK * .6));
    hills(c, 610, 16, '#04050b', 2);
    tower(c, 640, 230, 650, '#05060d');
    // lantern shards
    var su = u; var burst = ease(su / 1.2);
    if (su < 4.5) {
      c.save(); c.translate(640, 215);
      for (var k = 0; k < shards.length; k++) {
        var s = shards[k], x = s.vx * su, y = s.vy * su + 140 * su * su, a = clamp(1 - su / 4.3, 0, 1);
        c.save(); c.translate(x, y); c.rotate(s.r + s.vr * su); c.fillStyle = 'rgba(255,225,150,' + a + ')';
        c.beginPath(); c.moveTo(-s.z, -s.z * .4); c.lineTo(s.z * .8, 0); c.lineTo(-s.z * .3, s.z * .7); c.closePath(); c.fill(); c.restore();
      }
      c.restore();
      c.globalCompositeOperation = 'lighter';
      glow(c, 640, 215, 200 + burst * 900, '255,240,200', clamp(1 - su / 2.6, 0, 1) * .9);
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = 'rgba(255,240,210,' + clamp(1 - su / 2, 0, 1) + ')'; c.lineWidth = 6 * (1 - su / 2);
      if (su < 2) { c.beginPath(); c.arc(640, 215, su * 520, 0, 6.3); c.stroke(); }
    }
    // spark rain
    c.globalCompositeOperation = 'lighter';
    var step = LOW ? 3 : 1;
    for (k = 0; k < sparks.length; k += step) {
      var p = sparks[k], a2 = u - p.t0; if (a2 < 0) continue;
      var xx = p.x + p.vx * Math.min(a2, 1.4) + Math.sin(a2 * 1.3 + p.ph) * 14 + p.vx * .12 * Math.max(a2 - 1.4, 0);
      var yy = p.y + p.vy * Math.min(a2, 1.4) + .5 * p.g * a2 * a2 * 1.6;
      if (yy > 700) continue;
      var kind = p.k && u > 2.5 ? p.k : 0, al = clamp(1 - Math.max(0, a2 - 6) / 2, 0, 1);
      var col = COL[kind];
      glow(c, xx, yy, p.s * 7, kind ? hexRgb(col) : '255,230,160', .55 * al);
      c.fillStyle = col; c.globalAlpha = al; c.fillRect(xx - p.s / 2, yy - p.s / 2, p.s, p.s); c.globalAlpha = 1;
    }
    c.globalCompositeOperation = 'source-over';
    // mist floods in
    var mv = ease(seg(u, 4.5, 12));
    if (mv > 0) {
      mist(c, t, -100, 1380, 760 - mv * 140, .62 * mv, '55,50,80', 200);
      mist(c, t * 1.3, -100, 1380, 700 - mv * 80, .5 * mv, '30,26,48', 150);
    }
    // red eyes
    for (k = 0; k < eyes.length; k++) {
      var e = eyes[k], ea = clamp((u - 7 - e[3] * .25) / 1, 0, 1) * (Math.sin(t * 2 + e[3]) > -.85 ? 1 : 0);
      if (ea > 0) {
        c.globalCompositeOperation = 'lighter'; glow(c, e[0], e[1], e[2] * 3, '255,40,40', .5 * ea);
        c.fillStyle = 'rgba(255,60,50,' + ea + ')'; c.fillRect(e[0] - e[2], e[1], 3, 2); c.fillRect(e[0] + e[2] - 3, e[1], 3, 2); c.globalCompositeOperation = 'source-over';
      }
    }
    vignette(c, .7);
    // title
    var ta = ease(seg(u, 9.2, 11)) * (1 - ease(seg(u, 13.4, 14)));
    if (ta > 0) {
      c.save(); c.globalAlpha = ta; c.textAlign = 'center'; c.font = '600 92px Georgia,"Times New Roman",serif';
      c.shadowColor = 'rgba(255,200,110,.9)'; c.shadowBlur = 40; c.fillStyle = '#ffe9b8';
      var txt = 'L A N T E R N F A L L'; c.fillText(txt, 640, 330); c.shadowBlur = 0; c.restore();
    }
  }
  function hexRgb(h) { return parseInt(h.substr(1, 2), 16) + ',' + parseInt(h.substr(3, 2), 16) + ',' + parseInt(h.substr(5, 2), 16); }

  function sceneRuins(c, u, t) { // 7.5 s: 0-3.5 ruins, 3.5-7.5 Sylva ; u from 55
    if (u < 3.5) {
      sky(c, '#120b14', '#2a1618', '#4a2418');
      glow(c, 300, 560, 400, '255,110,40', .25);
      hills(c, 600, 14, '#07050a', 4);
      var k, xs = [80, 260, 420, 620, 820, 990];
      for (k = 0; k < xs.length; k++) { // broken houses
        c.fillStyle = '#0a070d'; c.beginPath(); c.moveTo(xs[k], 640); c.lineTo(xs[k], 560 - k % 3 * 14); c.lineTo(xs[k] + 24, 540 - k % 3 * 10); c.lineTo(xs[k] + 40, 575); c.lineTo(xs[k] + 70, 560); c.lineTo(xs[k] + 90, 640); c.closePath(); c.fill();
      }
      c.globalCompositeOperation = 'lighter';
      for (k = 0; k < 50; k++) {
        var ex = (k * 83.7) % W, ey = 640 - ((t * 40 + k * 31) % 360), a = .6 * (1 - (640 - ey) / 360);
        c.fillStyle = 'rgba(255,150,60,' + a + ')'; c.fillRect(ex + Math.sin(t + k) * 10, ey, 2, 2);
      }
      c.globalCompositeOperation = 'source-over';
      mist(c, t, -100, 1380, 700, .38, '60,50,70', 120);
      for (k = 0; k < 9; k++) person(c, ((u * 52 + k * 130) % 1500) - 100, 628 + (k % 2) * 6, .85, k % 4, t * 3 + k, '#050309', false);
      vignette(c, .65);
    } else {
      var uu = u - 3.5;
      sky(c, '#050a1c', '#0f1b3a', '#242c4e'); drawStars(c, t, .8);
      hills(c, 600, 22, '#060812', 3);
      for (k = 0; k < 7; k++) house(c, 470 + k * 52, 650 - k % 2 * 8, 36, 26 + k % 3 * 8, '#090c1a', k + 11, ease(uu / 1.5), 1);
      var lit = ease(seg(uu, 1, 2.4));
      lantern(c, 640, 470, .62, lit, t);
      c.globalCompositeOperation = 'lighter'; glow(c, 640, 480, 330, '255,200,110', .6 * lit); c.globalCompositeOperation = 'source-over';
      hills(c, 660, 14, '#03040a', 6);
      mist(c, t, -300, 340, 700, .55, '110,125,175', 110);
      mist(c, t, 940, 1580, 700, .55, '110,125,175', 110);
      vignette(c, .55);
    }
  }

  function sceneWoman(c, u, t) { // 62.5 -> 75 (u 0..12.5)
    var white = ease(seg(u, 7.6, 10.6));
    sky(c, '#040818', '#0e1a3a', '#1c2850'); drawStars(c, t, 1);
    // sylva lights far below
    for (var k = 0; k < 12; k++) { c.fillStyle = 'rgba(255,200,110,' + (.5 + .3 * Math.sin(t + k)) + ')'; c.fillRect(120 + k * 38, 668 + (k % 3) * 6, 3, 3); }
    mist(c, t, -100, 1380, 730, .3, '90,105,150', 90);
    // cliff
    c.fillStyle = '#04060e'; c.beginPath(); c.moveTo(380, 720); c.lineTo(420, 560); c.lineTo(560, 530); c.lineTo(760, 524); c.lineTo(900, 560); c.lineTo(940, 720); c.closePath(); c.fill();
    var fx = 640, fy = 524, sp = ease(seg(u, 1.2, 3));
    var spark = 1 + (.06 + 0 * 1) * Math.sin(t * 6);
    var hug = ease(seg(u, 3.5, 7)), hx = lerp(70, 2, hug), hy = lerp(-118, -86, hug);
    var gx = fx + hx * 1.5, gy = fy + hy * 1.5; // spark position: extended, then drawn to her chest
    c.save(); c.translate(fx, fy); c.scale(1.5, 1.5);
    var wing = function (dir) {
      c.beginPath();
      for (var q = 0; q < 8; q++) {
        var an = lerp(-1.15, .6, q / 7), L = 95 + 70 * Math.sin(.4 + q / 7 * 2.4), bx = dir * 10, by = -100;
        var tx = bx + dir * Math.cos(an) * -1 * L * (dir === 1 ? -1 : -1) * -1, ty = by + Math.sin(an) * L;
        tx = bx + dir * Math.abs(Math.cos(an)) * L; ty = by + Math.sin(an) * L;
        var nx = -(ty - by), ny = (tx - bx), nl = Math.sqrt(nx * nx + ny * ny) || 1, w = 20;
        c.moveTo(bx, by);
        c.quadraticCurveTo((bx + tx) / 2 + nx / nl * w, (by + ty) / 2 + ny / nl * w, tx, ty);
        c.quadraticCurveTo((bx + tx) / 2 - nx / nl * w, (by + ty) / 2 - ny / nl * w, bx, by);
      }
    };
    c.fillStyle = '#05070f'; c.strokeStyle = 'rgba(255,214,140,' + (.55 * sp) + ')'; c.lineWidth = 2;
    var flap = Math.sin(t * 1.4) * 0.03;
    c.save(); c.rotate(-flap + hug * .14); wing(-1); c.fill(); c.stroke(); c.restore();
    c.save(); c.rotate(flap - hug * .14); wing(1); c.fill(); c.stroke(); c.restore();
    // body: dress
    c.beginPath(); c.moveTo(-9, -112); c.lineTo(9, -112); c.lineTo(32, -4); c.quadraticCurveTo(0, 6, -32, -4); c.closePath(); c.fill(); c.stroke();
    // hair
    c.beginPath(); c.arc(0, -128, 15, 0, 6.3); c.fill();
    c.beginPath(); c.moveTo(-14, -128); c.quadraticCurveTo(-26, -90, -16, -60); c.lineTo(-8, -110); c.closePath(); c.fill();
    // arms: one reaches out, then both wrap the light against her chest
    var cxA = lerp(40, 20, hug), cyA = lerp(-100, -78, hug);
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = '#05070f';
    c.beginPath(); c.moveTo(6, -108); c.quadraticCurveTo(cxA, cyA, hx, hy); c.stroke();
    if (hug > 0) { c.beginPath(); c.moveTo(-6, -108); c.quadraticCurveTo(-lerp(8, 24, hug), lerp(-100, -76, hug), hx - 3, hy + 3); c.stroke(); }
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,214,140,' + (.7 * sp) + ')'; c.beginPath(); c.moveTo(6, -111); c.quadraticCurveTo(cxA, cyA - 3, hx, hy - 3); c.stroke();
    c.restore();
    c.globalCompositeOperation = 'lighter';
    var R1 = (60 + sp * 70 - hug * 20) * spark + white * 1400;
    glow(c, gx, gy, R1, '255,236,190', .9 * sp);
    glow(c, gx, gy, 22 * spark, '255,255,240', sp);
    c.globalCompositeOperation = 'source-over';
    vignette(c, .6 * (1 - white));
    if (white > 0) { c.fillStyle = 'rgba(250,252,255,' + white + ')'; c.fillRect(0, 0, W, H); }
    var ta = ease(seg(u, 10.4, 11.4)) * (1 - ease(seg(u, 12.3, 12.5)));
    if (ta > 0) { c.save(); c.globalAlpha = ta; c.textAlign = 'center'; c.font = '500 56px "Sarabun","Noto Sans Thai",sans-serif'; c.fillStyle = '#33456b'; c.fillText('300 ปีต่อมา…', 640, 372); c.restore(); }
  }

  function draw(c, t) {
    var f = 0, flash = 0;
    if (t < 13) sceneBig(c, t);
    else if (t < 28) townScene(c, t - 13, 1, t);
    else if (t < 31.5) { var d = 1 - .65 * ease((t - 29.5) / 2); townScene(c, 15 + (t - 28), d, t); }
    else if (t < 41) sceneDark(c, t - 31.5, t);
    else if (t < 55) sceneFall(c, t - 41, t);
    else if (t < 62.5) sceneRuins(c, t - 55, t);
    else sceneWoman(c, t - 62.5, t);
    // black dips at hard cuts
    var cuts = [0, 13, 31.5, 55, 58.5, 62.5], k;
    for (k = 0; k < cuts.length; k++) { var dd = Math.abs(t - cuts[k]); var hw = k === 0 ? 0 : .35; if (k === 0 && t < .9) f = Math.max(f, 1 - t / .9); else if (dd < hw) f = Math.max(f, 1 - dd / hw); }
    if (t >= 40.7 && t < 41.05) flash = (t - 40.7) / .35;
    else if (t >= 41.05 && t < 42.4) flash = 1 - (t - 41.05) / 1.35;
    if (f > 0) { c.fillStyle = 'rgba(0,0,0,' + f + ')'; c.fillRect(0, 0, W, H); }
    if (flash > 0) { c.fillStyle = 'rgba(255,248,230,' + clamp(flash, 0, 1) + ')'; c.fillRect(0, 0, W, H); }
  }

  var IMG = {"c1s": "assets/b8863f21882ebd0c.webp", "c1e": "assets/7797510d59cd2990.webp", "c2s": "assets/5b1acc90555c6bb6.webp", "c2e": "assets/7fab604cde0f26b6.webp", "c3s": "assets/0bc550c4ea53e220.webp", "c3e": "assets/7b409d211bbc9ae5.webp", "c4s": "assets/fcce5c0889082b29.webp", "c4e": "assets/60c274e8a2b8c900.webp", "c5s": "assets/7994ee942ec201ca.webp", "c5e": "assets/bb1f163fd62d9c36.webp", "c6s": "assets/d51863489618d8f0.webp", "c6h": "assets/8b7e6b64d3483de0.webp"};
  // ---------- image mode (ChatGPT paintings as backgrounds, code adds motion) ----------
  var IM = null;
  function dimg(c, k, a, zoom, fx, fy, px, py) {
    var im = IM[k]; if (!im || a <= 0.002) return;
    c.save(); c.globalAlpha = clamp(a, 0, 1);
    c.translate(fx * W + (px || 0), fy * H + (py || 0)); c.scale(zoom, zoom); c.translate(-fx * W, -fy * H);
    c.drawImage(im, 0, 0, W, H); c.restore();
  }
  function sparkRain(c, u, a) {
    c.globalCompositeOperation = 'lighter';
    var step = LOW ? 3 : 2;
    for (var k = 0; k < sparks.length; k += step) {
      var p = sparks[k], a2 = u - p.t0; if (a2 < 0) continue;
      var xx = p.x + p.vx * Math.min(a2, 1.4) + Math.sin(a2 * 1.3 + p.ph) * 14 + p.vx * .12 * Math.max(a2 - 1.4, 0);
      var yy = p.y + p.vy * Math.min(a2, 1.4) + .5 * p.g * a2 * a2 * 1.6; if (yy > 700) continue;
      var kind = p.k && u > 2.5 ? p.k : 0, al = a * clamp(1 - Math.max(0, a2 - 6) / 2, 0, 1);
      glow(c, xx, yy, p.s * 6, kind ? hexRgb(COL[kind]) : '255,230,160', .45 * al);
    }
    c.globalCompositeOperation = 'source-over';
  }
  function lanceLine(c, t) { // long diagonal black lance through the lantern, lower left to upper right
    var hp = Math.pow(seg(t, 37.3, 38.1), 2), tp = ease(seg(t, 37.7, 38.6));
    if (hp <= 0 || tp >= 1) return;
    var Px = -100, Py = 406, Qx = 1400, Qy = -88;
    var hx = Px + (Qx - Px) * hp, hy = Py + (Qy - Py) * hp, tx = Px + (Qx - Px) * Math.min(tp, hp), ty = Py + (Qy - Py) * Math.min(tp, hp);
    c.lineCap = 'round'; c.globalCompositeOperation = 'lighter';
    c.strokeStyle = 'rgba(150,80,220,.4)'; c.lineWidth = 30; c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy); c.stroke();
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = '#000'; c.lineWidth = 10; c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx, hy); c.stroke();
  }
  function draw2(c, t) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    var u, sh = 0;
    if (t < 13) {
      var gp = ease(seg(t, .3, 3.2));
      dimg(c, 'c1s', 1, lerp(1, 1.12, t / 13), .5, .46);
      c.globalCompositeOperation = 'lighter'; glow(c, W * .5, H * .46, 20 + gp * 120, '255,225,150', .35 + .6 * gp); c.globalCompositeOperation = 'source-over';
      dimg(c, 'c1e', ease(seg(t, 2.6, 6.5)), lerp(1.75, 1.0, ease(seg(t, 2.6, 12.5))), .5, .22);
    } else if (t < 28) {
      var a = ease(seg(t, 19.5, 23.5));
      dimg(c, 'c2s', 1, lerp(1, 1.16, seg(t, 13, 24)), .5, .55, lerp(60, -60, seg(t, 13, 24)), 0);
      dimg(c, 'c2e', a, lerp(1.1, 1.0, seg(t, 19.5, 28)), .4, .5);
    } else if (t < 38) {
      var b = ease(seg(t, 28.2, 31));
      dimg(c, 'c2e', 1, 1.0, .4, .5);
      dimg(c, 'c3s', b, lerp(1.0, 1.14, seg(t, 31, 37.5)), .52, .22);
      var fl = .55 + .45 * Math.abs(Math.sin(t * 9)) * Math.abs(Math.sin(t * 3.7));
      if (t > 31) { c.globalCompositeOperation = 'lighter'; glow(c, W * .52, H * .22, 150, '255,200,110', .25 * fl); c.globalCompositeOperation = 'source-over'; }
      c.fillStyle = 'rgba(0,0,10,' + .22 * b * (1 - fl) + ')'; c.fillRect(0, 0, W, H);
      lanceLine(c, t);
    } else if (t < 41) {
      u = t - 38; sh = 10 * Math.max(0, 1 - u / 1.4);
      c.save(); c.translate(Math.sin(t * 60) * sh, Math.cos(t * 53) * sh);
      dimg(c, 'c3e', 1, lerp(1.1, 1.0, ease(u / 3)), .5, .22); c.restore();
      var wa = clamp(1 - u / 1.2, 0, 1) * .9; c.fillStyle = 'rgba(255,248,230,' + wa + ')'; c.fillRect(0, 0, W, H);
    } else if (t < 55) {
      u = t - 41; sh = 16 * Math.max(0, 1 - u / 2.2);
      c.save(); c.translate(Math.sin(t * 70) * sh, Math.cos(t * 61) * sh);
      dimg(c, 'c4s', 1 - ease(seg(u, 5, 7.5)), lerp(1.12, 1.0, ease(seg(u, 0, 6))), .5, .3);
      dimg(c, 'c4e', ease(seg(u, 5, 7.5)), lerp(1.12, 1.0, ease(seg(u, 5, 14))), .5, .3);
      c.restore();
      sparkRain(c, u, 1);
      var ta = ease(seg(u, 9.2, 11)) * (1 - ease(seg(u, 13.4, 14)));
      if (ta > 0) { c.save(); c.globalAlpha = ta; c.textAlign = 'center'; c.font = '600 92px Georgia,"Times New Roman",serif'; c.shadowColor = 'rgba(255,200,110,.9)'; c.shadowBlur = 40; c.fillStyle = '#ffe9b8'; c.fillText('L A N T E R N F A L L', 640, 360); c.restore(); }
    } else if (t < 62.5) {
      u = t - 55;
      dimg(c, 'c5s', 1, lerp(1.0, 1.1, seg(u, 0, 4)), .3, .6, lerp(0, -40, seg(u, 0, 4)), 0);
      dimg(c, 'c5e', ease(seg(u, 3.3, 5.5)), lerp(1.1, 1.0, seg(u, 3.3, 7.5)), .6, .55);
    } else {
      u = t - 62.5;
      var hg = ease(seg(u, 3.3, 6.3)), white = ease(seg(u, 7.6, 10.6));
      dimg(c, 'c6s', 1, lerp(1.0, 1.08, seg(u, 0, 4)), .5, .5);
      c.globalCompositeOperation = 'lighter'; glow(c, W * .564, H * .296, 70 + 10 * Math.sin(t * 6), '255,225,150', .5 * (1 - hg)); c.globalCompositeOperation = 'source-over';
      dimg(c, 'c6h', hg, lerp(1.08, 1.12, seg(u, 3.3, 9)), .5, .45);
      c.globalCompositeOperation = 'lighter'; glow(c, W * .502, H * .347, (90 + 14 * Math.sin(t * 5)) + white * 1400, '255,236,190', .55 * hg + white * .6); c.globalCompositeOperation = 'source-over';
      if (white > 0) { c.fillStyle = 'rgba(250,252,255,' + white + ')'; c.fillRect(0, 0, W, H); }
      var tb = ease(seg(u, 10.4, 11.4)) * (1 - ease(seg(u, 12.3, 12.5)));
      if (tb > 0) { c.save(); c.globalAlpha = tb; c.textAlign = 'center'; c.font = '500 56px "Sarabun","Noto Sans Thai",sans-serif'; c.fillStyle = '#33456b'; c.fillText('300 ปีต่อมา…', 640, 372); c.restore(); }
    }
    // dips and the hit flash
    var f = 0, cuts = [0, 55, 62.5], k;
    for (k = 0; k < cuts.length; k++) { var dd = Math.abs(t - cuts[k]); if (k === 0 && t < .9) f = Math.max(f, 1 - t / .9); else if (k && dd < .35) f = Math.max(f, 1 - dd / .35); }
    if (f > 0) { c.fillStyle = 'rgba(0,0,0,' + f + ')'; c.fillRect(0, 0, W, H); }
    if (t >= 40.7 && t < 41.05) { c.fillStyle = 'rgba(255,248,230,' + clamp((t - 40.7) / .35, 0, 1) + ')'; c.fillRect(0, 0, W, H); }
    else if (t >= 41.05 && t < 42.4) { c.fillStyle = 'rgba(255,248,230,' + clamp(1 - (t - 41.05) / 1.35, 0, 1) + ')'; c.fillRect(0, 0, W, H); }
    vignette(c, .2);
  }
  function loadImgs(cb) {
    var keys = Object.keys(IMG), n = 0, out = {}, bad = false;
    keys.forEach(function (k) { var im = new Image(); im.onload = function () { out[k] = im; if (++n === keys.length && !bad) cb(out); }; im.onerror = function () { if (!bad) { bad = true; cb(null); } }; im.src = IMG[k]; });
  }

  // ---------- audio ----------
  function makeAudio() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    var a = new AC(), m = a.createGain(); m.gain.value = 0; m.connect(a.destination);
    m.gain.linearRampToValueAtTime(.5, a.currentTime + 2);
    function pad(f, type, g) { var o = a.createOscillator(), v = a.createGain(); o.type = type; o.frequency.value = f; v.gain.value = g; o.connect(v); v.connect(m); o.start(); return [o, v]; }
    var p1 = pad(110, 'sine', .22), p2 = pad(164.8, 'triangle', .08), p3 = pad(55, 'sine', .25);
    function ping(f, g, dur) { var o = a.createOscillator(), v = a.createGain(); o.type = 'sine'; o.frequency.value = f; v.gain.setValueAtTime(0, a.currentTime); v.gain.linearRampToValueAtTime(g, a.currentTime + .02); v.gain.exponentialRampToValueAtTime(.0005, a.currentTime + dur); o.connect(v); v.connect(m); o.start(); o.stop(a.currentTime + dur + .1); }
    function boom() {
      var b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      var s = a.createBufferSource(); s.buffer = b; var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; var v = a.createGain(); v.gain.value = .9; s.connect(lp); lp.connect(v); v.connect(m); s.start();
      var o = a.createOscillator(), og = a.createGain(); o.frequency.setValueAtTime(90, a.currentTime); o.frequency.exponentialRampToValueAtTime(30, a.currentTime + 1.6); og.gain.setValueAtTime(.7, a.currentTime); og.gain.exponentialRampToValueAtTime(.001, a.currentTime + 1.8); o.connect(og); og.connect(m); o.start(); o.stop(a.currentTime + 2);
    }
    return { a: a, m: m, p: [p1, p2, p3], ping: ping, boom: boom };
  }

  // ---------- main ----------
  window.playOpeningVideo = function (onDone, opts) {
    opts = opts || {};
    var finished = false;
    function fin() { if (finished) return; finished = true; try { onDone && onDone(); } catch (e) { console.error(e); } }
    if (running || (typeof document === 'undefined')) { fin(); return; }
    running = true;
    LOW = !!opts.low || (window.innerWidth < 760 && window.devicePixelRatio > 1.5) || !!(window.lowGfx);
    var root = document.createElement('div');
    root.id = 'openingVideo';
    root.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:manipulation;user-select:none';
    var cv = document.createElement('canvas');
    var pw = LOW ? 854 : 1280, ph = LOW ? 480 : 720;
    cv.width = pw; cv.height = ph;
    cv.style.cssText = 'width:min(100vw,calc(100vh*16/9));height:min(100vh,calc(100vw*9/16));background:#000';
    var ctx = cv.getContext('2d');
    var sub = document.createElement('div');
    sub.style.cssText = 'position:absolute;left:0;right:0;bottom:7%;text-align:center;color:#fff;font:600 clamp(15px,3.4vmin,34px)/1.45 Sarabun,"Noto Sans Thai",Tahoma,sans-serif;text-shadow:0 2px 6px #000,0 0 14px #000;padding:0 6%;opacity:0;transition:opacity .45s;pointer-events:none';
    var skip = document.createElement('button');
    skip.textContent = 'ข้าม ▸';
    skip.setAttribute('aria-label', 'ข้ามวิดีโอเปิดเกม');
    skip.style.cssText = 'position:absolute;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));min-width:76px;min-height:44px;padding:0 16px;border:1px solid rgba(255,255,255,.45);border-radius:22px;background:rgba(0,0,0,.45);color:#fff;font:600 16px Sarabun,"Noto Sans Thai",Tahoma,sans-serif;cursor:pointer';
    var mute = document.createElement('button');
    mute.textContent = opts.mute ? '🔇' : '🔊';
    mute.setAttribute('aria-label', 'เปิดปิดเสียง');
    mute.style.cssText = 'position:absolute;top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));min-width:44px;min-height:44px;border:1px solid rgba(255,255,255,.45);border-radius:22px;background:rgba(0,0,0,.45);color:#fff;font-size:18px;cursor:pointer';
    root.appendChild(cv); root.appendChild(sub); root.appendChild(skip); root.appendChild(mute);
    document.body.appendChild(root);

    var audio = null, muted = !!opts.mute, fired = {};
    if (!opts.mute) { try { audio = makeAudio(); } catch (e) { audio = null; } }
    mute.onclick = function () { muted = !muted; mute.textContent = muted ? '🔇' : '🔊'; if (audio) audio.m.gain.value = muted ? 0 : .5; if (!audio && !muted) { try { audio = makeAudio(); } catch (e) { } } };

    var t = clamp(+opts.startAt || 0, 0, DUR), last = 0, raf = 0, curSub = -1;
    function end(skipped) {
      if (!running) return; running = false;
      cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey, true);
      if (audio) { try { audio.m.gain.cancelScheduledValues(audio.a.currentTime); audio.m.gain.setValueAtTime(audio.m.gain.value, audio.a.currentTime); audio.m.gain.linearRampToValueAtTime(0, audio.a.currentTime + .4); setTimeout(function () { try { audio.a.close(); } catch (e) { } }, 600); } catch (e) { } }
      if (root.parentNode) root.parentNode.removeChild(root);
      fin();
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); end(true); } }
    window.addEventListener('keydown', onKey, true);
    skip.onclick = function (e) { e.stopPropagation(); end(true); };

    function audioCues() {
      if (!audio) return; var a = audio;
      var notes = [392, 440, 523, 587, 659];
      if (t < 13 && Math.floor(t / 1.4) !== fired.n1) { fired.n1 = Math.floor(t / 1.4); if (t > 1) a.ping(notes[fired.n1 % 5] * .5, .12, 2.5); }
      if (t >= 13 && t < 28 && Math.floor(t / 2) !== fired.n2) { fired.n2 = Math.floor(t / 2); a.ping(notes[(fired.n2 * 2) % 5], .08, 1.8); }
      if (t >= 29 && !fired.dim) { fired.dim = 1; a.p[0][0].frequency.linearRampToValueAtTime(103.8, a.a.currentTime + 6); a.p[1][0].frequency.linearRampToValueAtTime(155.6, a.a.currentTime + 6); }
      if (t >= 41 && !fired.boom) { fired.boom = 1; a.boom(); }
      if (t >= 42 && t < 50 && Math.floor(t * 3) !== fired.sp) { fired.sp = Math.floor(t * 3); a.ping(1200 + Math.random() * 1800, .05, 1.2); }
      if (t >= 62.5 && !fired.up) { fired.up = 1; a.p[0][0].frequency.linearRampToValueAtTime(130.8, a.a.currentTime + 8); a.p[1][0].frequency.linearRampToValueAtTime(196, a.a.currentTime + 8); }
      if (t >= 63 && Math.floor(t / 1.6) !== fired.n3) { fired.n3 = Math.floor(t / 1.6); a.ping(notes[fired.n3 % 5], .07, 2.4); }
    }
    function frame(ms) {
      if (!running) return;
      if (!ready) { last = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, pw, ph); raf = requestAnimationFrame(frame); return; }
      var dt = last ? Math.min((ms - last) / 1000, .1) : 0; last = ms;
      if (!opts.freeze) t += dt;
      if (t >= DUR) { end(false); return; }
      ctx.setTransform(pw / W, 0, 0, ph / H, 0, 0);
      (IM ? draw2 : draw)(ctx, t);
      var idx = -1; for (var k = 0; k < SUBS.length; k++) if (t >= SUBS[k][0] && t < SUBS[k][1]) idx = k;
      if (idx !== curSub) { curSub = idx; if (idx >= 0) { sub.textContent = SUBS[idx][2]; sub.style.opacity = 1; } else sub.style.opacity = 0; }
      audioCues();
      raf = requestAnimationFrame(frame);
    }
    var ready = false;
    if (opts.codeOnly) { ready = true; } else {
      loadImgs(function (o) { if (!ready) { IM = o; ready = true; } });
      setTimeout(function () { if (!ready) { IM = null; ready = true; } }, 3000);
    }
    raf = requestAnimationFrame(frame);
  };
  window.OpeningVideo = { version: 'r5', duration: DUR };
})();

