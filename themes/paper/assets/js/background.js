/* Living paper background: pastel side washes and a subtle paper grain.
   Adapted from the "Home with typed grain" design. */
(function () {
  var canvas = document.getElementById('paper-bg');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var PASTEL = [[247, 196, 178], [204, 194, 238], [184, 226, 206], [242, 222, 166], [182, 212, 238]];
  var w = 0, h = 0, grain, grainPat;

  /* subtle paper grain: dark and light specks, tiled */
  var STRENGTH = 0.4, TILE = 256;
  function makeGrain() {
    var g = document.createElement('canvas'); g.width = g.height = TILE;
    var x = g.getContext('2d'), img = x.createImageData(TILE, TILE);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random(), dark = v < 0.5;
      img.data[i] = dark ? 43 : 255;
      img.data[i + 1] = dark ? 40 : 253;
      img.data[i + 2] = dark ? 36 : 248;
      img.data[i + 3] = Math.abs(v - 0.5) * 2 * 22 * STRENGTH;
    }
    x.putImageData(img, 0, 0);
    return g;
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

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    drawPastel(t * 3);
    if (!grainPat) grainPat = ctx.createPattern(grain, 'repeat');
    ctx.fillStyle = grainPat; ctx.fillRect(0, 0, w, h);
  }

  /* one random arrangement of the washes, drawn once per page load; no animation loop */
  var T = Math.random() * 2000;
  var timer;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    grainPat = null;
    draw(T);
  }

  grain = makeGrain();
  resize();
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(resize, 150);
  });
})();
