/* Living paper background: drifting typed glyphs, pastel side washes and paper grain.
   Ported from the "Home with typed grain" design (texture: type). */
(function () {
  var canvas = document.getElementById('paper-bg');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var PAL = [[92, 116, 96], [158, 98, 72], [76, 92, 124], [146, 124, 70]];
  var PASTEL = [[247, 196, 178], [204, 194, 238], [184, 226, 206], [242, 222, 166], [182, 212, 238]];
  var GLYPHS = ['.', ',', ':', ';', '+', '=', '*'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t0 = performance.now();
  var w = 0, h = 0, grain, grainPat, raf;

  function makeGrain() {
    var g = document.createElement('canvas'); g.width = 180; g.height = 180;
    var x = g.getContext('2d'), img = x.createImageData(180, 180);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random();
      img.data[i] = 43; img.data[i + 1] = 40; img.data[i + 2] = 36;
      img.data[i + 3] = v > 0.55 ? Math.floor((v - 0.55) / 0.45 * 11) : 0;
    }
    x.putImageData(img, 0, 0);
    return g;
  }

  function hash(i, j, k) {
    var h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 1440662683);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function noise(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    var a = hash(xi, yi, zi), b = hash(xi + 1, yi, zi), c = hash(xi, yi + 1, zi), d = hash(xi + 1, yi + 1, zi);
    var e = hash(xi, yi, zi + 1), f = hash(xi + 1, yi, zi + 1), g = hash(xi, yi + 1, zi + 1), hh = hash(xi + 1, yi + 1, zi + 1);
    var p = (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
    var q = (e + (f - e) * u) + ((g + (hh - g) * u) - (e + (f - e) * u)) * v;
    return p + (q - p) * w;
  }

  function tint(x, y, t, mix) {
    var n = noise(x * 0.0011 + 31, y * 0.0011 + 7, t * 0.022) * 6;
    var i = Math.floor(n) % 4, f = n - Math.floor(n), A = PAL[i], B = PAL[(i + 1) % 4];
    var r = 43 + ((A[0] + (B[0] - A[0]) * f) - 43) * mix;
    var g = 40 + ((A[1] + (B[1] - A[1]) * f) - 40) * mix;
    var b = 36 + ((A[2] + (B[2] - A[2]) * f) - 36) * mix;
    return 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',';
  }

  /* quieter behind the text column */
  function calm(x) {
    var d = Math.abs(x - w / 2);
    var s = Math.min(1, Math.max(0, (d - 280) / 240));
    return 0.3 + 0.7 * s * s * (3 - 2 * s);
  }

  function drawPastel(t) {
    var cx = w / 2, side = Math.max(0, cx - 300);
    if (side < 40) return;
    for (var b = 0; b < 6; b++) {
      var left = b % 2 === 0, lane = Math.floor(b / 2);
      var across = side * (0.35 + 0.25 * Math.sin(t * 0.021 * (1 + b * 0.13) + b * 2.1));
      var px = left ? across : w - across;
      var py = h * ((lane + 0.5) / 3 + 0.16 * Math.sin(t * 0.017 * (1 + lane * 0.3) + b * 1.7));
      var r = Math.min(side * 1.1, 420) * (0.85 + 0.15 * Math.sin(t * 0.04 + b * 1.3));
      var ph = (t * 0.012 + b * 1.37) % 5, i = Math.floor(ph), f = ph - i;
      var A = PASTEL[i], B = PASTEL[(i + 1) % 5];
      var col = 'rgba(' + ((A[0] + (B[0] - A[0]) * f) | 0) + ',' + ((A[1] + (B[1] - A[1]) * f) | 0) + ',' + ((A[2] + (B[2] - A[2]) * f) | 0) + ',';
      var g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, col + '0.300)');
      g.addColorStop(0.5, col + '0.120)');
      g.addColorStop(1, col + '0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    /* keep the text column clean: erase the pastel toward the centre */
    var st = function (v) { return Math.min(1, Math.max(0, v / w)); };
    var a = st(cx - 470), b2 = Math.max(a, st(cx - 300)), c = Math.max(b2, st(cx + 300)), d = Math.max(c, st(cx + 470));
    var m = ctx.createLinearGradient(0, 0, w, 0);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(a, 'rgba(0,0,0,0)');
    m.addColorStop(b2, 'rgba(0,0,0,1)'); m.addColorStop(c, 'rgba(0,0,0,1)');
    m.addColorStop(d, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = m; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawType(t) {
    var CW = 18, CH = 24;
    ctx.globalCompositeOperation = 'multiply';
    ctx.font = '11px "Courier Prime", "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var gy = 0, j = 0; gy < h; gy += CH, j++) {
      for (var gx = 0, i = 0; gx < w; gx += CW, i++) {
        var x = gx + CW / 2, y = gy + CH / 2;
        var v = noise((x + t * 5) * 0.0048, (y - t * 3) * 0.0048, t * 0.012) + (hash(i, j, 5) - 0.5) * 0.14;
        if (v < 0.5) continue;
        var idx = Math.min(GLYPHS.length - 1, Math.floor((v - 0.5) * 2 * GLYPHS.length));
        var alpha = (0.075 + 0.07 * (v - 0.5)) * calm(x);
        ctx.fillStyle = tint(x, y, t, 0.3) + alpha.toFixed(3) + ')';
        ctx.fillText(GLYPHS[idx], x + (hash(i, j, 9) - 0.5) * 1.2, y + (hash(i, j, 13) - 0.5) * 1.2);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    drawPastel(t * 3);
    drawType(t);
    if (!grainPat) grainPat = ctx.createPattern(grain, 'repeat');
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = grainPat; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    grainPat = null;
    if (reduce) draw(0);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    draw((now - t0) / 1000);
  }

  grain = makeGrain();
  resize();
  window.addEventListener('resize', resize);
  if (!reduce) raf = requestAnimationFrame(frame);
})();
