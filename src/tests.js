/* Tests for the geometry engine, notation and lessons. Open geo-notes-tests.html; results show on
   the page and in window.testSummary. */
(() => {
  'use strict';
  const results = [];
  const LV = key => Tasks.LEVELS.find(l => l.key === key);
  const t = (name, fn) => {
    try { const r = fn(); results.push({ name, ok: r === true, info: r === true ? '' : String(r) }); }
    catch (e) { results.push({ name, ok: false, info: 'threw: ' + e.message }); }
  };
  const L = (a, b) => ({ kind: 'line', a, b }), S = (a, b) => ({ kind: 'segment', a, b }), R = (a, b) => ({ kind: 'ray', a, b });
  // A(8,5) B(12,7) C(16,9) E(4,3) are on one line; D(3,9) is not.
  const F = { points: { A: { x: 8, y: 5 }, B: { x: 12, y: 7 }, C: { on: ['A', 'B'], t: 2 }, D: { x: 3, y: 9 }, E: { on: ['A', 'B'], t: -1 } }, objects: [] };

  // ---------- Which figure a name describes ----------
  t('line from any two of its points', () => Geom.same(F, L('A', 'B'), L('C', 'A')) && Geom.same(F, L('A', 'B'), L('B', 'C')) || 'failed');
  t('line through an off-line point is different', () => !Geom.same(F, L('A', 'B'), L('A', 'D')) || 'failed');
  t('segment AB is segment BA', () => Geom.same(F, S('A', 'B'), S('B', 'A')) || 'failed');
  t('segment AB is not segment AC', () => !Geom.same(F, S('A', 'B'), S('A', 'C')) || 'failed');
  t('ray AB is not ray BA', () => !Geom.same(F, R('A', 'B'), R('B', 'A')) || 'failed');
  t('ray AB is ray AC when C is past B', () => Geom.same(F, R('A', 'B'), R('A', 'C')) || 'failed');
  t('ray AB is not ray AE when E is behind A', () => !Geom.same(F, R('A', 'B'), R('A', 'E')) || 'failed');
  t('different kinds are never the same', () => !Geom.same(F, L('A', 'B'), R('A', 'B')) && !Geom.same(F, S('A', 'B'), L('A', 'B')) || 'failed');
  t('all names of a line', () => Geom.names(F, L('A', 'B')).length === 12 || Geom.names(F, L('A', 'B')).length);   // 4 points: 4 x 3 ordered pairs
  t('all names of ray AB', () => Geom.names(F, R('A', 'B')).map(p => p.join('')).sort().join() === 'AB,AC' || JSON.stringify(Geom.names(F, R('A', 'B'))));
  t('segment names use endpoints only', () => Geom.names(F, S('A', 'C')).map(p => p.join('')).join() === 'AC,CA' || 'failed');
  t('opposite rays', () => Geom.opposite(F, 'A', 'B', 'E') && !Geom.opposite(F, 'A', 'B', 'C') || 'failed');
  t('between', () => Geom.between(F, 'A', 'B', 'C') && !Geom.between(F, 'A', 'C', 'B') && !Geom.between(F, 'A', 'D', 'B') || 'failed');
  t('point on a segment, ray, line', () => Geom.onFigure(F, S('A', 'C'), 'B') && !Geom.onFigure(F, S('A', 'B'), 'C') && Geom.onFigure(F, R('A', 'B'), 'C') && !Geom.onFigure(F, R('A', 'B'), 'E') && Geom.onFigure(F, L('A', 'B'), 'E') || 'failed');
  t('built points stay on their line when an anchor moves', () => {
    const f = JSON.parse(JSON.stringify(F));
    f.points.B = { x: 9, y: 3 };
    return Geom.collinearPts(f, 'A', 'B', 'C') && Geom.collinearPts(f, 'A', 'B', 'E') || 'failed';
  });

  // ---------- Moving points ----------
  t('free points snap to the grid', () => { const n = Geom.snapMove(F, 'D', { x: 4.3, y: 7.8 }); return n.x === 4 && n.y === 8 || JSON.stringify(n); });
  t('a point can not land on another point', () => Geom.snapMove(F, 'D', { x: 8.2, y: 5.1 }) === null || 'allowed');
  t('an anchor can not push a built point off the grid', () => Geom.snapMove(F, 'B', { x: 18, y: 12 }) === null || 'allowed');
  t('points stay on the grid', () => Geom.snapMove(F, 'D', { x: 30, y: 40 }).x <= 19 || 'off grid');
  t('a magnet line pulls a point exactly onto it', () => {
    const f = { points: { A: { x: 3, y: 4 }, B: { x: 7, y: 6 }, D: { x: 14, y: 4 } }, objects: [] };
    const n = Geom.snapMove(f, 'D', { x: 11.1, y: 8.3 }, [['A', 'B']]);
    const g = { points: Object.assign({}, f.points, { D: n }), objects: [] };
    return Geom.collinearPts(g, 'A', 'B', 'D') || JSON.stringify(n);
  });
  t('a point on a line slides along it', () => {
    const n = Geom.snapMove(F, 'C', { x: 14.5, y: 8.6 });
    const g = { points: Object.assign({}, F.points, { C: n }), objects: [] };
    return (n.on && Geom.collinearPts(g, 'A', 'B', 'C')) || JSON.stringify(n);
  });
  t('arrow keys move a free point one unit', () => { const n = Geom.keyMove(F, 'D', 1, 0); return n.x === 4 && n.y === 9 || JSON.stringify(n); });

  // ---------- Measurements and congruence ----------
  // A(1,1) B(4,5) is length 5; C(7,1) D(10,5) is length 5; E(2,8) F(4,9) is sqrt 5.
  const MF = { points: { A: { x: 1, y: 1 }, B: { x: 4, y: 5 }, C: { x: 7, y: 1 }, D: { x: 10, y: 5 }, E: { x: 2, y: 8 }, F: { x: 4, y: 9 } },
    objects: [S('A', 'B'), S('C', 'D'), S('E', 'F')] };
  t('segment lengths', () => { const m = Geom.measure(MF); const ab = m.segments.find(s => s.pts.join('') === 'AB'); return ab.text === '5' && ab.exact || JSON.stringify(ab); });
  t('an inexact length is marked as rounded', () => { const ef = Geom.measure(MF).segments.find(s => s.pts.join('') === 'EF'); return !ef.exact && ef.text === '2.2' || JSON.stringify(ef); });
  t('congruent segments are grouped exactly', () => JSON.stringify(Geom.measure(MF).congruent) === '[[["A","B"],["C","D"]]]' || JSON.stringify(Geom.measure(MF).congruent));
  t('points on a line give every segment between them', () => Geom.measure(F, [L('A', 'B')]).segments.map(s => s.pts.join('')).join() === 'AB,AC,AE,BC,BE,CE' || Geom.measure(F, [L('A', 'B')]).segments.map(s => s.pts.join('')).join());
  t('lengths that would round alike get another decimal', () => {
    // AB = sqrt(41) = 6.403..., CD = 6.4: both round to 6.4, but they are not congruent.
    const f = { points: { A: { x: 1, y: 1 }, B: { x: 5, y: 6 }, C: { x: 10, y: 1 }, D: { x: 16.4, y: 1 } }, objects: [S('A', 'B'), S('C', 'D')] };
    const m = Geom.measure(f);
    const t1 = m.segments.find(s => s.pts.join('') === 'AB').text, t2 = m.segments.find(s => s.pts.join('') === 'CD').text;
    return t1 !== t2 || `${t1} and ${t2} look equal`;
  });
  t('tick marks: each congruent group gets its own count, non-congruent get none', () => {
    const f = { points: { A: { x: 1, y: 1 }, B: { x: 4, y: 5 }, C: { x: 7, y: 1 }, D: { x: 10, y: 5 }, E: { x: 1, y: 9 }, F: { x: 3, y: 9 }, G: { x: 6, y: 9 }, H: { x: 8, y: 9 }, J: { x: 12, y: 2 }, K: { x: 13, y: 9 } },
      objects: [S('A', 'B'), S('C', 'D'), S('E', 'F'), S('G', 'H'), S('J', 'K')] };
    const t1 = Object.fromEntries(Geom.measure(f).segments.map(s => [s.pts.join(''), s.ticks || 0]));
    return t1.AB === 1 && t1.CD === 1 && t1.EF === 2 && t1.GH === 2 && t1.JK === 0 || JSON.stringify(t1);
  });
  t('a length that moves stops being congruent', () => {
    const f = JSON.parse(JSON.stringify(MF)); f.points.D = { x: 10, y: 6 };
    return Geom.measure(f).congruent.length === 0 || 'still congruent';
  });

  // ---------- Notation ----------
  const p = s => { const r = Notation.parse(s); return r.error ? 'error' : `${r.kind}:${(r.pts || []).join('')}`; };
  t('reads loose spellings', () => {
    const cases = { 'segment AB': 'segment:AB', 'seg ab': 'segment:AB', 'line segment BA': 'segment:BA', 'ray BA': 'ray:BA', 'Line cd': 'line:CD', 'AB': 'null:AB', 'ray A B': 'ray:AB', '→AB': 'ray:AB', '<->PQ': 'line:PQ' };
    for (const [k, v] of Object.entries(cases)) if (p(k) !== v) return `${k} read as ${p(k)}`;
    return true;
  });
  t('rejects names that are not two points', () => ['ray A', 'segment ABC', 'line AA', '', 'ray 12'].every(s => p(s) === 'error') || 'accepted one');
  t('notes lowercase letters', () => Notation.parse('ray ab').lowercase === true && !Notation.parse('ray AB').lowercase || 'failed');
  t('speaks a name', () => Notation.speak('ray', ['A', 'B']) === 'ray A B' || Notation.speak('ray', ['A', 'B']));

  // ---------- Checking answers ----------
  const f1 = Tasks.LEVEL1.rays.tasks[1].fig;
  t('typed ray, correct', () => Tasks.checkName(f1, f1.objects[0], 'ray DE').status === 'good' || 'failed');
  t('typed ray, backwards is Almost', () => Tasks.checkName(f1, f1.objects[0], 'ray ED').status === 'almost' || 'failed');
  t('typed a line for a ray', () => Tasks.checkName(f1, f1.objects[0], 'line DE').status === 'bad' || 'failed');
  t('bare AB asks which figure', () => Tasks.checkName(f1, f1.objects[0], 'DE').status === 'ask' || 'failed');
  t('unknown point', () => /no point Q/.test(Tasks.checkName(f1, f1.objects[0], 'ray DQ').message) || 'failed');

  // ---------- Planes ----------
  const PL = { points: { A: { x: 4, y: 3 }, B: { x: 8, y: 5 }, C: { on: ['A', 'B'], t: 2 }, D: { x: 13, y: 3 }, E: { x: 9, y: 12 } }, objects: [],
    planes: [{ label: 'M', pts: ['A', 'B', 'D'], quad: [[2, 2], [13, 2], [18, 9], [7, 9]] }] };
  const planeName = s => Tasks.checkName(PL, { kind: 'plane', label: 'M' }, s).status;
  t('plane by its letter', () => planeName('plane M') === 'good' || planeName('plane M'));
  t('plane by three points, any order', () => ['plane ABD', 'plane DBA', 'plane CDA'].every(s => planeName(s) === 'good') || 'rejected one');
  t('a point on a line in the plane is in the plane', () => Geom.inPlane(PL, 'M', 'C') || 'failed');
  t('three collinear points do not name a plane', () => planeName('plane ABC') === 'almost' || planeName('plane ABC'));
  t('a point outside the plane', () => /E isn't in plane M/.test(Tasks.checkName(PL, { kind: 'plane', label: 'M' }, 'plane ABE').message) || 'failed');
  t('a plane needs one letter or three points', () => Notation.parse('plane AB').error && !Notation.parse('plane M').error && !Notation.parse('plane ABC').error || 'failed');
  t('a line lies in a plane when two of its points do', () => Geom.lineInPlane(PL, 'A', 'D', 'M') && !Geom.lineInPlane(PL, 'A', 'E', 'M') || 'failed');
  t('a line through one point of a plane crosses it there', () => Geom.lineCrossesAt(PL, 'E', 'D', 'M') === 'D' && Geom.lineCrossesAt(PL, 'A', 'D', 'M') === null || 'failed');
  t('a plane letter is correct on every plane task', () => Object.values(Tasks.LEVEL1.planes.tasks).filter(x => x.type === 'name').every(x => Tasks.checkName(x.fig, { kind: 'plane', label: x.fig.targetPlane }, 'plane ' + x.fig.targetPlane).status === 'good') || 'a letter was rejected');

  // ---------- Capital and lowercase letters (a learning target) ----------
  const LK = { points: { G: { x: 3, y: 10 }, H: { x: 12, y: 4 } }, objects: [{ kind: 'line', a: 'G', b: 'H', label: 'k' }] };
  const lineName = s => Tasks.checkName(LK, LK.objects[0], s);
  t('reads a line’s one-letter name and keeps its case', () => Notation.parse('line k').letter === 'k' && Notation.parse('line K').letter === 'K' || 'failed');
  t('keeps the case of point letters as typed', () => Notation.parse('ray qP').raw.join('') === 'qP' && Notation.parse('ray qP').pts.join('') === 'QP' || 'failed');
  t('line k is correct', () => lineName('line k').status === 'good' || lineName('line k').message);
  t('line K is Almost: a line’s letter is lowercase', () => { const r = lineName('line K'); return r.status === 'almost' && /lowercase/.test(r.message) && r.fix.pts[0] === 'k' || JSON.stringify(r); });
  t('line gh is Almost: points are capitals', () => { const r = lineName('line gh'); return r.status === 'almost' && /capital/.test(r.message) && r.fix.pts.join('') === 'GH' || JSON.stringify(r); });
  t('a two-point name also lists the letter name', () => lineName('line GH').others[0] === 'k' || JSON.stringify(lineName('line GH').others));
  t('a letter on a line with no letter', () => /no letter/.test(Tasks.checkName(F, L('A', 'B'), 'line m').message) || 'failed');
  t('plane n is Almost: a plane’s letter is a capital', () => { const r = Tasks.checkName(PL, { kind: 'plane', label: 'M' }, 'plane m'); return r.status === 'almost' && /capital/.test(r.message) || JSON.stringify(r); });
  t('plane abd is Almost: points are capitals', () => { const r = Tasks.checkName(PL, { kind: 'plane', label: 'M' }, 'plane abd'); return r.status === 'almost' && r.fix.pts.join('') === 'ABD' || JSON.stringify(r); });
  t('a backwards lowercase ray gets both fixes', () => { const r = Tasks.checkName(f1, f1.objects[0], 'ray ed'); return r.status === 'almost' && r.fix.pts.join('') === 'DE' && /capital/.test(r.message) || JSON.stringify(r); });

  // ---------- Angles ----------
  const pol = (v, r, d) => ({ x: v.x + r * Math.cos(d * Math.PI / 180), y: v.y + r * Math.sin(d * Math.PI / 180) });
  const V0 = { x: 10, y: 7 };
  // Lines AC (20 degrees) and BD (95 degrees) cross at E; S sits on ray EA past A.
  const X4 = { points: { E: V0, A: pol(V0, 6, 200), C: pol(V0, 6, 20), B: pol(V0, 5, 95), D: pol(V0, 5, 275), S: pol(V0, 8, 200) }, objects: [] };
  const deg = (...g) => Math.round(Geom.angleDeg(X4, ...g) * 1000) / 1000;
  t('angle measures', () => deg('A', 'E', 'B') === 105 && deg('B', 'E', 'C') === 75 && deg('A', 'E', 'C') === 180 || `${deg('A', 'E', 'B')}, ${deg('B', 'E', 'C')}`);
  t('angle kinds', () => ['acute', 'right', 'obtuse', 'straight'].join() === [45, 90, 120, 180].map(Geom.angleKind).join() || 'failed');
  t('the same angle by different names', () => Geom.sameAngle(X4, ['A', 'E', 'B'], ['B', 'E', 'A']) && Geom.sameAngle(X4, ['A', 'E', 'B'], ['S', 'E', 'B']) && !Geom.sameAngle(X4, ['A', 'E', 'B'], ['B', 'E', 'C']) || 'failed');
  t('vertical angles and linear pairs', () => Geom.anglePair(X4, ['A', 'E', 'B'], ['C', 'E', 'D']) === 'vertical' && Geom.anglePair(X4, ['A', 'E', 'B'], ['B', 'E', 'C']) === 'linear pair' || 'failed');
  const angName = s => Tasks.checkAngleName(Object.assign({}, X4, { angles: [['A', 'E', 'B']] }), ['A', 'E', 'B'], s);
  t('angle names: vertex in the middle', () => angName('angle AEB').status === 'good' && angName('<BEA').status === 'good' && angName('∠SEB').status === 'good' && /middle/.test(angName('∠EAB').message) || 'failed');
  t('a one-letter angle name is Almost', () => { const r = angName('∠E'); return r.status === 'almost' && /three points/.test(r.message) || JSON.stringify(r); });
  t('m∠ in a naming task is Almost', () => angName('m∠AEB').status === 'almost' || 'failed');
  const meas = s => Tasks.checkMeasure(X4, ['A', 'E', 'B'], s);
  t('measures: every spelling', () => ['m∠AEB = 105°', 'm<AEB=105', 'm angle AEB = 105 degrees', 'measure of angle BEA = 105'].every(s => meas(s).status === 'good') || ['m∠AEB = 105°', 'm<AEB=105', 'm angle AEB = 105 degrees', 'measure of angle BEA = 105'].map(s => meas(s).status).join());
  t('a measure without m is Almost', () => { const r = meas('∠AEB = 105'); return r.status === 'almost' && r.fix.kind === 'measure' || JSON.stringify(r); });
  t('a wrong number', () => meas('m∠AEB = 75').status === 'bad' || 'failed');

  // ---------- A transversal ----------
  const TF = Tasks.LEVELS.find(l => l.key === '3').parts.transversals.tasks[0].fig;
  const pr = (g, h) => Geom.anglePair(TF, g.split(''), h.split(''));
  t('transversal pair names', () => {
    const want = { 'APE CQP': 'corresponding', 'BPQ CQP': 'alternate interior', 'QPB PQD': 'same-side interior', 'APE DQF': 'alternate exterior', 'EPB DQF': 'same-side exterior', 'EPB PQD': 'corresponding', 'APE BPQ': 'vertical', 'APE EPB': 'linear pair', 'APE PQD': null };
    for (const [k, v] of Object.entries(want)) { const [g, h] = k.split(' '); if (pr(g, h) !== v) return `${k}: ${pr(g, h)}`; }
    return true;
  });
  t('pair names survive turning the figure upside down', () => {
    const f = JSON.parse(JSON.stringify(TF));
    for (const n of Object.keys(f.points)) if (!f.points[n].on) { f.points[n].x = 20 - f.points[n].x; f.points[n].y = 14 - f.points[n].y; }
    return Geom.anglePair(f, ['A', 'P', 'E'], ['C', 'Q', 'P']) === 'corresponding' && Geom.anglePair(f, ['B', 'P', 'Q'], ['C', 'Q', 'P']) === 'alternate interior' || 'names changed';
  });
  t('parallel lines: congruent or supplementary', () => Geom.pairRelation(TF, 'corresponding') === 'congruent' && Geom.pairRelation(TF, 'same-side interior') === 'supplementary' || 'failed');
  t('not parallel: the pair names stay, the relationship goes', () => {
    const f = JSON.parse(JSON.stringify(TF)); f.points.C = { x: 2, y: 1 };
    return Geom.anglePair(f, ['A', 'P', 'E'], ['C', 'Q', 'P']) === 'corresponding' && Geom.pairRelation(f, 'corresponding') === null || 'failed';
  });
  t('reads line relationships', () => {
    const r1 = Notation.parse('line m || line n'), r2 = Notation.parse('AB ⊥ ef'), r3 = Notation.parse('t is perpendicular to m');
    return r1.rel === 'parallel' && r1.left.letter === 'm' && r2.rel === 'perpendicular' && r2.right.lowercase && r3.rel === 'perpendicular' || 'failed';
  });
  const PPF = Tasks.LEVELS.find(l => l.key === '3').parts.lines.tasks[0].fig;
  t('writing m ⊥ t', () => ['m ⊥ t', 't perp m', 'line m is perpendicular to line t', 'AB ⊥ EF'].every(s => Tasks.checkRelation(PPF, ['m', 't'], s).status === 'good') || ['m ⊥ t', 't perp m', 'line m is perpendicular to line t', 'AB ⊥ EF'].map(s => Tasks.checkRelation(PPF, ['m', 't'], s).status).join());
  t('the wrong sign is explained', () => /right angle/.test(Tasks.checkRelation(PPF, ['m', 't'], 'm ∥ t').message) || 'failed');
  t('case in a relationship is Almost', () => Tasks.checkRelation(PPF, ['m', 't'], 'M ⊥ T').status === 'almost' && Tasks.checkRelation(PPF, ['m', 't'], 'ab ⊥ ef').status === 'almost' || 'failed');

  // ---------- Algebra ----------
  const ev = (s, x) => Algebra.parse(s)(x);
  t('reads expressions, with implicit multiplication', () => ev('2x+10', 3) === 16 && ev('2(x+1)', 4) === 10 && ev('3 x', 2) === 6 && ev('x2', 5) === 10 && ev('−(x−4)', 1) === 3 && ev('(3x − 4) + (x + 6)', 5) === 22 || 'failed');
  const VERT = { rel: { is: 'equal', a: '2x+10', b: '3x-20' }, hint: 'h', find: { name: 'AEB', expr: '2x+10', angle: true },
    wrong: [{ rel: { is: 'sum', parts: ['2x+10', '3x-20'], total: 180 }, why: 'VERTICAL' }] };
  t('an equation in any arrangement', () => ['2x + 10 = 3x - 20', '3x-20=2x+10', '2x+10-(3x-20)=0', '4x+20 = 6x-40', '30 = x'].slice(0, 4).every(s => Algebra.checkSetup(VERT, s).status === 'good') || ['2x + 10 = 3x - 20', '3x-20=2x+10', '2x+10-(3x-20)=0', '4x+20 = 6x-40'].map(s => Algebra.checkSetup(VERT, s).status).join());
  t('the wrong relationship is named', () => Algebra.checkSetup(VERT, '2x + 10 + 3x - 20 = 180').message === 'VERTICAL' || 'failed');
  t('an equation that says nothing is rejected', () => Algebra.checkSetup(VERT, '2x+10 = 2x+10').status === 'bad' || 'failed');
  t('letters other than x', () => /with x/.test(Algebra.checkSetup(VERT, 'AB + BC = AC').message) || 'failed');
  t('solving: x = 30, 30 = x, 30', () => ['x = 30', '30 = x', '30'].every(s => Algebra.checkSolve(VERT, s).status === 'good') && Algebra.checkSolve(VERT, 'x = 20').status === 'bad' || 'failed');
  t('finding the measure', () => Algebra.checkFind(VERT, 'm∠AEB = 70°').status === 'good' && Algebra.checkFind(VERT, '70').status === 'good' && Algebra.checkFind(VERT, '∠AEB = 70').status === 'almost' && Algebra.checkFind(VERT, 'm∠AEB = 60').status === 'bad' || 'failed');
  function validAlgebra(p) {
    const form = Algebra.relForm(p.rel), x = Algebra.root(form), v = Algebra.parse(p.find.expr)(x);
    if (!form || !isFinite(x)) return 'no single solution';
    if (Math.abs(x - Math.round(x)) > 1e-9 || Math.abs(v - Math.round(v)) > 1e-9) return `x = ${x}, answer ${v}: not whole numbers`;
    // Every expression on the figure is positive, and angle labels match the drawing.
    for (const lb of p.fig.labels || []) {
      const val = Algebra.parse(lb.text)(x);
      if (!(val > 0)) return `${lb.text} is ${val} when x = ${x}`;
      if (lb.angle && Math.abs(Geom.angleDeg(p.fig, ...lb.angle) - val) > 1e-6) return `∠${lb.angle.join('')} is drawn ${Geom.angleDeg(p.fig, ...lb.angle).toFixed(1)}° but its expression gives ${val}°`;
      if (lb.arc && Math.abs(Geom.arcDeg(p.fig, lb.arc) - val) > 1e-6) return `arc ${lb.arc.a}${lb.arc.b} is drawn ${Geom.arcDeg(p.fig, lb.arc).toFixed(1)}° but its expression gives ${val}°`;
    }
    // Segment labels: drawn lengths are in proportion to their values.
    const segs = (p.fig.labels || []).filter(lb => lb.seg);
    if (segs.length > 1) {
      const len = s => Math.hypot(Geom.pos(p.fig, s[1]).x - Geom.pos(p.fig, s[0]).x, Geom.pos(p.fig, s[1]).y - Geom.pos(p.fig, s[0]).y);
      const k = len(segs[0].seg) / Algebra.parse(segs[0].text)(x);
      for (const s of segs) if (Math.abs(len(s.seg) / Algebra.parse(s.text)(x) - k) > 1e-6) return `${s.seg.join('')} isn't drawn to scale`;
    }
    const setup = Algebra.checkSetup(p, p.rel.is === 'equal' ? `${p.rel.a} = ${p.rel.b}` : `${p.rel.parts.join(' + ')} = ${p.rel.total}`);
    if (setup.status !== 'good') return 'its own equation is rejected: ' + setup.message;
    for (const w of p.wrong || []) if (Algebra.sameForm(Algebra.relForm(w.rel), form)) return 'a "wrong" relationship gives the right equation';
    return true;
  }
  for (const L of Tasks.LEVELS) (L.algebra || []).forEach((p, i) => t(`level ${L.key} algebra ${i + 1}`, () => validAlgebra(p)));
  t('every level has an Explore and an Algebra set; bridges are lessons', () => Tasks.LEVELS.every(L => L.bridge ? !L.explore && Object.keys(L.parts).length : L.explore && L.explore().fig && (L.algebra || []).length >= 3) || 'missing');
  t('Explore’s plane: points inside the drawing are in it', () => {
    const f = { points: { A: { x: 7, y: 4 }, B: { x: 2, y: 12 } }, objects: [], planes: [{ label: 'M', quad: [[1, 1], [11, 1], [15, 6.5], [5, 6.5]], pts: [], byShape: true }] };
    return Geom.inPlane(f, 'M', 'A') && !Geom.inPlane(f, 'M', 'B') || 'failed';
  });

  // ---------- Explore sandboxes move freely, but keep their shape ----------
  const setPt = (f, n, v) => Object.assign({}, f, { points: Object.assign({}, f.points, { [n]: v }) });
  t('Level 2 Explore: the crossing point moves, and C and D slide', () => {
    const f = LV('2').explore().fig;
    return !!(Geom.snapMove(f, 'E', { x: 11, y: 7 }) && Geom.snapMove(f, 'C', Geom.pos(f, 'E')) === null && Geom.keyMove(f, 'D', -1, 0)) || 'failed';
  });
  t('Level 2 Explore: C can’t slide past E', () => {
    const f = LV('2').explore().fig, A = Geom.pos(f, 'A');
    return Geom.snapMove(f, 'C', { x: A.x - 0.2, y: A.y - 0.2 }) === null || 'C slid past E';
  });
  t('Level 3 Explore: each line moves on its own', () => {
    const f = LV('3').explore().fig;
    const m = Geom.snapMove(f, 'B', { x: 17, y: 11 }), n = Geom.snapMove(f, 'C', { x: 3, y: 3 }), tt = Geom.snapMove(f, 'P', { x: 10, y: 10 });
    return !!(m && n && tt) || [m, n, tt].map(Boolean).join();
  });
  t('Level 3 Explore: n snaps parallel to m, and the pairs follow', () => {
    const task = LV('3').explore(), f = task.fig;
    const D = Geom.snapMove(f, 'D', { x: 16, y: 4.2 }, task.magnets);
    if (!D) return 'the move was blocked';
    const g = setPt(f, 'D', D);
    return Geom.lineRelation(g, 'A', 'B', 'C', 'D') === 'parallel' && Geom.measureAngles(g).congruent.length === 2 || JSON.stringify(D);
  });
  t('Level 3 Explore: P stays between A and B, and t never lies along m', () => {
    const f = LV('3').explore().fig;
    // A small figure where moving D would put Q on line m, so t would lie along m.
    const g = { points: { A: { x: 2, y: 7 }, B: { x: 18, y: 7 }, P: { on: ['A', 'B'], t: 0.25 }, C: { x: 2, y: 1 }, D: { x: 18, y: 5 }, Q: { on: ['C', 'D'], t: 0.5 },
      E: { on: ['P', 'Q'], t: -0.35 }, F: { on: ['P', 'Q'], t: 1.35 } }, objects: [], transversal: { l: ['A', 'B'], m: ['C', 'D'], t: ['E', 'F'], P: 'P', Q: 'Q' } };
    return Geom.snapMove(f, 'P', { x: 18.6, y: 10 }) === null && Geom.snapMove(g, 'D', { x: 18, y: 12 }) !== null && Geom.snapMove(g, 'D', { x: 18, y: 13 }) === null || 'failed';
  });

  // ---------- Triangles ----------
  const TRIF = pts => ({ points: pts, objects: [], triangles: [['A', 'B', 'C']] });
  t('triangle notation: △ABC, triangle abc, tri ABC', () => p('△ABC') === 'triangle:ABC' && p('triangle abc') === 'triangle:ABC' && p('tri A B C') === 'triangle:ABC' && Notation.parse('△ABCD').error && Notation.parse('triangle abc').lowercase || 'failed');
  t('classify by sides, isosceles inclusive', () => {
    const iso = TRIF({ A: { x: 2, y: 2 }, B: { x: 8, y: 2 }, C: { x: 5, y: 9 } }), sc = TRIF({ A: { x: 2, y: 2 }, B: { x: 9, y: 2 }, C: { x: 4, y: 7 } });
    const eq = LV('b2').parts.classify.tasks[2].fig;
    return Geom.triSides(iso, ['A', 'B', 'C']) === 'isosceles' && Geom.triSides(sc, ['A', 'B', 'C']) === 'scalene' && Geom.triSides(eq, ['A', 'B', 'C']) === 'equilateral'
      && Tasks.goalMet(eq, { is: 'tri', tri: ['A', 'B', 'C'], sides: 'isosceles' }) || 'failed';
  });
  t('classify by angles', () => {
    const r = TRIF({ A: { x: 2, y: 2 }, B: { x: 8, y: 2 }, C: { x: 2, y: 9 } }), o = TRIF({ A: { x: 2, y: 2 }, B: { x: 8, y: 2 }, C: { x: 11, y: 5 } }), a = TRIF({ A: { x: 2, y: 2 }, B: { x: 8, y: 2 }, C: { x: 5, y: 9 } });
    return Geom.triKind(r, ['A', 'B', 'C']) === 'right' && Geom.triKind(o, ['A', 'B', 'C']) === 'obtuse' && Geom.triKind(a, ['A', 'B', 'C']) === 'acute' || 'failed';
  });
  t('the equilateral magnet reaches the off-grid point', () => {
    const f = TRIF({ A: { x: 5, y: 3 }, B: { x: 13, y: 3 }, C: { x: 14, y: 11 } });
    const n = Geom.snapMove(f, 'C', { x: 9, y: 10 }, [{ apex: ['A', 'B'] }]);
    return Geom.triSides(setPt(f, 'C', n), ['A', 'B', 'C']) === 'equilateral' || JSON.stringify(n);
  });
  t('a triangle can’t be flattened', () => Geom.snapMove(TRIF({ A: { x: 2, y: 2 }, B: { x: 8, y: 2 }, C: { x: 5, y: 6 } }), 'C', { x: 11, y: 2 }) === null || 'allowed');
  t('every triangle type is reachable in Explore', () => {
    const task = LV('4').explore(), f = task.fig, want = new Set();
    for (let x = 1; x <= 19; x++) for (let y = 1; y <= 13; y++) for (const dx of [0, 0.3]) {
      const n = Geom.snapMove(f, 'C', { x: x + dx, y: y + dx }, task.magnets);
      if (n) { const g = setPt(f, 'C', n); want.add(Geom.triSides(g, ['A', 'B', 'C']) + ' ' + Geom.triKind(g, ['A', 'B', 'C'])); }
    }
    const all = ['scalene acute', 'scalene right', 'scalene obtuse', 'isosceles acute', 'isosceles right', 'isosceles obtuse', 'equilateral acute'];
    const missing = all.filter(k => !want.has(k));
    return !missing.length || 'unreachable: ' + missing.join(', ');
  });
  t('Explore has two triangles, and magnets pull only their own vertex', () => {
    const task = LV('4').explore(), f = task.fig;
    if (f.triangles.length !== 2) return 'not two triangles';
    // D dragged near the perpendicular bisector of AB stays on the grid point: that magnet is C's.
    const n = Geom.snapMove(f, 'D', { x: 5.3, y: 12 }, task.magnets);
    return n && n.x === 5 && n.y === 12 || JSON.stringify(n);
  });
  t('triangle statements: ≅, ~=, ∼, ~, words', () => {
    const k = s => { const r = Notation.parse(s); return r.kind === 'triRel' && !r.error ? `${r.rel}:${r.left.pts.join('')}:${r.right.pts.join('')}` : 'x'; };
    return k('△ABC ≅ △DEF') === 'congruent:ABC:DEF' && k('tri ABC ~= tri DEF') === 'congruent:ABC:DEF' && k('△ABC ∼ △FDE') === 'similar:ABC:FDE'
      && k('triangle ABC is similar to triangle DEF') === 'similar:ABC:DEF' && k('△ABC ~ △DEF') === 'similar:ABC:DEF' && Notation.parse('ABC ≅ DEF').noSign || 'failed';
  });
  t('a statement in the wrong letter order is Almost, with the fix', () => {
    const f = LV('4').parts.congSim.tasks[0].fig;
    const good = Tasks.checkTriRel(f, 'congruent', '△ABC ≅ △EFD'), order = Tasks.checkTriRel(f, 'congruent', '△ABC ≅ △DEF', true), hidden = Tasks.checkTriRel(f, 'congruent', '△ABC ≅ △DEF'), sim = Tasks.checkTriRel(LV('4').parts.congSim.tasks[4].fig, 'similar', '△ABC ≅ △FDE');
    return good.status === 'good' && order.status === 'almost' && order.fixText === '△ABC ≅ △EFD' && hidden.status === 'almost' && !hidden.fixText && !/EFD/.test(hidden.message) && sim.status === 'bad' || JSON.stringify([good, order, sim]);
  });
  t('similar triangles and their scale factor', () => {
    const f = LV('4').parts.congSim.tasks[4].fig, s = Geom.similarTri(f, ['A', 'B', 'C'], ['D', 'E', 'F']);
    return s && s.order.join('') === 'FDE' && Math.abs(s.k - 2) < 1e-9 && !Geom.congruentTri(f, ['A', 'B', 'C'], ['D', 'E', 'F']) || JSON.stringify(s);
  });
  t('congruence shortcuts come from the givens: SSS, SAS, ASA, AAS, HL; SSA and AAA are not enough', () => {
    const k = q => Tasks.congCriteria(Object.assign({ stmt: ['ABC', 'DEF'] }, q)).join() || 'none';
    const cases = [[{ sides: [0, 1, 2] }, 'SSS'], [{ sides: [0, 1], angles: [1] }, 'SAS'], [{ angles: [0, 1], sides: [0] }, 'ASA'], [{ angles: [0, 1], sides: [2] }, 'AAS'],
      [{ right: 0, sides: [1, 2] }, 'HL'], [{ sides: [0, 1], angles: [0] }, 'none'], [{ angles: [0, 1, 2] }, 'none'], [{ sides: [0, 2], shared: 1 }, 'SSS'], [{ sides: [0, 1], vertical: 1 }, 'SAS']];
    const bad = cases.filter(([q, want]) => k(q) !== want).map(([q, want]) => `${JSON.stringify(q)} gave ${k(q)}, not ${want}`);
    return !bad.length || bad.join('; ');
  });
  // Every true answer is accepted: all shortcuts the givens support, and inclusive names.
  const accepted = (f, q) => { const a = Tasks.chooseAnswer(f, q); return [a.answer].concat((a.also || []).map(x => x.opt)); };
  t('shortcut questions on parallel-line figures accept both ASA and AAS', () => {
    const tasks = LV('4').parts.congruent.tasks.filter(x => x.q && x.q.c === 'crit' && /^m ∥ n and (E Is the Midpoint of AD|BE ≅ CE)\./.test(x.ask));
    if (tasks.length !== 2) return `found ${tasks.length} of the 2 questions`;
    const bad = tasks.filter(x => !['ASA', 'AAS'].every(c => accepted(x.fig, x.q).includes(c)));
    return !bad.length || bad.map(x => `${x.ask}: ${accepted(x.fig, x.q).join(', ')}`).join('; ');
  });
  t('an equilateral triangle is accepted as isosceles, and a diameter as a chord', () => {
    const eq = LV('b2').parts.classify.tasks[2].fig;
    if (!accepted(eq, { c: 'triSides', tri: ['A', 'B', 'C'] }).includes('Isosceles')) return 'equilateral not accepted as isosceles';
    const d = LV('5').parts.parts.tasks.find(x => x.q && x.q.c === 'circlePart' && Tasks.chooseAnswer(x.fig, x.q).answer === 'Diameter');
    if (!d) return 'no diameter question found';
    return accepted(d.fig, d.q).includes('Chord') || 'diameter not accepted as a chord';
  });
  t('arcs of equal measure in one circle are grouped as congruent; unequal ones are not', () => {
    const f = { points: { P: { x: 8, y: 7 }, A: { circ: 'P', deg: 210 }, B: { circ: 'P', deg: 90 }, C: { circ: 'P', deg: 330 } }, objects: [], circles: [{ c: 'P', r: 5 }],
      arcs: [{ c: 'P', a: 'A', b: 'B', opp: 'C' }, { c: 'P', a: 'B', b: 'C', opp: 'A' }, { c: 'P', a: 'A', b: 'C', opp: 'B' }] };
    const g = Geom.congruentArcs(f);
    if (g.length !== 1 || g[0].length !== 3) return `expected one group of 3 arcs of 120 degrees, got ${JSON.stringify(g.map(x => x.length))}`;
    f.points.B.deg = 120;
    return Geom.congruentArcs(f).length === 0 || 'unequal arcs were grouped';
  });
  t('congruent triangles are written in matching order', () => {
    const f = { points: { A: { x: 1, y: 1 }, B: { x: 5, y: 1 }, C: { x: 1, y: 4 }, D: { x: 10, y: 5 }, E: { x: 10, y: 1 }, F: { x: 13, y: 1 } }, objects: [] };
    const m = Geom.congruentTri(f, ['A', 'B', 'C'], ['D', 'E', 'F']);
    return m && m.join('') === 'EDF' || (m ? m.join('') : 'not found');
  });

  // ---------- Circles ----------
  const CF = { points: { P: { x: 8, y: 7 }, A: { circ: 'P', deg: 20 }, B: { circ: 'P', deg: 90 }, C: { circ: 'P', deg: 220 }, E: { circ: 'P', deg: 200 } }, objects: [], circles: [{ c: 'P', r: 5 }] };
  t('circle and arc notation', () => {
    const k = s => { const r = Notation.parse(s); return r.error ? 'error' : `${r.kind}:${(r.pts || []).join('')}${r.measure ? ':m' : ''}${r.value != null ? '=' + r.value : ''}`; };
    const cases = { '⊙P': 'circle:P', 'circle p': 'circle:P', '⌒AB': 'arc:AB', 'arc acb': 'arc:ACB', 'm arc AB = 70': 'arc:AB:m=70', 'm⌒AB=70°': 'arc:AB:m=70', 'arc A': 'error' };
    for (const [s, v] of Object.entries(cases)) if (k(s) !== v) return `${s} read as ${k(s)}`;
    return true;
  });
  t('arc measures: minor, major, semicircle', () => Math.abs(Geom.arcDeg(CF, { c: 'P', a: 'A', b: 'B' }) - 70) < 1e-9 && Math.abs(Geom.arcDeg(CF, { c: 'P', a: 'A', b: 'B', via: 'C' }) - 290) < 1e-9
    && Math.abs(Geom.arcDeg(CF, { c: 'P', a: 'A', b: 'B', opp: 'C' }) - 70) < 1e-9 && Geom.arcKind(CF, { c: 'P', a: 'A', b: 'E', via: 'B' }) === 'semicircle' || 'failed');
  t('arc names: a major arc needs three letters', () => {
    const t1 = { c: 'P', a: 'A', b: 'B', via: 'C' };
    return Tasks.checkArcName(CF, t1, '⌒ACB').status === 'good' && Tasks.checkArcName(CF, t1, '⌒AEB').status === 'good' && Tasks.checkArcName(CF, t1, '⌒AB').status === 'almost'
      && Tasks.checkArcName(CF, { c: 'P', a: 'A', b: 'B' }, 'arc ba').status === 'almost' && Tasks.checkArcName(CF, { c: 'P', a: 'A', b: 'B' }, 'm⌒AB').status === 'almost' || 'failed';
  });
  t('arc measure is written with m', () => {
    const t1 = { c: 'P', a: 'A', b: 'B' };
    return Tasks.checkArcMeasure(CF, t1, 'm⌒AB = 70°').status === 'good' && Tasks.checkArcMeasure(CF, t1, '⌒AB = 70').status === 'almost' && Tasks.checkArcMeasure(CF, t1, 'm⌒AB = 60').status === 'bad' || 'failed';
  });
  t('parts of a circle', () => {
    const f = LV('5').parts.parts.tasks[0].fig, g = LV('5').parts.parts.tasks[5].fig;
    return ['radius', 'diameter', 'chord'].every((k, i) => Geom.circlePart(f, 'P', f.objects[i]) === k) && Geom.circlePart(g, 'P', g.objects[1]) === 'tangent' && Geom.circlePart(g, 'P', g.objects[2]) === 'secant' || 'failed';
  });
  t('a point on a circle slides in 5 degree steps', () => {
    const n = Geom.snapMove(CF, 'A', { x: 8 + 5 * Math.cos(0.7), y: 7 + 5 * Math.sin(0.7) });
    return n.circ === 'P' && n.deg === 40 && Geom.onCircle(setPt(CF, 'A', n), 'P', 'A') || JSON.stringify(n);
  });
  t('Explore: tangent segments stay congruent, and Q can’t go inside the circle', () => {
    const task = LV('5').explore(), f = task.fig;
    const d = (a, b) => Math.hypot(Geom.pos(f, a).x - Geom.pos(f, b).x, Geom.pos(f, a).y - Geom.pos(f, b).y);
    const moved = setPt(f, 'Q', Geom.snapMove(f, 'Q', { x: 13, y: 11 }));
    const d2 = (a, b) => Math.hypot(Geom.pos(moved, a).x - Geom.pos(moved, b).x, Geom.pos(moved, a).y - Geom.pos(moved, b).y);
    return Math.abs(d('Q', 'S') - d('Q', 'T')) < 1e-9 && Math.abs(d2('Q', 'S') - d2('Q', 'T')) < 1e-9 && Math.abs(Geom.angleDeg(moved, 'S', 'Q', 'P') - Geom.angleDeg(moved, 'P', 'Q', 'T')) < 1e-9
      && Geom.snapMove(f, 'Q', { x: 7, y: 7 }) === null || 'failed';
  });
  t('circumscribed angle: tangent sides, and it adds to 180° with its central angle', () => {
    const f = LV('5').explore().fig;
    for (const q of [{ x: 16, y: 7 }, { x: 13, y: 12 }, { x: 12, y: 2 }]) {
      const n = Geom.snapMove(f, 'Q', q), g = setPt(f, 'Q', n);
      if (Geom.angleAtCircle(g, 'P', ['S', 'Q', 'T']) !== 'circumscribed') return `Q at ${q.x}, ${q.y}: not circumscribed`;
      if (Math.abs(Geom.angleDeg(g, 'S', 'Q', 'T') + Geom.angleDeg(g, 'S', 'P', 'T') - 180) > 1e-9) return `Q at ${q.x}, ${q.y}: doesn't add to 180`;
    }
    return Geom.angleAtCircle(f, 'P', ['A', 'B', 'C']) === 'inscribed' && Geom.angleAtCircle(f, 'P', ['A', 'P', 'C']) === 'central' || 'angle types';
  });
  t('Explore: the inscribed angle is half the central angle on the same arc', () => {
    const f = LV('5').explore().fig;
    for (const deg of [40, 100, 150]) {
      const g = setPt(f, 'B', { circ: 'P', deg });
      if (Math.abs(Geom.angleDeg(g, 'A', 'B', 'C') * 2 - Geom.arcDeg(g, g.arcs[0])) > 1e-9) return `B at ${deg}°`;
    }
    return true;
  });

  // ---------- Every lesson task is valid and solvable ----------
  const nm = n => ({ kind: n.kind, a: n.pts[0], b: n.pts[1] });
  const perms3 = p => [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(ix => ix.map(i => p[i]));
  const valid = task => {
      const f = JSON.parse(JSON.stringify(task.fig));
      if (task.type === 'algebra') return validAlgebra(task);
      if (task.type === 'show' && task.names[0].kind === 'triangle') {
        if (!task.names.every(n => f.triangles.some(t => Geom.sameTri(f, t, n.pts)))) return 'a shown triangle name is wrong';
        // Two names on two triangles are a congruence or similarity statement: its order must be right.
        const [a, b] = task.names.map(n => n.pts);
        return task.names.length !== 2 || f.triangles.length < 2 || Geom.triStatement(f, a, b, 'similar') || 'the shown statement’s letter order is wrong';
      }
      if (task.type === 'show' && f.circles) {
        return task.names.every(n => n.kind === 'circle' ? f.circles.some(k => k.c === n.pts[0])
          : n.kind === 'arc' ? n.pts.every(q => Geom.onCircle(f, f.circles[0].c, q))
            : n.kind === 'angle' ? (f.angles || []).some(g => Geom.sameAngle(f, g, n.pts))
              : f.objects.some(o => Geom.same(f, o, nm(n)))) || 'a shown name is not in the figure';
      }
      if (task.type === 'name' && f.targetCircle) {
        return Tasks.checkCircleName(f, f.targetCircle, '⊙' + f.targetCircle).status === 'good' && Tasks.checkCircleName(f, f.targetCircle, f.targetCircle).status === 'ask' || 'circle name check is wrong';
      }
      if (task.type === 'name' && f.targetArc) {
        const names = Tasks.arcNames(f, f.targetArc);
        return names.length > 0 && names.every(p => Tasks.checkArcName(f, f.targetArc, '⌒' + p.join('')).status === 'good') || 'a correct arc name is rejected';
      }
      if (task.type === 'measure' && f.targetArc) {
        const n = Tasks.arcNames(f, f.targetArc)[0], d = Math.round(Geom.arcDeg(f, f.targetArc));
        if (Math.abs(Geom.arcDeg(f, f.targetArc) - d) > 1e-7) return 'the arc isn’t a whole number of degrees';
        for (const lb of f.labels || []) if (lb.angle && Math.abs(Geom.angleDeg(f, ...lb.angle) - parseFloat(lb.text)) > 1e-6) return `label ${lb.text} doesn’t match the drawing`;
        return Tasks.checkArcMeasure(f, f.targetArc, Notation.arcMeasureText(n, d)).status === 'good' || 'the correct arc measure is rejected';
      }
      if (task.type === 'measure' && f.labels) {
        for (const lb of f.labels) {
          const want = parseFloat(lb.text), got = lb.arc ? Geom.arcDeg(f, lb.arc) : lb.angle ? Geom.angleDeg(f, ...lb.angle) : want;
          if (Math.abs(got - want) > 1e-6) return `label ${lb.text} is drawn as ${got.toFixed(2)}`;
        }
      }
      if (task.type === 'triRel') {
        const [t3, u3] = f.triangles, m = task.want === 'congruent' ? Geom.congruentTri(f, t3, u3) : (Geom.similarTri(f, t3, u3) || {}).order;
        if (!m) return 'the triangles aren’t ' + task.want;
        if (Tasks.checkTriRel(f, task.want, Notation.triRelText(task.want, t3, m)).status !== 'good') return 'the correct statement is rejected';
        const wrongOrder = [m[1], m[0], m[2]];
        const w = Tasks.checkTriRel(f, task.want, Notation.triRelText(task.want, t3, wrongOrder));
        return Geom.triStatement(f, t3, wrongOrder, task.want) || w.status === 'almost' || 'a wrong letter order should be Almost';
      }
      if (task.type === 'corresp') {
        const want = Tasks.matchPart(task.stmt, task.part);
        if (!Geom.triStatement(f, task.stmt[0], task.stmt[1], 'similar')) return 'the given statement isn’t true';
        const typed = want.length === 2 ? 'segment ' + want.join('') : '∠' + want.join('');
        return Tasks.checkCorresp(f, task, typed).status === 'good' || 'the matching part is rejected';
      }
      if (task.type === 'name' && f.targetTri) {
        if (!perms3(f.targetTri).every(p => Tasks.checkTriName(f, f.targetTri, '△' + p.join('')).status === 'good')) return 'a correct triangle name is rejected';
        const extra = Object.keys(f.points).find(p => !f.targetTri.includes(p));
        if (extra && Tasks.checkTriName(f, f.targetTri, '△' + f.targetTri.slice(0, 2).join('') + extra).status === 'good') return 'a different triangle is accepted';
        return Tasks.checkTriName(f, f.targetTri, f.targetTri.join('')).status === 'ask' || 'a name with no triangle sign should ask';
      }
      if (task.type === 'opposite') {
        const t3 = f.triangles[0];
        if (task.given) { const side = t3.filter(p => p !== task.given[1]); return Tasks.checkOpposite(f, task, 'segment ' + side.join('')).status === 'good' && Tasks.checkOpposite(f, task, 'segment ' + task.given[1] + side[0]).status === 'bad' || 'opposite side check is wrong'; }
        const v = t3.find(p => !task.givenSide.includes(p)), g = Geom.triAngles(t3).find(x => x[1] === v);
        return Tasks.checkOpposite(f, task, '∠' + g.join('')).status === 'good' && Tasks.checkOpposite(f, task, '∠' + g.slice().reverse().join('')).status === 'good' || 'opposite angle check is wrong';
      }
      if (task.type === 'show' && task.names[0].kind === 'angle') return task.names.every(n => (f.angles || []).some(g => Geom.sameAngle(f, g, n.pts))) || 'a shown angle name is not in the figure';
      if (task.type === 'show' && task.names.every(n => n.kind === 'line' && n.pts.length === 1)) return task.names.every(n => f.objects.some(o => o.label === n.pts[0])) || 'a shown line letter is not in the figure';
      if (task.type === 'choose' && task.q.c === 'crit') {
        // The givens must be true in the drawing, and the two triangles really congruent in the stated order.
        const [t3, u3] = task.q.stmt.map(s => s.split('')), m = i => (i + 3) % 3;
        const len = (tri, i) => Math.hypot(Geom.pos(f, tri[i]).x - Geom.pos(f, tri[m(i + 1)]).x, Geom.pos(f, tri[i]).y - Geom.pos(f, tri[m(i + 1)]).y);
        const deg = (tri, i) => Geom.angleDeg(f, tri[m(i - 1)], tri[i], tri[m(i + 1)]);
        if (!Geom.triStatement(f, t3, u3, 'congruent')) return 'the triangles aren’t congruent in the stated order';
        const sides = (task.q.sides || []).concat(task.q.shared != null ? [task.q.shared] : []);
        if (sides.some(i => Math.abs(len(t3, i) - len(u3, i)) > 1e-7)) return 'a given side pair isn’t congruent';
        const angs = (task.q.angles || []).concat(task.q.vertical != null ? [task.q.vertical] : []);
        if (angs.some(i => Math.abs(deg(t3, i) - deg(u3, i)) > 1e-7)) return 'a given angle pair isn’t congruent';
        if (task.q.right != null && [t3, u3].some(t => Math.abs(deg(t, task.q.right) - 90) > 1e-7)) return 'a given right angle isn’t right';
        const a = Tasks.chooseAnswer(f, task.q);
        return task.options.includes(a.answer) || `answer "${a.answer}" is not an option`;
      }
      if (task.type === 'choose') {
        const a = Tasks.chooseAnswer(f, task.q);
        return task.options.includes(a.answer) && a.why.length > 5 || `answer "${a.answer}" is not an option`;
      }
      if (task.type === 'proof') {
        // Every step is true in the figure, and every reason is one of the choices.
        for (const r of task.rows) {
          if (!task.options.includes(r.r)) return `reason "${r.r}" is not a choice`;
          if (r.claim && !Tasks.claimTruth(f, r.claim)) return `step "${r.s}" is false in the figure`;
        }
        return task.rows.every(r => r.claim || r.r === 'Given') || 'a step has nothing to check it';
      }
      if (task.type === 'measure') {
        const deg = Math.round(Geom.angleDeg(f, ...f.targetAngle));
        return Tasks.checkMeasure(f, f.targetAngle, Notation.measureText(f.targetAngle, deg)).status === 'good' || 'the correct measure is rejected';
      }
      if (task.type === 'namePair') {
        const hits = f.angles.filter(g => Tasks.checkNamePair(f, task.given, task.want, '∠' + g.join('')).status === 'good');
        return hits.length === 1 || `${hits.length} angles make that pair`;
      }
      if (task.type === 'relate') {
        const [a, b] = task.lines.map(l => f.objects.find(o => o.label === l));
        const rel = Geom.lineRelation(f, a.a, a.b, b.a, b.b);
        return rel && Tasks.checkRelation(f, task.lines, `${task.lines[0]} ${rel === 'parallel' ? '∥' : '⊥'} ${task.lines[1]}`).status === 'good' || 'the correct relationship is rejected';
      }
      if (task.type === 'name' && f.targetAngle) {
        const names = Tasks.angleNames(f, f.targetAngle);
        return names.length >= 2 && names.every(p => Tasks.checkAngleName(f, f.targetAngle, '∠' + p.join('')).status === 'good') || 'a correct angle name is rejected';
      }
      if (task.type === 'show' && f.hlPlane) return task.names.every(n => Geom.resolvePlane(f, n.pts).label === f.hlPlane) || 'a shown plane name is wrong';
      if (task.type === 'show') return task.names.every(n => n.pts.length === 1 ? f.objects[0].label === n.pts[0] : Geom.same(f, f.objects[0], nm(n))) || 'a shown name is wrong';
      if (task.type === 'fixcase') {
        const target = f.targetTri ? { kind: 'triangle', pts: f.targetTri } : f.targetPlane ? { kind: 'plane', label: f.targetPlane } : f.objects[f.target];
        const wrong = Tasks.checkName(f, target, task.wrong);
        if (wrong.status !== 'almost' || !wrong.fix) return `"${task.wrong}" should be Almost with a fix, got ${wrong.status}`;
        const fixed = Tasks.checkName(f, target, Notation.text(wrong.fix.kind, wrong.fix.pts));
        return fixed.status === 'good' || `the fix ${Notation.text(wrong.fix.kind, wrong.fix.pts)} is not accepted`;
      }
      if (task.type === 'name' && f.targetPlane) {
        const names = Geom.planeNames(f, f.targetPlane);
        return names.length > 1 && names.every(p => Tasks.checkName(f, { kind: 'plane', label: f.targetPlane }, 'plane ' + p.join('')).status === 'good') || 'correct plane name rejected';
      }
      if (task.type === 'find' && task.wantIn) {
        const hits = f.objects.filter((o, k) => Tasks.checkFind(f, null, k, task.wantIn).status === 'good').length;
        return hits === 1 || `${hits} lines lie in the plane`;
      }
      if (task.type === 'name') {
        const target = f.objects[f.target];
        const good = Geom.names(f, target)[0];
        return Tasks.checkName(f, target, `${target.kind} ${good.join('')}`).status === 'good' || 'correct name rejected';
      }
      if (task.type === 'draw') return Tasks.checkDraw(f, task.want, nm(task.want)).status === 'good' && task.want.pts.every(q => f.points[q]) || 'cannot be drawn';
      if (task.type === 'find') {
        const hits = f.objects.filter(o => Geom.same(f, o, nm(task.want))).length;
        return hits === 1 || `${hits} figures match`;
      }
      if (task.type === 'same') { Tasks.sameReason(f, task.n1, task.n2); return true; }
      if (task.type === 'mistake') {
        const falses = task.claims.filter(c => !Tasks.claimTruth(f, c)).length;
        return falses === 1 || `${falses} false claims`;
      }
      if (task.type === 'build') {
        if (Tasks.goalMet(f, task.goal)) return 'already solved at the start';
        for (let x = 1; x <= 19; x++) for (let y = 1; y <= 13; y++) for (const dx of [0, 0.2, -0.2]) {
          const n = Geom.snapMove(f, task.move, { x: x + dx, y }, task.magnets);
          if (!n) continue;
          const g = setPt(f, task.move, n);
          if (Tasks.goalMet(g, task.goal)) return true;
        }
        return 'no reachable position meets the goal';
      }
      return 'unknown task type ' + task.type;
  };
  for (const L of Tasks.LEVELS) for (const [part, lesson] of Object.entries(L.parts)) {
    lesson.tasks.forEach((task, i) => t(`level ${L.key} ${part} ${i + 1} (${task.type})`, () => valid(task)));
  }
  // Parallel marks never claim more than the figure shows: lines with the same number of arrows are parallel.
  t('lines marked parallel (same number of arrows) are parallel in every lesson figure', () => {
    for (const L of Tasks.LEVELS) for (const lesson of Object.values(L.parts)) for (const task of lesson.tasks) {
      const par = (task.fig.marks || []).filter(m => m.par);
      for (const a of par) for (const b of par) {
        if (a === b || (a.arrows || 1) !== (b.arrows || 1)) continue;
        if (Geom.lineRelation(task.fig, a.par[0], a.par[1], b.par[0], b.par[1]) !== 'parallel') return `${a.par.join('')} and ${b.par.join('')} aren’t parallel: ${task.ask}`;
      }
    }
    return true;
  });
  // Common Mistakes: every question fits the grid, is valid, has distinct choices, and offers the
  // mistake itself (the trap) as a wrong choice.
  for (const g of Tasks.MISTAKES) g.list.forEach((m, i) => t(`Common Mistakes ${g.key}.${i + 1} (${m.name}): 40 questions`, () => {
    for (let k = 0; k < 40; k++) {
      const task = Tasks.mistakeQ(g.key, i);
      const off = Object.keys(task.fig.points).find(n => { const P = Geom.pos(task.fig, n); return !(P.x >= 0.9 && P.x <= 19.1 && P.y >= 0.9 && P.y <= 13.1); });
      if (off) return `point ${off} is off the grid: ${task.ask}`;
      const r = valid(task);
      if (r !== true) return `${r}: ${task.ask}`;
      if (new Set(task.options).size !== task.options.length) return `repeated choice: ${task.options.join(' | ')}`;
      if (task.q.trap && (!task.options.includes(task.q.trap) || task.q.trap === task.q.answer)) return `trap is not a wrong choice: ${task.q.trap}`;
      if (task.q.trap && !task.q.trapWhy) return 'trap has no rule';
    }
    return true;
  }));
  // More Practice: every kind of generated problem, many times over, must be valid and fit the grid.
  for (const [key, list] of Object.entries(Tasks.PRACTICE)) list.forEach((gen, i) => t(`level ${key} More Practice, kind ${i + 1}: 40 problems`, () => {
    for (let k = 0; k < 40; k++) {
      const task = gen();
      const off = Object.keys(task.fig.points).find(n => { const P = Geom.pos(task.fig, n); return !(P.x >= 0.9 && P.x <= 19.1 && P.y >= 0.9 && P.y <= 13.1); });
      if (off) return `point ${off} is off the grid: ${task.ask}`;
      const r = valid(task);
      if (r !== true) return `${r}: ${task.ask} ${JSON.stringify(task.fig.points)}`;
    }
    return true;
  }));
  t('transversal figures keep Q between C and D at every angle', () => {
    for (let d = 50; d <= 130; d += 5) {
      const f = Tasks.transAt(d);
      if (!Geom.between(f, 'C', 'Q', 'D') || !Geom.between(f, 'A', 'P', 'B')) return `at ${d}°, Q or P is outside its line’s points`;
      if (Math.abs(Geom.angleDeg(f, 'A', 'P', 'E') - d) > 1e-9 || Math.abs(Geom.angleDeg(f, 'C', 'Q', 'P') - d) > 1e-9) return `at ${d}°, the corresponding angles are wrong`;
    }
    return true;
  });
  t('More Practice changes kind each time', () => { const a = new Set(); for (let k = 0; k < 20; k++) a.add(Tasks.practice('4').type); return a.size > 1 || 'always the same'; });
  t('find-the-mistake answers name why', () => Object.values(Tasks.LEVEL1).every(l => l.tasks.filter(x => x.type === 'mistake').every(x => x.claims.every(c => Tasks.claimWhy(x.fig, c).length > 5))) || 'missing reason');
  t('60 generated naming problems are valid', () => {
    for (let i = 0; i < 60; i++) {
      const task = Tasks.generateName(), f = task.fig, target = f.objects[f.target];
      const good = Geom.names(f, target)[0];
      if (Tasks.checkName(f, target, `${target.kind} ${good.join('')}`).status !== 'good') return 'bad problem ' + JSON.stringify(f);
    }
    return true;
  });

  // ---------- The writing on the diagrams ----------
  // Every figure is drawn at phone width and checked: no letter, line name or expression may touch
  // another, sit on another point, run off the edge, or have a drawn line or circle through it.
  Diagram.mount(document.getElementById('svg'), {});
  const drawn = (f, task) => { Diagram.load(f, task ? { hideMeasures: !!task.hideMeasures, hlArc: f.targetArc, hlAngle: f.targetAngle } : {}); return Diagram.audit(); };
  t('the diagram can be measured on this page', () => drawn(Tasks.LEVELS[0].algebra[0].fig, Tasks.LEVELS[0].algebra[0]) !== null);
  t('no writing hides other writing or has a line through it, on every lesson and Algebra Connections figure', () => {
    const bad = []; let n = 0;
    for (const Lv of Tasks.LEVELS) {
      const tasks = [].concat(...Object.keys(Lv.parts || {}).map(k => Lv.parts[k].tasks || []), Lv.algebra || []);
      tasks.forEach((task, i) => { if (!task.fig) return; n++; const a = drawn(task.fig, task); if (a && a.length) bad.push(`${Lv.key} #${i + 1}: ${a[0]}`); });
    }
    return n > 200 && !bad.length || `${bad.length} of ${n}: ` + bad.slice(0, 4).join('; ');
  });
  t('the same on new More Practice and Common Mistakes questions (40 of each kind; at most 1 in 300 may fail)', () => {
    const bad = [], kinds = []; let n = 0;
    const tryOne = (name, make) => { let own = 0; for (let i = 0; i < 40; i++) { const task = make(); if (!task || !task.fig) continue; n++; const a = drawn(task.fig, task); if (a && a.length) { own++; bad.push(`${name}: ${a[0]}`); } } if (own > 1) kinds.push(`${name} (${own} of 40)`); };
    for (const key of Object.keys(Tasks.PRACTICE)) Tasks.PRACTICE[key].forEach((g, i) => tryOne(`More Practice ${key}.${i + 1}`, g));
    for (const grp of Tasks.MISTAKES) grp.list.forEach((m, i) => tryOne(`Common Mistakes ${grp.key}.${i + 1}`, m.gen));
    // No one kind may fail more than once in 40, and no more than 1 in 300 overall.
    return n > 1000 && !kinds.length && bad.length <= n / 300 || `${bad.length} of ${n}; kinds: ${kinds.join(', ') || 'none'}; ` + bad.slice(0, 4).join('; ');
  });
  // The same two sweeps again with the diagram at laptop size: writing is placed by measuring, so each size is its own case.
  document.getElementById('svg').style.width = '551px';
  t('at laptop width too: every lesson and Algebra Connections figure', () => {
    const bad = []; let n = 0;
    for (const Lv of Tasks.LEVELS) {
      const tasks = [].concat(...Object.keys(Lv.parts || {}).map(k => Lv.parts[k].tasks || []), Lv.algebra || []);
      tasks.forEach((task, i) => { if (!task.fig) return; n++; const a = drawn(task.fig, task); if (a && a.length) bad.push(`${Lv.key} #${i + 1}: ${a[0]}`); });
    }
    return n > 200 && !bad.length || `${bad.length} of ${n}: ` + bad.slice(0, 4).join('; ');
  });
  t('at laptop width too: new More Practice and Common Mistakes questions (40 of each kind)', () => {
    const bad = [], kinds = []; let n = 0;
    const tryOne = (name, make) => { let own = 0; for (let i = 0; i < 40; i++) { const task = make(); if (!task || !task.fig) continue; n++; const a = drawn(task.fig, task); if (a && a.length) { own++; bad.push(`${name}: ${a[0]}`); } } if (own > 1) kinds.push(`${name} (${own} of 40)`); };
    for (const key of Object.keys(Tasks.PRACTICE)) Tasks.PRACTICE[key].forEach((g, i) => tryOne(`More Practice ${key}.${i + 1}`, g));
    for (const grp of Tasks.MISTAKES) grp.list.forEach((m, i) => tryOne(`Common Mistakes ${grp.key}.${i + 1}`, m.gen));
    return n > 1000 && !kinds.length && bad.length <= n / 300 || `${bad.length} of ${n}; kinds: ${kinds.join(', ') || 'none'}; ` + bad.slice(0, 4).join('; ');
  });
  document.getElementById('svg').style.width = '342px';
  t('on the circumscribed question the angle\u2019s expression is beside Q and the arc\u2019s is inside the circle', () => {
    const task = Tasks.LEVELS.find(l => l.key === '5').algebra[2]; drawn(task.fig, task);
    const ex = Array.from(document.querySelectorAll('#svg .expr-lbl')), ang = ex.find(e => e._ray), arc = ex.find(e => e._arc);
    const P = { x: 120, y: 140 }, R = 80, from = e => Math.hypot(e.getAttribute('x') - P.x, e.getAttribute('y') - 5 - P.y);
    return from(arc) < R && from(ang) > R || `arc ${Math.round(from(arc))}, angle ${Math.round(from(ang))} from the center (radius ${R})`;
  });
  t('a labelled angle is marked with a filled wedge, never an arc (arcs mean congruent)', () => {
    const task = Tasks.LEVELS.find(l => l.key === '3').algebra[1]; drawn(task.fig, task);
    const svg = document.getElementById('svg');
    if (svg.querySelectorAll('.expr-wedge').length !== 2) return 'expected two wedges on Level 3 Algebra Connections 2';
    // Every figure that carries an angle expression: a wedge for each, and no arc drawn as a label mark.
    let n = 0;
    const check = (f, task) => {
      const angles = (f.labels || []).filter(l => l.angle).length;
      if (!angles) return '';
      n++; drawn(f, task);
      const boxed = (f.labels || []).filter(l => l.angle && (f.marks || []).some(m => m.angle && m.right && m.angle[1] === l.angle[1])).length;
      if (svg.querySelectorAll('.given-arc, .expr-arc').length) return 'an arc marks a labelled angle';
      return svg.querySelectorAll('.expr-wedge').length >= angles - boxed ? '' : 'a labelled angle has no wedge';
    };
    for (const Lv of Tasks.LEVELS) for (const task of [].concat(...Object.keys(Lv.parts || {}).map(p => Lv.parts[p].tasks || []), Lv.algebra || [])) { if (task.fig) { const r = check(task.fig, task); if (r) return `${Lv.key}: ${r} (${task.ask})`; } }
    for (const key of Object.keys(Tasks.PRACTICE)) for (const g of Tasks.PRACTICE[key]) for (let i = 0; i < 10; i++) { const task = g(); if (task && task.fig) { const r = check(task.fig, task); if (r) return `More Practice ${key}: ${r} (${task.ask})`; } }
    return n > 60 || 'only ' + n + ' figures with angle expressions were checked';
  });
  t('an expression on an arc highlights the arc, and with both radii drawn its central angle gets a wedge too', () => {
    const task = Tasks.LEVELS.find(l => l.key === '5').algebra[2]; drawn(task.fig, task);
    const svg = document.getElementById('svg');
    return svg.querySelectorAll('.expr-arc-hl').length === 1 && svg.querySelectorAll('.expr-wedge').length === 2 && svg.querySelectorAll('.expr-arc').length === 0;
  });
  t('an expression is never upside down, and is level unless its turn is gentle or it would not fit', () => {
    const turns = [];
    for (const Lv of Tasks.LEVELS) for (const task of Lv.algebra || []) { drawn(task.fig, task); document.querySelectorAll('#svg .expr-lbl').forEach(e => turns.push(e._tilt || 0)); }
    return turns.length > 80 && turns.every(a => Math.abs(a) <= 90) || 'a turn beyond 90: ' + turns.filter(a => Math.abs(a) > 90).join(' ');
  });

  const pass = results.filter(r => r.ok).length;
  window.testSummary = { pass, fail: results.length - pass, failures: results.filter(r => !r.ok) };
  document.getElementById('results').innerHTML =
    `<p><strong>${pass} of ${results.length} passed</strong></p><ul>` +
    results.map(r => `<li style="color:${r.ok ? '#14532d' : '#7f1d1d'}">${r.ok ? '✓' : '✗'} ${r.name}${r.info ? ' — ' + r.info.replace(/</g, '&lt;') : ''}</li>`).join('') + '</ul>';
})();
