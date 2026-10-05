/* Living paper background: pastel side washes framing the content column, plus a
   subtle paper grain. Drawn once per page load (random arrangement); redrawn only on resize. */
(function () {
  var canvas = document.getElementById('paper-bg');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  /* ---- adjustable ---- */
  var STRENGTH  = 0.3;   /* pastel opacity at blob centre */
  var CORE      = 0.3;   /* 0-1: how solid a blob stays before fading */
  var BLOBS     = 8;     /* total blobs, split left/right */
  var BLOB_SIZE = 1;     /* multiplier on blob radius */
  var COLUMN    = 380;   /* half-width of the content column */
  var GAP       = 50;    /* clear space kept between content and colour */
  var EDGE      = 200;   /* width of the soft border where colour fades out */
  var GRAIN     = 0.4;   /* grain strength */
  var TILE      = 256;   /* grain tile size */
  var PALETTE = [[247, 196, 178], [204, 194, 238], [184, 226, 206], [242, 222, 166], [182, 212, 238]];
  /* -------------------- */

  var w = 0, h = 0, grainPat;

  /* random choices made once per load so a resize keeps the same arrangement */
  var blobs = [];
  for (var i = 0; i < BLOBS; i++) {
    blobs.push({
      across: 0.15 + Math.random() * 0.7,
      jitter: (Math.random() - 0.5) * 0.24,
      size: 0.75 + Math.random() * 0.4,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    });
  }

  function makeGrain() {
    var g = document.createElement('canvas'); g.width = g.height = TILE;
    var x = g.getContext('2d'), img = x.createImageData(TILE, TILE);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random(), dark = v < 0.5;
      img.data[i] = dark ? 43 : 255;
      img.data[i + 1] = dark ? 40 : 253;
      img.data[i + 2] = dark ? 36 : 248;
      img.data[i + 3] = Math.abs(v - 0.5) * 2 * 22 * GRAIN;
    }
    x.putImageData(img, 0, 0);
    return g;
  }
  var grain = makeGrain();

  function drawPastel() {
    var cx = w / 2, side = Math.max(0, cx - COLUMN - GAP);
    if (side <= 30) return;
    for (var i = 0; i < blobs.length; i++) {
      var o = blobs[i], left = i % 2 === 0, lane = Math.floor(i / 2), lanes = BLOBS / 2;
      var across = o.across * side;
      var px = left ? across : w - across;
      var py = h * ((lane + 0.5) / lanes + o.jitter);
      var r = Math.min(side * 0.9, 380) * BLOB_SIZE * o.size;
      var c = o.color;
      var col = function (a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
      var g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, col(STRENGTH));
      g.addColorStop(CORE, col(STRENGTH * 0.7));
      g.addColorStop(1, col(0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    /* border: erase colour toward the centre, fully clear inside COLUMN + GAP */
    var clearEdge = COLUMN + GAP;
    var st = function (v) { return Math.min(1, Math.max(0, v / w)); };
    var a = st(cx - clearEdge - EDGE), b = Math.max(a, st(cx - clearEdge));
    var d = st(cx + clearEdge + EDGE), e = Math.max(b, st(cx + clearEdge));
    var m = ctx.createLinearGradient(0, 0, w, 0);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(a, 'rgba(0,0,0,0)');
    m.addColorStop(b, 'rgba(0,0,0,1)'); m.addColorStop(e, 'rgba(0,0,0,1)');
    m.addColorStop(d, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = m; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    drawPastel();
    if (!grainPat) grainPat = ctx.createPattern(grain, 'repeat');
    ctx.fillStyle = grainPat; ctx.fillRect(0, 0, w, h);
  }

  var timer;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    grainPat = null;
    draw();
  }

  resize();
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(resize, 150);
  });
})();
