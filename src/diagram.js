/* The diagram area: draws the figure as SVG and takes direct input.
   Tools: move (drag points), segment / ray / line (tap a first point, then a second), pick (tap a figure).
   Every action also works from the keyboard: Tab to a point or figure; arrow keys move a point;
   Enter or Space selects it. */
const Diagram = (() => {
  'use strict';
  const U = 20, WPX = Geom.W * U, HPX = Geom.H * U;
  const X = x => x * U, Y = y => HPX - y * U;
  let svg, NS, layerPlanes, layerObjs, layerPts, fig, opts = {}, cb = {}, handles = {}, first = null, drag = null;
  let tool = 'move';
  // Congruent marks (measured ticks and arcs) can be turned off by the student; given marks always show.
  let congMarks = true;
  function setCongMarks(on) { congMarks = on; if (fig) redraw(); }

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function mount(svgEl, callbacks) {
    svg = svgEl; NS = svg.namespaceURI; cb = callbacks || {};
    svg.setAttribute('viewBox', `0 0 ${WPX} ${HPX}`);
    const dots = el('g', { 'aria-hidden': 'true', class: 'grid' }, svg);
    for (let x = 1; x < Geom.W; x++) for (let y = 1; y < Geom.H; y++) el('circle', { cx: X(x), cy: Y(y), r: 1.2 }, dots);
    layerPlanes = el('g', { class: 'planes' }, svg);
    layerObjs = el('g', { class: 'objs' }, svg);
    layerPts = el('g', { class: 'pts' }, svg);
    if (window.ResizeObserver) {
      let seen = 0;
      new ResizeObserver(() => { const w = Math.round(svg.getBoundingClientRect().width); if (w && w !== seen && fig) { seen = w; redraw(); } }).observe(svg);
    }
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
  }

  // options: { movable: 'all' | 'none' | [names], magnets, highlight: index, hlPlane, hlAngle: [a, v, b],
  //            hideMeasures, drawn: [objects] }
  function load(figure, options) {
    fig = figure; opts = options || {}; first = null; drag = null; letterSpot = {};
    layerPts.textContent = '';
    handles = {};
    for (const name of Object.keys(fig.points)) handles[name] = makeHandle(name);
    redraw();
  }
  const movable = name => opts.movable === 'all' || (Array.isArray(opts.movable) && opts.movable.includes(name));

  function setTool(t) {
    tool = t; first = null;
    svg.setAttribute('data-tool', t);
    redraw();
  }

  // ---------- Drawing ----------
  // Where a ray or line leaves the diagram, starting at P and heading along d.
  function edge(P, d) {
    let t = Infinity;
    const lo = { x: 0.3, y: 0.3 }, hi = { x: Geom.W - 0.3, y: Geom.H - 0.3 };
    if (d.x > 1e-12) t = Math.min(t, (hi.x - P.x) / d.x); else if (d.x < -1e-12) t = Math.min(t, (lo.x - P.x) / d.x);
    if (d.y > 1e-12) t = Math.min(t, (hi.y - P.y) / d.y); else if (d.y < -1e-12) t = Math.min(t, (lo.y - P.y) / d.y);
    return { x: P.x + t * d.x, y: P.y + t * d.y };
  }
  function ends(o) {
    const A = Geom.pos(fig, o.a), B = Geom.pos(fig, o.b), d = { x: B.x - A.x, y: B.y - A.y };
    if (o.kind === 'segment') return [A, B];
    if (o.kind === 'ray') return [A, edge(A, d)];
    return [edge(A, { x: -d.x, y: -d.y }), edge(A, d)];
  }
  function drawObject(o, i, cls) {
    const [P, Q] = ends(o);
    const d = `M${X(P.x)},${Y(P.y)} L${X(Q.x)},${Y(Q.y)}`;
    const g = el('g', { class: 'obj ' + o.kind + (cls ? ' ' + cls : '') }, layerObjs);
    if (cls && cls.includes('hl')) el('path', { d, class: 'halo' }, g);
    // Arrowheads match their figure's stroke: plain, highlighted, or drawn by the student.
    const m = `url(#arrow${cls && cls.includes('hl') || cls === 'picked' ? '-hl' : cls === 'drawn' ? '-drawn' : ''})`;
    const marks = o.kind === 'line' ? { 'marker-start': m, 'marker-end': m } : o.kind === 'ray' ? { 'marker-end': m } : {};
    if (o.hiddenPast) {
      // A line passing through a plane: solid on the near side, dashed where it goes behind the
      // plane, so it doesn't look like it meets the lines drawn in the plane.
      const C = Geom.pos(fig, o.hiddenPast);
      el('path', Object.assign({ d: `M${X(P.x)},${Y(P.y)} L${X(C.x)},${Y(C.y)}`, class: 'stroke' }, o.kind === 'line' ? { 'marker-start': m } : {}), g);
      el('path', Object.assign({ d: `M${X(C.x)},${Y(C.y)} L${X(Q.x)},${Y(Q.y)}`, class: 'stroke behind' }, marks['marker-end'] ? { 'marker-end': m } : {}), g);
    } else {
      el('path', Object.assign({ d, class: 'stroke' }, marks), g);
    }
    if (o.label) {
      // A line's one-letter name, written near one end in lowercase italics, the textbook way.
      // It goes at whichever end has more room, so it never sits on a point's letter.
      const spot = (E, F) => { const l = Math.hypot(F.x - E.x, F.y - E.y); return { x: E.x - (E.x - F.x) / l * 1.3, y: E.y - (E.y - F.y) / l * 1.3 }; };
      const room = S => Math.min(...Object.keys(fig.points).map(n => { const R = Geom.pos(fig, n); return Math.hypot(R.x - S.x, R.y - S.y); }));
      const s1 = spot(Q, P), s2 = spot(P, Q), S = room(s1) >= room(s2) ? s1 : s2;
      const ux = Q.x - P.x, uy = Q.y - P.y;
      // Nudge the letter off the line, to the side a reader expects.
      const nx = -uy, ny = ux, nl = Math.hypot(nx, ny), side = ny >= 0 ? 1 : -1;
      const at = (E, sd) => ({ x: E.x + sd * nx / nl * 0.7, y: E.y + sd * ny / nl * 0.7 });
      // A point's own letter sits beside it (up and to the right, or down and to the right near the
      // top edge). If the usual spot would land on a point or its letter, the name moves to the
      // other side of the line or to the other end, wherever it is clearest.
      const taken = [].concat(...Object.keys(fig.points).map(n => {
        const R = Geom.pos(fig, n), dir = fig.labelDir && fig.labelDir[n];      // a figure can say where a point's letter goes
        return dir ? [R, { x: R.x + dir[0] * 0.9, y: R.y - dir[1] * 0.9 }] : [R, { x: R.x + 0.7, y: R.y + 0.7 }, { x: R.x + 0.7, y: R.y - 0.7 }];
      }));
      const clear = L => Math.min(...taken.map(R => Math.hypot(R.x - L.x, R.y - L.y)));
      let L = at(S, side);
      const S2 = S === s1 ? s2 : s1, wide = (E, sd) => ({ x: E.x + sd * nx / nl * 1.2, y: E.y + sd * ny / nl * 1.2 });
      if (clear(L) < 1) for (const c of [at(S, -side), at(S2, side), at(S2, -side)]) if (clear(c) > clear(L) + 1e-9) L = c;
      // Still crowded (a point close to each end): step a little farther from the line.
      if (clear(L) < 1) for (const c of [wide(S, side), wide(S, -side), wide(S2, side), wide(S2, -side)]) if (clear(c) > clear(L) + 1e-9) L = c;
      // Kept a little inside the diagram, so a name near a corner is not pressed against the edge.
      L = { x: Math.min(Geom.W - 1, Math.max(1, L.x)), y: Math.min(Geom.H - 1.1, Math.max(0.9, L.y)) };
      const t = el('text', { x: X(L.x) - 5, y: Y(L.y) + 6, class: 'line-lbl', 'aria-hidden': 'true' }, g);
      t.textContent = o.label;
      // Every spot the name could take, kept for tidyNames to choose from once the whole figure is drawn.
      const inside = c => ({ x: Math.min(Geom.W - 1, Math.max(1, c.x)), y: Math.min(Geom.H - 1.1, Math.max(0.9, c.y)) });
      const far = (E, sd) => ({ x: E.x + sd * nx / nl * 1.8, y: E.y + sd * ny / nl * 1.8 });
      const inward = (E, F) => { const l = Math.hypot(F.x - E.x, F.y - E.y); return { x: E.x - (E.x - F.x) / l * 3, y: E.y - (E.y - F.y) / l * 3 }; };
      const S3 = inward(Q, P), S4 = inward(P, Q);
      t._spots = [at(S, side), at(S, -side), at(S2, side), at(S2, -side), wide(S, side), wide(S, -side), wide(S2, side), wide(S2, -side), far(S, side), far(S, -side), far(S2, side), far(S2, -side),
        at(S3, side), at(S3, -side), at(S4, side), at(S4, -side)]
        .map(inside).map(c => ({ x: X(c.x) - 5, y: Y(c.y) + 6 }));
    }
    if (tool === 'pick' && i >= 0) {
      const hit = el('path', { d, class: 'hit', tabindex: '0', role: 'button', 'aria-label': `Figure ${i + 1}: a ${o.kind}`, 'data-obj': i }, g);
      // Underneath the drawn line, so its keyboard-focus band never covers the figure.
      g.insertBefore(hit, g.firstChild);
      hit.addEventListener('pointerdown', e => { e.preventDefault(); if (cb.onPick) cb.onPick(i); });
      hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (cb.onPick) cb.onPick(i); } });
    }
  }
  // A plane is drawn the textbook way: a slanted parallelogram with its letter in a corner.
  function drawPlanes() {
    layerPlanes.textContent = '';
    for (const pl of fig.planes || []) {
      const g = el('g', { class: 'plane' + (opts.hlPlane === pl.label ? ' hl' : '') }, layerPlanes);
      el('polygon', { points: pl.quad.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ') }, g);
      const [cx, cy] = pl.quad[3];
      const t = el('text', { x: X(cx) + 10, y: Y(cy) + 22, class: 'plane-lbl', 'aria-hidden': 'true' }, g);
      t.textContent = pl.label;
    }
  }
  // The SVG path for an arc of circle c from a to b (through `via`, or avoiding `opp`, or the minor arc).
  function arcPath(arc, rOff = 0) {
    const C = Geom.pos(fig, arc.c), r = Geom.radius(fig, arc.c) * U + rOff;
    const ang = n => { const P = Geom.pos(fig, n); return Math.atan2(P.y - C.y, P.x - C.x); };
    const ta = ang(arc.a), tb = ang(arc.b), deg = Geom.arcDeg(fig, arc);
    const ccw = ((tb - ta) * 180 / Math.PI % 360 + 360) % 360;         // counterclockwise sweep from a to b
    const goCcw = Math.abs(ccw - deg) < 1e-6;
    const P = t => `${X(C.x) + r * Math.cos(t)},${Y(C.y) - r * Math.sin(t)}`;
    const mid = ta + (goCcw ? 1 : -1) * deg / 2 * Math.PI / 180;
    return { d: `M${P(ta)} A${r},${r} 0 ${deg > 180 ? 1 : 0} ${goCcw ? 0 : 1} ${P(tb)}`, mid: { x: X(C.x) + (r + 18) * Math.cos(mid), y: Y(C.y) - (r + 18) * Math.sin(mid) } };
  }
  function drawCircles() {
    for (const k of fig.circles || []) {
      const C = Geom.pos(fig, k.c);
      el('circle', { cx: X(C.x), cy: Y(C.y), r: k.r * U, class: 'circ' }, layerObjs);
    }
    // The arc a task is about, drawn thick over the circle.
    if (opts.hlArc) el('path', { d: arcPath(opts.hlArc).d, class: 'arc-hl' }, layerObjs);
  }
  function redraw() {
    drawPlanes();
    layerObjs.textContent = '';
    drawCircles();
    (fig.objects || []).forEach((o, i) => drawObject(o, i, i === opts.highlight ? 'hl' : (opts.picked === i ? 'picked' : '')));
    (opts.drawn || []).forEach(o => drawObject(o, -1, 'drawn'));
    drawTicks();
    drawAngles();
    drawGivens();
    for (const name of Object.keys(handles)) placeHandle(name);
    tidyExprs();
    tidyLetters();
    tidyNames();
  }
  /* A point's letter must not sit on other writing either. A letter that touches an expression,
     another point's letter or another point's dot tries the four corners around its point (up
     right, up left, down right, down left) and takes the first that is clear of writing and not
     lying on a drawn line or circle. Letters that are already clear are left where they are. */
  let letterSpot = {};           // where each moved letter last sat (forgotten when a new figure loads)
  function tidyLetters() {
    const frame = svg.getBoundingClientRect();
    if (!frame.width) return;
    const k = frame.width / WPX, need = 4 * k;
    const gap = (a, b) => Math.hypot(Math.max(a.left - b.right, b.left - a.right, 0), Math.max(a.top - b.bottom, b.top - a.bottom, 0));
    const exprs = Array.from(svg.querySelectorAll('.expr-lbl')).map(e => e.getBoundingClientRect());
    // How far a spot (in drawing units) is from the nearest drawn line, ray, segment or circle.
    const strokes = (fig.objects || []).concat(opts.drawn || []).map(o => ends(o).map(E => ({ x: X(E.x), y: Y(E.y) })));
    const toStroke = c => {
      let d = Infinity;
      for (const [A, B] of strokes) {
        const L2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2 || 1, t = Math.max(0, Math.min(1, ((c.x - A.x) * (B.x - A.x) + (c.y - A.y) * (B.y - A.y)) / L2));
        d = Math.min(d, Math.hypot(c.x - A.x - t * (B.x - A.x), c.y - A.y - t * (B.y - A.y)));
      }
      for (const q of fig.circles || []) { const C = Geom.pos(fig, q.c); d = Math.min(d, Math.abs(Math.hypot(c.x - X(C.x), c.y - Y(C.y)) - q.r * U)); }
      return d;
    };
    const SPOTS = [[9, -10], [-18, -10], [9, 22], [-18, 22]];
    for (const name of Object.keys(handles)) {
      const lbl = handles[name].querySelector('text');
      if (!lbl || !lbl.textContent) continue;
      const P = Geom.pos(fig, name), others = () => exprs.concat(Object.keys(handles).filter(n => n !== name).map(n => handles[n]).reduce((all, h) => {
        const t = h.querySelector('text'), dot = h.querySelector('circle.dot');
        if (t && t.textContent) all.push(t.getBoundingClientRect());
        if (dot) all.push(dot.getBoundingClientRect());
        return all;
      }, []));
      const room = () => { const b = lbl.getBoundingClientRect(), o = others(); return o.length ? Math.min(...o.map(r => gap(b, r))) : Infinity; };
      const cut = () => { const b = lbl.getBoundingClientRect(); return Math.max(0, frame.left + 2 - b.left, b.right - frame.right + 2, frame.top + 2 - b.top, b.bottom - frame.bottom + 2); };
      if (room() >= need && !cut()) { delete letterSpot[name]; continue; }
      const start = [lbl.getAttribute('x'), lbl.getAttribute('y')];
      let best = start, most = -Infinity;
      for (const c of (letterSpot[name] ? [letterSpot[name]] : []).concat([start.map(Number)], SPOTS, [[9, 8], [-18, 8], [-5, -12], [-5, 24]])) {
        lbl.setAttribute('x', c[0]); lbl.setAttribute('y', c[1]);
        // The letter's middle, in drawing units, for the line check; then both checks on one scale.
        const mid = { x: X(P.x) + c[0] + 5, y: Y(P.y) + c[1] - 6 }, off = (P.x + (c[0] + 5) / U < 0.4 || P.x + (c[0] + 5) / U > Geom.W - 0.4 || P.y - (c[1] - 6) / U < 0.4 || P.y - (c[1] - 6) / U > Geom.H - 0.4);
        const over = cut();
        const score = over ? -100 - over : off ? -50 : Math.min(room() / k - 4, toStroke(mid) - 8);
        if (score > most + 0.5) { best = c; most = score; }
        if (score >= 0) break;
      }
      lbl.setAttribute('x', best[0]); lbl.setAttribute('y', best[1]);
      letterSpot[name] = best.map(Number);
    }
  }
  /* A line's name must never sit on other writing. Once everything is drawn, each name is measured
     against the point letters, the dots, the expressions written on the figure and the other line
     names; a name that touches one moves to whichever of its spots is clearest. Nothing moves when
     the diagram is not on screen (nothing can be measured then). */
  function tidyNames() {
    const names = Array.from(layerObjs.querySelectorAll('.line-lbl')).filter(t => t._spots);
    const frame = svg.getBoundingClientRect();
    if (!names.length || !frame.width) return;
    const k = frame.width / WPX, need = 5 * k;             // about a quarter of a grid square on screen
    const gap = (a, b) => Math.hypot(Math.max(a.left - b.right, b.left - a.right, 0), Math.max(a.top - b.bottom, b.top - a.bottom, 0));
    const fixed = Array.from(svg.querySelectorAll('.expr-lbl, text.lbl, circle.dot')).filter(e => e.tagName !== 'text' || e.textContent).map(e => e.getBoundingClientRect());
    for (const t of names) {
      const others = () => fixed.concat(names.filter(n => n !== t).map(n => n.getBoundingClientRect()));
      const room = () => { const b = t.getBoundingClientRect(); return Math.min(nameLineRoom(t) * k + need, ...others().map(o => gap(b, o))); };
      if (room() >= need) continue;
      const start = { x: t.getAttribute('x'), y: t.getAttribute('y') };
      let best = start, most = room();
      for (const c of t._spots) {
        t.setAttribute('x', c.x); t.setAttribute('y', c.y);
        const r = room();
        if (r > most + 0.5) { best = c; most = r; }
        if (r >= need) break;                               // the first clear spot, in the order a reader expects
      }
      t.setAttribute('x', best.x); t.setAttribute('y', best.y);
    }
  }
  // What a problem gives: marks that are stated, not measured (fig.marks), and expressions written
  // on the figure (fig.labels). They show even when measurements are hidden.
  function drawGivens() {
    const g = el('g', { class: 'givens', 'aria-hidden': 'true' }, layerObjs);
    const px = n => { const P = Geom.pos(fig, n); return { x: X(P.x), y: Y(P.y) }; };
    const unit = (A, B) => { const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy); return { x: dx / l, y: dy / l }; };
    for (const mk of fig.marks || []) {
      if (mk.seg) {
        const A = px(mk.seg[0]), B = px(mk.seg[1]), u = unit(A, B), m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        for (let k = 0; k < mk.ticks; k++) {
          const off = (k - (mk.ticks - 1) / 2) * 6, c = { x: m.x + u.x * off, y: m.y + u.y * off };
          el('line', { x1: c.x + u.y * 8, y1: c.y - u.x * 8, x2: c.x - u.y * 8, y2: c.y + u.x * 8, class: 'given-mark' }, g);
        }
      } else if (mk.angle) {
        const V = px(mk.angle[1]), u = unit(V, px(mk.angle[0])), w = unit(V, px(mk.angle[2])), s = 12;
        if (mk.right) el('path', { d: `M${V.x + u.x * s},${V.y + u.y * s} L${V.x + (u.x + w.x) * s},${V.y + (u.y + w.y) * s} L${V.x + w.x * s},${V.y + w.y * s}`, class: 'given-mark' }, g);
        // Given congruent angles: 1, 2 or 3 arcs, matching their partners in the other triangle.
        for (let k = 0; k < (mk.arcs || 0); k++) el('path', { d: arc(V.x, V.y, u, w, 20 + k * 5), class: 'given-mark' }, g);
      } else if (mk.par) {
        // Given parallel lines: arrowheads pointing along the line from par[0] to par[1], at fraction
        // `at` of the way (default halfway). Lines with the same number of arrows are parallel.
        const A = px(mk.par[0]), B = px(mk.par[1]), u = unit(A, B), t = mk.at != null ? mk.at : 0.5;
        for (let k = 0; k < (mk.arrows || 1); k++) {
          const c = { x: A.x + (B.x - A.x) * t + u.x * k * 7, y: A.y + (B.y - A.y) * t + u.y * k * 7 };
          el('path', { d: `M${c.x - u.x * 8 - u.y * 6},${c.y - u.y * 8 + u.x * 6} L${c.x},${c.y} L${c.x - u.x * 8 + u.y * 6},${c.y - u.y * 8 - u.x * 6}`, class: 'given-mark' }, g);
        }
      }
    }
    for (const lb of fig.labels || []) {
      let x, y, tilt = 0, ray = null, onArc = null, onSeg = false;
      if (lb.arc) {
        // An arc's measure belongs to the arc: the arc is highlighted in the expression's color and
        // the measure is written beside it. tidyExprs chooses the spot (outside or inside the circle).
        el('path', { d: arcPath(lb.arc).d, class: 'expr-arc-hl' }, g);
        const drawnTo = n => (fig.objects || []).some(o => (o.a === lb.arc.c && o.b === n) || (o.b === lb.arc.c && o.a === n));
        if (drawnTo(lb.arc.a) && drawnTo(lb.arc.b) && Geom.arcDeg(fig, lb.arc) < 180 && (fig.labels || []).some(l => l.angle)) {
          // Both radii are drawn: the central angle on this arc gets a wedge as well, so every expression on the figure has its own mark.
          const V = px(lb.arc.c);
          el('path', { d: wedge(V.x, V.y, unit(V, px(lb.arc.a)), unit(V, px(lb.arc.b)), WEDGE), class: 'expr-wedge' }, g);
        }
        ({ x, y } = arcPath(lb.arc).mid); y += 5;
        const C = Geom.pos(fig, lb.arc.c), cx = X(C.x), cy = Y(C.y), l = Math.hypot(x - cx, y - 5 - cy) || 1;
        onArc = { cx, cy, ux: (x - cx) / l, uy: (y - 5 - cy) / l, R: Geom.radius(fig, lb.arc.c) * U };
        onArc.turn = upright(Math.atan2(onArc.ux, -onArc.uy) * 180 / Math.PI);        // along the curve
        tilt = gentle(onArc.turn);
      } else if (lb.seg) {
        const A = px(lb.seg[0]), B = px(lb.seg[1]), u = unit(A, B);
        // Labels on the whole segment go below it; labels on its parts go above.
        const below = fig.labelBelow && fig.labelBelow.join() === lb.seg.join() ? 1 : -1;
        let nx = -u.y, ny = u.x;
        if (ny > 0) { nx = -nx; ny = -ny; }                 // (nx, ny) points up on screen
        const far = below === 1 ? 31 : 18;
        x = (A.x + B.x) / 2 - nx * far * below; y = (A.y + B.y) / 2 - ny * far * below + 5;
        // A length is written parallel to its segment, so on a slanted segment it is clear which part it measures.
        tilt = upright(Math.atan2(u.y, u.x) * 180 / Math.PI);
        onSeg = { mx: (A.x + B.x) / 2, my: (A.y + B.y) / 2, nx: -nx * below, ny: -ny * below, far, turn: tilt };
      } else {
        const V = px(lb.angle[1]), u = unit(V, px(lb.angle[0])), w = unit(V, px(lb.angle[2]));
        let bx = u.x + w.x, by = u.y + w.y; const bl = Math.hypot(bx, by) || 1;
        bx /= bl; by /= bl;
        // When a drawn segment runs along the bisector (like QP bisecting angle SQT), a label there would
        // look like it names the half angle. Instead, a wedge covers the whole angle and the expression is written
        // just outside the angle, beside its vertex.
        const onBisector = (fig.objects || []).some(o => {
          const other = o.a === lb.angle[1] ? o.b : o.b === lb.angle[1] ? o.a : null;
          if (!other) return false;
          const d = unit(V, px(other));
          return d.x * bx + d.y * by > 0.995;
        });
        if (onBisector) {
          el('path', { d: wedge(V.x, V.y, u, w, 34), class: 'expr-wedge' }, g);
          const half = Math.acos(Math.max(-1, Math.min(1, u.x * w.x + u.y * w.y))) / 2;
          ray = { V, bx, by, half, turn: upright(Math.atan2(bx, -by) * 180 / Math.PI), len: lb.text.length, minR: 34, name: lb.angle[1], dirs: [u, w, { x: bx, y: by }], outsideFirst: true };
          tilt = 0;
          const d = lb.text.length * CHAR[0] / 2 * Math.abs(bx) + HIGH[0] * Math.abs(by) + 14;
          x = V.x - bx * d; y = V.y - by * d + 5;
        } else {
          /* A pale wedge in the expression's color marks the angle it measures. It is a filled
             shape, never an arc: arcs mean congruent angles. A right angle already has its box. */
          const boxed = (fig.marks || []).some(mk => mk.angle && mk.right && mk.angle[1] === lb.angle[1] && Geom.sameAngle(fig, mk.angle, lb.angle));
          const half = Math.acos(Math.max(-1, Math.min(1, u.x * w.x + u.y * w.y))) / 2;
          const reach = half < 0.45 ? WEDGE * 1.6 : WEDGE;        // a narrow angle's wedge is a sliver: make it longer
          if (!boxed) el('path', { d: wedge(V.x, V.y, u, w, reach), class: 'expr-wedge' }, g);
          // Facing its vertex: written across the angle, its foot toward the vertex, never upside down.
          const turn = upright(Math.atan2(bx, -by) * 180 / Math.PI);
          const marked = !opts.hideMeasures && congMarks && (fig.angles || []).length
            ? Math.max(0, ...Geom.measureAngles(fig).angles.filter(a => a.pts[1] === lb.angle[1]).map(a => Math.min(a.arcs || 0, 4))) : 0;
          ray = { V, bx, by, half, turn, len: lb.text.length, name: lb.angle[1], dirs: [u, w], minR: Math.max(reach, marked ? 24 + 6 * (marked - 1) + 3 : WEDGE) };
          tilt = gentle(turn);
          const r = fitRadius(ray, tilt, false);
          x = V.x + bx * r; y = V.y + by * r + 5;
        }
      }
      const t = el('text', { x, y, class: 'expr-lbl', 'text-anchor': 'middle' }, g);
      t.textContent = lb.text;
      setTurn(t, tilt);
      if (ray) { t._ray = ray; t._pts = Array.from(lb.angle); }
      if (onArc) t._arc = onArc;
      if (onSeg) t._seg = onSeg;
    }
  }
  // ---------- Where writing goes: the rules, as plain arithmetic ----------
  const WEDGE = 20;              // radius of the wedge that marks a labelled angle
  const STEEP = 35;              // an expression that would turn more than this many degrees is written level instead
  const CHAR = [7.0, 5.7];       // width of one character of an expression: full size, smaller size
  const HIGH = [7, 6];           // half the height of an expression: full size, smaller size
  // A turn in degrees that never leaves text upside down.
  const upright = a => (a > 90 ? a - 180 : a < -90 ? a + 180 : a);
  // Level when the turn would be steep; otherwise the turn itself.
  const gentle = a => (Math.abs(a) > STEEP ? 0 : a);
  function setTurn(t, deg) {
    t._tilt = deg;
    if (Math.abs(deg) > 0.5) t.setAttribute('transform', `rotate(${Math.round(deg * 10) / 10} ${t.getAttribute('x')} ${t.getAttribute('y') - 5})`);
    else t.removeAttribute('transform');
  }
  /* How far from its vertex an angle's expression sits, so that it fits between the two sides and
     clear of the wedge. q: the angle (bisector bx, by; half its opening; number of characters).
     turn: how the text is turned, in degrees. small: written a size smaller. */
  function fitRadius(q, turn, small) {
    const hw = q.len * CHAR[small ? 1 : 0] / 2, hh = HIGH[small ? 1 : 0], a = turn * Math.PI / 180;
    const along = Math.abs(Math.cos(a) * q.bx + Math.sin(a) * q.by), across = Math.sqrt(Math.max(0, 1 - along * along));
    const reach = hw * along + hh * across;          // how far the text reaches along the bisector, each way from its middle
    const span = hw * across + hh * along;           // how far it reaches across the angle
    return Math.min(130, Math.max((q.minR || WEDGE) + 4 + reach, reach + (span + 4) / Math.tan(Math.max(0.12, q.half))));
  }
  // The distance from a spot (drawing units) to the nearest drawn segment, ray, line or circle.
  function strokeDist(c) {
    let d = Infinity;
    for (const o of (fig.objects || []).concat(opts.drawn || [])) {
      const [P, Q] = ends(o), A = { x: X(P.x), y: Y(P.y) }, B = { x: X(Q.x), y: Y(Q.y) };
      const L2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2 || 1, s = Math.max(0, Math.min(1, ((c.x - A.x) * (B.x - A.x) + (c.y - A.y) * (B.y - A.y)) / L2));
      d = Math.min(d, Math.hypot(c.x - A.x - s * (B.x - A.x), c.y - A.y - s * (B.y - A.y)));
    }
    for (const q of fig.circles || []) { const C = Geom.pos(fig, q.c); d = Math.min(d, Math.abs(Math.hypot(c.x - X(C.x), c.y - Y(C.y)) - q.r * U)); }
    return d;
  }
  // Clear space between an expression and the nearest drawn line or circle, in drawing units;
  // below zero when a line runs through the writing.
  function lineRoom(t) {
    const s = t.classList.contains('snug') ? 1 : 0;
    const x = +t.getAttribute('x'), y = t.getAttribute('y') - 5, a = (t._tilt || 0) * Math.PI / 180;
    // The writing is treated as a rounded bar: its middle line, shortened by half its height at each end, with that half height around it.
    const wide = t.getComputedTextLength ? t.getComputedTextLength() : 0;       // the real width when it can be measured
    const hh = HIGH[s], hw = Math.max(0, (wide || t.textContent.length * CHAR[s]) / 2 - hh);
    let d = Infinity;
    for (const f of [-1, -0.6, -0.2, 0.2, 0.6, 1]) d = Math.min(d, strokeDist({ x: x + Math.cos(a) * hw * f, y: y + Math.sin(a) * hw * f }));
    return d - hh;
  }
  // Clear space between a line's one-letter name and the nearest drawn line or circle, in drawing units; below zero when a line runs through the letter.
  function nameLineRoom(t) { return strokeDist({ x: +t.getAttribute('x') + 6, y: t.getAttribute('y') - 6 }) - 9; }
  /* Whose is it? The name of a point that an angle's expression sits nearer to than its own vertex
     (so it would be read as that point's), or '' when it is clearly its own. Points on the angle's
     two sides do not count: the expression is between them by design. */
  function strayTo(t) {
    const q = t._ray;
    if (!q || !q.name) return '';
    const c = { x: +t.getAttribute('x'), y: t.getAttribute('y') - 5 }, own = Math.hypot(c.x - q.V.x, c.y - q.V.y);
    for (const n of Object.keys(fig.points)) {
      if (n === q.name) continue;
      const P = Geom.pos(fig, n), px = X(P.x) - q.V.x, py = Y(P.y) - q.V.y, l = Math.hypot(px, py) || 1;
      // A point lying along either side of the angle (as seen from the vertex) is part of the angle, not a rival.
      if ((q.dirs || []).some(d => (px * d.x + py * d.y) / l > 0.995)) continue;
      if (Math.hypot(c.x - X(P.x), c.y - Y(P.y)) + 10 < own) return n;
    }
    return '';
  }
  /* A check of the figure as drawn, for the tests page and for sweeping every figure: a list of
     what is wrong with its writing, in words (empty when all is well), or null when the diagram is
     not on screen and nothing can be measured. */
  function audit() {
    const frame = svg.getBoundingClientRect();
    if (!frame.width) return null;
    const out = [], gap = (a, b) => Math.hypot(Math.max(a.left - b.right, b.left - a.right, 0), Math.max(a.top - b.bottom, b.top - a.bottom, 0));
    const texts = Array.from(svg.querySelectorAll('.line-lbl, .expr-lbl, text.lbl')).filter(t => t.textContent.trim());
    const dots = Object.keys(handles).map(n => ({ n, lbl: handles[n].querySelector('text'), box: handles[n].querySelector('circle.dot').getBoundingClientRect() }));
    texts.forEach((t, i) => {
      const b = t.getBoundingClientRect(), name = `"${t.textContent}"`;
      if (b.left < frame.left || b.right > frame.right || b.top < frame.top || b.bottom > frame.bottom) out.push(`${name} runs off the edge`);
      for (const o of texts.slice(i + 1)) if (gap(b, o.getBoundingClientRect()) < 1) out.push(`${name} touches "${o.textContent}"`);
      for (const d of dots) if (d.lbl !== t && gap(b, d.box) < 1) out.push(`${name} is on point ${d.n}`);
      if (t.classList.contains('expr-lbl') && lineRoom(t) < -1.5) out.push(`a line runs through ${name}`);
      if (t.classList.contains('line-lbl') && nameLineRoom(t) < -3) out.push(`a line runs through the name ${name}`);
      if (t._ray && strayTo(t)) out.push(`${name} is nearer point ${strayTo(t)} than its own vertex ${t._ray.name}`);
    });
    return out;
  }
  /* Once everything is drawn, each expression is measured where it stands: against the point
     letters, the dots, the other expressions, and every drawn line and circle. The order of
     preference for an angle's expression: beside its vertex at full size; then a size smaller
     (which fits nearer); then a little farther out or to one side. No line may run through it. */
  function tidyExprs() {
    const frame = svg.getBoundingClientRect();
    if (!frame.width) return;
    const k = frame.width / WPX, NEED = 3;                // drawing units of clear space wanted around an expression
    const gap = (a, b) => Math.hypot(Math.max(a.left - b.right, b.left - a.right, 0), Math.max(a.top - b.bottom, b.top - a.bottom, 0));
    const all = Array.from(svg.querySelectorAll('.expr-lbl'));
    // Point letters and dots, each with its point's name. An expression ignores the letter of its own vertex: that letter moves aside for it afterwards.
    const fixed = [];
    for (const n of Object.keys(handles)) {
      const lbl = handles[n].querySelector('text'), dot = handles[n].querySelector('circle.dot');
      if (lbl && lbl.textContent) fixed.push({ n, letter: true, box: lbl.getBoundingClientRect() });
      if (dot) fixed.push({ n, box: dot.getBoundingClientRect() });
    }
    const small = t => t.classList.contains('snug');
    let arcsYield = false;        // while the angles take their places, arc measures are not in the way: they move afterwards
    const textRoom = t => {
      const b = t.getBoundingClientRect(), mine = t._ray && t._ray.name;
      const boxes = fixed.filter(f => !(f.letter && f.n === mine)).map(f => f.box).concat(all.filter(e => e !== t && !(arcsYield && e._arc)).map(e => e.getBoundingClientRect()));
      return Math.min(Infinity, ...boxes.map(o => gap(b, o))) / k;
    };
    const edgeRoom = t => { const b = t.getBoundingClientRect(); return Math.min(b.left - frame.left, frame.right - b.right, b.top - frame.top, frame.bottom - b.bottom) / k + 1; };
    const room = t => (strayTo(t) ? -5 : Math.min(textRoom(t), lineRoom(t) - 1, edgeRoom(t)));
    const move = (t, x, y, turn) => { t.setAttribute('x', x); t.setAttribute('y', y + 5); setTurn(t, turn); };
    // Try a list of placements, each a function that puts the expression somewhere; keep the first clear one, else the clearest.
    const choose = (t, tries) => {
      let best = null, most = -Infinity;
      for (const go of tries) {
        go();
        const r = room(t);
        if (r >= NEED) return true;
        if (r > most + 0.25) { best = go; most = r; }
      }
      if (best) best();
      return false;
    };

    // Lengths: beside the segment at full size; if something is in the way, a size smaller, a little
    // farther off, or the other side of the segment.
    for (const t of all.filter(e => e._seg)) {
      if (room(t) >= 1) continue;
      const s = t._seg, tries = [];
      for (const snug of [false, true]) for (const side of [1, -1]) for (const d of [s.far, s.far + 8, 18, 26]) {
        tries.push(() => { t.classList.toggle('snug', snug); move(t, s.mx + s.nx * d * side, s.my + s.ny * d * side, s.turn); });
      }
      choose(t, tries);
    }

    // Arcs: outside the circle beside the arc, or just inside it; level if it fits, else along the curve; full size first.
    const settleArc = t => {
      const a = t._arc, tries = [];
      const faced = all.some(e => e._ray && (() => {
        const dx = e._ray.V.x - a.cx, dy = e._ray.V.y - a.cy, l = Math.hypot(dx, dy);
        return l > a.R && (dx * a.ux + dy * a.uy) / l > 0.5;
      })());
      const ways = Math.abs(a.turn) > STEEP ? (faced ? [[a.turn, -1], [0, -1], [a.turn, 1], [0, 1]] : [[0, 1], [a.turn, 1], [a.turn, -1], [0, -1]])
        : (faced ? [[a.turn, -1], [a.turn, 1]] : [[a.turn, 1], [a.turn, -1]]);
      for (const snug of [false, true]) for (const [turn, out] of ways) {
        tries.push(() => {
          t.classList.toggle('snug', snug);
          const hw = t.textContent.length * CHAR[snug ? 1 : 0] / 2, hh = HIGH[snug ? 1 : 0], r = turn * Math.PI / 180;
          const along = Math.abs(Math.cos(r) * a.ux + Math.sin(r) * a.uy), reach = hw * along + hh * Math.sqrt(Math.max(0, 1 - along * along));
          const d = a.R + out * (8 + reach);
          move(t, a.cx + a.ux * d, a.cy + a.uy * d, turn);
        });
      }
      choose(t, tries);
    };

    // Angles.
    const settle = (t, smallOnly) => {
      const q = t._ray, tries = [], later = [];
      const sizes = smallOnly ? [true] : [false, true];
      const at = (turn, snug, n, side) => () => {
        const r = fitRadius(q, turn, snug) + 5 * n;
        t.classList.toggle('snug', snug); move(t, q.V.x + q.bx * r - q.by * side, q.V.y + q.by * r + q.bx * side, turn);
      };
      // Nothing else drawn behind the vertex (a triangle's corner, the point two tangents come from)? Then there is
      // a place just outside the angle, and anything far from the vertex waits until that place has been tried.
      const open = !!q.name && (fig.objects || []).concat(opts.drawn || []).every(o => !Geom.onFigure(fig, o, q.name) || o.a === q.name || (o.kind === 'segment' && o.b === q.name));
      const FAR = 62;       // farther than this from its vertex, an expression starts to look like it belongs to something else
      for (const turn of (Math.abs(q.turn) > STEEP ? [0, q.turn] : [q.turn])) {
        // Beside the vertex, full size then smaller; only then a step farther out, again at each size; then a step to one side.
        const near = (snug, n) => !open || fitRadius(q, turn, snug) + 5 * n <= FAR;
        for (let n = 0; n <= 4; n++) for (const snug of sizes) (near(snug, n) ? tries : later).push(at(turn, snug, n, 0));
        for (const n of [0, 2, 4]) for (const side of [12, -12, 22, -22]) for (const snug of sizes) (near(snug, n) ? tries : later).push(at(turn, snug, n, side));
        for (let n = 5; n <= 12; n++) for (const snug of sizes) later.push(at(turn, snug, n, 0));   // only if every way of staying close has failed
      }
      if (open) {
        const outside = [];
        for (const snug of sizes) {
          const reach = q.len * CHAR[snug ? 1 : 0] / 2 * Math.abs(q.bx) + HIGH[snug ? 1 : 0] * Math.abs(q.by);
          for (const d of [reach + 14, reach + 22]) for (const side of [0, 10, -10]) outside.push(() => { t.classList.toggle('snug', snug); move(t, q.V.x - q.bx * d - q.by * side, q.V.y - q.by * d + q.bx * side, 0); });
        }
        // First choice where a line bisects the angle (inside, the expression would read as one half) and where
        // the angle is too narrow to hold it anywhere near the vertex; otherwise the last resort.
        if (q.outsideFirst) tries.unshift(...outside); else tries.push(...outside);
      }
      tries.push(...later);
      return choose(t, tries);
    };
    const rays = all.filter(e => e._ray), arcs = all.filter(e => e._arc);
    // Twice round: the second time, each one sees where the others settled.
    // An angle's expression has first call on the space beside its vertex; an arc's measure then
    // takes the best place left along its arc (outside the circle, or just inside it).
    arcsYield = true;
    for (const t of rays) settle(t, false);
    arcsYield = false;
    for (const t of arcs) settleArc(t);
    for (const t of rays) if (room(t) < NEED) settle(t, small(t));

    // Expressions that share a tight space are written the same size; so are all of a triangle's.
    const beside = (a, b) => gap(a.getBoundingClientRect(), b.getBoundingClientRect()) < 45 * k;
    const shrink = list => { for (const t of list) { if (t._ray) settle(t, true); else t.classList.add('snug'); } };
    shrink(all.filter(e => !small(e) && all.some(o => o !== e && small(o) && beside(e, o))));
    for (const tri of fig.triangles || []) {
      const own = rays.filter(e => e._pts.every(n => tri.includes(n)));
      if (own.some(small)) shrink(own.filter(e => !small(e)));
    }
    // Shrinking one can free room for its neighbor: a last look at any that are still crowded.
    for (const t of arcs) if (room(t) < NEED) settleArc(t);
    for (const t of rays) if (room(t) < NEED) settle(t, true);
  }
  // Angle marks: a box on a right angle; arcs on congruent angles (one arc for the first group,
  // two for the next); a shaded wedge on the angle a task is about.
  function drawAngles() {
    if (!(fig.angles || []).length) return;
    const g = el('g', { class: 'angle-marks', 'aria-hidden': 'true' }, layerObjs);
    const m = Geom.measureAngles(fig);
    for (const a of m.angles) {
      const V = Geom.pos(fig, a.pts[1]);
      const cx = X(V.x), cy = Y(V.y);
      const dir = p => { const P = Geom.pos(fig, p), dx = X(P.x) - cx, dy = Y(P.y) - cy, l = Math.hypot(dx, dy); return { x: dx / l, y: dy / l }; };
      const u = dir(a.pts[0]), w = dir(a.pts[2]);
      const target = [opts.hlAngle].concat(opts.hlAngles || []).some(h => h && Geom.sameAngle(fig, h, a.pts));
      if (target) {
        // Under the lines, so the highlighted angle never hides them.
        const under = el('g', { 'aria-hidden': 'true' });
        layerObjs.insertBefore(under, layerObjs.firstChild);
        el('path', { d: wedge(cx, cy, u, w, 34), class: 'angle-hl' }, under);
      }
      if (a.kind === 'right' && !opts.hideMeasures) {
        const s = 12;
        el('path', { d: `M${cx + u.x * s},${cy + u.y * s} L${cx + (u.x + w.x) * s},${cy + (u.y + w.y) * s} L${cx + w.x * s},${cy + w.y * s}`, class: 'right-box' }, g);
      } else if (a.arcs && !opts.hideMeasures && congMarks) {
        for (let k = 0; k < Math.min(a.arcs, 4); k++) el('path', { d: arc(cx, cy, u, w, 24 + k * 6), class: 'arc' }, g);
      }
    }
  }
  function arc(cx, cy, u, w, r) {
    const sweep = u.x * w.y - u.y * w.x > 0 ? 1 : 0;
    return `M${cx + u.x * r},${cy + u.y * r} A${r},${r} 0 0 ${sweep} ${cx + w.x * r},${cy + w.y * r}`;
  }
  function wedge(cx, cy, u, w, r) { return `M${cx},${cy} L${cx + u.x * r},${cy + u.y * r} ` + arc(cx, cy, u, w, r).replace(/^M[^A]*/, '') + ' Z'; }
  // Tick marks on congruent segments: one tick for the first group, two for the next, and so on,
  // crossing the middle of each segment. The Measurements panel says the same thing in words.
  function drawTicks() {
    const g = el('g', { class: 'ticks', 'aria-hidden': 'true' }, layerObjs);
    for (const s of Geom.measure(fig, opts.drawn || []).segments) {
      if (!s.ticks || opts.hideMeasures || !congMarks || (fig.angles && !fig.triangles && !fig.ticks)) continue;
      const A = Geom.pos(fig, s.pts[0]), B = Geom.pos(fig, s.pts[1]);
      const mx = X((A.x + B.x) / 2), my = Y((A.y + B.y) / 2);
      const dx = X(B.x) - X(A.x), dy = Y(B.y) - Y(A.y), len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      const n = Math.min(s.ticks, 4), gap = 6, half = 8;
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * gap;
        const cx = mx + ux * off, cy = my + uy * off;
        el('line', { x1: cx - nx * half, y1: cy - ny * half, x2: cx + nx * half, y2: cy + ny * half }, g);
      }
    }
    // Congruent arcs: tick marks across the circle at each arc's middle, one tick for the first
    // group, two for the next. The Congruent panel lists them in words.
    if (opts.hideMeasures || !congMarks) return;
    Geom.congruentArcs(fig).forEach((group, i) => {
      for (const a of group) {
        const C = Geom.pos(fig, a.c), cx = X(C.x), cy = Y(C.y), r = Geom.radius(fig, a.c) * U;
        const m = arcPath(a).mid, l = Math.hypot(m.x - cx, m.y - cy), ux = (m.x - cx) / l, uy = (m.y - cy) / l;
        const n = Math.min(i + 1, 4);
        for (let k = 0; k < n; k++) {
          const t = (k - (n - 1) / 2) * 6 / r, c = Math.cos(t), s = Math.sin(t);
          const vx = ux * c - uy * s, vy = ux * s + uy * c;    // the middle direction, turned a little for each extra tick
          el('line', { x1: cx + vx * (r - 7), y1: cy + vy * (r - 7), x2: cx + vx * (r + 7), y2: cy + vy * (r + 7) }, g);
        }
      }
    });
  }

  // ---------- Points ----------
  function makeHandle(name) {
    const g = el('g', { class: 'pt', tabindex: '0', role: 'button', 'data-pt': name }, layerPts);
    el('circle', { r: 18, class: 'hit' }, g);
    el('circle', { r: 5.5, class: 'dot' }, g);
    const t = el('text', { class: 'lbl', 'aria-hidden': 'true' }, g);
    t.textContent = name;
    g.addEventListener('pointerdown', e => onPointDown(e, name));
    g.addEventListener('keydown', e => onPointKey(e, name));
    return g;
  }
  function placeHandle(name) {
    const g = handles[name], P = Geom.pos(fig, name);
    g.setAttribute('transform', `translate(${X(P.x)},${Y(P.y)})`);
    const lbl = g.querySelector('text');
    // A triangle's vertex letter goes outside the triangle, away from its center, so it never sits
    // on the angle marks inside. Other letters go up and to the right unless that runs off the edge.
    const t = (fig.triangles || []).find(x => x.includes(name));
    // Points on a circle get their letter outside the circle, away from the center.
    const k = !t && (fig.circles || []).find(c => c.c !== name && Geom.onCircle(fig, c.c, name));
    // A figure can set a letter's direction (screen x right, y down), like a vertex two triangles share.
    const dir = fig.labelDir && fig.labelDir[name];
    if (dir) {
      lbl.setAttribute('x', dir[0] * 17 - 6);
      lbl.setAttribute('y', dir[1] * 17 + 7);
    } else if (t || k) {
      const c = k ? Geom.pos(fig, k.c) : t.map(n => Geom.pos(fig, n)).reduce((s, Q) => ({ x: s.x + Q.x / 3, y: s.y + Q.y / 3 }), { x: 0, y: 0 });
      let dx = X(P.x) - X(c.x), dy = Y(P.y) - Y(c.y); const l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      lbl.setAttribute('x', dx * 17 - 6);
      lbl.setAttribute('y', dy * 17 + 7);
    } else {
      lbl.setAttribute('x', P.x > Geom.W - 2.5 ? -18 : 9);
      lbl.setAttribute('y', P.y > Geom.H - 2 ? 22 : -10);
    }
    const can = tool === 'move' ? movable(name) : tool !== 'pick';
    g.classList.toggle('movable', tool === 'move' && movable(name));
    g.classList.toggle('first', first === name);
    g.setAttribute('aria-disabled', can ? 'false' : 'true');
    const how = tool === 'move' ? (movable(name) ? ' Arrow keys move it.' : '') : tool === 'pick' ? '' : first === name ? ' Selected.' : ' Enter selects it.';
    g.setAttribute('aria-label', `Point ${name} at ${Geom.round2(P.x)}, ${Geom.round2(P.y)}.${how}`);
    g.setAttribute('tabindex', tool === 'pick' ? '-1' : '0');
  }

  function choosePoint(name) {
    if (!['segment', 'ray', 'line'].includes(tool)) return;
    if (!first) { first = name; redraw(); if (cb.onFirst) cb.onFirst(name); return; }
    if (first === name) { first = null; redraw(); return; }
    const drawn = { kind: tool, a: first, b: name };
    first = null;
    redraw();
    if (cb.onDraw) cb.onDraw(drawn);
  }

  function onPointDown(e, name) {
    if (tool !== 'move') { e.preventDefault(); choosePoint(name); return; }
    if (!movable(name)) return;
    e.preventDefault();
    handles[name].focus({ preventScroll: true });   // preventDefault skips focus; without it, arrow keys after a click scroll the page
    drag = { name, id: e.pointerId, moved: false };
    try { handles[name].setPointerCapture(e.pointerId); } catch (err) { /* the svg still tracks the drag */ }
    handles[name].classList.add('dragging');
  }
  function toModel(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x / U, y: (HPX - p.y) / U };
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const next = Geom.snapMove(fig, drag.name, toModel(e), opts.magnets || []);
    if (!next) return;
    const cur = fig.points[drag.name];
    if (JSON.stringify(cur) === JSON.stringify(next)) return;
    fig.points[drag.name] = next;
    drag.moved = true;
    redraw();
    if (cb.onMove) cb.onMove(drag.name, false);
  }
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const { name, moved } = drag;
    handles[name].classList.remove('dragging');
    drag = null;
    if (moved && cb.onMove) cb.onMove(name, true);
  }
  function onPointKey(e, name) {
    const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if ((e.key === 'Enter' || e.key === ' ') && tool !== 'move') { e.preventDefault(); choosePoint(name); return; }
    if (!dirs[e.key] || tool !== 'move' || !movable(name)) return;
    e.preventDefault();
    const next = Geom.keyMove(fig, name, dirs[e.key][0], dirs[e.key][1], opts.magnets || []);
    if (!next) { if (cb.onBlocked) cb.onBlocked(name); return; }
    fig.points[name] = next;
    redraw();
    handles[name].focus();
    if (cb.onMove) cb.onMove(name, true);
  }

  return { mount, load, setTool, redraw, setCongMarks, audit, get tool() { return tool; } };
})();
