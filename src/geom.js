/* Geometry engine for Geometric Interactive Notes. No DOM here, so every rule can be tested.
   Model: a 20 x 14 grid, y pointing up. A point has coordinates, or sits on the line through two
   other points at parameter t (so it stays exactly on that line when they move).
   A figure object is { kind: 'segment' | 'ray' | 'line', a, b } where a and b are point names;
   for a ray, a is the endpoint. */
const Geom = (() => {
  'use strict';
  const W = 20, H = 14;
  const EPS = 1e-9;
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const cross = (u, v) => u.x * v.y - u.y * v.x;
  const dot = (u, v) => u.x * v.x + u.y * v.y;
  const len = u => Math.hypot(u.x, u.y);

  const KINDS = {
    segment: { word: 'segment', ends: 'has two endpoints' },
    ray: { word: 'ray', ends: 'has one endpoint and goes on forever in one direction' },
    line: { word: 'line', ends: 'has no endpoints and goes on forever in both directions' },
    plane: { word: 'plane', ends: 'is a flat surface that goes on forever in every direction' },
  };

  // ---------- Positions ----------
  function pos(fig, name, depth = 0) {
    const p = fig.points[name];
    if (!p) throw new Error('There is no point ' + name + '.');
    if (depth > 6) throw new Error('Point ' + name + ' depends on itself.');
    // On a circle, at an angle (degrees) from its center.
    if (p.circ) {
      const C = pos(fig, p.circ, depth + 1), r = radius(fig, p.circ), a = p.deg * Math.PI / 180;
      return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) };
    }
    // Where a tangent from point `from` touches the circle (side 1 or -1 picks which of the two).
    // Not a number when `from` is inside the circle, so moves that put it there are refused.
    if (p.tanFrom) {
      const C = pos(fig, p.circ2, depth + 1), Q = pos(fig, p.tanFrom, depth + 1), r = radius(fig, p.circ2);
      const d = Math.hypot(Q.x - C.x, Q.y - C.y), base = Math.atan2(Q.y - C.y, Q.x - C.x), a = base + p.side * Math.acos(r / d);
      return d > r + 1e-9 ? { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) } : { x: NaN, y: NaN };
    }
    // On the tangent line at point `at`, a distance d along it.
    if (p.tanLine) {
      const T = pos(fig, p.tanLine, depth + 1), C = pos(fig, p.circ2, depth + 1), l = Math.hypot(T.x - C.x, T.y - C.y);
      return { x: T.x - p.d * (T.y - C.y) / l, y: T.y + p.d * (T.x - C.x) / l };
    }
    if (!p.on) return { x: p.x, y: p.y };
    const A = pos(fig, p.on[0], depth + 1), B = pos(fig, p.on[1], depth + 1);
    return { x: A.x + p.t * (B.x - A.x), y: A.y + p.t * (B.y - A.y) };
  }
  const samePos = (P, Q) => Math.abs(P.x - Q.x) < 1e-7 && Math.abs(P.y - Q.y) < 1e-7;
  function collinear(P, Q, R) {
    const u = sub(Q, P), v = sub(R, P);
    return Math.abs(cross(u, v)) <= EPS * Math.max(1, len(u) * len(v));
  }
  // Where X sits along A -> B: 0 at A, 1 at B. Only meaningful when X is on line AB.
  function param(A, B, X) { const d = sub(B, A); return dot(sub(X, A), d) / dot(d, d); }

  // ---------- Which figure does a name describe? ----------
  // Two names describe the same figure when they are the same set of points, whatever the drawing order.
  function same(fig, f, g) {
    if (f.kind !== g.kind) return false;
    const A = pos(fig, f.a), B = pos(fig, f.b), C = pos(fig, g.a), D = pos(fig, g.b);
    if (f.kind === 'segment') return (samePos(A, C) && samePos(B, D)) || (samePos(A, D) && samePos(B, C));
    if (f.kind === 'line') return collinear(A, B, C) && collinear(A, B, D);
    return samePos(A, C) && collinear(A, B, D) && param(A, B, D) > EPS;   // ray: same endpoint, same direction
  }
  // Is point X on figure f?
  function onFigure(fig, f, x) {
    const A = pos(fig, f.a), B = pos(fig, f.b), X = pos(fig, x);
    if (!collinear(A, B, X)) return false;
    const t = param(A, B, X);
    if (f.kind === 'segment') return t >= -EPS && t <= 1 + EPS;
    if (f.kind === 'ray') return t >= -EPS;
    return true;
  }
  // Every correct name for f using the points in the figure (segment names use its endpoints only).
  function names(fig, f) {
    if (f.kind === 'segment') return [[f.a, f.b], [f.b, f.a]];
    const pts = Object.keys(fig.points), out = [];
    for (const p of pts) for (const q of pts) if (p !== q && same(fig, f, { kind: f.kind, a: p, b: q })) out.push([p, q]);
    return out;
  }
  // Rays VA and VB are opposite when they share endpoint V and point exactly opposite ways.
  function opposite(fig, v, a, b) {
    const V = pos(fig, v), A = pos(fig, a), B = pos(fig, b);
    return collinear(A, V, B) && param(V, A, B) < -EPS;
  }
  // Is point m strictly between a and b on one line?
  function between(fig, a, m, b) {
    const A = pos(fig, a), M = pos(fig, m), B = pos(fig, b);
    if (!collinear(A, B, M)) return false;
    const t = param(A, B, M);
    return t > EPS && t < 1 - EPS;
  }
  const collinearPts = (fig, a, b, c) => collinear(pos(fig, a), pos(fig, b), pos(fig, c));

  // ---------- Moving points ----------
  const inBounds = P => P.x >= 1 - 1e-9 && P.x <= W - 1 + 1e-9 && P.y >= 1 - 1e-9 && P.y <= H - 1 + 1e-9;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  // The two points that make an equilateral triangle with A and B.
  function apexes(A, B) {
    const d = sub(B, A), h = Math.sqrt(3) / 2, mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    return [{ x: mid.x - d.y * h, y: mid.y + d.x * h }, { x: mid.x + d.y * h, y: mid.y - d.x * h }];
  }
  // Where a dragged point lands. Free points snap to the grid, or onto a "magnet" line when the
  // pointer is close, so a point can land exactly on a line. Points built on a line slide along it
  // in steps of about one unit. Returns null when the move isn't allowed (off the grid, or on top
  // of another point). A magnet with `for` pulls only that point.
  function snapMove(fig, name, M, magnets = []) {
    magnets = magnets.filter(mg => !mg.for || mg.for === name);
    const p = fig.points[name];
    let next;
    if (p.tanFrom || p.tanLine) return null;       // built from other points; it moves with them
    if (p.circ) {
      // A point on a circle slides around it in 5 degree steps, so arcs and angles stay whole numbers.
      const C = pos(fig, p.circ), deg = Math.atan2(M.y - C.y, M.x - C.x) * 180 / Math.PI;
      next = { circ: p.circ, deg: ((Math.round(deg / 5) * 5) % 360 + 360) % 360 };
    } else if (p.on) {
      const A = pos(fig, p.on[0]), B = pos(fig, p.on[1]);
      const step = 1 / len(sub(B, A));
      const t = Math.round(param(A, B, M) / step) * step;
      next = { on: p.on, t };
    } else {
      let best = { x: clamp(Math.round(M.x), 1, W - 1), y: clamp(Math.round(M.y), 1, H - 1) };
      // A point magnet comes first: { apex: [a, b] } pulls the point to where it makes an
      // equilateral triangle with a and b (never a grid point, so it needs a magnet to reach).
      const apex = magnets.filter(mg => mg.apex && !mg.apex.includes(name))
        .map(mg => apexes(pos(fig, mg.apex[0]), pos(fig, mg.apex[1])).find(P => len(sub(M, P)) < 0.5)).find(Boolean);
      // A line magnet is a line through two points, [a, b]; a line through point `at` that is
      // perpendicular or parallel to line `of`: { at, dir: 'perp' | 'par', of: [a, b] }; or the
      // perpendicular bisector of a segment, { bis: [a, b] }, where every point is as far from a as from b.
      for (const mg of apex ? [] : magnets) {
        let A, d;
        if (mg.apex) continue;
        if (Array.isArray(mg)) {
          if (mg.includes(name)) continue;
          A = pos(fig, mg[0]); d = sub(pos(fig, mg[1]), A);
        } else if (mg.bis) {
          if (mg.bis.includes(name)) continue;
          const P = pos(fig, mg.bis[0]), Q = pos(fig, mg.bis[1]), e = sub(Q, P);
          A = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 }; d = { x: -e.y, y: e.x };
        } else {
          if (mg.at === name || mg.of.includes(name)) continue;
          A = pos(fig, mg.at);
          const e = sub(pos(fig, mg.of[1]), pos(fig, mg.of[0]));
          d = mg.dir === 'perp' ? { x: -e.y, y: e.x } : e;
        }
        const u = { x: d.x / len(d), y: d.y / len(d) };
        const s = dot(sub(M, A), u);
        const foot = { x: A.x + s * u.x, y: A.y + s * u.y };
        if (len(sub(M, foot)) > 0.45) continue;
        // Prefer a grid point that is exactly on the line; otherwise step along the line in whole units.
        const lattice = { x: Math.round(M.x), y: Math.round(M.y) };
        const onIt = Math.abs(cross(d, sub(lattice, A))) <= EPS * Math.max(1, len(d) * len(sub(lattice, A)));
        if (onIt && len(sub(lattice, M)) < 0.75) { best = lattice; break; }
        const k = Math.round(s);
        best = { x: A.x + k * u.x, y: A.y + k * u.y };
        break;
      }
      next = apex || best;
    }
    const trial = Object.assign({}, fig, { points: Object.assign({}, fig.points, { [name]: next }) });
    const P = pos(trial, name);
    if (!inBounds(P)) return null;
    for (const other of Object.keys(fig.points)) {
      if (other === name) continue;
      if (samePos(P, pos(trial, other))) return null;
    }
    // Moving an anchor must not push a point built on its line off the grid or onto another point.
    for (const other of Object.keys(fig.points)) {
      if (other === name) continue;
      const Q = pos(trial, other);
      if (!inBounds(Q) && inBounds(pos(fig, other))) return null;
      for (const third of Object.keys(fig.points)) if (third !== other && samePos(Q, pos(trial, third))) return null;
    }
    // A transversal figure keeps its shape: P stays between the points that name its line and Q
    // between theirs (so the eight angle names still fit), and t never lies along either line.
    const tv = fig.transversal;
    if (tv && !(between(trial, tv.l[0], tv.P, tv.l[1]) && between(trial, tv.m[0], tv.Q, tv.m[1]) &&
      !collinearPts(trial, tv.l[0], tv.l[1], tv.Q) && !collinearPts(trial, tv.m[0], tv.m[1], tv.P))) return null;
    // Two crossing lines stay crossing at their point, with it between the points on each line.
    const cr = fig.crossing;
    if (cr && !(cr.lines.every(([a, b]) => between(trial, a, cr.at, b)) && !collinearPts(trial, cr.lines[0][0], cr.lines[0][1], cr.lines[1][0]))) return null;
    // A triangle never flattens into a line.
    if ((fig.triangles || []).some(t => collinearPts(trial, ...t))) return null;
    return next;
  }
  // One arrow-key step: a free point moves one grid unit; a point on a line moves one unit along it.
  function keyMove(fig, name, dx, dy, magnets) {
    const p = fig.points[name];
    const P = pos(fig, name);
    if (p.circ) {
      // Right or up goes counterclockwise, left or down clockwise, one 5 degree step.
      const C = pos(fig, p.circ), a = (p.deg + (dx + dy > 0 ? 5 : -5)) * Math.PI / 180, r = radius(fig, p.circ);
      return snapMove(fig, name, { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) }, magnets);
    }
    if (p.on) {
      const A = pos(fig, p.on[0]), B = pos(fig, p.on[1]), d = sub(B, A), u = { x: d.x / len(d), y: d.y / len(d) };
      const sign = (dx * u.x + dy * u.y) >= 0 ? 1 : -1;
      return snapMove(fig, name, { x: P.x + sign * u.x, y: P.y + sign * u.y }, magnets);
    }
    return snapMove(fig, name, { x: P.x + dx, y: P.y + dy }, []);
  }

  // ---------- Planes ----------
  // A flat diagram can't show depth, so which points lie in a plane is part of how the figure is
  // built (fig.planes[i].pts), not something measured. A point built on a line through two points
  // of a plane is in that plane too.
  const plane = (fig, label) => (fig.planes || []).find(p => p.label === label);
  // Is P inside the plane's drawn shape? Used only by Explore's plane, where the rule for the
  // sandbox is: a point dragged inside the drawing is in the plane.
  function insideQuad(quad, P) {
    let inside = false;
    for (let i = 0, j = quad.length - 1; i < quad.length; j = i++) {
      const [xi, yi] = quad[i], [xj, yj] = quad[j];
      if ((yi > P.y) !== (yj > P.y) && P.x < (xj - xi) * (P.y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function inPlane(fig, label, name) {
    const pl = plane(fig, label);
    if (!pl) return false;
    if (pl.byShape) return !!fig.points[name] && insideQuad(pl.quad, pos(fig, name));
    if (pl.pts.includes(name)) return true;
    const p = fig.points[name];
    return !!(p && p.on && inPlane(fig, label, p.on[0]) && inPlane(fig, label, p.on[1]));
  }
  // Which plane does a name describe? "M" -> plane M; three points -> the plane holding all three,
  // as long as they aren't on one line (then many planes go through them).
  function resolvePlane(fig, pts) {
    if (pts.length === 1) return plane(fig, pts[0]) ? { label: pts[0] } : { error: 'noPlane', pt: pts[0] };
    if (pts.length !== 3) return { error: 'count' };
    const missing = pts.find(p => !fig.points[p]);
    if (missing) return { error: 'noPoint', pt: missing };
    if (collinearPts(fig, pts[0], pts[1], pts[2])) return { error: 'collinear' };
    const pl = (fig.planes || []).find(p => pts.every(n => inPlane(fig, p.label, n)));
    if (!pl) {
      const home = (fig.planes || [])[0];
      return { error: 'notIn', pt: home ? pts.find(n => !inPlane(fig, home.label, n)) : pts[0], plane: home && home.label };
    }
    return { label: pl.label };
  }
  // A line lies in a plane when two of its points do. A line through one point of the plane and
  // one point outside it crosses the plane at that one point.
  const lineInPlane = (fig, a, b, label) => inPlane(fig, label, a) && inPlane(fig, label, b);
  function lineCrossesAt(fig, a, b, label) {
    const ia = inPlane(fig, label, a), ib = inPlane(fig, label, b);
    return ia === ib ? null : ia ? a : b;
  }
  function planeNames(fig, label) {
    const pts = Object.keys(fig.points).filter(n => inPlane(fig, label, n));
    const out = [[label]];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) for (let k = j + 1; k < pts.length; k++) {
      if (!collinearPts(fig, pts[i], pts[j], pts[k])) out.push([pts[i], pts[j], pts[k]]);
    }
    return out;
  }

  // ---------- Angles ----------
  // An angle is [a, v, b]: two rays from vertex v, through a and through b. Named with three
  // points, vertex in the middle (the convention these notes teach).
  function angleDeg(fig, a, v, b) {
    const V = pos(fig, v), u = sub(pos(fig, a), V), w = sub(pos(fig, b), V);
    return Math.atan2(Math.abs(cross(u, w)), dot(u, w)) * 180 / Math.PI;
  }
  const DEG_EPS = 1e-7;
  function angleKind(deg) {
    if (Math.abs(deg - 90) < DEG_EPS) return 'right';
    if (Math.abs(deg - 180) < DEG_EPS) return 'straight';
    return deg < 90 ? 'acute' : 'obtuse';
  }
  const sameRay = (fig, v, a, w, b) => same(fig, { kind: 'ray', a: v, b: a }, { kind: 'ray', a: w, b: b });
  // Two names describe the same angle when they have the same vertex and the same two rays.
  function sameAngle(fig, g, h) {
    if (!samePos(pos(fig, g[1]), pos(fig, h[1]))) return false;
    return (sameRay(fig, g[1], g[0], h[1], h[0]) && sameRay(fig, g[1], g[2], h[1], h[2]))
      || (sameRay(fig, g[1], g[0], h[1], h[2]) && sameRay(fig, g[1], g[2], h[1], h[0]));
  }
  const oppRays = (fig, v, a, b) => opposite(fig, v, a, b);
  // Angles that share a vertex: vertical (each ray of one is opposite a ray of the other), a linear
  // pair (one shared ray, the other two opposite), adjacent (one shared ray), or no name.
  function sameVertexPair(fig, g, h) {
    const v = g[1];
    const shared = [[0, 0], [0, 2], [2, 0], [2, 2]].find(([i, j]) => sameRay(fig, v, g[i], v, h[j]));
    if (shared) {
      const gi = shared[0] === 0 ? 2 : 0, hj = shared[1] === 0 ? 2 : 0;
      return oppRays(fig, v, g[gi], h[hj]) ? 'linear pair' : 'adjacent';
    }
    const vertical = (oppRays(fig, v, g[0], h[0]) && oppRays(fig, v, g[2], h[2])) || (oppRays(fig, v, g[0], h[2]) && oppRays(fig, v, g[2], h[0]));
    return vertical ? 'vertical' : null;
  }
  // Lines through (a, b) and (c, d) are parallel when their directions don't cross.
  function parallel(fig, a, b, c, d) {
    const u = sub(pos(fig, b), pos(fig, a)), w = sub(pos(fig, d), pos(fig, c));
    return Math.abs(cross(u, w)) <= EPS * Math.max(1, len(u) * len(w));
  }

  // ...and perpendicular when their directions meet at a right angle.
  function perpendicular(fig, a, b, c, d) {
    const u = sub(pos(fig, b), pos(fig, a)), w = sub(pos(fig, d), pos(fig, c));
    return Math.abs(dot(u, w)) <= EPS * Math.max(1, len(u) * len(w));
  }
  const lineRelation = (fig, a, b, c, d) => (parallel(fig, a, b, c, d) ? 'parallel' : perpendicular(fig, a, b, c, d) ? 'perpendicular' : null);

  // ---------- A transversal ----------
  // fig.transversal = { l: [a, b], m: [c, d], t: [e, f], P, Q }: line t crosses line l at P and
  // line m at Q. Every angle at P or Q is described by which side of t it opens to, whether it lies
  // between l and m (interior), and which way along t its t-ray points. Those describe the pair
  // names in the figure's own frame, so the names don't change when the figure is turned.
  function tInfo(fig, g) {
    const T = fig.transversal, V = pos(fig, g[1]);
    const onT = x => collinearPts(fig, T.t[0], T.t[1], x);
    const tRay = onT(g[0]) ? g[0] : g[2], other = tRay === g[0] ? g[2] : g[0];
    const tdir = sub(pos(fig, T.t[1]), pos(fig, T.t[0]));
    const across = g[1] === T.P ? T.Q : T.P;
    return {
      side: Math.sign(cross(tdir, sub(pos(fig, other), V))),
      interior: dot(sub(pos(fig, tRay), V), sub(pos(fig, across), V)) > 0,
      along: Math.sign(dot(sub(pos(fig, tRay), V), tdir)),
    };
  }
  function anglePair(fig, g, h) {
    if (samePos(pos(fig, g[1]), pos(fig, h[1]))) return sameVertexPair(fig, g, h);
    if (!fig.transversal) return null;
    const a = tInfo(fig, g), b = tInfo(fig, h);
    if (a.side === b.side && a.along === b.along) return 'corresponding';
    if (a.interior && b.interior) return a.side === b.side ? 'same-side interior' : 'alternate interior';
    if (!a.interior && !b.interior) return a.side === b.side ? 'same-side exterior' : 'alternate exterior';
    return null;
  }
  // What a pair's name tells you. Vertical angles and linear pairs are always related; the
  // transversal pairs only when the two lines are parallel.
  function pairRelation(fig, name) {
    if (name === 'vertical') return 'congruent';
    if (name === 'linear pair') return 'supplementary';
    const T = fig.transversal;
    if (!T || !parallel(fig, T.l[0], T.l[1], T.m[0], T.m[1])) return null;
    if (['corresponding', 'alternate interior', 'alternate exterior'].includes(name)) return 'congruent';
    if (['same-side interior', 'same-side exterior'].includes(name)) return 'supplementary';
    return null;
  }
  // Angle measures and congruent angles, for the Measurements panel and the arc marks.
  function measureAngles(fig) {
    const list = (fig.angles || []).map(g => ({ pts: g, deg: angleDeg(fig, ...g) }));
    const groups = [];
    for (const x of list) {
      x.kind = angleKind(x.deg);
      x.exact = Math.abs(x.deg - Math.round(x.deg)) < DEG_EPS;
      x.text = x.exact ? String(Math.round(x.deg)) : x.deg.toFixed(1);
      if (x.kind === 'right') continue;            // right angles get a box, never arcs
      const g = groups.find(gr => Math.abs(gr[0].deg - x.deg) < DEG_EPS);
      if (g) g.push(x); else groups.push([x]);
    }
    const classes = groups.filter(g => g.length > 1);
    classes.forEach((g, i) => g.forEach(x => { x.arcs = i + 1; }));
    return { angles: list, congruent: classes.map(g => g.map(x => x.pts)) };
  }

  // ---------- Measurements and congruence ----------
  // Every segment the figure shows: each pair of labeled points that lie on one drawn figure.
  // Lengths are compared exactly (squared lengths within a tiny tolerance), so congruent segments
  // are grouped by the geometry, never by rounded numbers.
  function measure(fig, extra = []) {
    const objs = (fig.objects || []).concat(extra);
    const names = Object.keys(fig.points), seen = new Set(), segs = [];
    for (const o of objs) {
      const on = names.filter(n => onFigure(fig, o, n)).sort();
      for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
        const key = on[i] + on[j];
        if (seen.has(key)) continue;
        seen.add(key);
        const A = pos(fig, on[i]), B = pos(fig, on[j]);
        segs.push({ pts: [on[i], on[j]], sq: dot(sub(B, A), sub(B, A)) });
      }
    }
    const same = (a, b) => Math.abs(a.sq - b.sq) <= 1e-9 * Math.max(1, a.sq, b.sq);
    // Congruence classes: segments with exactly equal lengths.
    const groups = [];
    for (const s of segs) {
      const g = groups.find(gr => same(gr[0], s));
      if (g) g.push(s); else groups.push([s]);
    }
    // Displayed lengths: one decimal, or more when two different lengths would round alike.
    for (const g of groups) {
      const v = Math.sqrt(g[0].sq);
      let dp = 1;
      while (dp < 3 && groups.some(h => h !== g && Math.sqrt(h[0].sq).toFixed(dp) === v.toFixed(dp))) dp++;
      const exact = Math.abs(v - Math.round(v)) < 1e-9;
      for (const s of g) { s.value = v; s.text = exact ? String(Math.round(v)) : v.toFixed(dp); s.exact = exact; }
    }
    segs.sort((a, b) => a.pts.join('').localeCompare(b.pts.join('')));
    // Tick marks: the first congruent group (by name) gets one tick, the next two, and so on, so
    // the marks stay put while points are dragged.
    const key = g => g.map(s => s.pts.join('')).sort()[0];
    const classes = groups.filter(g => g.length > 1).sort((a, b) => key(a).localeCompare(key(b)));
    classes.forEach((g, i) => g.forEach(s => { s.ticks = i + 1; }));
    return { segments: segs, congruent: classes.map(g => g.map(s => s.pts).sort((a, b) => a.join('').localeCompare(b.join('')))) };
  }

  // ---------- Triangles ----------
  // A triangle is three point names. Its sides and angles are compared exactly, so a triangle is
  // isosceles only when two sides really are congruent (the tick marks agree).
  const sqLen = (fig, a, b) => { const d = sub(pos(fig, b), pos(fig, a)); return dot(d, d); };
  const eqSq = (p, q) => Math.abs(p - q) <= 1e-9 * Math.max(1, p, q);
  // The interior angles, vertex in the middle: at a, at b, at c.
  const triAngles = t => [[t[2], t[0], t[1]], [t[0], t[1], t[2]], [t[1], t[2], t[0]]];
  // By sides: equilateral (3 congruent), isosceles (at least 2), scalene (none). Isosceles is
  // inclusive, so an equilateral triangle is isosceles too; `sides` gives the most specific name.
  function triSides(fig, t) {
    const [a, b, c] = t, s = [sqLen(fig, a, b), sqLen(fig, b, c), sqLen(fig, c, a)];
    const pairs = [eqSq(s[0], s[1]), eqSq(s[1], s[2]), eqSq(s[2], s[0])].filter(Boolean).length;
    return pairs === 3 ? 'equilateral' : pairs === 1 ? 'isosceles' : 'scalene';
  }
  // By angles: right (one 90 degree angle), obtuse (one over 90), or acute (all under 90).
  function triKind(fig, t) {
    const kinds = triAngles(t).map(g => angleKind(angleDeg(fig, ...g)));
    return kinds.includes('right') ? 'right' : kinds.includes('obtuse') ? 'obtuse' : 'acute';
  }
  const isTriangle = (fig, t) => !collinearPts(fig, ...t);
  // Two names describe the same triangle when they use the same three vertices, in any order.
  // △t ≅ △u when all three pairs of sides are congruent (SSS). Returns u's vertices reordered to
  // match t's (the correspondence the name must show), or null.
  function congruentTri(fig, t, u) {
    const side = (p, q) => sqLen(fig, p, q);
    const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(ix => ix.map(i => u[i]));
    return orders.find(v => eqSq(side(t[0], t[1]), side(v[0], v[1])) && eqSq(side(t[1], t[2]), side(v[1], v[2])) && eqSq(side(t[2], t[0]), side(v[2], v[0]))) || null;
  }
  // △t ∼ △u when all three pairs of sides are in the same ratio (SSS similarity). Returns u's
  // vertices in matching order and the scale factor k (u's sides are k times t's), or null.
  function similarTri(fig, t, u) {
    const side = (p, q) => sqLen(fig, p, q);
    const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(ix => ix.map(i => u[i]));
    for (const v of orders) {
      const r = side(v[0], v[1]) / side(t[0], t[1]);
      if (eqSq(side(v[1], v[2]), r * side(t[1], t[2])) && eqSq(side(v[2], v[0]), r * side(t[2], t[0]))) return { order: v, k: Math.sqrt(r) };
    }
    return null;
  }
  // Does the statement "△t ≅ △u" (or ∼), in exactly this vertex order, hold?
  function triStatement(fig, t, u, rel) {
    const r = sqLen(fig, u[0], u[1]) / sqLen(fig, t[0], t[1]);
    if (rel === 'congruent' && !eqSq(r, 1)) return false;
    return eqSq(sqLen(fig, u[1], u[2]), r * sqLen(fig, t[1], t[2])) && eqSq(sqLen(fig, u[2], u[0]), r * sqLen(fig, t[2], t[0]));
  }
  const sameTri = (fig, t, u) => t.length === 3 && u.length === 3 && t.every(p => u.some(q => samePos(pos(fig, p), pos(fig, q))));

  // ---------- Circles ----------
  // fig.circles = [{ c: 'P', r }]: a circle is named by its center (⊙P).
  function radius(fig, c) { const k = (fig.circles || []).find(x => x.c === c); if (!k) throw new Error('There is no circle ' + c + '.'); return k.r; }
  const onCircle = (fig, c, n) => Math.abs(len(sub(pos(fig, n), pos(fig, c))) - radius(fig, c)) < 1e-7;
  // An arc from a to b on circle c. With `via`, the arc through that point; with `opp`, the arc
  // that doesn't contain that point (an inscribed angle's intercepted arc); otherwise the minor arc.
  function arcDeg(fig, arc) {
    const m = angleDeg(fig, arc.a, arc.c, arc.b);
    if (Math.abs(m - 180) < DEG_EPS) return 180;
    const inMinor = x => Math.abs(angleDeg(fig, arc.a, arc.c, x) + angleDeg(fig, x, arc.c, arc.b) - m) < 1e-7;
    if (arc.via) return inMinor(arc.via) ? m : 360 - m;
    if (arc.opp) return inMinor(arc.opp) ? 360 - m : m;
    return m;
  }
  // Congruent arcs: arcs of the same circle with the same measure, in groups of two or more (the
  // order of fig.arcs). Arcs are compared within one circle only.
  function congruentArcs(fig) {
    const groups = [];
    for (const arc of fig.arcs || []) {
      const d = arcDeg(fig, arc), g = groups.find(x => x.c === arc.c && Math.abs(x.deg - d) < DEG_EPS);
      if (g) g.arcs.push(arc); else groups.push({ c: arc.c, deg: d, arcs: [arc] });
    }
    return groups.filter(g => g.arcs.length > 1).map(g => g.arcs);
  }
  const arcKind = (fig, arc) => { const d = arcDeg(fig, arc); return Math.abs(d - 180) < DEG_EPS ? 'semicircle' : d < 180 ? 'minor' : 'major'; };
  // Which part of circle c a segment or line is. A diameter is a chord too; `part` gives the most specific name.
  function circlePart(fig, c, o) {
    const C = pos(fig, c), isC = n => samePos(pos(fig, n), C), on = n => onCircle(fig, c, n);
    if (o.kind === 'segment') {
      if ((isC(o.a) && on(o.b)) || (isC(o.b) && on(o.a))) return 'radius';
      if (on(o.a) && on(o.b)) return collinear(pos(fig, o.a), C, pos(fig, o.b)) ? 'diameter' : 'chord';
      return null;
    }
    if (o.kind === 'line') {
      const A = pos(fig, o.a), B = pos(fig, o.b), dist = Math.abs(cross(sub(B, A), sub(C, A))) / len(sub(B, A)), r = radius(fig, c);
      return Math.abs(dist - r) < 1e-7 ? 'tangent' : dist < r ? 'secant' : null;
    }
    return null;
  }
  // An angle is inscribed when its vertex is on the circle and both sides meet it again; central
  // when its vertex is the center.
  // Circumscribed when its vertex is outside and both sides are tangent (each side meets the circle
  // at a point where it is perpendicular to the radius).
  function angleAtCircle(fig, c, g) {
    if (samePos(pos(fig, g[1]), pos(fig, c))) return 'central';
    if (onCircle(fig, c, g[1]) && onCircle(fig, c, g[0]) && onCircle(fig, c, g[2])) return 'inscribed';
    const tangentAt = n => onCircle(fig, c, n) && perpendicular(fig, c, n, n, g[1]);
    return len(sub(pos(fig, g[1]), pos(fig, c))) > radius(fig, c) && tangentAt(g[0]) && tangentAt(g[2]) ? 'circumscribed' : null;
  }

  // ---------- Text mirror ----------
  function facts(fig) {
    const points = Object.keys(fig.points).map(n => {
      const P = pos(fig, n);
      return { name: n, x: round2(P.x), y: round2(P.y) };
    });
    const figures = (fig.objects || []).map(f => ({ kind: f.kind, names: names(fig, f) }));
    const planes = (fig.planes || []).map(p => ({ label: p.label, pts: Object.keys(fig.points).filter(n => inPlane(fig, p.label, n)) }));
    return { points, figures, planes };
  }
  const round2 = v => Math.round(v * 100) / 100;

  return { W, H, KINDS, pos, collinear, collinearPts, param, same, onFigure, names, opposite, between, snapMove, keyMove,
    plane, inPlane, resolvePlane, lineInPlane, lineCrossesAt, planeNames, measure, facts, round2,
    angleDeg, angleKind, sameAngle, anglePair, pairRelation, parallel, perpendicular, lineRelation, measureAngles,
    apexes, triAngles, triSides, triKind, isTriangle, sameTri, congruentTri, similarTri, triStatement,
    radius, onCircle, arcDeg, congruentArcs, arcKind, circlePart, angleAtCircle };
})();
