/* Lessons and checkers. Every task is plain data, so tests can verify each one against the engine.
   The two areas take different input: the diagram is for doing (drag, draw, tap), the labeling
   area is for writing notation.
   Task types:
     show     a worked example: a figure plus the names it teaches
     name     labeling area: type the name of the highlighted figure
     fixcase  labeling area: a name written with the wrong capitals; write it correctly
     draw     diagram: pick the right tool and draw the named figure
     find     diagram: tap the figure a name describes
     same     do two names describe the same figure?
     mistake  three claims about the figure; tap the false one
     build    diagram: drag a point until the figure matches the description
     choose   pick one answer; the right one is worked out from the figure, never typed in
     measure  labeling area: write an angle's measure (m∠ABC = 75°)
     namePair labeling area: name the angle that makes a given pair with a given angle
     relate   labeling area: write how two lines are related (m ∥ n, t ⊥ m)
     explore  free play with every tool; Figure Facts shows every name */
const Tasks = (() => {
  'use strict';
  const K = Geom.KINDS;
  const fig = (points, objects, extra) => Object.assign({ points, objects }, extra || {});
  const N = (kind, pts) => ({ kind, pts: pts.split('') });
  const obj = n => ({ kind: n.kind, a: n.pts[0], b: n.pts[1] });

  // ---------- Level 1: lines, segments and rays ----------
  const LEVEL1 = {
    lines: {
      title: 'Lines',
      tasks: [
        { type: 'show', ask: 'One Line, Many Names',
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 9, y: 7 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'line', a: 'A', b: 'B' }]),
          names: ['AB', 'BA', 'AC', 'CA', 'BC', 'CB'].map(p => N('line', p)),
          say: 'Any two points on a line name it, in either order.' },
        { type: 'show', ask: 'One Letter Names a Line Too',
          fig: fig({ A: { x: 4, y: 4 }, B: { x: 12, y: 8 } }, [{ kind: 'line', a: 'A', b: 'B', label: 'm' }]),
          names: [N('line', 'm'), N('line', 'AB'), N('line', 'BA')],
          say: 'Points get capital letters. A line’s one-letter name is lowercase.' },
        { type: 'name', ask: 'Name the Line',
          fig: fig({ A: { x: 4, y: 3 }, B: { x: 14, y: 8 } }, [{ kind: 'line', a: 'A', b: 'B' }], { target: 0 }) },
        { type: 'name', ask: 'Name the Line Two Ways',
          fig: fig({ G: { x: 3, y: 10 }, H: { x: 12, y: 4 } }, [{ kind: 'line', a: 'G', b: 'H', label: 'k' }], { target: 0 }) },
        { type: 'fixcase', ask: 'Fix the Capitals', wrong: 'line T',
          fig: fig({ R: { x: 4, y: 9 }, S: { x: 13, y: 5 } }, [{ kind: 'line', a: 'R', b: 'S', label: 't' }], { target: 0 }) },
        { type: 'name', ask: 'Name the Line',
          fig: fig({ M: { x: 3, y: 10 }, N: { x: 9, y: 7 }, P: { on: ['M', 'N'], t: 2 } }, [{ kind: 'line', a: 'M', b: 'N' }], { target: 0 }) },
        { type: 'draw', ask: 'Draw', want: N('line', 'BC'),
          fig: fig({ A: { x: 4, y: 10 }, B: { x: 6, y: 4 }, C: { x: 15, y: 7 } }, []) },
        { type: 'find', ask: 'Tap', want: N('line', 'QS'),
          fig: fig({ P: { x: 3, y: 11 }, Q: { x: 5, y: 3 }, R: { x: 16, y: 11 }, S: { x: 11, y: 7 } },
            [{ kind: 'line', a: 'P', b: 'R' }, { kind: 'line', a: 'Q', b: 'S' }]) },
        { type: 'same', ask: 'Same Line or Different Lines?', n1: N('line', 'AB'), n2: N('line', 'CA'),
          fig: fig({ A: { x: 3, y: 3 }, B: { x: 8, y: 6 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'line', a: 'A', b: 'B' }]) },
        { type: 'same', ask: 'Same Line or Different Lines?', n1: N('line', 'AB'), n2: N('line', 'AD'),
          fig: fig({ A: { x: 3, y: 3 }, B: { x: 9, y: 6 }, D: { x: 12, y: 11 } }, [{ kind: 'line', a: 'A', b: 'B' }, { kind: 'line', a: 'A', b: 'D' }]) },
        { type: 'build', ask: 'Drag D Onto Line AB', move: 'D', magnets: [['A', 'B']],
          goal: { is: 'collinear', pts: ['A', 'B', 'D'] }, done: 'A, B and D are collinear: they are on one line.',
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 7, y: 6 }, D: { x: 14, y: 4 } }, [{ kind: 'line', a: 'A', b: 'B' }]) },
        { type: 'mistake', ask: 'Tap the False Statement',
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 9, y: 7 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'line', a: 'A', b: 'B' }]),
          claims: [{ c: 'same', n1: N('line', 'AB'), n2: N('line', 'CB') }, { c: 'ends', f: N('line', 'AC'), n: 2 }, { c: 'collinear', pts: ['A', 'B', 'C'] }] },
      ],
    },
    segments: {
      title: 'Segments',
      tasks: [
        { type: 'show', ask: 'A Segment Has Two Endpoints',
          fig: fig({ A: { x: 4, y: 5 }, B: { x: 14, y: 9 } }, [{ kind: 'segment', a: 'A', b: 'B' }]),
          names: [N('segment', 'AB'), N('segment', 'BA')],
          say: 'Either order names the same segment. AB with no bar is its length, a number.' },
        { type: 'name', ask: 'Name the Segment',
          fig: fig({ C: { x: 5, y: 3 }, D: { x: 13, y: 10 } }, [{ kind: 'segment', a: 'C', b: 'D' }], { target: 0 }) },
        { type: 'name', ask: 'Name the Highlighted Segment',
          fig: fig({ A: { x: 3, y: 9 }, B: { x: 9, y: 4 }, C: { x: 16, y: 9 } }, [{ kind: 'segment', a: 'A', b: 'B' }, { kind: 'segment', a: 'B', b: 'C' }], { target: 1 }) },
        { type: 'fixcase', ask: 'Fix the Capitals', wrong: 'segment de',
          fig: fig({ D: { x: 4, y: 4 }, E: { x: 15, y: 9 } }, [{ kind: 'segment', a: 'D', b: 'E' }], { target: 0 }) },
        { type: 'draw', ask: 'Draw', want: N('segment', 'EF'),
          fig: fig({ D: { x: 3, y: 4 }, E: { x: 8, y: 11 }, F: { x: 16, y: 5 } }, []) },
        { type: 'find', ask: 'Tap', want: N('segment', 'BC'),
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 10, y: 11 }, C: { x: 16, y: 4 } },
            [{ kind: 'segment', a: 'A', b: 'B' }, { kind: 'segment', a: 'B', b: 'C' }, { kind: 'segment', a: 'A', b: 'C' }]) },
        { type: 'same', ask: 'Same Segment or Different Segments?', n1: N('segment', 'AB'), n2: N('segment', 'BA'),
          fig: fig({ A: { x: 4, y: 4 }, B: { x: 14, y: 8 } }, [{ kind: 'segment', a: 'A', b: 'B' }]) },
        { type: 'same', ask: 'Same Segment or Different Segments?', n1: N('segment', 'AB'), n2: N('segment', 'AC'),
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 9, y: 7 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'segment', a: 'A', b: 'C' }]) },
        { type: 'build', ask: 'Drag C Onto Segment AB', move: 'C', magnets: [['A', 'B']],
          goal: { is: 'between', a: 'A', m: 'C', b: 'B' }, done: 'C is between A and B, so it is on segment AB.',
          fig: fig({ A: { x: 3, y: 3 }, B: { x: 15, y: 9 }, C: { x: 12, y: 3 } }, [{ kind: 'segment', a: 'A', b: 'B' }]) },
        { type: 'mistake', ask: 'Tap the False Statement',
          fig: fig({ A: { x: 4, y: 5 }, B: { x: 14, y: 9 } }, [{ kind: 'segment', a: 'A', b: 'B' }]),
          claims: [{ c: 'same', n1: N('segment', 'AB'), n2: N('segment', 'BA') }, { c: 'ends', f: N('segment', 'AB'), n: 0 }, { c: 'ends', f: N('segment', 'BA'), n: 2 }] },
      ],
    },
    rays: {
      title: 'Rays',
      tasks: [
        { type: 'show', ask: 'Start at the Endpoint',
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 8, y: 6 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'ray', a: 'A', b: 'B' }]),
          names: [N('ray', 'AB'), N('ray', 'AC')],
          say: 'The endpoint comes first. Ray BA would start at B and go the other way.' },
        { type: 'name', ask: 'Name the Ray',
          fig: fig({ D: { x: 14, y: 9 }, E: { x: 6, y: 5 } }, [{ kind: 'ray', a: 'D', b: 'E' }], { target: 0 }) },
        { type: 'name', ask: 'Name the Ray',
          fig: fig({ P: { x: 4, y: 10 }, Q: { x: 8, y: 7 }, R: { on: ['P', 'Q'], t: 2 } }, [{ kind: 'ray', a: 'P', b: 'Q' }], { target: 0 }) },
        { type: 'fixcase', ask: 'Fix the Capitals', wrong: 'ray qp',
          fig: fig({ Q: { x: 13, y: 9 }, P: { x: 6, y: 5 } }, [{ kind: 'ray', a: 'Q', b: 'P' }], { target: 0 }) },
        { type: 'draw', ask: 'Draw', want: N('ray', 'BA'),
          fig: fig({ A: { x: 4, y: 5 }, B: { x: 12, y: 9 } }, []) },
        { type: 'find', ask: 'Tap', want: N('ray', 'KJ'),
          fig: fig({ J: { x: 5, y: 7 }, K: { x: 11, y: 7 } }, [{ kind: 'ray', a: 'J', b: 'K' }, { kind: 'ray', a: 'K', b: 'J' }]) },
        { type: 'same', ask: 'Same Ray or Different Rays?', n1: N('ray', 'AB'), n2: N('ray', 'BA'),
          fig: fig({ A: { x: 5, y: 4 }, B: { x: 13, y: 8 } }, [{ kind: 'ray', a: 'A', b: 'B' }, { kind: 'ray', a: 'B', b: 'A' }]) },
        { type: 'same', ask: 'Same Ray or Different Rays?', n1: N('ray', 'AB'), n2: N('ray', 'AC'),
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 7, y: 6 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'ray', a: 'A', b: 'B' }]) },
        { type: 'build', ask: 'Drag C So Rays BA and BC Are Opposite Rays', move: 'C', magnets: [['A', 'B']],
          goal: { is: 'opposite', v: 'B', a: 'A', b: 'C' }, done: 'Rays BA and BC share endpoint B and point opposite ways.',
          fig: fig({ A: { x: 3, y: 5 }, B: { x: 9, y: 8 }, C: { x: 12, y: 3 } }, [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'C' }]) },
        { type: 'mistake', ask: 'Tap the False Statement',
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 8, y: 6 }, C: { on: ['A', 'B'], t: 2 } }, [{ kind: 'ray', a: 'A', b: 'B' }]),
          claims: [{ c: 'same', n1: N('ray', 'AB'), n2: N('ray', 'AC') }, { c: 'ends', f: N('ray', 'AB'), n: 1 }, { c: 'same', n1: N('ray', 'AB'), n2: N('ray', 'BA') }] },
      ],
    },
  };

  // Planes are drawn as a slanted parallelogram; which points lie in the plane is part of the figure.
  const QUAD = [[2, 2], [13, 2], [18, 9], [7, 9]];
  const P = (label, pts, quad) => ({ label, pts, quad: quad || QUAD });
  LEVEL1.planes = {
    title: 'Planes',
    tasks: [
      { type: 'show', ask: 'Two Ways to Name a Plane',
        fig: fig({ A: { x: 5, y: 3 }, B: { x: 12, y: 4 }, C: { x: 10, y: 7 } }, [], { planes: [P('M', ['A', 'B', 'C'])], hlPlane: 'M' }),
        names: [N('plane', 'M'), N('plane', 'ABC'), N('plane', 'BCA'), N('plane', 'CAB')],
        say: 'Use its letter, or three points in it that are not on one line.' },
      { type: 'name', ask: 'Name the Plane',
        fig: fig({ J: { x: 6, y: 4 }, K: { x: 13, y: 3 }, L: { x: 12, y: 7 } }, [], { planes: [P('P', ['J', 'K', 'L'])], targetPlane: 'P' }) },
      { type: 'name', ask: 'Name the Plane',
        fig: fig({ A: { x: 4, y: 3 }, B: { x: 8, y: 5 }, C: { on: ['A', 'B'], t: 2 }, D: { x: 13, y: 3 } }, [{ kind: 'line', a: 'A', b: 'B' }],
          { planes: [P('N', ['A', 'B', 'D'])], targetPlane: 'N' }) },
      { type: 'fixcase', ask: 'Fix the Capitals', wrong: 'plane r',
        fig: fig({ U: { x: 6, y: 4 }, V: { x: 13, y: 3 }, W: { x: 12, y: 7 } }, [], { planes: [P('R', ['U', 'V', 'W'])], targetPlane: 'R' }) },
      { type: 'same', ask: 'Same Plane or Different Planes?', n1: N('plane', 'M'), n2: N('plane', 'BCA'),
        fig: fig({ A: { x: 5, y: 3 }, B: { x: 12, y: 4 }, C: { x: 10, y: 7 } }, [], { planes: [P('M', ['A', 'B', 'C'])] }) },
      { type: 'same', ask: 'Same Plane or Different Planes?', n1: N('plane', 'M'), n2: N('plane', 'ABD'),
        fig: fig({ A: { x: 5, y: 3 }, B: { x: 12, y: 4 }, C: { x: 10, y: 7 }, D: { x: 9, y: 12 } }, [], { planes: [P('M', ['A', 'B', 'C'])] }) },
      { type: 'find', ask: 'Tap the Line That Lies in Plane M', wantIn: 'M',
        fig: fig({ A: { x: 5, y: 3 }, B: { x: 12, y: 4 }, C: { x: 10, y: 7 }, D: { x: 9, y: 12 } },
          [{ kind: 'line', a: 'D', b: 'C', hiddenPast: 'C' }, { kind: 'line', a: 'A', b: 'B' }], { planes: [P('M', ['A', 'B', 'C'])] }) },
      { type: 'mistake', ask: 'Tap the False Statement',
        fig: fig({ A: { x: 5, y: 3 }, B: { x: 12, y: 4 }, C: { x: 10, y: 7 }, D: { x: 9, y: 12 } },
          [{ kind: 'line', a: 'A', b: 'B' }, { kind: 'line', a: 'D', b: 'C', hiddenPast: 'C' }], { planes: [P('M', ['A', 'B', 'C'])] }),
        claims: [{ c: 'lineIn', n: N('line', 'AB'), plane: 'M' }, { c: 'inPlane', pt: 'D', plane: 'M' }, { c: 'crosses', n: N('line', 'DC'), plane: 'M', at: 'C' }] },
    ],
  };

  // ---------- Level 2: angles ----------
  // A point at distance r from v in direction deg (degrees), for figures with exact angle measures.
  const polar = (v, r, deg) => ({ x: v.x + r * Math.cos(deg * Math.PI / 180), y: v.y + r * Math.sin(deg * Math.PI / 180) });
  const A3 = s => s.split('');
  // Two lines crossing at E: line AC at 20 degrees, line BD at 95 degrees, so the angles are 75 and 105.
  const E0 = { x: 10, y: 7 };
  const CROSS = () => fig({ E: E0, A: polar(E0, 6.5, 200), C: polar(E0, 6.5, 20), B: polar(E0, 5.5, 95), D: polar(E0, 5.5, 275) },
    [{ kind: 'line', a: 'A', b: 'C' }, { kind: 'line', a: 'B', b: 'D' }],
    { angles: [A3('AEB'), A3('BEC'), A3('CED'), A3('DEA')] });
  const B0 = { x: 8, y: 4 };

  const LEVEL2 = {
    angles: {
      title: 'Angles',
      tasks: [
        { type: 'show', ask: 'An Angle Is Two Rays From One Point',
          fig: fig({ B: B0, A: polar(B0, 7, 140), C: polar(B0, 8, 15) }, [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'C' }], { angles: [A3('ABC')] }),
          names: [N('angle', 'ABC'), N('angle', 'CBA')],
          say: 'The vertex, B, goes in the middle of the name.' },
        { type: 'name', ask: 'Name the Angle',
          fig: fig({ Q: { x: 9, y: 4 }, P: polar({ x: 9, y: 4 }, 7, 115), R: polar({ x: 9, y: 4 }, 8, 30) },
            [{ kind: 'ray', a: 'Q', b: 'P' }, { kind: 'ray', a: 'Q', b: 'R' }], { angles: [A3('PQR')], targetAngle: A3('PQR') }) },
        { type: 'name', ask: 'Name the Angle',
          fig: fig({ V: { x: 5, y: 4 }, S: polar({ x: 5, y: 4 }, 5, 50), T: polar({ x: 5, y: 4 }, 12, 5), U: polar({ x: 5, y: 4 }, 9, 50) },
            [{ kind: 'ray', a: 'V', b: 'S' }, { kind: 'ray', a: 'V', b: 'T' }], { angles: [A3('SVT')], targetAngle: A3('SVT') }) },
        { type: 'choose', ask: 'Acute, Right, Obtuse or Straight?', q: { c: 'kind', ang: A3('ABC') },
          options: ['Acute', 'Right', 'Obtuse', 'Straight'],
          fig: fig({ B: B0, A: polar(B0, 7, 150), C: polar(B0, 8, 25) }, [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'C' }], { angles: [A3('ABC')], targetAngle: A3('ABC') }) },
        { type: 'build', ask: 'Drag C to Make ∠ABC a Right Angle', move: 'C', magnets: [{ at: 'B', dir: 'perp', of: ['B', 'A'] }],
          goal: { is: 'angle', pts: A3('ABC'), deg: 90 }, done: 'm∠ABC = 90°, a right angle. The box marks it.',
          fig: fig({ A: { x: 3, y: 5 }, B: { x: 9, y: 5 }, C: { x: 14, y: 9 } }, [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'C' }], { angles: [A3('ABC')] }) },
        { type: 'show', ask: 'Where Two Lines Cross',
          fig: CROSS(), names: [N('angle', 'AEB'), N('angle', 'CED')],
          say: 'Vertical angles sit across from each other and are congruent. Two angles side by side along a line are a linear pair: their measures add to 180°.' },
        { type: 'choose', ask: '∠AEB and ∠CED Are', q: { c: 'pair', g: A3('AEB'), h: A3('CED') },
          options: ['Vertical Angles', 'A Linear Pair', 'Neither'], fig: CROSS() },
        { type: 'choose', ask: '∠AEB and ∠BEC Are', q: { c: 'pair', g: A3('AEB'), h: A3('BEC') },
          options: ['Vertical Angles', 'A Linear Pair', 'Neither'], fig: CROSS() },
        { type: 'measure', ask: 'Write the Measure of the Angle',
          fig: Object.assign(CROSS(), { targetAngle: A3('AEB') }) },
        { type: 'build', ask: 'Drag D So ∠AEB and ∠BED Are a Linear Pair', move: 'D', magnets: [['A', 'E']],
          goal: { is: 'opposite', v: 'E', a: 'A', b: 'D' }, done: 'A, E and D are on one line, so ∠AEB and ∠BED are a linear pair. Their measures add to 180°.',
          fig: fig({ E: { x: 9, y: 5 }, A: { x: 3, y: 5 }, B: { x: 11, y: 11 }, D: { x: 15, y: 9 } },
            [{ kind: 'ray', a: 'E', b: 'A' }, { kind: 'ray', a: 'E', b: 'B' }, { kind: 'ray', a: 'E', b: 'D' }], { angles: [A3('AEB'), A3('BED')] }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: CROSS(),
          claims: [{ c: 'pairIs', g: A3('AEB'), h: A3('CED'), name: 'vertical' }, { c: 'pairIs', g: A3('AEB'), h: A3('BEC'), name: 'vertical' }, { c: 'mEq', g: A3('AEB'), h: A3('CED') }] },
      ],
    },
  };

  // ---------- Level 3: parallel, perpendicular and transversal ----------
  // Line m through A and B, line n through C and D, transversal t through E and F crossing m at P
  // and n at Q. Q is fixed on t; C can pivot line n around Q, so it can be made parallel to m.
  const TRANS = (cy) => {
    const f = fig({
      A: { x: 4, y: 10 }, B: { x: 16, y: 10 }, P: { x: 8, y: 10 }, Q: { x: 12, y: 4 },
      E: { on: ['P', 'Q'], t: -0.3 }, F: { on: ['P', 'Q'], t: 1.3 },
      C: { x: 4, y: cy }, D: { on: ['C', 'Q'], t: 1.5 },
    }, [
      { kind: 'line', a: 'A', b: 'B', label: 'm' }, { kind: 'line', a: 'C', b: 'D', label: 'n' }, { kind: 'line', a: 'E', b: 'F', label: 't' },
    ], {
      transversal: { l: ['A', 'B'], m: ['C', 'D'], t: ['E', 'F'], P: 'P', Q: 'Q' },
      angles: ['APE', 'EPB', 'BPQ', 'QPA', 'CQP', 'PQD', 'DQF', 'FQC'].map(A3),
    });
    return f;
  };
  const PAIRS = ['Corresponding', 'Alternate Interior', 'Alternate Exterior', 'Same-Side Interior', 'Same-Side Exterior'];
  // Lines m and n are parallel (both level); t crosses both at right angles, at P and Q.
  const PP = () => fig({
    A: { x: 4, y: 10 }, B: { x: 16, y: 10 }, C: { x: 4, y: 5 }, D: { x: 16, y: 5 },
    P: { x: 9, y: 10 }, Q: { x: 9, y: 5 }, E: { on: ['P', 'Q'], t: -0.4 }, F: { on: ['P', 'Q'], t: 1.4 },
  }, [
    { kind: 'line', a: 'A', b: 'B', label: 'm' }, { kind: 'line', a: 'C', b: 'D', label: 'n' }, { kind: 'line', a: 'E', b: 'F', label: 't' },
  ], { angles: [A3('BPE'), A3('DQP')] });
  const TWO = (a, b, c, d) => fig({ A: a, B: b, C: c, D: d },
    [{ kind: 'line', a: 'A', b: 'B', label: 'p' }, { kind: 'line', a: 'C', b: 'D', label: 'q' }]);
  const REL = ['Parallel', 'Perpendicular', 'Neither'];
  const LEVEL3 = {
    lines: {
      title: 'Parallel and Perpendicular',
      tasks: [
        { type: 'show', ask: 'Parallel and Perpendicular Lines', fig: PP(),
          names: [N('line', 'm'), N('line', 'n'), N('line', 't')],
          say: 'Parallel lines never meet: m ∥ n. Perpendicular lines meet at right angles: t ⊥ m. The box marks a right angle.' },
        { type: 'choose', ask: 'Lines p and q Are', q: { c: 'lineRel', l: ['A', 'B'], m: ['C', 'D'] }, options: REL, hideMeasures: true,
          fig: TWO({ x: 2, y: 3 }, { x: 10, y: 7 }, { x: 4, y: 8 }, { x: 12, y: 12 }) },
        { type: 'choose', ask: 'Lines p and q Are', q: { c: 'lineRel', l: ['A', 'B'], m: ['C', 'D'] }, options: REL, hideMeasures: true,
          fig: TWO({ x: 3, y: 4 }, { x: 11, y: 8 }, { x: 10, y: 3 }, { x: 7, y: 9 }) },
        { type: 'choose', ask: 'Lines p and q Are', q: { c: 'lineRel', l: ['A', 'B'], m: ['C', 'D'] }, options: REL, hideMeasures: true,
          fig: TWO({ x: 2, y: 3 }, { x: 12, y: 6 }, { x: 3, y: 11 }, { x: 15, y: 4 }) },
        { type: 'relate', ask: 'Write How Line m and Line t Are Related', lines: ['m', 't'], hideMeasures: true, fig: PP() },
        { type: 'relate', ask: 'Write How Line m and Line n Are Related', lines: ['m', 'n'], hideMeasures: true, fig: PP() },
        { type: 'build', ask: 'Drag D Until Line n Is Perpendicular to Line m', move: 'D', magnets: [{ at: 'Q', dir: 'perp', of: ['A', 'B'] }],
          goal: { is: 'perpendicular', l: ['A', 'B'], m: ['Q', 'D'] }, done: 'm ⊥ n: they meet at a right angle.',
          fig: fig({ A: { x: 3, y: 4 }, B: { x: 15, y: 10 }, Q: { x: 9, y: 7 }, D: { x: 14, y: 3 } },
            [{ kind: 'line', a: 'A', b: 'B', label: 'm' }, { kind: 'line', a: 'Q', b: 'D', label: 'n' }], { angles: [A3('BQD')] }) },
        { type: 'build', ask: 'Drag D Until Line n Is Parallel to Line m', move: 'D', magnets: [{ at: 'C', dir: 'par', of: ['A', 'B'] }],
          goal: { is: 'parallel', l: ['A', 'B'], m: ['C', 'D'] }, done: 'm ∥ n: they never meet.',
          fig: fig({ A: { x: 3, y: 11 }, B: { x: 15, y: 11 }, C: { x: 3, y: 3 }, D: { x: 15, y: 7 } },
            [{ kind: 'line', a: 'A', b: 'B', label: 'm' }, { kind: 'line', a: 'C', b: 'D', label: 'n' }]) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: PP(),
          claims: [{ c: 'lineRel', a: 'm', b: 'n', rel: 'parallel' }, { c: 'lineRel', a: 't', b: 'n', rel: 'parallel' }, { c: 'lineRel', a: 't', b: 'm', rel: 'perpendicular' }] },
      ],
    },
    transversals: {
      title: 'Transversals',
      tasks: [
        { type: 'show', ask: 'Two Lines and a Transversal', fig: TRANS(4),
          names: [N('line', 'm'), N('line', 'n'), N('line', 't')],
          say: 'Line t is a transversal: it crosses two lines. Here line m is parallel to line n.' },
        { type: 'choose', ask: '∠APE and ∠CQP Are', q: { c: 'pair', g: A3('APE'), h: A3('CQP') }, options: PAIRS, fig: TRANS(4) },
        { type: 'choose', ask: '∠BPQ and ∠CQP Are', q: { c: 'pair', g: A3('BPQ'), h: A3('CQP') }, options: PAIRS, fig: TRANS(4) },
        { type: 'choose', ask: '∠QPB and ∠PQD Are', q: { c: 'pair', g: A3('QPB'), h: A3('PQD') }, options: PAIRS, fig: TRANS(4) },
        { type: 'choose', ask: '∠APE and ∠DQF Are', q: { c: 'pair', g: A3('APE'), h: A3('DQF') }, options: PAIRS, fig: TRANS(4) },
        { type: 'choose', ask: '∠EPB and ∠DQF Are', q: { c: 'pair', g: A3('EPB'), h: A3('DQF') }, options: PAIRS, fig: TRANS(4) },
        { type: 'namePair', ask: 'Name the Angle Alternate Interior to ∠BPQ', given: A3('BPQ'), want: 'alternate interior', fig: TRANS(4) },
        { type: 'choose', ask: 'Line m Is Parallel to Line n. ∠BPQ and ∠PQD Are', q: { c: 'relation', g: A3('BPQ'), h: A3('PQD') },
          options: ['Congruent', 'Supplementary'], hideMeasures: true, fig: TRANS(4) },
        { type: 'choose', ask: 'Line m Is Parallel to Line n. ∠APE and ∠CQP Are', q: { c: 'relation', g: A3('APE'), h: A3('CQP') },
          options: ['Congruent', 'Supplementary'], hideMeasures: true, fig: TRANS(4) },
        { type: 'build', ask: 'Drag C Until Line n Is Parallel to Line m', move: 'C', magnets: [{ at: 'Q', dir: 'par', of: ['A', 'B'] }],
          goal: { is: 'parallel', l: ['A', 'B'], m: ['C', 'D'] }, done: 'Line n is parallel to line m. Now the corresponding angles are congruent: watch the arcs.',
          fig: TRANS(1) },
        { type: 'choose', ask: 'Are ∠APE and ∠CQP Congruent?', q: { c: 'isCongruent', g: A3('APE'), h: A3('CQP') },
          options: ['Yes', 'No'], fig: TRANS(1) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: TRANS(4),
          claims: [{ c: 'pairIs', g: A3('APE'), h: A3('CQP'), name: 'corresponding' }, { c: 'congruent', g: A3('BPQ'), h: A3('PQD') }, { c: 'pairIs', g: A3('BPQ'), h: A3('CQP'), name: 'alternate interior' }] },
      ],
    },
  };

  // ---------- Level 4: triangles ----------
  const SIDES = t => [{ kind: 'segment', a: t[0], b: t[1] }, { kind: 'segment', a: t[1], b: t[2] }, { kind: 'segment', a: t[2], b: t[0] }];
  // A triangle from three points (grid points, or exact points from triAt).
  function TRI(A, B, C, names = 'ABC', extra) {
    const t = names.split('');
    return fig({ [t[0]]: A, [t[1]]: B, [t[2]]: C }, SIDES(t), Object.assign({ triangles: [t], angles: Geom.triAngles(t) }, extra || {}));
  }
  // Side AB along the bottom, with m∠A = a and m∠B = b exactly: C is where the other two sides meet.
  function triAt(A, L, a, b, names, extra) {
    const B = { x: A.x + L, y: A.y }, r = L * Math.sin(b * Math.PI / 180) / Math.sin((a + b) * Math.PI / 180);
    return TRI(A, B, polar(A, r, a), names, extra);
  }
  // Triangle ABC with its side AB extended past B to D, making the exterior angle ∠CBD.
  function extAt(A, L, a, b, extra) {
    const f = triAt(A, L, a, b, 'ABC', extra);
    f.points.D = { on: ['A', 'B'], t: 1.45 };
    f.objects = [{ kind: 'segment', a: 'A', b: 'D' }, { kind: 'segment', a: 'B', b: 'C' }, { kind: 'segment', a: 'C', b: 'A' }];
    f.angles = f.angles.concat([A3('CBD')]);
    return f;
  }
  // One more labeled point, on a side: it's a point of the triangle but not a vertex.
  const withPoint = (f, name, on, t) => { f.points[name] = { on, t }; return f; };
  const angPairText = p => `∠${p[0]} and ∠${p[1]}`;
  const BASE_PAIRS = [['CAB', 'ABC'], ['CAB', 'BCA'], ['ABC', 'BCA']];
  const TRI_SIDES = ['Scalene', 'Isosceles', 'Equilateral'], TRI_ANGLES = ['Acute', 'Right', 'Obtuse'];
  // Magnets for dragging C: the perpendicular bisector of AB (isosceles), right angles at A and B,
  // and the equilateral point.
  const C_MAGNETS = [{ apex: ['A', 'B'] }, { bis: ['A', 'B'] }, { at: 'A', dir: 'perp', of: ['A', 'B'] }, { at: 'B', dir: 'perp', of: ['A', 'B'] }];
  const ISO = () => TRI({ x: 4, y: 3 }, { x: 16, y: 3 }, { x: 10, y: 11 });
  const tri = s => s.split('');
  const angL = (g, text) => ({ angle: A3(g), text });

  // Two triangles, △ABC and △DEF, from six points.
  function PAIR(a, b, c, d, e, g, extra) {
    const f = TRI(a, b, c), h = TRI(d, e, g, 'DEF');
    return fig(Object.assign(f.points, h.points), f.objects.concat(h.objects), Object.assign({ triangles: f.triangles.concat(h.triangles), angles: f.angles.concat(h.angles) }, extra || {}));
  }
  const p2 = (x, y) => ({ x, y });
  // △ABC ≅ △EFD: △DEF is △ABC flipped, with its letters in a different order.
  const CONG_PAIR = () => PAIR(p2(2, 3), p2(8, 3), p2(3, 8), p2(17, 8), p2(18, 3), p2(12, 3));
  // △ABC ∼ △FDE with scale factor 2 (a 3-4-5 right triangle and a 6-8-10 one).
  const SIM_PAIR = () => PAIR(p2(2, 4), p2(6, 4), p2(2, 7), p2(18, 2), p2(10, 8), p2(10, 2));
  const NEITHER_PAIR = () => PAIR(p2(2, 3), p2(8, 3), p2(4, 9), p2(11, 3), p2(18, 4), p2(12, 7));
  const TRI_REL = ['Congruent', 'Similar', 'Neither'];

  const LEVEL4 = {
    naming: {
      title: 'Naming Triangles',
      tasks: [
        { type: 'show', ask: 'A Triangle Is Named by Its Vertices',
          fig: TRI({ x: 4, y: 3 }, { x: 15, y: 3 }, { x: 8, y: 11 }),
          names: [N('triangle', 'ABC'), N('triangle', 'BCA'), N('triangle', 'CBA')],
          say: 'Use the triangle sign and the three vertices, in any order. The sides are segments and the corners are angles.' },
        { type: 'show', ask: 'Labeling the Sides',
          fig: TRI({ x: 4, y: 3 }, { x: 15, y: 3 }, { x: 8, y: 11 }, 'ABC', { labels: [{ seg: ['B', 'C'], text: 'a' }, { seg: ['C', 'A'], text: 'b' }, { seg: ['A', 'B'], text: 'c' }], labelBelow: ['A', 'B'] }),
          names: [N('triangle', 'ABC')],
          say: 'Vertices are capital letters. A side can also be labeled with one lowercase letter: the letter of the vertex across from it. Side a is segment BC, across from vertex A. Side b is segment CA, and side c is segment AB.' },
        { type: 'choose', ask: 'Which Segment Is Side b?', q: { c: 'fixed', answer: '[s:AC]', why: 'Side b is across from vertex B, so it is the side that doesn’t touch B.', hint: 'Side b is across from vertex B: find the side that doesn’t touch B.' },
          options: ['[s:AB]', '[s:AC]', '[s:BC]'], fig: TRI({ x: 3, y: 3 }, { x: 16, y: 4 }, { x: 11, y: 12 }) },
        { type: 'name', ask: 'Name the Triangle',
          fig: TRI({ x: 3, y: 4 }, { x: 16, y: 6 }, { x: 7, y: 12 }, 'PQR', { targetTri: tri('PQR') }) },
        { type: 'name', ask: 'Name the Triangle',
          fig: withPoint(TRI({ x: 3, y: 3 }, { x: 17, y: 3 }, { x: 12, y: 11 }, 'JKL', { targetTri: tri('JKL') }), 'M', ['J', 'K'], 0.5) },
        { type: 'fixcase', ask: 'Fix the Name', wrong: '△abc',
          fig: TRI({ x: 4, y: 3 }, { x: 15, y: 5 }, { x: 9, y: 12 }, 'ABC', { targetTri: tri('ABC') }) },
        { type: 'opposite', ask: 'Name the Side Opposite ∠BAC', given: A3('BAC'),
          fig: TRI({ x: 3, y: 3 }, { x: 16, y: 4 }, { x: 11, y: 12 }) },
        { type: 'opposite', ask: 'Name the Angle Opposite Side', givenSide: ['A', 'C'],
          fig: TRI({ x: 3, y: 3 }, { x: 16, y: 4 }, { x: 11, y: 12 }) },
        { type: 'measure', ask: 'Write the Measure of the Angle',
          fig: triAt({ x: 4, y: 3 }, 11, 55, 70, 'ABC', { targetAngle: A3('ABC') }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: TRI({ x: 3, y: 3 }, { x: 16, y: 4 }, { x: 11, y: 12 }),
          claims: [{ c: 'triSame', t1: tri('ABC'), t2: tri('CAB') }, { c: 'opp', g: A3('BAC'), side: ['B', 'C'] }, { c: 'opp', g: A3('ABC'), side: ['B', 'C'] }] },
      ],
    },
    classify: {
      title: 'Classifying Triangles',
      tasks: [
        { type: 'show', ask: 'Tick Marks Show Congruent Sides', fig: ISO(), names: [N('triangle', 'ABC')],
          say: 'By sides: two congruent sides make it isosceles, three make it equilateral, none make it scalene. An equilateral triangle is isosceles too.' },
        { type: 'choose', ask: 'Classify △ABC by Its Sides', q: { c: 'triSides', tri: tri('ABC') }, options: TRI_SIDES,
          fig: TRI({ x: 3, y: 3 }, { x: 15, y: 3 }, { x: 11, y: 10 }) },
        { type: 'choose', ask: 'Classify △ABC by Its Sides', q: { c: 'triSides', tri: tri('ABC') }, options: TRI_SIDES,
          fig: triAt({ x: 5, y: 3 }, 10, 60, 60) },
        { type: 'show', ask: 'Classify by the Largest Angle', fig: TRI({ x: 4, y: 3 }, { x: 14, y: 3 }, { x: 4, y: 10 }), names: [N('triangle', 'ABC')],
          say: 'By angles: one right angle makes a right triangle, one obtuse angle makes an obtuse triangle, and three acute angles make an acute triangle.' },
        { type: 'choose', ask: 'Classify △ABC by Its Angles', q: { c: 'triAngles', tri: tri('ABC') }, options: TRI_ANGLES,
          fig: TRI({ x: 3, y: 3 }, { x: 12, y: 3 }, { x: 15, y: 8 }) },
        { type: 'choose', ask: 'Classify △ABC by Its Angles', q: { c: 'triAngles', tri: tri('ABC') }, options: TRI_ANGLES, fig: ISO() },
        { type: 'build', ask: 'Drag C to Make △ABC Isosceles', move: 'C', magnets: C_MAGNETS,
          goal: { is: 'tri', tri: tri('ABC'), sides: 'isosceles' }, done: 'CA = CB, so △ABC is isosceles. The tick marks match.',
          fig: TRI({ x: 4, y: 3 }, { x: 14, y: 3 }, { x: 13, y: 10 }) },
        { type: 'build', ask: 'Drag C to Make △ABC a Right Triangle', move: 'C', magnets: C_MAGNETS,
          goal: { is: 'tri', tri: tri('ABC'), angles: 'right' }, done: 'One angle is a right angle, so △ABC is a right triangle. The box marks it.',
          fig: TRI({ x: 4, y: 3 }, { x: 14, y: 3 }, { x: 11, y: 10 }) },
        { type: 'build', ask: 'Drag C to Make △ABC Equilateral', move: 'C', magnets: C_MAGNETS,
          goal: { is: 'tri', tri: tri('ABC'), sides: 'equilateral' }, done: 'All three sides are congruent, and every angle measures 60°.',
          fig: TRI({ x: 5, y: 3 }, { x: 13, y: 3 }, { x: 15, y: 11 }) },
        { type: 'build', ask: 'Drag C to Make △ABC Obtuse and Isosceles', move: 'C', magnets: C_MAGNETS,
          goal: { is: 'tri', tri: tri('ABC'), sides: 'isosceles', angles: 'obtuse' }, done: 'An obtuse isosceles triangle: the obtuse angle is between the congruent sides.',
          fig: TRI({ x: 3, y: 5 }, { x: 17, y: 5 }, { x: 13, y: 11 }) },
        { type: 'choose', ask: 'Can a Right Triangle Be Equilateral?', q: { c: 'fixed', answer: 'No', why: 'Every angle of an equilateral triangle measures 60°, so none of them is a right angle.' },
          options: ['Yes', 'No'], fig: triAt({ x: 5, y: 3 }, 10, 60, 60) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: triAt({ x: 5, y: 3 }, 10, 60, 60),
          claims: [{ c: 'triIs', tri: tri('ABC'), sides: 'isosceles' }, { c: 'triIs', tri: tri('ABC'), angles: 'acute' }, { c: 'triIs', tri: tri('ABC'), sides: 'scalene' }] },
      ],
    },
    angles: {
      title: 'Angles of a Triangle',
      tasks: [
        { type: 'show', ask: 'The Angles Add to 180°', fig: triAt({ x: 4, y: 3 }, 12, 50, 60), names: [N('angle', 'CAB'), N('angle', 'ABC'), N('angle', 'BCA')],
          say: 'm∠CAB + m∠ABC + m∠BCA = 180°, in every triangle.' },
        { type: 'measure', ask: 'Find the Measure of ∠BCA', hideMeasures: true, hint: 'The three angles add to 180°.',
          fig: triAt({ x: 4, y: 3 }, 12, 50, 65, 'ABC', { targetAngle: A3('BCA'), labels: [angL('CAB', '50°'), angL('ABC', '65°')] }) },
        { type: 'show', ask: 'An Exterior Angle', fig: extAt({ x: 3, y: 3 }, 9, 45, 70), names: [N('angle', 'CBD')],
          say: 'Extend side AB past B to make exterior angle ∠CBD. Its measure is the sum of the two angles not next to it: m∠CBD = m∠CAB + m∠BCA.' },
        { type: 'measure', ask: 'Find the Measure of ∠CBD', hideMeasures: true, hint: 'm∠CBD = m∠CAB + m∠BCA: the two angles not next to it.',
          fig: extAt({ x: 3, y: 3 }, 9, 45, 70, { targetAngle: A3('CBD'), labels: [angL('CAB', '45°'), angL('BCA', '65°')] }) },
        { type: 'show', ask: 'Isosceles Triangle Base Angles', fig: ISO(), names: [N('angle', 'CAB'), N('angle', 'ABC')],
          say: 'The angles opposite the congruent sides are congruent. Here CA = CB, so ∠CAB ≅ ∠ABC.' },
        { type: 'choose', ask: 'Which Angles Are Congruent?', q: { c: 'congPair', pairs: BASE_PAIRS }, options: BASE_PAIRS.map(angPairText), hideMeasures: true,
          fig: Object.assign(TRI({ x: 3, y: 3 }, { x: 17, y: 3 }, { x: 5, y: 3 + Math.sqrt(52) }), { marks: [{ seg: ['A', 'B'], ticks: 1 }, { seg: ['B', 'C'], ticks: 1 }] }) },
        { type: 'measure', ask: 'Find the Measure of ∠CAB', hideMeasures: true, hint: 'CA = CB, so the base angles are congruent. All three angles add to 180°.',
          fig: triAt({ x: 5.5, y: 3 }, 9, 65, 65, 'ABC', { targetAngle: A3('CAB'), labels: [angL('BCA', '50°')], marks: [{ seg: ['C', 'A'], ticks: 1 }, { seg: ['C', 'B'], ticks: 1 }] }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: extAt({ x: 3, y: 3 }, 9, 45, 70),
          claims: [{ c: 'angleSum', tri: tri('ABC') }, { c: 'ext', ext: A3('CBD'), parts: [A3('CAB'), A3('BCA')] }, { c: 'ext', ext: A3('CBD'), parts: [A3('CAB'), A3('ABC')] }] },
      ],
    },
    congSim: {
      title: 'Congruent and Similar Triangles',
      tasks: [
        { type: 'show', ask: 'Congruent Triangles', fig: CONG_PAIR(), names: [N('triangle', 'ABC'), N('triangle', 'EFD')],
          say: '△ABC ≅ △EFD: same size and shape. The order of the letters matches the parts: A with E, B with F, C with D. Matching parts have matching marks.' },
        { type: 'corresp', ask: '△ABC ≅ △EFD. Name the Side That Matches', part: ['B', 'C'], stmt: [tri('ABC'), tri('EFD')], fig: CONG_PAIR() },
        { type: 'corresp', ask: '△ABC ≅ △EFD. Name the Angle That Matches ∠BCA', part: A3('BCA'), stmt: [tri('ABC'), tri('EFD')], fig: CONG_PAIR() },
        { type: 'triRel', ask: 'Write the Congruence Statement, Starting With △ABC', want: 'congruent', fig: CONG_PAIR() },
        { type: 'show', ask: 'Similar Triangles', fig: SIM_PAIR(), names: [N('triangle', 'ABC'), N('triangle', 'FDE')],
          say: '△ABC ∼ △FDE: same shape, not the same size. Matching angles are congruent, and every side of △FDE is 2 times as long. The scale factor is 2.' },
        { type: 'choose', ask: 'Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABC'), u: tri('DEF') }, options: TRI_REL, fig: SIM_PAIR() },
        { type: 'choose', ask: 'Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABC'), u: tri('DEF') }, options: TRI_REL, fig: NEITHER_PAIR() },
        { type: 'triRel', ask: 'Write the Similarity Statement, Starting With △ABC', want: 'similar', fig: SIM_PAIR() },
        { type: 'mistake', ask: 'Tap the False Statement', fig: SIM_PAIR(),
          claims: [{ c: 'triRel', t: tri('ABC'), u: tri('FDE'), rel: 'similar' }, { c: 'mEq', g: A3('CAB'), h: A3('EFD') }, { c: 'triRel', t: tri('ABC'), u: tri('FDE'), rel: 'congruent' }] },
      ],
    },
  };

  // ---------- Level 5: circles ----------
  // A circle named by its center c, with points on it at the given angles (degrees).
  function CIRC(center, r, onIt, objects, extra, c = 'P') {
    const points = { [c]: center };
    for (const [n, deg] of Object.entries(onIt)) points[n] = { circ: c, deg };
    return fig(points, objects, Object.assign({ circles: [{ c, r }] }, extra || {}));
  }
  const S2 = (a, b) => ({ kind: 'segment', a, b }), L2 = (a, b) => ({ kind: 'line', a, b });
  const arcOf = (a, b, more) => Object.assign({ c: 'P', a, b }, more || {});
  const arcL = (arc, text) => ({ arc, text });
  // A radius, a diameter and a chord.
  const CHORDS = () => CIRC(p2(8, 7), 5, { A: 60, B: 150, C: 330, D: 205, E: 285 }, [S2('P', 'A'), S2('B', 'C'), S2('D', 'E')]);
  // A radius PT, the tangent line JK at T, and a secant FG.
  const TAN_LINES = () => { const f = CIRC(p2(7, 7.5), 4.5, { T: 270, F: 30, G: 120 }, [S2('P', 'T'), L2('J', 'K'), L2('F', 'G')], { angles: [A3('PTK')] });
    f.points.K = { tanLine: 'T', circ2: 'P', d: 5 }; f.points.J = { tanLine: 'T', circ2: 'P', d: -5 }; return f; };
  // Tangent line JK at T, perpendicular to radius PT.
  const TAN_ONE = () => { const f = CIRC(p2(7, 7), 4.5, { T: 0 }, [S2('P', 'T'), L2('J', 'K')], { angles: [A3('PTK')] });
    f.points.K = { tanLine: 'T', circ2: 'P', d: 4 }; f.points.J = { tanLine: 'T', circ2: 'P', d: -4 }; return f; };
  // Two tangents from Q touching ⊙P at S and T. With QP = 2r, m∠SQT = 60°.
  // Rays from Q through the points of tangency: a tangent keeps going past the one point where it
  // touches the circle. The segments QS and QT stay too (the tangent segments that are congruent);
  // the rays come last, so no task's figure numbers change.
  const TAN_RAYS = () => [{ kind: 'ray', a: 'Q', b: 'S' }, { kind: 'ray', a: 'Q', b: 'T' }];
  function TWO_TAN(qx = 14) {
    const f = fig({ P: p2(6, 7), Q: p2(qx, 7), S: { tanFrom: 'Q', circ2: 'P', side: 1 }, T: { tanFrom: 'Q', circ2: 'P', side: -1 } },
      [S2('Q', 'S'), S2('Q', 'T'), S2('P', 'Q'), S2('P', 'S'), S2('P', 'T'), ...TAN_RAYS()],
      { circles: [{ c: 'P', r: 4 }], angles: [A3('SQP'), A3('PQT'), A3('PSQ'), A3('QTP')], ticks: true });
    return f;
  }
  // Circumscribed ∠SQT: both sides tangent to ⊙P, with m∠SQT = theta, and central ∠SPT (180 - theta).
  function CIRCUM(theta, extra) {
    const d = 4 / Math.sin(theta / 2 * Math.PI / 180);
    return fig({ P: p2(6, 7), Q: p2(6 + d, 7), S: { tanFrom: 'Q', circ2: 'P', side: 1 }, T: { tanFrom: 'Q', circ2: 'P', side: -1 } },
      [S2('Q', 'S'), S2('Q', 'T'), S2('P', 'S'), S2('P', 'T'), ...TAN_RAYS()], Object.assign({ circles: [{ c: 'P', r: 4 }], angles: [A3('SQT'), A3('SPT'), A3('PSQ'), A3('QTP')] }, extra || {}));
  }
  const ANGLE_TYPES = ['A Central Angle', 'An Inscribed Angle', 'A Circumscribed Angle'];
  // Inscribed ∠ABC with vertex B on the circle; its intercepted arc AC is the one away from B.
  function INSC(a, b, c, more, extra) {
    const { objects = [], ...rest } = extra || {};
    return CIRC(p2(8, 7), 5, Object.assign({ A: a, B: b, C: c }, more || {}), [S2('B', 'A'), S2('B', 'C')].concat(objects), Object.assign({ angles: [A3('ABC')] }, rest));
  }
  const PARTS = ['Radius', 'Diameter', 'Chord', 'Secant', 'Tangent'], ARC_KINDS = ['Minor Arc', 'Major Arc', 'Semicircle'];
  const ARCS = extra => CIRC(p2(8, 7), 5, { A: 20, B: 90, C: 220, D: 300 }, [S2('P', 'A'), S2('P', 'B')], Object.assign({ angles: [A3('APB')] }, extra || {}));

  const LEVEL5 = {
    parts: {
      title: 'Parts of a Circle',
      tasks: [
        { type: 'show', ask: 'A Circle Is Named by Its Center', fig: CHORDS(), names: [N('circle', 'P'), N('segment', 'PA'), N('segment', 'BC'), N('segment', 'DE')],
          say: '⊙P: every point on it is the same distance from center P. A radius joins the center to the circle. A chord joins two points on the circle. A diameter is a chord through the center.' },
        { type: 'name', ask: 'Name the Circle', fig: CIRC(p2(9, 7), 5, { A: 40, B: 200 }, [S2('Q', 'A')], { targetCircle: 'Q' }, 'Q') },
        { type: 'choose', ask: 'The Highlighted Figure Is a', q: { c: 'circlePart', circ: 'P', obj: 0 }, options: PARTS, fig: CHORDS() },
        { type: 'choose', ask: 'The Highlighted Figure Is a', q: { c: 'circlePart', circ: 'P', obj: 2 }, options: PARTS, fig: CHORDS() },
        { type: 'choose', ask: 'The Highlighted Figure Is a', q: { c: 'circlePart', circ: 'P', obj: 1 }, options: PARTS, fig: CHORDS() },
        { type: 'show', ask: 'Secants and Tangents', fig: TAN_LINES(), names: [N('line', 'FG'), N('line', 'JK')],
          say: 'A secant crosses the circle at two points. A tangent touches it at exactly one point, the point of tangency, T.' },
        { type: 'choose', ask: 'The Highlighted Line Is a', q: { c: 'circlePart', circ: 'P', obj: 2 }, options: PARTS, fig: TAN_LINES() },
        { type: 'choose', ask: 'The Highlighted Line Is a', q: { c: 'circlePart', circ: 'P', obj: 1 }, options: PARTS, fig: TAN_LINES() },
        { type: 'name', ask: 'Name the Radius', fig: Object.assign(CHORDS(), { target: 0 }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: CHORDS(),
          claims: [{ c: 'part', circ: 'P', obj: 1, is: 'chord' }, { c: 'part', circ: 'P', obj: 0, is: 'radius' }, { c: 'part', circ: 'P', obj: 2, is: 'diameter' }] },
      ],
    },
    arcs: {
      title: 'Arcs',
      tasks: [
        { type: 'show', ask: 'Minor Arcs and Major Arcs', fig: ARCS({ targetArc: arcOf('A', 'B') }), names: [N('arc', 'AB'), N('arc', 'ACB')],
          say: 'A minor arc is named by its two endpoints: ⌒AB. A major arc needs a third point on it: ⌒ACB. A minor arc’s measure is its central angle: m⌒AB = m∠APB.' },
        { type: 'name', ask: 'Name the Highlighted Arc', fig: ARCS({ targetArc: arcOf('A', 'B') }) },
        { type: 'name', ask: 'Name the Highlighted Arc', fig: ARCS({ targetArc: arcOf('A', 'B', { via: 'C' }) }) },
        { type: 'choose', ask: 'The Highlighted Arc Is a', q: { c: 'arcKind', arc: arcOf('A', 'E', { via: 'B' }) }, options: ARC_KINDS,
          fig: CIRC(p2(8, 7), 5, { A: 20, E: 200, B: 90, C: 250 }, [S2('A', 'E')], { targetArc: arcOf('A', 'E', { via: 'B' }) }) },
        { type: 'choose', ask: 'The Highlighted Arc Is a', q: { c: 'arcKind', arc: arcOf('A', 'B', { via: 'D' }) }, options: ARC_KINDS, fig: ARCS({ targetArc: arcOf('A', 'B', { via: 'D' }) }) },
        { type: 'measure', ask: 'Write the Measure of the Arc', fig: ARCS({ targetArc: arcOf('A', 'B') }) },
        { type: 'measure', ask: 'Find the Measure of the Major Arc', hideMeasures: true, hint: 'The whole circle is 360°, and the minor arc is 70°.',
          fig: ARCS({ targetArc: arcOf('A', 'B', { via: 'C' }), labels: [angL('APB', '70°')] }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: ARCS(),
          claims: [{ c: 'arcIs', arc: arcOf('A', 'B'), deg: 70 }, { c: 'arcIs', arc: arcOf('A', 'B', { via: 'C' }), deg: 70 }, { c: 'arcIs', arc: arcOf('A', 'B', { via: 'D' }), deg: 290 }] },
      ],
    },
    tangents: {
      title: 'Tangents',
      tasks: [
        { type: 'show', ask: 'A Tangent Is Perpendicular to the Radius', fig: TAN_ONE(), names: [N('segment', 'PT'), N('line', 'JK')],
          say: 'Line JK is tangent to ⊙P at T. A tangent is perpendicular to the radius at the point of tangency: the box marks the right angle.' },
        { type: 'build', ask: 'Drag K So Line TK Is Tangent to ⊙P', move: 'K', magnets: [{ at: 'T', dir: 'perp', of: ['P', 'T'] }],
          goal: { is: 'perpendicular', l: ['P', 'T'], m: ['T', 'K'] }, done: 'Line TK is perpendicular to radius PT, so it touches ⊙P only at T: it is tangent.',
          fig: (() => { const f = CIRC(p2(7, 7), 4.5, { T: 0 }, [S2('P', 'T'), L2('T', 'K')], { angles: [A3('PTK')] }); f.points.K = p2(15, 11); return f; })() },
        { type: 'show', ask: 'Two Tangents From One Point', fig: TWO_TAN(), names: [N('segment', 'QS'), N('segment', 'QT')],
          say: 'Tangent segments from the same point are congruent: QS = QT. Segment QP bisects the angle between them, so ∠SQP ≅ ∠PQT.' },
        { type: 'measure', ask: 'm∠SQT = 60°. Find the Measure of ∠PQT', hideMeasures: true, hint: 'QP bisects ∠SQT: it splits it into two congruent angles.',
          fig: Object.assign(TWO_TAN(), { targetAngle: A3('PQT'), labels: [angL('SQT', '60°')] }) },
        { type: 'measure', ask: 'Find the Measure of ∠PSQ', hideMeasures: true, hint: 'A tangent is perpendicular to the radius at the point of tangency.',
          fig: Object.assign(TWO_TAN(), { targetAngle: A3('PSQ') }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: TWO_TAN(),
          claims: [{ c: 'segEq', s1: ['Q', 'S'], s2: ['Q', 'T'] }, { c: 'mEq', g: A3('SQP'), h: A3('PQT') }, { c: 'segEq', s1: ['Q', 'S'], s2: ['Q', 'P'] }] },
        { type: 'show', ask: 'Circumscribed Angles', fig: CIRCUM(60), names: [N('angle', 'SQT'), N('angle', 'SPT')],
          say: '∠SQT is circumscribed about ⊙P: both of its sides are tangent to the circle. It and central angle ∠SPT add to 180°: m∠SQT + m∠SPT = 180°.' },
        { type: 'choose', ask: '∠SQT Is', q: { c: 'angleType', circ: 'P', g: A3('SQT') }, options: ANGLE_TYPES, fig: CIRCUM(60) },
        { type: 'measure', ask: 'Find the Measure of ∠SQT', hideMeasures: true, hint: 'A circumscribed angle and its central angle add to 180°.',
          fig: CIRCUM(70, { targetAngle: A3('SQT'), labels: [angL('SPT', '110°')] }) },
        { type: 'measure', ask: 'Find the Measure of ∠SQT', hideMeasures: true, hint: 'Minor arc ST has the same measure as central angle ∠SPT, and m∠SQT + m∠SPT = 180°.',
          fig: CIRCUM(50, { targetAngle: A3('SQT'), labels: [arcL(arcOf('S', 'T'), '130°')] }) },
      ],
    },
    inscribed: {
      title: 'Inscribed Angles',
      tasks: [
        { type: 'show', ask: 'An Inscribed Angle Is Half Its Arc', fig: INSC(200, 90, 340, null, { targetArc: arcOf('A', 'C', { opp: 'B' }) }),
          names: [N('angle', 'ABC')],
          say: 'Inscribed angle ∠ABC has its vertex on the circle. It intercepts ⌒AC, and its measure is half the arc: m∠ABC = ½ m⌒AC.' },
        { type: 'measure', ask: 'Find the Measure of ∠ABC', hideMeasures: true, hint: 'An inscribed angle is half its intercepted arc.',
          fig: INSC(200, 90, 340, null, { targetAngle: A3('ABC'), labels: [arcL(arcOf('A', 'C', { opp: 'B' }), '140°')] }) },
        { type: 'measure', ask: 'Find the Measure of the Intercepted Arc', hideMeasures: true, hint: 'The intercepted arc is twice the inscribed angle.',
          fig: INSC(235, 90, 305, null, { targetArc: arcOf('A', 'C', { opp: 'B' }), labels: [angL('ABC', '35°')] }) },
        { type: 'show', ask: 'Inscribed Angles on the Same Arc', fig: INSC(200, 90, 340, { D: 135 }, { objects: [S2('D', 'A'), S2('D', 'C')], angles: [A3('ABC'), A3('ADC')] }),
          names: [N('angle', 'ABC'), N('angle', 'ADC')], say: 'Both angles intercept ⌒AC, so they are congruent: the arcs match.' },
        { type: 'choose', ask: 'AC Is a Diameter. ∠ABC Is', q: { c: 'kind', ang: A3('ABC') }, options: ['Acute', 'Right', 'Obtuse'], hideMeasures: true,
          fig: INSC(180, 60, 0, null, { objects: [S2('A', 'C')] }) },
        { type: 'choose', ask: '∠APC Is', q: { c: 'angleType', circ: 'P', g: A3('APC') }, options: ANGLE_TYPES,
          fig: INSC(200, 90, 340, null, { objects: [S2('P', 'A'), S2('P', 'C')], angles: [A3('ABC'), A3('APC')] }) },
        { type: 'mistake', ask: 'Tap the False Statement', fig: INSC(200, 90, 340, { D: 135 }, { objects: [S2('D', 'A'), S2('D', 'C')], angles: [A3('ABC'), A3('ADC')] }),
          claims: [{ c: 'angleArc', g: A3('ABC'), arc: arcOf('A', 'C', { opp: 'B' }), k: 0.5 }, { c: 'mEq', g: A3('ABC'), h: A3('ADC') }, { c: 'angleArc', g: A3('ABC'), arc: arcOf('A', 'C', { opp: 'B' }), k: 1 }] },
      ],
    },
  };

  // ---------- Algebra on the diagram, one set per level ----------
  // Expressions sit on the figure (labels); the given facts are marked (marks), never measured, so
  // the numbers on screen can't give the answer away. Each problem: write the equation (rel), solve
  // for x, then find one measure (find). `wrong` names the relationships students mix up.
  const lerp = (P, Q, t) => ({ x: P.x + t * (Q.x - P.x), y: P.y + t * (Q.y - P.y) });
  const seg = (a, b, text) => ({ seg: [a, b], text });
  const ang = (g, text) => ({ angle: A3(g), text });
  // Crossing lines through E with m∠AEB = d: A at 200 degrees, B at 200 - d, C and D opposite them.
  const CROSSD = d => fig({ E: E0, A: polar(E0, 6.5, 200), B: polar(E0, 5.5, 200 - d), C: polar(E0, 6.5, 20), D: polar(E0, 5.5, 20 - d) },
    [{ kind: 'line', a: 'A', b: 'C' }, { kind: 'line', a: 'B', b: 'D' }],
    { angles: [A3('AEB'), A3('BEC'), A3('CED'), A3('DEA')] });
  // Parallel lines m and n cut by t, drawn so m∠APE = d (and so every angle matches its expression).
  const transAt = d => {
    // P in the middle keeps Q between C and D for every d from 50 to 130 degrees.
    const P0 = { x: 10, y: 10 }, r = 6 / Math.sin(d * Math.PI / 180);
    const Q0 = polar(P0, r, 360 - d);              // down and to the right, so m∠APE = d
    return fig({
      A: { x: 3, y: 10 }, B: { x: 17, y: 10 }, P: P0, Q: Q0, C: { x: 3, y: 4 }, D: { x: 17, y: 4 },
      E: { on: ['P', 'Q'], t: -0.3 }, F: { on: ['P', 'Q'], t: 1.3 },
    }, [
      { kind: 'line', a: 'A', b: 'B', label: 'm' }, { kind: 'line', a: 'C', b: 'D', label: 'n' }, { kind: 'line', a: 'E', b: 'F', label: 't' },
    ], {
      transversal: { l: ['A', 'B'], m: ['C', 'D'], t: ['E', 'F'], P: 'P', Q: 'Q' },
      angles: ['APE', 'EPB', 'BPQ', 'QPA', 'CQP', 'PQD', 'DQF', 'FQC'].map(A3),
    });
  };

  const ALGEBRA = {
    1: [
      { type: 'algebra', ask: 'B Is Between A and C. Find AB.',
        fig: fig({ A: { x: 2, y: 6 }, C: { x: 18, y: 6 }, B: lerp({ x: 2, y: 6 }, { x: 18, y: 6 }, 11 / 21) }, [{ kind: 'segment', a: 'A', b: 'C' }],
          { labels: [seg('A', 'B', '2x + 1'), seg('B', 'C', 'x + 5'), seg('A', 'C', '21')], labelBelow: ['A', 'C'] }),
        rel: { is: 'sum', parts: ['2x+1', 'x+5'], total: 21 }, find: { name: 'AB', expr: '2x+1' },
        hint: 'B is between A and C, so AB + BC = AC.',
        wrong: [{ rel: { is: 'equal', a: '2x+1', b: 'x+5' }, why: 'AB and BC aren’t marked congruent. B is between A and C, so AB + BC = AC.' }] },
      { type: 'algebra', ask: 'M Is the Midpoint of AB. Find AB.',
        fig: fig({ A: { x: 3, y: 7 }, B: { x: 17, y: 7 }, M: { x: 10, y: 7 } }, [{ kind: 'segment', a: 'A', b: 'B' }],
          { labels: [seg('A', 'M', '3x − 4'), seg('M', 'B', 'x + 6')], marks: [{ seg: ['A', 'M'], ticks: 1 }, { seg: ['M', 'B'], ticks: 1 }] }),
        rel: { is: 'equal', a: '3x-4', b: 'x+6' }, find: { name: 'AB', expr: '(3x-4)+(x+6)' },
        hint: 'A midpoint splits a segment into two congruent parts: the tick marks say AM = MB.' },
      { type: 'algebra', ask: 'B Is Between A and C. Find AC.',
        fig: fig({ A: { x: 2, y: 5 }, C: { x: 18, y: 9 }, B: lerp({ x: 2, y: 5 }, { x: 18, y: 9 }, 9 / 21) }, [{ kind: 'segment', a: 'A', b: 'C' }],
          { labels: [seg('A', 'B', 'x + 3'), seg('B', 'C', '2x'), seg('A', 'C', '5x − 9')], labelBelow: ['A', 'C'] }),
        rel: { is: 'sum', parts: ['x+3', '2x'], total: '5x-9' }, find: { name: 'AC', expr: '5x-9' },
        hint: 'B is between A and C, so AB + BC = AC.',
        wrong: [{ rel: { is: 'equal', a: 'x+3', b: '2x' }, why: 'AB and BC aren’t marked congruent. AB + BC = AC.' }] },
    ],
    2: [
      { type: 'algebra', ask: 'Find m∠AEB.',
        fig: Object.assign(CROSSD(70), { labels: [ang('AEB', '(2x + 10)°'), ang('CED', '(3x − 20)°')] }),
        rel: { is: 'equal', a: '2x+10', b: '3x-20' }, find: { name: 'AEB', expr: '2x+10', angle: true },
        hint: '∠AEB and ∠CED are vertical angles.',
        wrong: [{ rel: { is: 'sum', parts: ['2x+10', '3x-20'], total: 180 }, why: 'Vertical angles are congruent: their measures are equal, not a sum of 180°.' }] },
      { type: 'algebra', ask: 'Find m∠AEB.',
        fig: Object.assign(CROSSD(100), { labels: [ang('AEB', '(4x + 20)°'), ang('BEC', '(2x + 40)°')] }),
        rel: { is: 'sum', parts: ['4x+20', '2x+40'], total: 180 }, find: { name: 'AEB', expr: '4x+20', angle: true },
        hint: '∠AEB and ∠BEC are a linear pair.',
        wrong: [{ rel: { is: 'equal', a: '4x+20', b: '2x+40' }, why: 'A linear pair adds to 180°. These two angles aren’t equal.' }] },
      { type: 'algebra', ask: 'm∠ABC = 100°. Find m∠DBC.',
        fig: fig({ B: B0, A: polar(B0, 8, 150), D: polar(B0, 8, 110), C: polar(B0, 8, 50) },
          [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'D' }, { kind: 'ray', a: 'B', b: 'C' }],
          { angles: [A3('ABD'), A3('DBC')], labels: [ang('ABD', '(x + 10)°'), ang('DBC', '(2x)°')] }),
        rel: { is: 'sum', parts: ['x+10', '2x'], total: 100 }, find: { name: 'DBC', expr: '2x', angle: true },
        hint: 'D is inside ∠ABC, so m∠ABD + m∠DBC = m∠ABC.',
        wrong: [{ rel: { is: 'equal', a: 'x+10', b: '2x' }, why: 'The two angles aren’t marked congruent. Together they make ∠ABC.' }] },
      { type: 'algebra', ask: '∠ABC Is a Right Angle. Find m∠DBC.',
        fig: fig({ B: p2(5, 3), A: polar(p2(5, 3), 8, 90), D: polar(p2(5, 3), 8, 50), C: polar(p2(5, 3), 9, 0) },
          [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'D' }, { kind: 'ray', a: 'B', b: 'C' }],
          { labels: [ang('ABD', '(x + 15)°'), ang('DBC', '(2x)°')], marks: [{ angle: A3('ABC'), right: true }] }),
        rel: { is: 'sum', parts: ['x+15', '2x'], total: 90 }, find: { name: 'DBC', expr: '2x', angle: true },
        hint: 'The box marks a right angle, so the two angles are complementary: they add to 90°.',
        wrong: [{ rel: { is: 'sum', parts: ['x+15', '2x'], total: 180 }, why: 'The box marks a right angle: 90°. Together the two angles make 90°, not 180°.' }] },
      { type: 'algebra', ask: 'Ray BD Bisects ∠ABC. Find m∠ABC.',
        fig: fig({ B: p2(4, 3), A: polar(p2(4, 3), 9, 100), D: polar(p2(4, 3), 9, 60), C: polar(p2(4, 3), 10, 20) },
          [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'D' }, { kind: 'ray', a: 'B', b: 'C' }],
          { labels: [ang('ABD', '(3x − 5)°'), ang('DBC', '(2x + 10)°')] }),
        rel: { is: 'equal', a: '3x-5', b: '2x+10' }, find: { name: 'ABC', expr: '(3x-5)+(2x+10)', angle: true },
        hint: 'A bisector splits an angle into two congruent angles. Then m∠ABC is the two halves together.',
        wrong: [{ rel: { is: 'sum', parts: ['3x-5', '2x+10'], total: 180 }, why: 'BD bisects ∠ABC, so the two halves are equal. They don’t make a straight angle.' }] },
      { type: 'algebra', ask: 'Find m∠BEC.',
        fig: Object.assign(CROSSD(65), { labels: [ang('AEB', '(5x − 10)°'), ang('CED', '(3x + 20)°')] }),
        rel: { is: 'equal', a: '5x-10', b: '3x+20' }, find: { name: 'BEC', expr: '180-(5x-10)', angle: true },
        hint: 'Two steps: vertical angles ∠AEB and ∠CED give x. Then ∠AEB and ∠BEC are a linear pair.',
        wrong: [{ rel: { is: 'sum', parts: ['5x-10', '3x+20'], total: 180 }, why: 'Vertical angles are congruent: their measures are equal, not a sum of 180°.' }] },
      { type: 'algebra', ask: 'm∠ABC = (10x − 10)°. Find m∠ABC.',
        fig: fig({ B: p2(4, 3), A: polar(p2(4, 3), 9, 110), D: polar(p2(4, 3), 9, 60), C: polar(p2(4, 3), 10, 0) },
          [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'D' }, { kind: 'ray', a: 'B', b: 'C' }],
          { labels: [ang('ABD', '(4x + 2)°'), ang('DBC', '(5x)°')] }),
        rel: { is: 'sum', parts: ['4x+2', '5x'], total: '10x-10' }, find: { name: 'ABC', expr: '10x-10', angle: true },
        hint: 'D is inside ∠ABC, so m∠ABD + m∠DBC = m∠ABC.',
        wrong: [{ rel: { is: 'sum', parts: ['4x+2', '5x'], total: 180 }, why: 'The two angles make ∠ABC, not a straight angle. Set their sum equal to 10x − 10.' }] },
      { type: 'algebra', ask: 'A, B and C Are on One Line. Find m∠EBC.',
        fig: fig({ B: p2(10, 3), A: polar(p2(10, 3), 8, 180), D: polar(p2(10, 3), 8, 140), E: polar(p2(10, 3), 8, 80), C: polar(p2(10, 3), 8, 0) },
          [{ kind: 'line', a: 'A', b: 'C' }, { kind: 'ray', a: 'B', b: 'D' }, { kind: 'ray', a: 'B', b: 'E' }],
          { labels: [ang('ABD', '(x + 10)°'), ang('DBE', '(2x)°'), ang('EBC', '(3x − 10)°')] }),
        rel: { is: 'sum', parts: ['x+10', '2x', '3x-10'], total: 180 }, find: { name: 'EBC', expr: '3x-10', angle: true },
        hint: 'The three angles together make a straight angle: 180°.',
        wrong: [{ rel: { is: 'sum', parts: ['x+10', '2x', '3x-10'], total: 360 }, why: 'They fill half a turn, a straight angle: 180°, not 360°.' }] },
    ],
    3: [
      { type: 'algebra', ask: 'Line m ∥ Line n. Find m∠APE.',
        fig: Object.assign(transAt(80), { labels: [ang('APE', '(3x + 5)°'), ang('CQP', '(4x − 20)°')] }),
        rel: { is: 'equal', a: '3x+5', b: '4x-20' }, find: { name: 'APE', expr: '3x+5', angle: true },
        hint: '∠APE and ∠CQP are corresponding angles, and m ∥ n.',
        wrong: [{ rel: { is: 'sum', parts: ['3x+5', '4x-20'], total: 180 }, why: 'Corresponding angles on parallel lines are congruent, not supplementary.' }] },
      { type: 'algebra', ask: 'Line m ∥ Line n. Find m∠BPQ.',
        fig: Object.assign(transAt(80), { labels: [ang('BPQ', '(2x + 30)°'), ang('PQD', '(3x + 25)°')] }),
        rel: { is: 'sum', parts: ['2x+30', '3x+25'], total: 180 }, find: { name: 'BPQ', expr: '2x+30', angle: true },
        hint: '∠BPQ and ∠PQD are same-side interior angles, and m ∥ n.',
        wrong: [{ rel: { is: 'equal', a: '2x+30', b: '3x+25' }, why: 'Same-side interior angles on parallel lines are supplementary: they add to 180°.' }] },
      { type: 'algebra', ask: 'Line t ⊥ Line m. Find x.',
        fig: Object.assign(PP(), { labelDir: { E: [-1, -0.2] }, labels: [ang('BPE', '(5x − 10)°')], marks: [{ angle: A3('BPE'), right: true }] }),
        rel: { is: 'equal', a: '5x-10', b: '90' }, find: { name: 'BPE', expr: '5x-10', angle: true },
        hint: 'Perpendicular lines meet at right angles, so the angle measures 90°.',
        wrong: [{ rel: { is: 'equal', a: '5x-10', b: '180' }, why: 'Perpendicular lines make right angles: 90°, not 180°.' }] },
      { type: 'algebra', ask: 'Line m ∥ Line n. Find m∠QPA.',
        fig: Object.assign(transAt(95), { labels: [ang('QPA', '(5x − 15)°'), ang('PQD', '(3x + 25)°')] }),
        rel: { is: 'equal', a: '5x-15', b: '3x+25' }, find: { name: 'QPA', expr: '5x-15', angle: true },
        hint: '∠QPA and ∠PQD are alternate interior angles, and m ∥ n.',
        wrong: [{ rel: { is: 'sum', parts: ['5x-15', '3x+25'], total: 180 }, why: 'Alternate interior angles on parallel lines are congruent, not supplementary.' }] },
      { type: 'algebra', ask: 'Line m ∥ Line n. Find m∠APE.',
        fig: Object.assign(transAt(110), { labels: [ang('APE', '(6x − 10)°'), ang('DQF', '(4x + 30)°')] }),
        rel: { is: 'equal', a: '6x-10', b: '4x+30' }, find: { name: 'APE', expr: '6x-10', angle: true },
        hint: '∠APE and ∠DQF are alternate exterior angles, and m ∥ n.',
        wrong: [{ rel: { is: 'sum', parts: ['6x-10', '4x+30'], total: 180 }, why: 'Alternate exterior angles on parallel lines are congruent, not supplementary.' }] },
      { type: 'algebra', ask: 'Line m ∥ Line n. Find m∠EPB.',
        fig: Object.assign(transAt(100), { labelDir: { E: [-1, -0.2] }, labels: [ang('EPB', '(2x + 20)°'), ang('DQF', '(3x + 10)°')] }),
        rel: { is: 'sum', parts: ['2x+20', '3x+10'], total: 180 }, find: { name: 'EPB', expr: '2x+20', angle: true },
        hint: '∠EPB and ∠DQF are same-side exterior angles, and m ∥ n.',
        wrong: [{ rel: { is: 'equal', a: '2x+20', b: '3x+10' }, why: 'Same-side exterior angles on parallel lines are supplementary: they add to 180°.' }] },
      { type: 'algebra', ask: 'What Value of x Makes Line m ∥ Line n?',
        fig: Object.assign(transAt(70), { labels: [ang('APE', '(3x − 5)°'), ang('CQP', '(2x + 20)°')] }),
        rel: { is: 'equal', a: '3x-5', b: '2x+20' }, find: { name: 'APE', expr: '3x-5', angle: true },
        hint: 'The lines are parallel exactly when corresponding angles are congruent.',
        wrong: [{ rel: { is: 'sum', parts: ['3x-5', '2x+20'], total: 180 }, why: 'For the lines to be parallel, corresponding angles must be congruent, not supplementary.' }] },
      { type: 'algebra', ask: 'Line m ∥ Line n. Find m∠EPB.',
        fig: Object.assign(transAt(70), { labels: [ang('APE', '(2x + 30)°'), ang('CQP', '(3x + 10)°')] }),
        rel: { is: 'equal', a: '2x+30', b: '3x+10' }, find: { name: 'EPB', expr: '180-(2x+30)', angle: true },
        hint: 'Two steps: corresponding angles ∠APE and ∠CQP give x. Then ∠APE and ∠EPB are a linear pair.',
        wrong: [{ rel: { is: 'sum', parts: ['2x+30', '3x+10'], total: 180 }, why: 'Corresponding angles on parallel lines are congruent, not supplementary.' }] },
    ],
    4: [
      { type: 'algebra', ask: 'Find m∠CAB.',
        fig: triAt({ x: 5, y: 3 }, 9, 58, 72, 'ABC', { labels: [ang('CAB', '(2x + 10)°'), ang('ABC', '(3x)°'), ang('BCA', '50°')] }),
        rel: { is: 'sum', parts: ['2x+10', '3x', '50'], total: 180 }, find: { name: 'CAB', expr: '2x+10', angle: true },
        hint: 'The three angles of a triangle add to 180°.',
        wrong: [{ rel: { is: 'equal', a: '2x+10', b: '3x' }, why: 'These angles aren’t marked congruent. The three angles of a triangle add to 180°.' }] },
      { type: 'algebra', ask: 'Find m∠CBD.',
        fig: extAt({ x: 3, y: 3 }, 7, 35, 105, { labels: [ang('CAB', '(x + 15)°'), ang('BCA', '(2x)°'), ang('CBD', '(4x − 5)°')] }),
        rel: { is: 'equal', a: '4x-5', b: '(x+15)+(2x)' }, find: { name: 'CBD', expr: '4x-5', angle: true },
        hint: '∠CBD is an exterior angle: it equals the sum of the two angles not next to it.',
        wrong: [{ rel: { is: 'sum', parts: ['x+15', '2x', '4x-5'], total: 180 }, why: '∠CBD is outside the triangle, so it isn’t one of the three angles that add to 180°. It equals m∠CAB + m∠BCA.' }] },
      { type: 'algebra', ask: 'CA = CB. Find m∠CAB.',
        fig: triAt({ x: 4, y: 4 }, 12, 40, 40, 'ABC', { labels: [ang('CAB', '(3x + 4)°'), ang('ABC', '(5x − 20)°')], marks: [{ seg: ['C', 'A'], ticks: 1 }, { seg: ['C', 'B'], ticks: 1 }] }),
        rel: { is: 'equal', a: '3x+4', b: '5x-20' }, find: { name: 'CAB', expr: '3x+4', angle: true },
        hint: 'The tick marks say CA = CB, so the angles opposite them, the base angles, are congruent.',
        wrong: [{ rel: { is: 'sum', parts: ['3x+4', '5x-20'], total: 180 }, why: 'The base angles of an isosceles triangle are congruent: their measures are equal. They don’t add to 180°.' }] },
      { type: 'algebra', ask: '△ABC ∼ △DEF. Find EF.',
        fig: PAIR(p2(2, 4), p2(6, 4), p2(2, 7), p2(10, 2), p2(18, 2), p2(10, 8), { labels: [seg('A', 'B', '4'), seg('B', 'C', '5'), seg('D', 'E', '8'), seg('E', 'F', 'x + 3')] }),
        rel: { is: 'equal', a: 'x+3', b: '10' }, find: { name: 'EF', expr: 'x+3' },
        hint: 'Matching sides of similar triangles are in proportion: EF / BC = DE / AB. Keep x on top.',
        wrong: [{ rel: { is: 'equal', a: 'x+3', b: '5' }, why: 'The triangles are similar, not congruent. DE is 2 times AB, so EF is 2 times BC.' }] },
      { type: 'algebra', ask: '△ABC ≅ △DEF. Find DE.',
        fig: PAIR(p2(2, 4), p2(9, 4), p2(4, 10), p2(11, 4), p2(18, 4), p2(13, 10), { labels: [seg('A', 'B', '3x − 1'), seg('D', 'E', '2x + 4')] }),
        rel: { is: 'equal', a: '3x-1', b: '2x+4' }, find: { name: 'DE', expr: '2x+4' },
        hint: 'Matching parts of congruent triangles are congruent. AB matches DE, so AB = DE.' },
      { type: 'algebra', ask: '∠BCA Is a Right Angle. Find m∠CAB.',
        fig: triAt(p2(3, 3), 12, 57, 33, 'ABC', { labels: [ang('CAB', '(3x + 6)°'), ang('ABC', '(2x − 1)°')], marks: [{ angle: A3('ACB'), right: true }] }),
        rel: { is: 'sum', parts: ['3x+6', '2x-1'], total: 90 }, find: { name: 'CAB', expr: '3x+6', angle: true },
        hint: 'The right angle is 90°, so the other two angles add to 90°.',
        wrong: [{ rel: { is: 'sum', parts: ['3x+6', '2x-1'], total: 180 }, why: 'The right angle already uses 90° of the 180°. The other two angles add to 90°.' }] },
      { type: 'algebra', ask: 'Find the Largest Angle, m∠BCA.',
        fig: triAt(p2(4, 3), 12, 40, 60, 'ABC', { labels: [ang('CAB', '(x + 10)°'), ang('ABC', '(2x)°'), ang('BCA', '(3x − 10)°')] }),
        rel: { is: 'sum', parts: ['x+10', '2x', '3x-10'], total: 180 }, find: { name: 'BCA', expr: '3x-10', angle: true },
        hint: 'The three angles of a triangle add to 180°.',
        wrong: [{ rel: { is: 'sum', parts: ['x+10', '2x', '3x-10'], total: 360 }, why: 'The angles of a triangle add to 180°, not 360°.' }] },
      { type: 'algebra', ask: '△ABC Is Equilateral. Find AC.',
        fig: triAt(p2(5, 3), 10, 60, 60, 'ABC', { labels: [seg('A', 'B', '4x − 7'), seg('B', 'C', '2x + 9')], marks: [{ seg: ['A', 'B'], ticks: 1 }, { seg: ['B', 'C'], ticks: 1 }, { seg: ['C', 'A'], ticks: 1 }] }),
        rel: { is: 'equal', a: '4x-7', b: '2x+9' }, find: { name: 'AC', expr: '4x-7' },
        hint: 'All three sides of an equilateral triangle are congruent, so AB = BC = AC.',
        wrong: [{ rel: { is: 'sum', parts: ['4x-7', '2x+9'], total: 180 }, why: 'These are side lengths, not angles. In an equilateral triangle the sides are equal.' }] },
      { type: 'algebra', ask: '∠CAB ≅ ∠ABC. Find CA.',
        fig: triAt(p2(4, 3), 12, 40, 40, 'ABC', { labels: [seg('C', 'A', '2x + 3'), seg('C', 'B', '5x − 9')] }),
        rel: { is: 'equal', a: '2x+3', b: '5x-9' }, find: { name: 'CA', expr: '2x+3' },
        hint: 'Two congruent angles in a triangle are opposite two congruent sides: CB and CA.' },
      { type: 'algebra', ask: '△ABC ∼ △DEF. Find m∠FDE.',
        fig: (() => {
          const f = triAt(p2(2, 3), 6, 65, 50, 'ABC'), g = triAt(p2(10, 2), 9, 65, 50, 'DEF');
          return fig(Object.assign(f.points, g.points), f.objects.concat(g.objects),
            { triangles: f.triangles.concat(g.triangles), angles: f.angles.concat(g.angles), labels: [ang('CAB', '(4x + 5)°'), ang('FDE', '(6x − 25)°')] });
        })(),
        rel: { is: 'equal', a: '4x+5', b: '6x-25' }, find: { name: 'FDE', expr: '6x-25', angle: true },
        hint: 'Matching angles of similar triangles are congruent. A matches D.',
        wrong: [{ rel: { is: 'sum', parts: ['4x+5', '6x-25'], total: 180 }, why: 'Matching angles of similar triangles are congruent, not supplementary.' }] },
    ],
    5: [
      { type: 'algebra', ask: 'Find m∠ABC.',
        fig: INSC(230, 90, 310, null, { labels: [ang('ABC', '(x + 10)°'), arcL(arcOf('A', 'C', { opp: 'B' }), '(3x − 10)°')] }),
        rel: { is: 'equal', a: '2(x+10)', b: '3x-10' }, find: { name: 'ABC', expr: 'x+10', angle: true },
        hint: 'An inscribed angle is half its intercepted arc: m⌒AC = 2 · m∠ABC.',
        wrong: [{ rel: { is: 'equal', a: 'x+10', b: '3x-10' }, why: 'An inscribed angle is half its arc, not equal to it.' }] },
      { type: 'algebra', ask: 'QS and QT Are Tangent to ⊙P. Find QS.',
        fig: Object.assign(TWO_TAN(), { ticks: false, labels: [seg('Q', 'S', '2x + 3'), seg('Q', 'T', '5x − 9')] }),
        rel: { is: 'equal', a: '2x+3', b: '5x-9' }, find: { name: 'QS', expr: '2x+3' },
        hint: 'Two tangent segments from the same point are congruent.' },
      { type: 'algebra', ask: '∠SQT Is Circumscribed About ⊙P. Find m∠SQT.',
        fig: CIRCUM(70, { labels: [ang('SQT', '(2x + 10)°'), arcL(arcOf('S', 'T'), '(3x + 20)°')] }),
        rel: { is: 'sum', parts: ['2x+10', '3x+20'], total: 180 }, find: { name: 'SQT', expr: '2x+10', angle: true },
        hint: 'A circumscribed angle and its minor arc add to 180°.',
        wrong: [{ rel: { is: 'equal', a: '2x+10', b: '3x+20' }, why: 'A circumscribed angle isn’t equal to its arc: together they make 180°.' }] },
      { type: 'algebra', ask: 'Find m⌒BC.',
        fig: CIRC(p2(8, 7), 5, { A: 90, B: 190, C: 350 }, [S2('P', 'A'), S2('P', 'B'), S2('P', 'C')],
          { labels: [arcL(arcOf('A', 'B', { opp: 'C' }), '(2x)°'), arcL(arcOf('B', 'C', { opp: 'A' }), '(3x + 10)°'), arcL(arcOf('C', 'A', { opp: 'B' }), '(x + 50)°')] }),
        rel: { is: 'sum', parts: ['2x', '3x+10', 'x+50'], total: 360 }, find: { name: 'BC', expr: '3x+10', arc: true },
        hint: 'The arcs go all the way around the circle, so they add to 360°.',
        wrong: [{ rel: { is: 'sum', parts: ['2x', '3x+10', 'x+50'], total: 180 }, why: 'The arcs make the whole circle: 360°, not 180°.' }] },
      { type: 'algebra', ask: 'Line JK Is Tangent to ⊙P at T. Find m∠PTK.',
        fig: Object.assign(TAN_ONE(), { labels: [ang('PTK', '(4x + 10)°')] }),
        rel: { is: 'equal', a: '4x+10', b: '90' }, find: { name: 'PTK', expr: '4x+10', angle: true },
        hint: 'A tangent is perpendicular to the radius at the point of tangency.',
        wrong: [{ rel: { is: 'equal', a: '4x+10', b: '180' }, why: 'Perpendicular means a right angle: 90°, not 180°.' }] },
      { type: 'algebra', ask: 'Find m∠ADC.',
        fig: INSC(200, 90, 340, { D: 135 }, { objects: [S2('D', 'A'), S2('D', 'C')], angles: [A3('ABC'), A3('ADC')], labels: [ang('ABC', '(3x − 5)°'), ang('ADC', '(2x + 20)°')] }),
        rel: { is: 'equal', a: '3x-5', b: '2x+20' }, find: { name: 'ADC', expr: '2x+20', angle: true },
        hint: 'Both inscribed angles intercept the same arc, ⌒AC, so they are congruent.',
        wrong: [{ rel: { is: 'sum', parts: ['3x-5', '2x+20'], total: 180 }, why: 'Inscribed angles on the same arc are congruent, not supplementary.' }] },
      { type: 'algebra', ask: 'AC Is a Diameter. Find x.',
        fig: INSC(180, 60, 0, null, { objects: [S2('A', 'C')], labels: [ang('ABC', '(5x + 15)°')] }),
        rel: { is: 'equal', a: '5x+15', b: '90' }, find: { name: 'ABC', expr: '5x+15', angle: true },
        hint: 'An angle inscribed in a semicircle is a right angle.',
        wrong: [{ rel: { is: 'equal', a: '5x+15', b: '180' }, why: 'The angle intercepts a semicircle, 180°, so it is half of that: 90°.' }] },
      { type: 'algebra', ask: 'Find m⌒AB.',
        fig: CIRC(p2(8, 7), 5, { A: 20, B: 130 }, [S2('P', 'A'), S2('P', 'B')], { angles: [A3('APB')], labels: [ang('APB', '(4x − 10)°'), arcL(arcOf('A', 'B'), '(3x + 20)°')] }),
        rel: { is: 'equal', a: '4x-10', b: '3x+20' }, find: { name: 'AB', expr: '3x+20', arc: true },
        hint: 'A central angle has the same measure as its arc.',
        wrong: [{ rel: { is: 'equal', a: '2(4x-10)', b: '3x+20' }, why: 'That rule is for inscribed angles. A central angle equals its arc.' }] },
      { type: 'algebra', ask: 'AC Is a Diameter. Find m⌒BC.',
        fig: CIRC(p2(8, 7), 5, { A: 180, B: 100, C: 0 }, [S2('A', 'C'), S2('P', 'B')],
          { labels: [arcL(arcOf('A', 'B'), '(2x + 20)°'), arcL(arcOf('B', 'C'), '(3x + 10)°')] }),
        rel: { is: 'sum', parts: ['2x+20', '3x+10'], total: 180 }, find: { name: 'BC', expr: '3x+10', arc: true },
        hint: 'A diameter cuts the circle into two semicircles, each 180°.',
        wrong: [{ rel: { is: 'sum', parts: ['2x+20', '3x+10'], total: 360 }, why: 'These two arcs make a semicircle: 180°, not the whole 360°.' }] },
      { type: 'algebra', ask: '∠SQT Is Circumscribed About ⊙P. Find m∠SPT.',
        fig: CIRCUM(60, { labels: [ang('SQT', '(x + 20)°'), ang('SPT', '(3x)°')] }),
        rel: { is: 'sum', parts: ['x+20', '3x'], total: 180 }, find: { name: 'SPT', expr: '3x', angle: true },
        hint: 'A circumscribed angle and its central angle add to 180°.',
        wrong: [{ rel: { is: 'equal', a: 'x+20', b: '3x' }, why: 'The circumscribed angle and the central angle aren’t equal: they add to 180°.' }] },
    ],
  };

  // ---------- Bridges: reasons, proofs and congruence shortcuts ----------
  // Give the Reason: a true statement about the figure (its claim is checked in the tests) and the
  // definition, postulate, theorem or property behind it.
  const reason = (ask, claim, answer, options, fig, why, hint) => ({ type: 'choose', ask, q: { c: 'reason', claim, answer, why, hint, g: claim.g, h: claim.h }, options, fig });
  // Complete the Proof: statements (with [s:AB] segment, [a:ABC] angle, [m:ABC] measure, [t:ABC]
  // triangle, [l:m] line tokens) and the reason for each, chosen from one list.
  const proof = (ask, rows, options, fig, done) => ({ type: 'proof', ask, rows, options, fig, done, hideMeasures: true });   // only the givens are marked
  const cong = (g, h) => ({ c: 'congruent', g: A3(g), h: A3(h) });

  // Which shortcut do the givens support? Sides are numbered by their first vertex in the
  // statement's order (side 0 joins vertices 0 and 1), angles by vertex. Shared sides and
  // vertical angles count as given but aren't drawn: students have to see them.
  function congCriteria(q) {
    const m = i => (i + 3) % 3;
    const S = new Set(q.sides || []), A = new Set(q.angles || []);
    if (q.shared != null) S.add(q.shared);
    if (q.vertical != null) A.add(q.vertical);
    if (q.right != null) A.add(q.right);
    const out = [];
    if (S.size === 3) out.push('SSS');
    if ([0, 1, 2].some(i => S.has(i) && S.has(m(i - 1)) && A.has(i))) out.push('SAS');
    if ([0, 1, 2].some(i => A.has(i) && A.has(m(i + 1)) && S.has(i))) out.push('ASA');
    if ([0, 1, 2].some(i => A.has(i) && A.has(m(i + 1)) && [...S].some(s => s !== i))) out.push('AAS');
    if (q.right != null && S.has(m(q.right + 1)) && (S.has(q.right) || S.has(m(q.right - 1)))) out.push('HL');
    return out;
  }
  // The marks a set of givens puts on both triangles: 1, 2, 3 ticks for the given side pairs, 1, 2,
  // 3 arcs for the given angle pairs, a box for right angles.
  function critMarks(q) {
    const [t, u] = q.stmt.map(A3), marks = [];
    const side = (tri, i) => [tri[i], tri[(i + 1) % 3]], ang = (tri, i) => [tri[(i + 2) % 3], tri[i], tri[(i + 1) % 3]];
    (q.sides || []).forEach((i, k) => marks.push({ seg: side(t, i), ticks: k + 1 }, { seg: side(u, i), ticks: k + 1 }));
    (q.angles || []).forEach((i, k) => marks.push({ angle: ang(t, i), arcs: k + 1 }, { angle: ang(u, i), arcs: k + 1 }));
    if (q.right != null) marks.push({ angle: ang(t, q.right), right: true }, { angle: ang(u, q.right), right: true });
    return marks;
  }
  const CRIT = ['SSS', 'SAS', 'ASA', 'AAS', 'HL', 'Not Enough'];
  const critTask = (ask, fig, q) => ({ type: 'choose', ask, q: Object.assign({ c: 'crit' }, q), options: CRIT, hideMeasures: true, fig: Object.assign(fig, { marks: critMarks(q) }) });
  // Kite ABCD split by BD into △ABD and △CBD, sharing side BD.
  const KITE = () => fig({ A: p2(3, 7), B: p2(10, 12), C: p2(17, 7), D: p2(10, 1) }, [S2('A', 'B'), S2('B', 'C'), S2('C', 'D'), S2('D', 'A'), S2('B', 'D')],
    { triangles: [tri('ABD'), tri('CBD')], angles: Geom.triAngles(tri('ABD')).concat(Geom.triAngles(tri('CBD'))) });
  // Segments AD and BC cross at their shared midpoint E, making △AEB and △DEC.
  const BOWTIE = () => fig({ A: p2(4, 11), B: p2(5, 2), C: p2(15, 12), D: p2(16, 3), E: p2(10, 7) }, [S2('A', 'D'), S2('B', 'C'), S2('A', 'B'), S2('C', 'D')],
    { triangles: [tri('AEB'), tri('DEC')], angles: Geom.triAngles(tri('AEB')).concat(Geom.triAngles(tri('DEC'))) });
  const HL_PAIR = () => PAIR(p2(2, 3), p2(8, 3), p2(2, 11), p2(18, 3), p2(12, 3), p2(18, 11));

  const B1_REASONS = ['Vertical Angles Theorem', 'Linear Pair Postulate', 'Corresponding Angles Postulate', 'Transitive Property'];
  const ALWAYS = ['Always', 'Only When m ∥ n'];
  const BRIDGE1 = {
    crossings: {
      title: 'One Crossing or Two?',
      tasks: [
        { type: 'show', ask: 'One Crossing or Two?', fig: TRANS(2), names: [N('angle', 'APE'), N('angle', 'QPB'), N('angle', 'CQP')],
          say: 'Angles at one crossing, like ∠APE and ∠QPB, are always related: vertical angles and linear pairs. Angles at two different crossings, like ∠APE and ∠CQP, are related only when m ∥ n.' },
        { type: 'choose', ask: '∠APE and ∠EPB Are Related', q: { c: 'always', g: A3('APE'), h: A3('EPB') }, options: ALWAYS, fig: TRANS(2) },
        { type: 'choose', ask: '∠APE and ∠CQP Are Related', q: { c: 'always', g: A3('APE'), h: A3('CQP') }, options: ALWAYS, fig: TRANS(2) },
        { type: 'choose', ask: '∠APE and ∠QPB Are Related', q: { c: 'always', g: A3('APE'), h: A3('QPB') }, options: ALWAYS, fig: TRANS(2) },
        { type: 'choose', ask: '∠QPB and ∠CQP Are Related', q: { c: 'always', g: A3('QPB'), h: A3('CQP') }, options: ALWAYS, fig: TRANS(2) },
        { type: 'mistake', ask: 'Line m Is Not Parallel to Line n. Tap the False Statement', fig: TRANS(2),
          claims: [{ c: 'pairIs', g: A3('APE'), h: A3('EPB'), name: 'linear pair' }, { c: 'congruent', g: A3('APE'), h: A3('QPB') }, { c: 'congruent', g: A3('APE'), h: A3('CQP') }] },
      ],
    },
    reasons: {
      title: 'Give the Reason',
      tasks: [
        { type: 'show', ask: 'Every Step Needs a Reason', fig: transAt(70), names: [N('angle', 'APE'), N('angle', 'QPB')],
          say: 'A reason is a definition, a postulate, a theorem or a property. ∠APE ≅ ∠QPB because of the Vertical Angles Theorem.' },
        reason('∠APE ≅ ∠QPB. Why?', cong('APE', 'QPB'), 'Vertical Angles Theorem', B1_REASONS, transAt(70), 'They are vertical angles, and vertical angles are congruent.'),
        reason('Line m ∥ Line n, So ∠APE ≅ ∠CQP. Why?', cong('APE', 'CQP'), 'Corresponding Angles Postulate', B1_REASONS, transAt(70), 'They are corresponding angles, and the lines are parallel.'),
        reason('m∠APE + m∠EPB = 180°. Why?', { c: 'supp', g: A3('APE'), h: A3('EPB') }, 'Linear Pair Postulate', B1_REASONS, transAt(70), 'They form a linear pair, so they are supplementary.'),
        proof('Line m ∥ Line n. Prove ∠QPB ≅ ∠CQP', [
          { s: '[l:m] ∥ [l:n]', r: 'Given', claim: { c: 'lineRel', a: 'm', b: 'n', rel: 'parallel' } },
          { s: '[a:APE] ≅ [a:CQP]', r: 'Corresponding Angles Postulate', claim: cong('APE', 'CQP') },
          { s: '[a:APE] ≅ [a:QPB]', r: 'Vertical Angles Theorem', claim: cong('APE', 'QPB') },
          { s: '[a:QPB] ≅ [a:CQP]', r: 'Transitive Property', claim: cong('QPB', 'CQP') },
        ], ['Given'].concat(B1_REASONS), transAt(70), 'Proved: alternate interior angles on parallel lines are congruent. That is the Alternate Interior Angles Theorem.'),
      ],
    },
  };

  // Bridge 2: Level 3's lines, crossed by more lines, make triangles, and Level 3's angle theorems
  // become the reasons the triangles are similar or congruent.
  // m ∥ n (through A, B and C, D), cut by AD and BC, which cross at E between them: △ABE above E
  // and △DCE below it. The lower triangle is k times the upper one (k = 1: congruent).
  const PAR_BOWTIE = (k = 2, extra) => {
    const A = p2(6, 11), B = p2(10, 11), E = p2(8, 11 - 9 / (1 + k));
    const D = p2(E.x + k * (E.x - A.x), E.y + k * (E.y - A.y)), C = p2(E.x + k * (E.x - B.x), E.y + k * (E.y - B.y));
    return fig({ A, B, C, D, E }, [Object.assign(L2('A', 'B'), { label: 'm' }), Object.assign(L2('C', 'D'), { label: 'n' }), L2('A', 'D'), L2('B', 'C')],
      Object.assign({ triangles: [tri('ABE'), tri('DCE')], angles: Geom.triAngles(tri('ABE')).concat(Geom.triAngles(tri('DCE'))), marks: PAR_MN(), labelDir: { E: [1, 0] } }, extra || {}));
  };
  const PAR_MN = () => [{ par: ['A', 'B'], at: 1.6 }, { par: ['C', 'D'], at: 1.25 }];
  // The same crossing lines with n tilted, so m and n are not parallel: only the vertical angles
  // match, and the triangles are neither similar nor congruent.
  const NOPAR_BOWTIE = () => fig({ A: p2(6, 11), B: p2(10, 11), E: p2(8, 8), D: p2(12, 2), C: p2(5, 3.5) },
    [Object.assign(L2('A', 'B'), { label: 'm' }), Object.assign(L2('C', 'D'), { label: 'n' }), L2('A', 'D'), L2('B', 'C')],
    { triangles: [tri('ABE'), tri('DCE')], angles: Geom.triAngles(tri('ABE')).concat(Geom.triAngles(tri('DCE'))), marks: [], labelDir: { E: [1, 0] } });
  // A triangle ABC cut by DE ∥ BC (D on AB, E on AC): the small △ADE shares ∠A with △ABC.
  // Unmarked (par = false): DE is drawn the same, but with no arrows it isn't given as parallel.
  const PAR_SIDE = (par = true, extra) => fig({ A: p2(8, 12), B: p2(2, 2), C: p2(17, 2), D: { on: ['A', 'B'], t: 0.45 }, E: { on: ['A', 'C'], t: 0.45 } },
    [S2('A', 'B'), S2('B', 'C'), S2('C', 'A'), S2('D', 'E')],
    Object.assign({ triangles: [tri('ADE'), tri('ABC')], angles: Geom.triAngles(tri('ADE')).concat(Geom.triAngles(tri('ABC'))),
      marks: par ? [{ par: ['D', 'E'] }, { par: ['B', 'C'], at: 0.62 }] : [] }, extra || {}));
  // BD ⊥ AC at D: right triangles △ADB and △CDB share leg BD.
  const RIGHT_D = [{ angle: A3('ADB'), right: true }, { angle: A3('CDB'), right: true }];
  const PERP = extra => fig({ A: p2(3, 3), D: p2(10, 3), C: p2(17, 3), B: p2(10, 11) }, [S2('A', 'C'), S2('A', 'B'), S2('C', 'B'), S2('B', 'D')],
    Object.assign({ triangles: [tri('ADB'), tri('CDB')], angles: Geom.triAngles(tri('ADB')).concat(Geom.triAngles(tri('CDB'))), marks: RIGHT_D.slice() }, extra || {}));
  // Marks for a figure: its parallel or right-angle marks plus the given congruent parts.
  const withMarks = (f, more) => Object.assign(f, { marks: f.marks.concat(more) });
  const ANG = (a, n) => ({ angle: A3(a), arcs: n }), SEG = (s, n) => ({ seg: s.split(''), ticks: n });
  // A shortcut question on a line figure keeps the figure's own marks (arrows, right angles).
  const critOn = (ask, f, q) => { const own = f.marks; const t = critTask(ask, f, q); t.fig.marks = own.concat(t.fig.marks); return t; };
  const LINE_REASONS = ['Vertical Angles Theorem', 'Alternate Interior Angles Theorem', 'Corresponding Angles Postulate', 'Given'];
  const B2_REASONS = ['Given', 'Reflexive Property', 'Definition of Midpoint', 'Definition of Perpendicular Lines', 'Vertical Angles Theorem',
    'Alternate Interior Angles Theorem', 'Corresponding Angles Postulate', 'AA Similarity Postulate', 'SSS Postulate', 'SAS Postulate', 'ASA Postulate', 'AAS Theorem', 'HL Theorem', 'CPCTC'];
  const AA_BOWTIE = () => withMarks(PAR_BOWTIE(2), [ANG('BAE', 1), ANG('CDE', 1), ANG('AEB', 2), ANG('DEC', 2)]);
  const AA_SIDE = () => withMarks(PAR_SIDE(), [ANG('ADE', 1), ANG('ABC', 1), ANG('AED', 2), ANG('ACB', 2)]);
  const MID_BOWTIE = () => withMarks(PAR_BOWTIE(1), [SEG('AE', 1), SEG('DE', 1)]);
  const HL_PERP = () => withMarks(PERP(), [SEG('AB', 1), SEG('CB', 1)]);
  // A 3-4-5 triangle ABC and a 6-8-10 triangle FDE (SIM_PAIR), with the side lengths written on.
  // SIDES_NOT is the same but with DE = 9, so one ratio is off and the triangles aren't similar.
  const SL = (a, b, text) => ({ seg: [a, b], text });
  const SIDES_345 = () => Object.assign(SIM_PAIR(), { labels: [SL('A', 'B', '4'), SL('B', 'C', '5'), SL('C', 'A', '3'), SL('F', 'D', '8'), SL('D', 'E', '10'), SL('E', 'F', '6')] });
  const SIDES_NOT = () => Object.assign(PAIR(p2(2, 4), p2(6, 4), p2(2, 7), p2(18, 2), p2(10 + 19 / 16, 2 + Math.sqrt(36 - 361 / 256)), p2(10, 2)),
    { labels: [SL('A', 'B', '4'), SL('B', 'C', '5'), SL('C', 'A', '3'), SL('F', 'D', '8'), SL('D', 'E', '9'), SL('E', 'F', '6')] });
  // Why a triangle's angles add to 180°: line DE through C, parallel to AB, turns two of the angles
  // into alternate interior angles at C, where the three angles make a straight line.
  const SUM_PAR = () => {
    const f = triAt({ x: 4, y: 3 }, 12, 50, 60), C = f.points.C;
    f.points.D = { x: C.x - 6, y: C.y }; f.points.E = { x: C.x + 6, y: C.y };
    f.objects.push(L2('D', 'E'));
    f.angles = f.angles.concat([A3('DCA'), A3('ECB')]);
    f.marks = [{ par: ['A', 'B'], at: 0.25 }, { par: ['D', 'E'], at: 0.8 }, { angle: A3('CAB'), arcs: 1 }, { angle: A3('DCA'), arcs: 1 }, { angle: A3('ABC'), arcs: 2 }, { angle: A3('ECB'), arcs: 2 }];
    return f;
  };
  const B2_ANGLES = { title: LEVEL4.angles.title, tasks: [LEVEL4.angles.tasks[0],
    { type: 'show', ask: 'Why the Angles Add to 180°', fig: SUM_PAR(), names: [N('angle', 'DCA'), N('angle', 'ACB'), N('angle', 'BCE')], hideMeasures: true,
      say: 'Draw line DE through C, parallel to AB. Then ∠DCA ≅ ∠CAB and ∠ECB ≅ ∠ABC: alternate interior angles, from Level 3. At C, ∠DCA, ∠ACB and ∠BCE make a straight line, 180°. So the triangle’s three angles add to 180° too. That is also why AA is enough for similar: when two angles match, the third must match.' },
    Object.assign(reason('∠DCA ≅ ∠CAB. Why?', cong('DCA', 'CAB'), 'Alternate Interior Angles Theorem', ['Alternate Interior Angles Theorem', 'Corresponding Angles Postulate', 'Vertical Angles Theorem', 'Given'], SUM_PAR(),
      'DE ∥ AB, and AC is a transversal: the two angles are between the parallel lines, on opposite sides of AC.', 'The angles are at two different crossings of AC. Between the lines, on which sides of AC?'), { hideMeasures: true }),
    ...LEVEL4.angles.tasks.slice(1)] };
  const BRIDGE2 = {
    makes: {
      title: 'Lines Make Triangles',
      tasks: [
        { type: 'show', ask: 'Parallel Lines, Two More Lines, Two Triangles', fig: PAR_BOWTIE(2), names: [N('triangle', 'ABE'), N('triangle', 'DCE')], hideMeasures: true,
          say: 'The arrows show m ∥ n. Two more lines, AD and BC, cross at E, between m and n. Three lines that cross make a triangle: m, AD and BC make △ABE, and n, AD and BC make △DCE.' },
        { type: 'name', ask: 'Name the Triangle Below E', fig: PAR_BOWTIE(2, { targetTri: tri('DCE') }), hideMeasures: true },
        Object.assign(reason('∠AEB ≅ ∠DEC. Why?', cong('AEB', 'DEC'), 'Vertical Angles Theorem', LINE_REASONS, PAR_BOWTIE(2),
          'They are vertical angles: across from each other where AD and BC cross.', 'Look at where the two angles meet: at the crossing, E.'), { hideMeasures: true }),
        Object.assign(reason('∠BAE ≅ ∠CDE. Why?', cong('BAE', 'CDE'), 'Alternate Interior Angles Theorem', LINE_REASONS, PAR_BOWTIE(2),
          'm ∥ n, and AD is a transversal: the two angles are between the lines, on opposite sides of AD.', 'The angles are at two different crossings of AD, so they need m ∥ n. Where are they: between the lines, and on which side of AD?'), { hideMeasures: true }),
        { type: 'show', ask: 'A Line Parallel to One Side', fig: PAR_SIDE(), names: [N('triangle', 'ADE'), N('triangle', 'ABC')], hideMeasures: true,
          say: 'The arrows show DE ∥ BC. DE cuts off a small triangle, △ADE, inside △ABC. The two triangles share ∠A.' },
        Object.assign(reason('∠ADE ≅ ∠ABC. Why?', cong('ADE', 'ABC'), 'Corresponding Angles Postulate', LINE_REASONS, PAR_SIDE(),
          'DE ∥ BC, and AB is a transversal: the two angles are in matching positions.', 'AB crosses both parallel segments. Are the angles in matching positions, or on opposite sides?'), { hideMeasures: true }),
        { type: 'show', ask: 'Perpendicular Lines Make Right Triangles', fig: PERP(), names: [N('triangle', 'ADB'), N('triangle', 'CDB')], hideMeasures: true,
          say: 'BD ⊥ AC, so ∠ADB and ∠CDB are right angles (the boxes). △ADB and △CDB are right triangles that share side BD.' },
        Object.assign(reason('∠ADB ≅ ∠CDB. Why?', cong('ADB', 'CDB'), 'Definition of Perpendicular Lines', ['Definition of Perpendicular Lines', 'Vertical Angles Theorem', 'Alternate Interior Angles Theorem', 'Given'], PERP(),
          'BD ⊥ AC makes right angles, and all right angles are congruent.'), { hideMeasures: true }),
      ],
    },
    similar: {
      title: 'Similar by AA, SSS or SAS',
      tasks: [
        { type: 'show', ask: 'AA: Two Angles Are Enough for Similar', fig: AA_BOWTIE(), names: [N('triangle', 'ABE'), N('triangle', 'DCE')], hideMeasures: true,
          say: 'If two angles of one triangle are congruent to two angles of another, the triangles are similar (AA Similarity Postulate). Here ∠BAE ≅ ∠CDE (alternate interior) and ∠AEB ≅ ∠DEC (vertical), so △ABE ∼ △DCE.' },
        { type: 'choose', ask: 'm ∥ n. Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABE'), u: tri('DCE') }, options: TRI_REL, fig: AA_BOWTIE() },
        { type: 'triRel', ask: 'Write the Similarity Statement, Starting With △ABE', want: 'similar', fig: AA_BOWTIE(), hideMeasures: true },
        proof('m ∥ n. Prove △ABE ∼ △DCE', [
          { s: '[a:BAE] ≅ [a:CDE]', r: 'Alternate Interior Angles Theorem', claim: cong('BAE', 'CDE') },
          { s: '[a:AEB] ≅ [a:DEC]', r: 'Vertical Angles Theorem', claim: cong('AEB', 'DEC') },
          { s: '[t:ABE] ∼ [t:DCE]', r: 'AA Similarity Postulate', claim: { c: 'triRel', t: tri('ABE'), u: tri('DCE'), rel: 'similar' } },
        ], B2_REASONS, PAR_BOWTIE(2), 'Similar by AA: △DCE is △ABE, twice as big and turned around.'),
        { type: 'show', ask: 'A Parallel Line Makes a Similar Triangle', fig: AA_SIDE(), names: [N('triangle', 'ADE'), N('triangle', 'ABC')], hideMeasures: true,
          say: 'DE ∥ BC gives two pairs of corresponding angles: ∠ADE ≅ ∠ABC and ∠AED ≅ ∠ACB. By AA, △ADE ∼ △ABC. They also share ∠A.' },
        Object.assign(reason('∠DAE ≅ ∠BAC. Why?', cong('DAE', 'BAC'), 'Reflexive Property', ['Reflexive Property', 'Vertical Angles Theorem', 'Corresponding Angles Postulate', 'Given'], PAR_SIDE(),
          'It is the same angle in both triangles, and any angle is congruent to itself.'), { hideMeasures: true }),
        proof('DE ∥ BC. Prove △ADE ∼ △ABC', [
          { s: '[a:ADE] ≅ [a:ABC]', r: 'Corresponding Angles Postulate', claim: cong('ADE', 'ABC') },
          { s: '[a:DAE] ≅ [a:BAC]', r: 'Reflexive Property', claim: cong('DAE', 'BAC') },
          { s: '[t:ADE] ∼ [t:ABC]', r: 'AA Similarity Postulate', claim: { c: 'triRel', t: tri('ADE'), u: tri('ABC'), rel: 'similar' } },
        ], B2_REASONS, PAR_SIDE(), 'Two pairs of congruent angles: similar by AA.'),
        { type: 'triRel', ask: 'Write the Similarity Statement, Starting With △ADE', want: 'similar', fig: AA_SIDE(), hideMeasures: true },
        // Similar by sides: SSS and SAS Similarity, set against SSS and SAS for congruence.
        { type: 'show', ask: 'SSS Similarity: Three Sides, One Ratio', fig: SIDES_345(), names: [N('triangle', 'ABC'), N('triangle', 'FDE')], hideMeasures: true,
          say: 'Every side of △FDE is 2 times as long as its match in △ABC: 8 ÷ 4 = 10 ÷ 5 = 6 ÷ 3 = 2. Three sides in the same ratio: △ABC ∼ △FDE by the SSS Similarity Postulate. (The SSS Postulate for congruence needs the sides to be congruent, not just in the same ratio.)' },
        { type: 'choose', ask: 'Which Proves △ABC ∼ △FDE?', q: { c: 'fixed', answer: 'SSS Similarity Postulate', why: 'The three pairs of sides are in the same ratio, 2. They aren’t congruent, so it isn’t the SSS Postulate.', hint: 'Are the matching sides equal, or in the same ratio?' },
          options: ['SSS Postulate', 'SSS Similarity Postulate', 'AA Similarity Postulate'], fig: SIDES_345(), hideMeasures: true },
        { type: 'choose', ask: 'Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABC'), u: tri('FDE') }, options: TRI_REL, fig: SIDES_NOT(), hideMeasures: true },
        { type: 'show', ask: 'SAS Similarity: Two Sides and the Angle Between', hideMeasures: true, names: [N('triangle', 'ABC'), N('triangle', 'FDE')],
          fig: Object.assign(SIM_PAIR(), { labels: [SL('A', 'B', '4'), SL('C', 'A', '3'), SL('F', 'D', '8'), SL('E', 'F', '6')], marks: [{ angle: A3('BAC'), right: true }, { angle: A3('DFE'), right: true }] }),
          say: 'Two pairs of sides are in the same ratio (8 ÷ 4 = 6 ÷ 3 = 2), and the angles between them, ∠BAC and ∠DFE, are congruent right angles. That is enough: △ABC ∼ △FDE by the SAS Similarity Postulate.' },
        { type: 'choose', ask: 'Which Proves △ABC ∼ △FDE?', q: { c: 'fixed', answer: 'SAS Similarity Postulate', why: 'Two pairs of sides in the same ratio, 2, and the angles between them congruent.', hint: 'How many sides are marked, and how do they compare?' },
          options: ['SAS Postulate', 'SAS Similarity Postulate', 'SSS Similarity Postulate'], hideMeasures: true,
          fig: Object.assign(SIM_PAIR(), { labels: [SL('A', 'B', '4'), SL('C', 'A', '3'), SL('F', 'D', '8'), SL('E', 'F', '6')], marks: [{ angle: A3('BAC'), right: true }, { angle: A3('DFE'), right: true }] }) },
      ],
    },
    congruent: {
      title: 'Congruent by ASA, AAS or HL',
      tasks: [
        { type: 'show', ask: 'Congruent Triangles Match Part by Part', fig: CONG_PAIR(), names: [N('triangle', 'ABC'), N('triangle', 'EFD')],
          say: '△ABC ≅ △EFD means all six pairs of matching parts are congruent: A with E, B with F, C with D. You don’t need all six to prove it: three well-chosen pairs are enough.' },
        { type: 'show', ask: 'SSS and SAS', fig: Object.assign(CONG_PAIR(), { marks: critMarks({ stmt: ['ABC', 'EFD'], sides: [0, 1], angles: [1] }) }), names: [N('triangle', 'ABC'), N('triangle', 'EFD')], hideMeasures: true,
          say: 'SSS: three pairs of congruent sides. SAS: two pairs of sides and the angle between them, like here.' },
        { type: 'show', ask: 'ASA, AAS and HL', fig: Object.assign(CONG_PAIR(), { marks: critMarks({ stmt: ['ABC', 'EFD'], angles: [0, 1], sides: [0] }) }), names: [N('triangle', 'ABC'), N('triangle', 'EFD')], hideMeasures: true,
          say: 'ASA: two angles and the side between them, like here. AAS: two angles and a side not between them. HL: in right triangles, the hypotenuse and a leg.' },
        critTask('Which Shortcut Proves △ABC ≅ △EFD?', CONG_PAIR(), { stmt: ['ABC', 'EFD'], sides: [0, 1], angles: [1] }),
        critTask('Do the Marks Prove △ABC ≅ △EFD?', CONG_PAIR(), { stmt: ['ABC', 'EFD'], sides: [0, 1], angles: [0] }),
        { type: 'show', ask: 'Parallel Lines Plus One Side: Congruent', fig: withMarks(MID_BOWTIE(), [ANG('BAE', 1), ANG('CDE', 1), ANG('AEB', 2), ANG('DEC', 2)]), names: [N('triangle', 'AEB'), N('triangle', 'DEC')], hideMeasures: true,
          say: 'Now E is the midpoint of AD, so AE ≅ DE. With ∠BAE ≅ ∠CDE (alternate interior) and ∠AEB ≅ ∠DEC (vertical), △AEB ≅ △DEC by ASA: two angles and the side between them. Angles alone only prove similar; a matching side makes them congruent.' },
        critOn('m ∥ n and E Is the Midpoint of AD. Which Shortcut?', PAR_BOWTIE(1), { stmt: ['AEB', 'DEC'], sides: [0], angles: [0, 2], vertical: 1 }),
        proof('m ∥ n and E Is the Midpoint of AD. Prove △AEB ≅ △DEC', [
          { s: '[s:AE] ≅ [s:DE]', r: 'Definition of Midpoint', why: 'The given says E is the midpoint, not AE ≅ DE. Which definition turns midpoint into AE ≅ DE?', claim: { c: 'segEq', s1: ['A', 'E'], s2: ['D', 'E'] } },
          { s: '[a:BAE] ≅ [a:CDE]', r: 'Alternate Interior Angles Theorem', claim: cong('BAE', 'CDE') },
          { s: '[a:AEB] ≅ [a:DEC]', r: 'Vertical Angles Theorem', claim: cong('AEB', 'DEC') },
          { s: '[t:AEB] ≅ [t:DEC]', r: 'ASA Postulate', why: 'Steps 1 to 3 give one pair of sides and two pairs of angles, so it can’t be SAS or SSS: they need two or three pairs of sides. Is the side AE between the two angles, or not?', claim: { c: 'triRel', t: tri('AEB'), u: tri('DEC'), rel: 'congruent' } },
          { s: '[s:AB] ≅ [s:DC]', r: 'CPCTC', claim: { c: 'segEq', s1: ['A', 'B'], s2: ['D', 'C'] } },
        ], B2_REASONS, MID_BOWTIE(), 'Proved by ASA, and then AB ≅ DC by CPCTC.'),
        critOn('m ∥ n and BE ≅ CE. Which Shortcut?', PAR_BOWTIE(1), { stmt: ['ABE', 'DCE'], sides: [1], angles: [0, 1], vertical: 2 }),
        { type: 'show', ask: 'CPCTC: After the Proof', fig: Object.assign(CONG_PAIR(), { marks: critMarks({ stmt: ['ABC', 'EFD'], sides: [0, 1, 2] }) }), hideMeasures: true,
          names: [N('triangle', 'ABC'), N('triangle', 'EFD')],
          say: 'CPCTC: Corresponding Parts of Congruent Triangles are Congruent. The marks prove △ABC ≅ △EFD by SSS. Now every matching pair is congruent too, like ∠ABC ≅ ∠EFD: letters in the same position match, B with F. Use CPCTC only after the triangles are proved congruent.' },
        Object.assign(reason('△ABC ≅ △EFD by SSS, So ∠ABC ≅ ∠EFD. Why?', cong('ABC', 'EFD'), 'CPCTC', ['CPCTC', 'SSS Postulate', 'Vertical Angles Theorem', 'Given'],
          Object.assign(CONG_PAIR(), { marks: critMarks({ stmt: ['ABC', 'EFD'], sides: [0, 1, 2] }) }), 'The triangles are already proved congruent, so their matching parts are congruent.',
          'SSS proved the triangles congruent. This step uses that result to say a matching pair of angles is congruent.'), { hideMeasures: true }),
        critOn('BD ⊥ AC and AB ≅ CB. Which Shortcut?', PERP(), { stmt: ['ADB', 'CDB'], sides: [2], shared: 1, right: 1 }),
        proof('BD ⊥ AC and AB ≅ CB. Prove △ADB ≅ △CDB', [
          { s: '[a:ADB] ≅ [a:CDB]', r: 'Definition of Perpendicular Lines', claim: cong('ADB', 'CDB') },
          { s: '[s:AB] ≅ [s:CB]', r: 'Given', claim: { c: 'segEq', s1: ['A', 'B'], s2: ['C', 'B'] } },
          { s: '[s:BD] ≅ [s:BD]', r: 'Reflexive Property', claim: { c: 'segEq', s1: ['B', 'D'], s2: ['B', 'D'] } },
          { s: '[t:ADB] ≅ [t:CDB]', r: 'HL Theorem', claim: { c: 'triRel', t: tri('ADB'), u: tri('CDB'), rel: 'congruent' } },
        ], B2_REASONS, HL_PERP(), 'Right triangles with congruent hypotenuses and a shared leg: congruent by HL.'),
        critTask('△ABD and △CBD Share a Side. Which Shortcut?', KITE(), { stmt: ['ABD', 'CBD'], sides: [0, 2], shared: 1 }),
        proof('Prove △ABD ≅ △CBD', [
          { s: '[s:AB] ≅ [s:CB]', r: 'Given', claim: { c: 'segEq', s1: ['A', 'B'], s2: ['C', 'B'] } },
          { s: '[s:AD] ≅ [s:CD]', r: 'Given', claim: { c: 'segEq', s1: ['A', 'D'], s2: ['C', 'D'] } },
          { s: '[s:BD] ≅ [s:BD]', r: 'Reflexive Property', claim: { c: 'segEq', s1: ['B', 'D'], s2: ['B', 'D'] } },
          { s: '[t:ABD] ≅ [t:CBD]', r: 'SSS Postulate', claim: { c: 'triRel', t: tri('ABD'), u: tri('CBD'), rel: 'congruent' } },
        ], B2_REASONS, Object.assign(KITE(), { marks: critMarks({ stmt: ['ABD', 'CBD'], sides: [0, 2] }) }), 'Proved by SSS.'),
      ],
    },
    decide: {
      title: 'Congruent or Similar?',
      tasks: [
        // Similar and congruent, side by side: the same crossing lines, first twice as big, then the same size.
        { type: 'show', ask: 'Similar: Same Shape, Different Size', fig: PAR_BOWTIE(2), names: [N('triangle', 'ABE'), N('triangle', 'DCE')],
          say: 'Check the Measurements: the matching angles are equal, and every side of △DCE is 2 times as long as its match in △ABE. Same shape, different size: △ABE ∼ △DCE, with scale factor 2.' },
        { type: 'show', ask: 'Congruent: Same Shape, Same Size', fig: PAR_BOWTIE(1), names: [N('triangle', 'ABE'), N('triangle', 'DCE')],
          say: 'Now E is halfway between m and n. The matching angles are still equal, and now the matching sides are equal too: △ABE ≅ △DCE. Congruent triangles are similar with scale factor 1.' },
        { type: 'choose', ask: 'Which Is True for Both Similar and Congruent Triangles?', q: { c: 'fixed', answer: 'Matching Angles Are Congruent', why: 'Similar and congruent triangles both have the same shape, so their matching angles are congruent.', hint: 'Which one is about shape, not size?' },
          options: ['Matching Angles Are Congruent', 'Matching Sides Are Congruent', 'They Are the Same Size'], fig: PAR_BOWTIE(2) },
        { type: 'choose', ask: 'Which Is True Only for Congruent Triangles?', q: { c: 'fixed', answer: 'Matching Sides Are Congruent', why: 'Congruent triangles are the same size, so matching sides are congruent. Similar triangles’ sides are only in the same ratio.', hint: 'Similar triangles can be different sizes. What does that change?' },
          options: ['Matching Angles Are Congruent', 'Matching Sides Are Congruent', 'They Have the Same Shape'], fig: PAR_BOWTIE(1) },
        { type: 'choose', ask: 'DC Is How Many Times as Long as AB?', q: { c: 'fixed', answer: '2', why: 'DC = 8 and AB = 4, so the scale factor from △ABE to △DCE is 2. Every pair of matching sides has the same ratio.', hint: 'Compare the lengths in the Measurements.' },
          options: ['1', '2', '4'], fig: PAR_BOWTIE(2) },
        { type: 'choose', ask: 'Are Congruent Triangles Also Similar?', q: { c: 'fixed', answer: 'Yes', why: 'They have the same shape (similar) and the same size: a scale factor of 1.', hint: 'Does being the same size stop them from having the same shape?' },
          options: ['Yes', 'No'], fig: PAR_BOWTIE(1) },
        { type: 'choose', ask: 'Line m Is Not Parallel to Line n. Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABE'), u: tri('DCE') }, options: TRI_REL, fig: NOPAR_BOWTIE() },
        { type: 'choose', ask: 'Only m ∥ n Is Given. Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABE'), u: tri('DCE') }, options: TRI_REL, fig: PAR_BOWTIE(2), hideMeasures: true },
        { type: 'choose', ask: 'm ∥ n. Which Proves △ABE ∼ △DCE?', q: { c: 'fixed', answer: 'AA Similarity Postulate', why: 'Two pairs of congruent angles and no sides: similar by AA.', hint: 'Which pairs does the figure give you: angles, sides or both?' },
          options: ['AA Similarity Postulate', 'ASA Postulate', 'SSS Postulate'], fig: AA_BOWTIE(), hideMeasures: true },
        { type: 'choose', ask: 'The Marks Show Two Pairs of Congruent Angles. Are the Triangles Congruent?', q: { c: 'fixed', answer: 'No, Only Similar', why: 'AA fixes the shape, not the size. Congruent also needs a pair of matching sides.', hint: 'Do the marks say anything about the sides?' },
          options: ['Yes', 'No, Only Similar'], fig: AA_BOWTIE(), hideMeasures: true },
        { type: 'choose', ask: 'm ∥ n and E Is the Midpoint of AD. Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABE'), u: tri('DCE') }, options: TRI_REL, fig: MID_BOWTIE(), hideMeasures: true },
        { type: 'triRel', ask: 'Write the Congruence Statement, Starting With △ABE', want: 'congruent', fig: MID_BOWTIE(), hideMeasures: true },
        { type: 'choose', ask: 'DE ∥ BC. How Are △ADE and △ABC Related?', q: { c: 'triRel', t: tri('ADE'), u: tri('ABC') }, options: TRI_REL, fig: PAR_SIDE(), hideMeasures: true },
        { type: 'choose', ask: 'DE Looks Parallel to BC, but Nothing Says So. Is △ADE ∼ △ABC Proved?', q: { c: 'fixed', answer: 'Not Proved', why: 'The Corresponding Angles Postulate needs DE ∥ BC to be given, with arrows or in words. Looking parallel is never a reason.', hint: 'What would you need to be given before using corresponding angles?' },
          options: ['Yes, by AA', 'Not Proved'], fig: PAR_SIDE(false), hideMeasures: true },
        { type: 'choose', ask: 'BD ⊥ AC and AB ≅ CB. Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ADB'), u: tri('CDB') }, options: TRI_REL, fig: HL_PERP(), hideMeasures: true },
      ],
    },
  };

  const B3_REASONS = ['Definition of Circle', 'Isosceles Triangle Theorem', 'Exterior Angle Theorem', 'Substitution Property', 'Given'];
  const ISO_CIRC = extra => CIRC(p2(8, 7), 5, { A: 220, B: 320 }, [S2('P', 'A'), S2('P', 'B'), S2('A', 'B')], Object.assign({ triangles: [tri('PAB')], angles: Geom.triAngles(tri('PAB')) }, extra || {}));
  // Diameter BD through P, and A on the circle: the exterior angle ∠APD of △PAB is the central angle.
  const HALF = extra => CIRC(p2(8, 7), 5, { B: 90, D: 270, A: 200 }, [S2('B', 'D'), S2('B', 'A'), S2('P', 'A')], Object.assign({ angles: [A3('APD'), A3('PBA')] }, extra || {}));
  const BRIDGE3 = {
    inside: {
      title: 'Triangles Inside Circles',
      tasks: [
        // A circle can go around any angle (centered at its vertex) and any triangle (through its corners).
        { type: 'show', ask: 'A Circle Around an Angle', hideMeasures: true, names: [N('angle', 'ABC')],
          fig: CIRC(p2(9, 5), 5, { A: 25, C: 115 }, [{ kind: 'ray', a: 'B', b: 'A' }, { kind: 'ray', a: 'B', b: 'C' }], { angles: [A3('ABC')], targetArc: arcOf('A', 'C', { c: 'B' }), labelDir: { A: [0.45, 1], C: [-1, 0.35] } }, 'B'),
          say: 'Put the compass point on the vertex, B, and draw a circle. ∠ABC is now a central angle: its sides cut off arc AC, and the arc has the same measure as the angle.' },
        { type: 'show', ask: 'A Circle Around a Triangle', hideMeasures: true, names: [N('triangle', 'ABC')],
          fig: CIRC(p2(9, 7), 5, { A: 210, B: 330, C: 95 }, [S2('A', 'B'), S2('B', 'C'), S2('C', 'A')], { triangles: [tri('ABC')], angles: Geom.triAngles(tri('ABC')), targetArc: arcOf('A', 'B', { opp: 'C' }) }),
          say: 'Every triangle has exactly one circle through its three corners. Its center, P, is the same distance from A, B and C. Each angle is now an inscribed angle: ∠ACB is half of arc AB, the arc across from it.' },
        { type: 'show', ask: 'Two Radii Make an Isosceles Triangle', fig: ISO_CIRC(), names: [N('triangle', 'PAB')],
          say: 'PA and PB are radii, so PA ≅ PB. That makes △PAB isosceles, so its base angles are congruent: ∠PAB ≅ ∠PBA.' },
        reason('PA ≅ PB. Why?', { c: 'segEq', s1: ['P', 'A'], s2: ['P', 'B'] }, 'Definition of Circle', B3_REASONS.slice(0, 3).concat(['Given']), ISO_CIRC(), 'All radii of a circle are congruent.'),
        { type: 'measure', ask: 'Find the Measure of ∠PAB', hideMeasures: true, hint: 'PA ≅ PB, so the base angles are congruent, and the three angles add to 180°.',
          fig: ISO_CIRC({ targetAngle: A3('PAB'), labels: [angL('APB', '100°')] }) },
        { type: 'show', ask: 'Why an Inscribed Angle Is Half', fig: HALF(), names: [N('angle', 'PBA'), N('angle', 'APD')],
          say: '△PAB is isosceles. Its exterior angle ∠APD equals the two angles not next to it, which are congruent, so m∠APD = 2 · m∠PBA.' },
        proof('Prove m∠APD = 2 · m∠PBA', [
          { s: '[s:PA] ≅ [s:PB]', r: 'Definition of Circle', claim: { c: 'segEq', s1: ['P', 'A'], s2: ['P', 'B'] } },
          { s: '[a:PAB] ≅ [a:PBA]', r: 'Isosceles Triangle Theorem', claim: cong('PAB', 'PBA') },
          { s: '[m:APD] = [m:PAB] + [m:PBA]', r: 'Exterior Angle Theorem', claim: { c: 'ext', ext: A3('APD'), parts: [A3('PAB'), A3('PBA')] } },
          { s: '[m:APD] = 2 · [m:PBA]', r: 'Substitution Property', claim: { c: 'mMul', g: A3('APD'), h: A3('PBA'), k: 2 } },
        ], B3_REASONS, HALF(), 'Proved: the central angle is twice the inscribed angle, so the inscribed angle is half its arc.'),
        { type: 'show', ask: 'An Angle in a Semicircle', fig: INSC(180, 60, 0, null, { objects: [S2('A', 'C'), S2('P', 'B')] }), names: [N('angle', 'ABC')],
          say: 'AC is a diameter. Radius PB splits △ABC into two isosceles triangles, and the angles of △ABC add to 180°, so m∠ABC = 90°.' },
        reason('AC Is a Diameter, So m∠ABC = 90°. Why?', { c: 'mIs', g: A3('ABC'), deg: 90 }, 'Inscribed Angle Theorem', ['Inscribed Angle Theorem', 'Tangent Theorem', 'Vertical Angles Theorem', 'Given'], INSC(180, 60, 0, null, { objects: [S2('A', 'C')] }), 'An inscribed angle on a semicircle is a right angle.'),
        { type: 'measure', ask: 'AC Is a Diameter. Find the Measure of ∠BCA', hideMeasures: true, hint: '∠ABC is a right angle, and the three angles of △ABC add to 180°.',
          fig: CIRC(p2(8, 7), 5, { A: 180, B: 110, C: 0 }, [S2('A', 'C'), S2('A', 'B'), S2('B', 'C')], { angles: [A3('BAC'), A3('ABC'), A3('BCA')], targetAngle: A3('BCA'), labels: [angL('BAC', '55°')] }) },
      ],
    },
  };

  // ---------- Explore, one sandbox per level ----------
  // Level 2: two lines crossing at E. Every point moves: A and B swing the lines, C and D slide
  // along them, and E moves the crossing. Vertical angles stay congruent through all of it.
  const EXPLORE2 = fig({ E: E0, A: { x: 4, y: 5 }, C: { on: ['A', 'E'], t: 2 }, B: { x: 8, y: 12 }, D: { on: ['B', 'E'], t: 2 } },
    [{ kind: 'line', a: 'A', b: 'C' }, { kind: 'line', a: 'B', b: 'D' }],
    { angles: [A3('AEB'), A3('BEC'), A3('CED'), A3('DEA')], crossing: { at: 'E', lines: [['A', 'C'], ['B', 'D']] } });
  // Level 3: lines m, n and t each move on their own. Drag A or B to move m, C or D to move n,
  // and slide P along m or Q along n to move t. P and Q are always where t crosses m and n.
  const EXPLORE3 = fig({
    A: { x: 3, y: 10 }, B: { x: 17, y: 10 }, P: { on: ['A', 'B'], t: 5 / 14 },
    C: { x: 3, y: 4 }, D: { x: 16, y: 6 }, Q: { on: ['C', 'D'], t: 9 / 13 },
    E: { on: ['P', 'Q'], t: -0.25 }, F: { on: ['P', 'Q'], t: 1.25 },
  }, [
    { kind: 'line', a: 'A', b: 'B', label: 'm' }, { kind: 'line', a: 'C', b: 'D', label: 'n' }, { kind: 'line', a: 'E', b: 'F', label: 't' },
  ], {
    transversal: { l: ['A', 'B'], m: ['C', 'D'], t: ['E', 'F'], P: 'P', Q: 'Q' },
    angles: ['APE', 'EPB', 'BPQ', 'QPA', 'CQP', 'PQD', 'DQF', 'FQC'].map(A3),
  });
  const PAR3 = [{ at: 'D', dir: 'par', of: ['A', 'B'] }, { at: 'C', dir: 'par', of: ['A', 'B'] }, { at: 'B', dir: 'par', of: ['C', 'D'] }, { at: 'A', dir: 'par', of: ['C', 'D'] }];
  // Level 4: two triangles, △ABC and △DEF. Every vertex moves, and each one can snap to make its
  // triangle isosceles, right or equilateral, so every type by sides and by angles is reachable.
  // Ticks and arcs are shared, so matching sides and angles show across the two triangles.
  const EXPLORE4 = (() => {
    const f = TRI({ x: 2, y: 3 }, { x: 9, y: 3 }, { x: 4, y: 9 }), g = TRI({ x: 11, y: 4 }, { x: 17, y: 3 }, { x: 15, y: 10 }, 'DEF');
    return fig(Object.assign(f.points, g.points), f.objects.concat(g.objects),
      { triangles: f.triangles.concat(g.triangles), angles: f.angles.concat(g.angles) });
  })();
  // Level 5: ⊙P with inscribed ∠ABC and central ∠APC on the same arc, and two tangents from Q.
  // A, B and C slide around the circle; P moves the whole circle; Q moves outside it.
  const EXPLORE5 = (() => {
    const f = CIRC(p2(6, 7), 4.5, { A: 210, B: 120, C: 330 }, [S2('B', 'A'), S2('B', 'C'), S2('P', 'A'), S2('P', 'C'), S2('Q', 'S'), S2('Q', 'T'), S2('P', 'S'), S2('P', 'T'), ...TAN_RAYS()],
      { angles: [A3('ABC'), A3('APC'), A3('SQT'), A3('SPT'), A3('PSQ'), A3('QTP')], arcs: [arcOf('A', 'C', { opp: 'B' }), arcOf('S', 'T'), arcOf('A', 'B', { opp: 'C' }), arcOf('B', 'C', { opp: 'A' })], ticks: true,
        // A tangent is perpendicular to the radius at the point of tangency: part of what a tangent is, so always marked.
        marks: [{ angle: A3('PSQ'), right: true }, { angle: A3('QTP'), right: true }] });
    Object.assign(f.points, { Q: p2(16, 7), S: { tanFrom: 'Q', circ2: 'P', side: 1 }, T: { tanFrom: 'Q', circ2: 'P', side: -1 } });
    return f;
  })();
  // Magnets that pull vertex p of a triangle into shape against its other two vertices, q and r.
  const magnetsFor = (p, q, r) => [{ apex: [q, r] }, { bis: [q, r] }, { at: q, dir: 'perp', of: [q, r] }, { at: r, dir: 'perp', of: [q, r] }].map(m => Object.assign(m, { for: p }));
  const TRI_MAGNETS = ['ABC', 'BCA', 'CAB', 'DEF', 'EFD', 'FDE'].flatMap(s => magnetsFor(...s.split('')));

  const LEVELS = [
    { key: '1', title: 'Level 1: Lines, Segments, Rays and Planes', parts: LEVEL1, algebra: ALGEBRA[1],
      explore: () => ({ type: 'explore', ask: 'Explore', fig: EXPLORE, tools: ['move', 'segment', 'ray', 'line'], movable: 'all', planeToggle: true }) },
    { key: '2', title: 'Level 2: Angles', parts: LEVEL2, algebra: ALGEBRA[2],
      explore: () => ({ type: 'explore', ask: 'Explore', fig: EXPLORE2, tools: ['move'], movable: 'all' }) },
    { key: 'b1', title: 'Bridge 1: One Crossing or Two?', parts: BRIDGE1, bridge: true },
    { key: '3', title: 'Level 3: Parallel, Perpendicular, and Transversal', parts: LEVEL3, algebra: ALGEBRA[3],
      explore: () => ({ type: 'explore', ask: 'Explore', fig: EXPLORE3, tools: ['move'], movable: ['A', 'B', 'C', 'D', 'P', 'Q'], magnets: PAR3 }) },
    // Bridge 2 gives the triangle basics and similarity; Level 4 puts them to work in line figures,
    // with congruence and proofs (Jon, 2026-09-26).
    { key: 'b2', title: 'Bridge 2: From Lines to Triangles', bridge: true,
      parts: { naming: LEVEL4.naming, classify: LEVEL4.classify, angles: B2_ANGLES, similar: BRIDGE2.similar } },
    { key: '4', title: 'Level 4: Lines That Make Triangles', algebra: ALGEBRA[4],
      parts: { makes: BRIDGE2.makes, congSim: LEVEL4.congSim, congruent: BRIDGE2.congruent, decide: BRIDGE2.decide },
      explore: () => ({ type: 'explore', ask: 'Explore', fig: EXPLORE4, tools: ['move'], movable: 'all', magnets: TRI_MAGNETS }) },
    { key: 'b3', title: 'Bridge 3: Triangles Inside Circles', parts: BRIDGE3, bridge: true },
    { key: '5', title: 'Level 5: Circles', parts: LEVEL5, algebra: ALGEBRA[5],
      explore: () => ({ type: 'explore', ask: 'Explore', fig: EXPLORE5, tools: ['move'], movable: ['P', 'A', 'B', 'C', 'Q'], tangentToggle: true }) },
  ];

  const EXPLORE = fig(
    { A: { x: 2, y: 3 }, B: { x: 7, y: 5 }, C: { on: ['A', 'B'], t: 2 }, D: { x: 4, y: 11 }, E: { x: 10, y: 11 }, F: { x: 16, y: 3 } },
    [{ kind: 'line', a: 'A', b: 'B' }, { kind: 'segment', a: 'D', b: 'E' }, { kind: 'ray', a: 'F', b: 'E' }]);

  // ---------- Checking a typed name ----------
  // Capital and lowercase letters are part of the notation (a learning target), so a right answer
  // in the wrong case is "Almost" with a one-tap fix: the student still makes the change.
  const CASE = {
    point: 'Points are named with capital letters.',
    plane: 'A plane’s letter is a capital.',
    line: 'A line’s one-letter name is lowercase.',
  };
  const caseFix = (kind, pts, rule) => ({ status: 'almost', fix: { kind, pts }, message: 'Almost. ' + rule });

  // A plane's letter (plane N) and three points in it that aren't on one line (plane ABD) are
  // both correct names, on every task.
  function checkPlaneName(f, target, r) {
    if (r.kind && r.kind !== 'plane') return { status: 'bad', message: `A ${r.kind} is part of a plane, not the whole plane. Name the plane.` };
    if (!r.kind) return { status: 'ask', message: 'Which one? Start with the word plane.' };
    const res = Geom.resolvePlane(f, r.pts);
    if (res.error === 'noPoint') return { status: 'bad', message: `There's no point ${res.pt} in this figure.` };
    if (res.error === 'noPlane') return { status: 'bad', message: `This plane isn't labeled ${res.pt}. Look for its letter in the corner.` };
    if (res.error === 'collinear') return { status: 'almost', message: `${r.pts.join(', ')} are on one line, and many planes go through one line. Use three points that are not on one line.` };
    if (res.error === 'notIn') return { status: 'bad', message: `${res.pt} isn't in plane ${res.plane}.` };
    if (res.label !== target.label) return { status: 'bad', message: 'That names a different plane.' };
    if (r.lowercase) return caseFix('plane', r.pts, r.pts.length === 1 ? CASE.plane : CASE.point);
    const others = Geom.planeNames(f, target.label).map(p => p.join('')).filter(p => p !== r.pts.join(''));
    return { status: 'good', kind: 'plane', pts: r.pts, others, message: 'Yes.' };
  }

  // "line m": a line's own one-letter name, which is lowercase.
  function checkLineLetter(f, target, r) {
    if (target.kind !== 'line') return { status: 'bad', message: `One letter names a line. A ${target.kind} is named with two points.` };
    if (!target.label) return { status: 'bad', message: 'This line has no letter in the diagram. Name it with two of its points.' };
    if (r.letter.toLowerCase() !== target.label.toLowerCase()) return { status: 'bad', message: 'That letter names a different line.' };
    if (r.letter !== target.label) return caseFix('line', [target.label], CASE.line);
    return { status: 'good', kind: 'line', pts: [target.label], others: Geom.names(f, target).map(p => p.join('')), message: 'Yes.' };
  }

  function checkName(f, target, input) {
    if (target.kind === 'triangle') return checkTriName(f, target.pts, input);
    const r = Notation.parse(input);
    // "JKL" or "M" on a plane task: the right idea, missing the word.
    if (target.kind === 'plane' && !r.kind && !Notation.parse('plane ' + input).error) return { status: 'ask', message: 'Which one? Start with the word plane.' };
    if (r.error) return { status: 'bad', message: r.error };
    if (target.kind === 'plane') return checkPlaneName(f, target, r);
    if (r.letter) return checkLineLetter(f, target, r);
    const missing = r.pts.find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    if (!r.kind) return { status: 'ask', message: `Which one? With no mark, ${r.pts.join('')} is a length. Add segment, ray or line.` };
    if (r.kind !== target.kind) return { status: 'bad', message: `A ${r.kind} ${K[r.kind].ends}. How many endpoints does this figure have?` };
    const typed = { kind: r.kind, a: r.pts[0], b: r.pts[1] };
    if (Geom.same(f, target, typed)) {
      if (r.lowercase) return caseFix(r.kind, r.pts, CASE.point);
      const others = Geom.names(f, target).map(p => p.join('')).filter(p => p !== r.pts.join(''));
      if (target.label) others.unshift(target.label);
      return { status: 'good', kind: r.kind, pts: r.pts, others, message: 'Yes.' };
    }
    if (r.kind === 'ray' && Geom.same(f, target, { kind: 'ray', a: r.pts[1], b: r.pts[0] })) {
      return { status: 'almost', fix: { kind: 'ray', pts: [r.pts[1], r.pts[0]] }, message: `Almost. A ray is named endpoint first, and this one starts at ${r.pts[1]}.${r.lowercase ? ' ' + CASE.point : ''}` };
    }
    if (r.kind === 'segment' && !(target.a === r.pts[0] || target.b === r.pts[0]) !== !(target.a === r.pts[1] || target.b === r.pts[1])) {
      return { status: 'bad', message: 'A segment is named by its two endpoints.' };
    }
    return { status: 'bad', message: `That names a different ${r.kind}. Check which points are on it.` };
  }

  // ---------- Angles ----------
  const angleText = g => '∠' + g.join('');
  // Every correct three-point name of an angle: any point on each of its rays, vertex in the middle.
  function angleNames(f, g) {
    const pts = Object.keys(f.points), out = [];
    for (const p of pts) for (const q of pts) {
      if (p === q || p === g[1] || q === g[1]) continue;
      if (Geom.sameAngle(f, g, [p, g[1], q])) out.push([p, g[1], q]);
    }
    return out;
  }
  // Which of the figure's angles does a typed three-point name describe?
  const findAngle = (f, pts) => (f.angles || []).find(g => Geom.sameAngle(f, g, pts));

  function checkAngleName(f, target, input) {
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'angle') return { status: 'ask', message: 'Which one? Name an angle with the angle sign and three points, like ∠ABC.' };
    const missing = r.pts.find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    const v = target[1];
    if (r.pts.length === 1) {
      return r.pts[0] === v ? caseFix('angle', target, `Name angles with three points, vertex in the middle: ${angleText(target)}.`)
        : { status: 'bad', message: `The vertex of this angle is ${v}.` };
    }
    if (r.measure) return caseFix('angle', r.pts, `m${angleText(r.pts)} is the measure, a number. The angle itself is ${angleText(r.pts)}.`);
    if (!Geom.sameAngle(f, target, r.pts)) {
      if (r.pts.includes(v) && r.pts[1] !== v) return { status: 'bad', message: `The vertex, ${v}, goes in the middle.` };
      return { status: 'bad', message: 'That names a different angle.' };
    }
    if (r.lowercase) return caseFix('angle', r.pts, CASE.point);
    const others = angleNames(f, target).map(p => p.join('')).filter(p => p !== r.pts.join(''));
    return { status: 'good', kind: 'angle', pts: r.pts, others, message: 'Yes.' };
  }

  // Writing a measure: m∠ABC = 75°. The m matters: ∠ABC is the angle, m∠ABC its measure.
  function checkMeasure(f, target, input, hint) {
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'angle') return { status: 'ask', message: 'Write the measure like m∠ABC = 40°.' };
    const deg = Math.round(Geom.angleDeg(f, ...target));
    const name = r.pts.length === 3 ? r.pts : target;
    if (r.pts.length === 3 && !Geom.sameAngle(f, target, r.pts)) return { status: 'bad', message: 'That names a different angle.' };
    const fix = { kind: 'measure', pts: name, value: deg };
    if (r.value == null) return { status: 'ask', message: 'Add the measure: = and the number of degrees.' };
    if (Math.abs(r.value - Geom.angleDeg(f, ...target)) > 0.5) {
      // The number of a different angle marked on the figure: say whose it is.
      const given = (f.labels || []).find(lb => lb.angle && parseFloat(lb.text) === r.value && !Geom.sameAngle(f, lb.angle, target));
      if (given) return { status: 'bad', message: `${r.value}° is m${angleText(given.angle)}, not m${angleText(target)}. ${hint || ''}`.trim() };
      return { status: 'bad', message: hint ? 'Check the number. ' + hint : 'Check the number: the Measurements panel shows it.' };
    }
    if (r.pts.length === 1) return { status: 'almost', fix, message: `Almost. Name the angle with three points, vertex in the middle.` };
    if (!r.measure) return { status: 'almost', fix, message: `Almost. ${angleText(name)} is the angle. Its measure is m${angleText(name)}.` };
    if (r.lowercase) return { status: 'almost', fix, message: 'Almost. ' + CASE.point };
    return { status: 'good', kind: 'measure', pts: name, value: deg, message: 'Yes.' };
  }

  // Name the angle that forms a given pair with a given angle.
  function checkNamePair(f, given, want, input) {
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'angle' || r.pts.length !== 3) return { status: 'ask', message: 'Name the angle with the angle sign and three points, like ∠ABC.' };
    const missing = r.pts.find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    const typed = findAngle(f, r.pts);
    if (!typed) return { status: 'bad', message: 'The vertex goes in the middle, and both other points on the angle’s rays.' };
    const pair = Geom.anglePair(f, given, typed);
    if (pair !== want) return { status: 'bad', message: pair ? `${angleText(r.pts)} and ${angleText(given)} are ${pairWords(pair)}.` : `${angleText(r.pts)} and ${angleText(given)} don't form a named pair.` };
    if (r.lowercase) return caseFix('angle', r.pts, CASE.point);
    return { status: 'good', kind: 'angle', pts: r.pts, others: angleNames(f, typed).map(p => p.join('')).filter(p => p !== r.pts.join('')), message: 'Yes.' };
  }
  const pairWords = p => (p === 'vertical' ? 'vertical angles' : p === 'linear pair' ? 'a linear pair' : p + ' angles');

  // ---------- Triangles ----------
  const triText = t => '△' + t.join('');
  const perms = t => [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(ix => ix.map(i => t[i]));
  // △ABC: the triangle sign and its three vertices, in any order.
  function checkTriName(f, t, input) {
    if (/^\s*[A-Za-z]\s*[A-Za-z]\s*[A-Za-z]\s*$/.test(input)) return { status: 'ask', message: 'Which one? Put the triangle sign, △, before the three vertices.' };
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind === 'angle' && r.pts.length === 3) return { status: 'bad', message: `${angleText(r.pts)} is one angle of the triangle. Name the whole triangle with △.` };
    if (r.kind !== 'triangle') return { status: 'ask', message: 'Name it with the triangle sign and its three vertices, like △ABC.' };
    const missing = r.pts.find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    if (Geom.collinearPts(f, ...r.pts)) return { status: 'bad', message: `${r.pts.join(', ')} are on one line, so they don't make a triangle.` };
    if (!Geom.sameTri(f, t, r.pts)) return { status: 'bad', message: 'That names a different triangle. Use its three vertices, the corners.' };
    if (r.lowercase) return caseFix('triangle', r.pts, CASE.point);
    const others = perms(t).map(p => p.join('')).filter(p => p !== r.pts.join(''));
    return { status: 'good', kind: 'triangle', pts: r.pts, others, message: 'Yes.' };
  }
  // The side opposite an angle doesn't touch its vertex; the angle opposite a side is at the
  // vertex that isn't on it.
  function checkOpposite(f, task, input) {
    const t = f.triangles[0];
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    const missing = (r.pts || []).find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    if (task.given) {
      const v = task.given[1], want = t.filter(p => p !== v);
      if (r.kind === 'angle') return { status: 'bad', message: 'Name a side: a segment.' };
      if (!r.kind && r.pts) return { status: 'ask', message: `Which one? With no mark, ${r.pts.join('')} is a length. The side is a segment.` };
      if (r.kind !== 'segment') return { status: 'bad', message: `A side of a triangle is a segment: it has two endpoints.` };
      if (r.pts.includes(v)) return { status: 'bad', message: `That side touches the vertex, ${v}. The opposite side doesn't.` };
      if (!want.every(p => r.pts.includes(p))) return { status: 'bad', message: 'That isn’t a side of the triangle.' };
      if (r.lowercase) return caseFix('segment', r.pts, CASE.point);
      return { status: 'good', kind: 'segment', pts: r.pts, others: [[r.pts[1], r.pts[0]].join('')], message: 'Yes.' };
    }
    const v = t.find(p => !task.givenSide.includes(p)), g = Geom.triAngles(t).find(x => x[1] === v);
    if (r.kind !== 'angle') return { status: 'ask', message: 'Name an angle with the angle sign and three points, like ∠ABC.' };
    if (r.pts.length === 1) return r.pts[0] === v ? caseFix('angle', g, `Name angles with three points, vertex in the middle: ${angleText(g)}.`) : { status: 'bad', message: `The opposite angle is at the vertex that isn't on side ${task.givenSide.join('')}.` };
    if (!Geom.sameAngle(f, g, r.pts)) return { status: 'bad', message: r.pts[1] === v ? 'Put the vertex in the middle and one point from each side.' : `The opposite angle is at the vertex that isn't on side ${task.givenSide.join('')}.` };
    if (r.lowercase) return caseFix('angle', r.pts, CASE.point);
    return { status: 'good', kind: 'angle', pts: r.pts, others: angleNames(f, g).map(p => p.join('')).filter(p => p !== r.pts.join('')), message: 'Yes.' };
  }
  // ---------- Congruent and similar triangles: the letter order is the correspondence ----------
  const REL_SIGN = { congruent: '≅', similar: '∼' };
  // In a lesson the matching is what's being learned, so a wrong order points to the marks instead
  // of giving the answer; Explore (reveal) shows the matching.
  function checkTriRel(f, want, input, reveal) {
    const r = Notation.parse(input);
    if (r.kind !== 'triRel') return { status: 'ask', message: `Write it like △ABC ${REL_SIGN[want]} △DEF.` };
    if (r.error) return { status: 'bad', message: r.error };
    const missing = r.left.pts.concat(r.right.pts).find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    const T = f.triangles, L = T.find(t => Geom.sameTri(f, t, r.left.pts)), R = T.find(t => Geom.sameTri(f, t, r.right.pts));
    if (!L || !R || L === R) return { status: 'bad', message: 'Name the two triangles by their vertices.' };
    const cong = Geom.congruentTri(f, r.left.pts, r.right.pts), sim = Geom.similarTri(f, r.left.pts, r.right.pts);
    const actual = cong ? 'congruent' : sim ? 'similar' : null;
    if (!actual) return { status: 'bad', message: 'These triangles aren’t congruent or similar: their sides aren’t in one ratio.' };
    if (r.rel === 'congruent' && actual === 'similar') return { status: 'bad', message: 'Same shape, but not the same size: the sides aren’t congruent. Use ∼ for similar.' };
    if (want === 'congruent' && r.rel === 'similar') return { status: 'almost', message: 'True, but they are the same size too, so they are congruent. Use ≅.', fixText: Notation.triRelText('congruent', r.left.pts, cong) };
    const order = actual === 'congruent' ? cong : sim.order;
    if (!Geom.triStatement(f, r.left.pts, r.right.pts, r.rel)) {
      if (!reveal) return { status: 'almost', message: `Almost: they are ${actual}, but the letters don't match up in order. The angle at ${r.left.pts[0]} matches the angle with the same arcs. Which vertex is that?` };
      return { status: 'almost', message: `Almost. The order of the letters must match the parts: ${r.left.pts.map((p, i) => `${p} with ${order[i]}`).join(', ')}.`, fixText: Notation.triRelText(r.rel, r.left.pts, order) };
    }
    if (r.noSign) return { status: 'almost', message: 'Almost. Put △ before each triangle’s letters.', fixText: Notation.triRelText(r.rel, r.left.pts, r.right.pts) };
    if (r.lowercase) return { status: 'almost', message: 'Almost. ' + CASE.point, fixText: Notation.triRelText(r.rel, r.left.pts, r.right.pts) };
    const k = actual === 'similar' ? sim.k : 1;
    return { status: 'good', message: `Yes: ${Notation.triRelText(r.rel, r.left.pts, r.right.pts)}.${actual === 'similar' ? ` The scale factor is ${Math.abs(k - Math.round(k)) < 1e-9 ? Math.round(k) : k.toFixed(2)}.` : ''}` };
  }
  // In △ABC ≅ △EFD, the part that matches BC is FD: same positions in the two names.
  function matchPart(stmt, part) { return part.map(p => stmt[1][stmt[0].indexOf(p)]); }
  function checkCorresp(f, task, input) {
    const want = matchPart(task.stmt, task.part), r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    const missing = (r.pts || []).find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    const map = task.stmt[0].map((p, i) => `${p} with ${task.stmt[1][i]}`).join(', ');
    if (want.length === 2) {
      if (!r.kind && r.pts) return { status: 'ask', message: `Which one? With no mark, ${r.pts.join('')} is a length. A side is a segment.` };
      if (r.kind !== 'segment') return { status: 'bad', message: 'Name a side: a segment.' };
      if (!(want.every(p => r.pts.includes(p)))) return { status: 'bad', message: `Match the letters in order: ${map}.` };
      if (r.lowercase) return caseFix('segment', r.pts, CASE.point);
      return { status: 'good', kind: 'segment', pts: r.pts, others: [], message: 'Yes.' };
    }
    if (r.kind !== 'angle') return { status: 'ask', message: 'Name an angle with the angle sign and three points, like ∠ABC.' };
    if (r.pts.length === 1) return r.pts[0] === want[1] ? caseFix('angle', want, `Name angles with three points, vertex in the middle: ${angleText(want)}.`) : { status: 'bad', message: `Match the letters in order: ${map}.` };
    if (!Geom.sameAngle(f, want, r.pts)) return { status: 'bad', message: `Match the letters in order: ${map}.` };
    if (r.lowercase) return caseFix('angle', r.pts, CASE.point);
    return { status: 'good', kind: 'angle', pts: r.pts, others: angleNames(f, want).map(p => p.join('')).filter(p => p !== r.pts.join('')), message: 'Yes.' };
  }
  // ---------- Circles and arcs ----------
  // ⊙P: a circle is named by its center.
  function checkCircleName(f, c, input) {
    if (/^\s*[A-Za-z]\s*$/.test(input)) return { status: 'ask', message: `Which one? Put the circle sign before the center: ⊙${input.trim()}.` };
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'circle') return { status: 'ask', message: 'Name a circle by its center, with the circle sign, like ⊙P.' };
    if (r.pts[0] !== c) return { status: 'bad', message: f.points[r.pts[0]] ? `${r.pts[0]} is on the circle. A circle is named by its center.` : 'A circle is named by its center point.' };
    if (r.lowercase) return caseFix('circle', [c], CASE.point);
    return { status: 'good', kind: 'circle', pts: [c], others: [], message: 'Yes.' };
  }
  // A typed arc name as an arc: two letters name the minor arc, three the arc through the middle one.
  const typedArc = (c, pts) => pts.length === 2 ? { c, a: pts[0], b: pts[1] } : { c, a: pts[0], b: pts[2], via: pts[1] };
  function sameArc(f, t, u) {
    const ends = [t.a, t.b].every(p => [u.a, u.b].includes(p));
    if (!ends || (u.via && (!Geom.onCircle(f, t.c, u.via) || [t.a, t.b].includes(u.via)))) return false;
    return Math.abs(Geom.arcDeg(f, t) - Geom.arcDeg(f, u)) < 1e-7;
  }
  // Every correct name of an arc: two letters for a minor arc, three for a major arc or semicircle.
  function arcNames(f, t) {
    if (Geom.arcKind(f, t) === 'minor') return [[t.a, t.b], [t.b, t.a]];
    return Object.keys(f.points).filter(p => ![t.a, t.b].includes(p) && Geom.onCircle(f, t.c, p) && sameArc(f, t, { c: t.c, a: t.a, b: t.b, via: p }))
      .flatMap(p => [[t.a, p, t.b], [t.b, p, t.a]]);
  }
  function arcCheck(f, t, r) {
    const missing = r.pts.find(p => !f.points[p]);
    if (missing) return { status: 'bad', message: `There's no point ${missing} in this figure.` };
    const kind = Geom.arcKind(f, t), good = arcNames(f, t)[0];
    if (!sameArc(f, t, typedArc(t.c, r.pts))) {
      if (kind !== 'minor' && r.pts.length === 2 && [t.a, t.b].every(p => r.pts.includes(p))) return { status: 'almost', fix: good, message: `Almost. Two letters name the minor arc. A ${kind === 'major' ? 'major arc' : 'semicircle'} needs a third point on it, in the middle.` };
      return { status: 'bad', message: 'That names a different arc. Use its endpoints, and for a major arc a point on it in the middle.' };
    }
    if (kind === 'minor' && r.pts.length === 3) return { status: 'almost', fix: [r.pts[0], r.pts[2]], message: 'Almost. A minor arc is named by its two endpoints.' };
    if (r.lowercase) return { status: 'almost', fix: r.pts, message: 'Almost. ' + CASE.point };
    return { status: 'good', pts: r.pts };
  }
  function checkArcName(f, t, input) {
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'arc') return { status: 'ask', message: 'Name an arc with the arc sign, ⌒, or the word arc, like ⌒AB.' };
    if (r.measure || r.value != null) return caseFix('arc', r.pts, `m⌒${r.pts.join('')} is the measure, a number. The arc itself is ⌒${r.pts.join('')}.`);
    const c = arcCheck(f, t, r);
    if (c.status === 'almost') return caseFix('arc', c.fix, c.message.replace(/^Almost\. /, ''));
    if (c.status !== 'good') return c;
    return { status: 'good', kind: 'arc', pts: r.pts, others: arcNames(f, t).map(p => p.join('')).filter(p => p !== r.pts.join('')), message: 'Yes.' };
  }
  // m⌒AB = 70°: the arc's measure, with the m.
  function checkArcMeasure(f, t, input, hint) {
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'arc') return { status: 'ask', message: 'Write the measure like m⌒AB = 70°.' };
    const deg = Math.round(Geom.arcDeg(f, t)), c = arcCheck(f, t, r);
    if (c.status === 'bad') return c;
    const fix = { kind: 'arcMeasure', pts: c.fix || r.pts, value: deg };
    if (r.value == null) return { status: 'ask', message: 'Add the measure: = and the number of degrees.' };
    if (Math.abs(r.value - Geom.arcDeg(f, t)) > 0.5) return { status: 'bad', message: hint ? 'Check the number. ' + hint : 'Check the number: an arc’s measure is its central angle.' };
    if (c.status === 'almost') return { status: 'almost', fix, message: c.message };
    if (!r.measure) return { status: 'almost', fix, message: `Almost. ⌒${r.pts.join('')} is the arc. Its measure is m⌒${r.pts.join('')}.` };
    return { status: 'good', kind: 'arcMeasure', pts: r.pts, value: deg, message: 'Yes.' };
  }
  const SIDE_WHY = { equilateral: 'All three sides are congruent.', isosceles: 'At least two sides are congruent: the tick marks match.', scalene: 'No two sides are congruent: there are no matching tick marks.' };
  function triAngleWhy(f, t) {
    const k = Geom.triKind(f, t), g = Geom.triAngles(t).find(x => Geom.angleKind(Geom.angleDeg(f, ...x)) === k);
    return k === 'acute' ? 'All three angles are acute: each is less than 90°.' : `m${angleText(g)} = ${Math.round(Geom.angleDeg(f, ...g))}°, ${k === 'right' ? 'a right angle' : 'more than 90°'}.`;
  }

  // ---------- How two lines are related: m ∥ n, t ⊥ m ----------
  const byLabel = (f, l) => (f.objects || []).find(o => o.kind === 'line' && o.label === l);
  const SIGN = { parallel: '∥', perpendicular: '⊥' };
  // A typed side ("m", "line m", "AB") as a line in the figure, with any case problem noted.
  function resolveLine(f, side) {
    if (side.letter) {
      const o = (f.objects || []).find(x => x.kind === 'line' && x.label && x.label.toLowerCase() === side.letter.toLowerCase());
      return o ? { o, caseRule: side.letter !== o.label ? CASE.line : null, text: o.label } : null;
    }
    if (side.pts.some(p => !f.points[p])) return null;
    const o = (f.objects || []).find(x => x.kind === 'line' && Geom.same(f, x, { kind: 'line', a: side.pts[0], b: side.pts[1] }));
    return o ? { o, caseRule: side.lowercase ? CASE.point : null, text: side.pts.join('') } : null;
  }
  function checkRelation(f, labels, input) {
    const r = Notation.parse(input);
    if (r.error) return { status: 'bad', message: r.error };
    if (r.kind !== 'relation') return { status: 'ask', message: 'Write two lines with ∥ or ⊥ between them, like m ∥ n.' };
    const want = labels.map(l => byLabel(f, l));
    const L = resolveLine(f, r.left), R = resolveLine(f, r.right);
    if (!L || !R) return { status: 'bad', message: 'Use the names of lines in the diagram.' };
    if (!want.includes(L.o) || !want.includes(R.o) || L.o === R.o) return { status: 'bad', message: `Write it about line ${labels[0]} and line ${labels[1]}.` };
    const actual = Geom.lineRelation(f, L.o.a, L.o.b, R.o.a, R.o.b);
    if (r.rel !== actual) {
      return { status: 'bad', message: actual === 'parallel' ? 'These lines never meet, so they are parallel.' : actual === 'perpendicular' ? 'These lines meet at a right angle, so they are perpendicular.' : 'These lines are neither parallel nor perpendicular.' };
    }
    const fixText = `${L.text} ${SIGN[actual]} ${R.text}`;
    const rule = L.caseRule || R.caseRule;
    if (rule) return { status: 'almost', fixText, message: 'Almost. ' + rule };
    return { status: 'good', message: `Yes: ${fixText}.` };
  }

  // ---------- Multiple-choice questions, answered from the figure ----------
  const PAIR_LABEL = { vertical: 'Vertical Angles', 'linear pair': 'A Linear Pair', corresponding: 'Corresponding', 'alternate interior': 'Alternate Interior',
    'alternate exterior': 'Alternate Exterior', 'same-side interior': 'Same-Side Interior', 'same-side exterior': 'Same-Side Exterior' };
  function chooseAnswer(f, q) {
    if (q.c === 'kind') {
      const deg = Geom.angleDeg(f, ...q.ang), k = Geom.angleKind(deg);
      return { answer: k[0].toUpperCase() + k.slice(1), why: `m${angleText(q.ang)} = ${Math.round(deg)}°, ${k === 'acute' ? 'less than 90°' : k === 'right' ? 'exactly 90°' : k === 'straight' ? 'exactly 180°' : 'between 90° and 180°'}.` };
    }
    if (q.c === 'pair') {
      const p = Geom.anglePair(f, q.g, q.h);
      const why = {
        vertical: 'They sit across from each other where two lines cross.',
        'linear pair': 'They share a ray, and their other rays make a line.',
        corresponding: 'Same side of the transversal, same position at each line.',
        'alternate interior': 'Between the two lines, on opposite sides of the transversal.',
        'alternate exterior': 'Outside the two lines, on opposite sides of the transversal.',
        'same-side interior': 'Between the two lines, on the same side of the transversal.',
        'same-side exterior': 'Outside the two lines, on the same side of the transversal.',
      }[p] || 'They don’t share a vertex or sit at the same line crossing.';
      return { answer: PAIR_LABEL[p] || 'Neither', why };
    }
    if (q.c === 'relation') {
      const p = Geom.anglePair(f, q.g, q.h), rel = Geom.pairRelation(f, p);
      return { answer: rel === 'congruent' ? 'Congruent' : 'Supplementary', why: `They are ${pairWords(p)} and the lines are parallel, so they are ${rel === 'congruent' ? 'congruent' : 'supplementary: their measures add to 180°'}.` };
    }
    if (q.c === 'lineRel') {
      const rel = Geom.lineRelation(f, q.l[0], q.l[1], q.m[0], q.m[1]);
      return { answer: rel ? rel[0].toUpperCase() + rel.slice(1) : 'Neither',
        why: rel === 'parallel' ? 'They go the same direction and never meet.' : rel === 'perpendicular' ? 'They meet at a right angle.' : 'They meet, but not at a right angle.' };
    }
    if (q.c === 'isCongruent') {
      const p = Geom.anglePair(f, q.g, q.h), rel = Geom.pairRelation(f, p);
      const same = Math.abs(Geom.angleDeg(f, ...q.g) - Geom.angleDeg(f, ...q.h)) < 1e-7;
      const T = f.transversal, par = T && Geom.parallel(f, T.l[0], T.l[1], T.m[0], T.m[1]);
      return { answer: same ? 'Yes' : 'No', why: same ? 'Their measures are equal.' : `They are ${p ? pairWords(p) : 'angles with no pair name'}, but ${par ? 'they aren’t congruent' : 'the lines aren’t parallel, so they don’t have to be congruent'}.` };
    }
    // Names are inclusive: an equilateral triangle is isosceles too, so both are accepted.
    if (q.c === 'triSides') { const s = Geom.triSides(f, q.tri); return { answer: s[0].toUpperCase() + s.slice(1), why: SIDE_WHY[s],
      also: s === 'equilateral' ? [{ opt: 'Isosceles', why: 'True: it has at least two congruent sides. All three are congruent, so the most precise name is Equilateral.' }] : [] }; }
    if (q.c === 'triAngles') { const k = Geom.triKind(f, q.tri); return { answer: k[0].toUpperCase() + k.slice(1), why: triAngleWhy(f, q.tri) }; }
    if (q.c === 'congPair') {
      const p = q.pairs.find(([g, h]) => Math.abs(Geom.angleDeg(f, ...A3(g)) - Geom.angleDeg(f, ...A3(h))) < 1e-7);
      return { answer: p ? angPairText(p) : 'None', why: 'They are opposite the congruent sides.' };
    }
    if (q.c === 'fixed') return { answer: q.answer, why: q.why };
    if (q.c === 'always') {
      const p = Geom.anglePair(f, q.g, q.h), always = p === 'vertical' || p === 'linear pair';
      return { answer: always ? 'Always' : 'Only When m ∥ n', why: always ? `They share a vertex: ${pairWords(p)} are related whether or not the lines are parallel.` : `They are ${pairWords(p)}, at two different crossings, so they are related only when the lines are parallel.` };
    }
    if (q.c === 'reason') {
      if (!claimTruth(f, q.claim)) throw new Error('A reason task states something false: ' + JSON.stringify(q.claim));
      return { answer: q.answer, why: q.why };
    }
    if (q.c === 'crit') {
      // Every shortcut the givens support is right (vertical angles and angles from given parallel
      // lines count as givens); the first is the answer, the rest are accepted too.
      const found = congCriteria(q);
      const WHY = { SSS: 'Three pairs of sides are congruent.', SAS: 'Two pairs of sides, and the angle between them.', ASA: 'Two pairs of angles, and the side between them.',
        AAS: 'Two pairs of angles, and a side that is not between them.', HL: 'Right triangles with congruent hypotenuses and one pair of congruent legs.' };
      const none = (q.angles || []).length === 3 ? 'Three pairs of angles give the same shape, but not the same size (AAA is not a shortcut).' : 'Two sides and an angle that is not between them (SSA) is not a shortcut.';
      const more = found.length > 1 ? ` ${found.slice(1).join(' and ')} works too.` : '';
      return { answer: found[0] || 'Not Enough', why: found.length ? WHY[found[0]] + more : none,
        also: found.slice(1).map(c => ({ opt: c, why: `${WHY[c]} ${found.filter(x => x !== c).join(' and ')} works too.` })) };
    }
    if (q.c === 'circlePart') {
      const o = f.objects[q.obj], p = Geom.circlePart(f, q.circ, o);
      const why = { radius: 'It joins the center to a point on the circle.', diameter: 'It is a chord through the center.', chord: 'It joins two points on the circle, not through the center.',
        secant: 'It is a line that crosses the circle at two points.', tangent: 'It touches the circle at exactly one point.' }[p];
      // A diameter is a chord too, so both are accepted.
      return { answer: p ? p[0].toUpperCase() + p.slice(1) : 'None', why,
        also: p === 'diameter' ? [{ opt: 'Chord', why: 'True: it joins two points on the circle. It goes through the center, so the most precise name is Diameter.' }] : [] };
    }
    if (q.c === 'arcKind') {
      const k = Geom.arcKind(f, q.arc), d = Math.round(Geom.arcDeg(f, q.arc));
      return { answer: { minor: 'Minor Arc', major: 'Major Arc', semicircle: 'Semicircle' }[k], why: k === 'semicircle' ? 'Its endpoints are the ends of a diameter: it measures 180°.' : `It measures ${d}°, ${k === 'minor' ? 'less' : 'more'} than 180°.` };
    }
    if (q.c === 'angleType') {
      const k = Geom.angleAtCircle(f, q.circ, q.g);
      return { answer: { central: 'A Central Angle', inscribed: 'An Inscribed Angle', circumscribed: 'A Circumscribed Angle' }[k] || 'None',
        why: { central: 'Its vertex is the center of the circle.', inscribed: 'Its vertex is on the circle, and its sides are chords.', circumscribed: 'Its vertex is outside the circle, and both of its sides are tangent to it.' }[k] };
    }
    if (q.c === 'triRel') {
      const cong = Geom.congruentTri(f, q.t, q.u), sim = Geom.similarTri(f, q.t, q.u);
      if (cong) return { answer: 'Congruent', why: `Every side matches a congruent side: ${Notation.triRelText('congruent', q.t, cong)}.` };
      if (sim) return { answer: 'Similar', why: `Same shape: every side is ${Math.abs(sim.k - Math.round(sim.k)) < 1e-9 ? Math.round(sim.k) : sim.k.toFixed(2)} times as long, so ${Notation.triRelText('similar', q.t, sim.order)}.` };
      return { answer: 'Neither', why: 'The sides aren’t in one ratio, so the shapes are different.' };
    }
    throw new Error('Unknown question ' + q.c);
  }

  // ---------- Checking a drawn figure (diagram input) ----------
  function checkDraw(f, want, drawn) {
    const target = obj(want);
    if (drawn.kind !== target.kind) return { status: 'bad', message: `You drew a ${drawn.kind}. A ${target.kind} ${K[target.kind].ends}. Pick the ${target.kind[0].toUpperCase() + target.kind.slice(1)} tool.` };
    if (Geom.same(f, target, drawn)) return { status: 'good', message: 'Yes.' };
    if (drawn.kind === 'ray' && Geom.same(f, target, { kind: 'ray', a: drawn.b, b: drawn.a })) {
      return { status: 'almost', message: `Almost. Ray ${want.pts.join('')} starts at ${want.pts[0]}: tap ${want.pts[0]} first.` };
    }
    return { status: 'bad', message: `That ${drawn.kind} goes through different points. Look for ${want.pts.join(' and ')}.` };
  }
  // ---------- Tapping the figure a name describes (diagram input) ----------
  function checkFind(f, want, index, wantIn) {
    const tapped = f.objects[index];
    if (wantIn) {
      if (Geom.lineInPlane(f, tapped.a, tapped.b, wantIn)) return { status: 'good', message: `Yes. ${tapped.a} and ${tapped.b} are both in plane ${wantIn}, so the whole line is.` };
      const at = Geom.lineCrossesAt(f, tapped.a, tapped.b, wantIn);
      return { status: 'bad', message: at ? `That line crosses plane ${wantIn} at ${at} only.` : `That line isn't in plane ${wantIn}.` };
    }
    if (Geom.same(f, obj(want), tapped)) return { status: 'good', message: 'Yes.' };
    if (tapped.kind !== want.kind) return { status: 'bad', message: `That one is a ${tapped.kind}.` };
    if (tapped.kind === 'ray') return { status: 'bad', message: `That ray starts at ${tapped.a}. Ray ${want.pts.join('')} starts at ${want.pts[0]}.` };
    return { status: 'bad', message: `That ${tapped.kind} doesn't go through both ${want.pts.join(' and ')}.` };
  }

  // ---------- Same figure or different? ----------
  function sameReason(f, n1, n2) {
    if (n1.kind === 'plane' && n2.kind === 'plane') {
      const r1 = Geom.resolvePlane(f, n1.pts), r2 = Geom.resolvePlane(f, n2.pts);
      if (r1.label && r2.label) return { same: r1.label === r2.label, why: r1.label === r2.label ? `${n2.pts.join(', ')} are all in plane ${r1.label}.` : 'They are different planes.' };
      const bad = r1.label ? r2 : r1;
      return { same: false, why: bad.error === 'notIn' ? `${bad.pt} isn't in plane ${bad.plane}.` : 'Those points do not name one plane.' };
    }
    const a = obj(n1), b = obj(n2), isSame = Geom.same(f, a, b);
    let why;
    if (a.kind !== b.kind) why = `A ${a.kind} and a ${b.kind} are different kinds of figures.`;
    else if (a.kind === 'line') why = isSame ? 'All of these points are on one line.' : `${[b.a, b.b].find(p => !Geom.onFigure(f, a, p))} isn't on line ${n1.pts.join('')}.`;
    else if (a.kind === 'segment') why = isSame ? 'Same two endpoints, so the same segment.' : 'Different endpoints, so different segments.';
    else if (!isSame && a.a !== b.a) why = 'Different endpoints, so different rays.';
    else why = isSame ? 'Same endpoint, same direction.' : 'Same endpoint, but opposite directions.';
    return { same: isSame, why };
  }

  // ---------- Claims for find-the-mistake ----------
  function claimTruth(f, c) {
    if (c.c === 'same') return Geom.same(f, obj(c.n1), obj(c.n2));
    if (c.c === 'ends') return { segment: 2, ray: 1, line: 0 }[c.f.kind] === c.n;
    if (c.c === 'collinear') return Geom.collinearPts(f, ...c.pts);
    if (c.c === 'lineIn') return Geom.lineInPlane(f, c.n.pts[0], c.n.pts[1], c.plane);
    if (c.c === 'inPlane') return Geom.inPlane(f, c.plane, c.pt);
    if (c.c === 'crosses') return Geom.lineCrossesAt(f, c.n.pts[0], c.n.pts[1], c.plane) === c.at;
    if (c.c === 'pairIs') return Geom.anglePair(f, c.g, c.h) === c.name;
    if (c.c === 'mEq' || c.c === 'congruent') return Math.abs(Geom.angleDeg(f, ...c.g) - Geom.angleDeg(f, ...c.h)) < 1e-7;
    if (c.c === 'lineRel') { const a = byLabel(f, c.a), b = byLabel(f, c.b); return Geom.lineRelation(f, a.a, a.b, b.a, b.b) === c.rel; }
    if (c.c === 'triSame') return Geom.sameTri(f, c.t1, c.t2);
    if (c.c === 'triRel') return Geom.triStatement(f, c.t, c.u, c.rel);
    if (c.c === 'part') { const p = Geom.circlePart(f, c.circ, f.objects[c.obj]); return p === c.is || (c.is === 'chord' && p === 'diameter'); }
    if (c.c === 'arcIs') return Math.abs(Geom.arcDeg(f, c.arc) - c.deg) < 1e-7;
    if (c.c === 'segEq') { const d = (s) => Math.hypot(Geom.pos(f, s[1]).x - Geom.pos(f, s[0]).x, Geom.pos(f, s[1]).y - Geom.pos(f, s[0]).y); return Math.abs(d(c.s1) - d(c.s2)) < 1e-7; }
    if (c.c === 'angleArc') return Math.abs(Geom.angleDeg(f, ...c.g) - c.k * Geom.arcDeg(f, c.arc)) < 1e-7;
    if (c.c === 'supp') return Math.abs(Geom.angleDeg(f, ...c.g) + Geom.angleDeg(f, ...c.h) - 180) < 1e-7;
    if (c.c === 'mMul') return Math.abs(Geom.angleDeg(f, ...c.g) - c.k * Geom.angleDeg(f, ...c.h)) < 1e-7;
    if (c.c === 'mIs') return Math.abs(Geom.angleDeg(f, ...c.g) - c.deg) < 1e-7;
    if (c.c === 'opp') return f.triangles[0].filter(p => p !== c.g[1]).every(p => c.side.includes(p));
    if (c.c === 'triIs') return c.sides ? (c.sides === 'isosceles' ? Geom.triSides(f, c.tri) !== 'scalene' : Geom.triSides(f, c.tri) === c.sides) : Geom.triKind(f, c.tri) === c.angles;
    if (c.c === 'angleSum') return Math.abs(Geom.triAngles(c.tri).reduce((s, g) => s + Geom.angleDeg(f, ...g), 0) - 180) < 1e-7;
    if (c.c === 'ext') return Math.abs(Geom.angleDeg(f, ...c.ext) - c.parts.reduce((s, g) => s + Geom.angleDeg(f, ...g), 0)) < 1e-7;
    throw new Error('Unknown claim ' + c.c);
  }
  function claimWhy(f, c) {
    if (c.c === 'ends') return `A ${c.f.kind} ${K[c.f.kind].ends}.`;
    if (c.c === 'inPlane') return claimTruth(f, c) ? `${c.pt} is in plane ${c.plane}.` : `${c.pt} is outside plane ${c.plane}, above it.`;
    if (c.c === 'lineIn') return claimTruth(f, c) ? `${c.n.pts.join(' and ')} are both in plane ${c.plane}.` : `Not both of ${c.n.pts.join(' and ')} are in plane ${c.plane}.`;
    if (c.c === 'crosses') return `Only ${c.at} is in plane ${c.plane}, so the line meets the plane at ${c.at}.`;
    if (c.c === 'pairIs') return chooseAnswer(f, { c: 'pair', g: c.g, h: c.h }).why;
    if (c.c === 'lineRel') { const a = byLabel(f, c.a), b = byLabel(f, c.b); return `Lines ${c.a} and ${c.b}: ` + chooseAnswer(f, { c: 'lineRel', l: [a.a, a.b], m: [b.a, b.b] }).why; }
    if (c.c === 'mEq' || c.c === 'congruent') {
      const p = Geom.anglePair(f, c.g, c.h), rel = Geom.pairRelation(f, p);
      return rel === 'supplementary' ? `They are ${pairWords(p)}, so they are supplementary, not congruent.` : `Their measures are ${claimTruth(f, c) ? 'equal' : 'different'}.`;
    }
    if (c.c === 'same') return sameReason(f, c.n1, c.n2).why;
    if (c.c === 'triSame') return 'Same three vertices, so the same triangle.';
    if (c.c === 'part') return chooseAnswer(f, { c: 'circlePart', circ: c.circ, obj: c.obj }).why + (c.is === 'chord' && claimTruth(f, c) ? ' A diameter is a chord too.' : '');
    if (c.c === 'arcIs') return `It measures ${Math.round(Geom.arcDeg(f, c.arc))}°.${Geom.arcKind(f, c.arc) === 'major' ? ' A major arc is 360° minus its minor arc.' : ''}`;
    if (c.c === 'segEq') return claimTruth(f, c) ? 'Tangent segments from the same point are congruent.' : `${c.s2.join('')} goes to the center, not to a point of tangency, so it is longer.`;
    if (c.c === 'angleArc') return 'An inscribed angle is half its intercepted arc.';
    if (c.c === 'supp') return 'They form a linear pair, so they add to 180°.';
    if (c.c === 'triRel') return chooseAnswer(f, { c: 'triRel', t: c.t, u: c.u }).why + (c.rel === 'congruent' && !claimTruth(f, c) ? ' Similar triangles aren’t congruent unless the scale factor is 1.' : '');
    if (c.c === 'opp') return claimTruth(f, c) ? `${c.side.join('')} doesn't touch ${c.g[1]}.` : `${c.side.join('')} touches the vertex, ${c.g[1]}. The opposite side is ${f.triangles[0].filter(p => p !== c.g[1]).join('')}.`;
    if (c.c === 'triIs') {
      if (c.angles) return triAngleWhy(f, c.tri);
      const s = Geom.triSides(f, c.tri);
      return s === 'equilateral' ? 'All three sides are congruent, so it is equilateral, and isosceles too.' : SIDE_WHY[s];
    }
    if (c.c === 'angleSum') return 'The three angles of every triangle add to 180°.';
    if (c.c === 'ext') return claimTruth(f, c) ? 'An exterior angle equals the sum of the two angles not next to it.' : `${angleText(c.parts[1])} is next to ${angleText(c.ext)}: together they make a line. Use the two angles not next to it.`;
    return claimTruth(f, c) ? 'They are on one line.' : 'They are not all on one line.';
  }

  // ---------- Build goals ----------
  function goalMet(f, g) {
    if (g.is === 'collinear') return Geom.collinearPts(f, ...g.pts);
    if (g.is === 'between') return Geom.between(f, g.a, g.m, g.b);
    if (g.is === 'opposite') return Geom.opposite(f, g.v, g.a, g.b);
    if (g.is === 'angle') return Math.abs(Geom.angleDeg(f, ...g.pts) - g.deg) < 1e-7;
    if (g.is === 'parallel') return Geom.parallel(f, g.l[0], g.l[1], g.m[0], g.m[1]);
    if (g.is === 'perpendicular') return Geom.perpendicular(f, g.l[0], g.l[1], g.m[0], g.m[1]);
    if (g.is === 'tri') {
      const s = Geom.triSides(f, g.tri);
      const sidesOk = !g.sides || s === g.sides || (g.sides === 'isosceles' && s === 'equilateral');
      return sidesOk && (!g.angles || Geom.triKind(f, g.tri) === g.angles);
    }
    throw new Error('Unknown goal ' + g.is);
  }

  // ---------- More practice: a new naming problem ----------
  function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function generateName() {
    const kinds = ['segment', 'ray', 'line'];
    const kind = kinds[randInt(0, 2)];
    const letters = ['ABC', 'DEF', 'PQR', 'JKL', 'XYZ'][randInt(0, 4)].split('');
    for (let tries = 0; tries < 200; tries++) {
      const A = { x: randInt(2, 17), y: randInt(2, 11) };
      const d = { x: randInt(-4, 4), y: randInt(-3, 3) };
      if (d.x === 0 && d.y === 0) continue;
      const B = { x: A.x + d.x, y: A.y + d.y };
      const points = { [letters[0]]: A, [letters[1]]: B };
      if (kind !== 'segment') points[letters[2]] = { on: [letters[0], letters[1]], t: 2 };
      const f = fig(points, [{ kind, a: letters[0], b: letters[1] }], { target: 0 });
      const ok = Object.keys(points).every(n => { const P = Geom.pos(f, n); return P.x >= 1 && P.x <= 19 && P.y >= 1 && P.y <= 13; })
        && Math.hypot(d.x, d.y) >= 3;
      if (ok) return { type: 'name', ask: 'Name the ' + kind[0].toUpperCase() + kind.slice(1), fig: f };
    }
    return LEVEL1.lines.tasks[1];
  }

  // ---------- More Practice: new problems for each level, made at random ----------
  // Every problem is built from exact figures, so the engine's answer is always right.
  const pick = a => a[randInt(0, a.length - 1)];
  const inside = (f, lo = 1, hiY = 13) => Object.keys(f.points).every(n => { const P = Geom.pos(f, n); return P.x >= lo && P.x <= 20 - lo && P.y >= lo && P.y <= hiY; });
  const LETTERS = ['ABC', 'DEF', 'PQR', 'JKL', 'XYZ', 'RST', 'MNP', 'GHK'];
  // An expression ax + b, as the engine reads it (src) and as it's written on a figure (text).
  function linExpr(a, b) {
    const xs = a === 1 ? 'x' : a + 'x';
    return { src: `${a}x${b < 0 ? '' : '+'}${b}`, text: `(${xs}${b > 0 ? ' + ' + b : b < 0 ? ' − ' + -b : ''})°` };
  }
  // An expression worth v when x has the given value; `avoid` keeps two expressions different.
  function exprFor(v, x, avoid) {
    const ok = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(a => a !== avoid && v - a * x >= -60 && v - a * x <= 100);
    const a = ok.length ? pick(ok) : avoid === 2 ? 3 : 2;
    return Object.assign(linExpr(a, v - a * x), { a });
  }
  // The wrong relationship must give a different equation from the right one.
  const differs = (rel, wrong) => !Algebra.sameForm(Algebra.relForm(rel), Algebra.relForm(wrong));

  // Level 1: naming, and same figure or different figures.
  function sameProblem() {
    const L = pick(LETTERS).split('');
    for (let tries = 0; tries < 200; tries++) {
      const A = { x: randInt(2, 12), y: randInt(2, 10) }, d = { x: randInt(1, 4), y: randInt(-2, 3) };
      const f = fig({ [L[0]]: A, [L[1]]: { x: A.x + d.x, y: A.y + d.y }, [L[2]]: { on: [L[0], L[1]], t: 2 } }, []);
      if (!inside(f) || Math.hypot(d.x, d.y) < 2.5) continue;
      const [a, b, c] = L, n = (k, s) => ({ kind: k, pts: s.split('') });
      const q = pick([
        ['line', n('line', a + b), n('line', c + a)], ['line', n('line', b + c), n('line', a + b)],
        ['ray', n('ray', a + b), n('ray', a + c)], ['ray', n('ray', b + a), n('ray', b + c)], ['ray', n('ray', a + b), n('ray', b + a)],
        ['segment', n('segment', a + b), n('segment', b + a)], ['segment', n('segment', a + b), n('segment', a + c)],
      ]);
      f.objects = [q[0] === 'segment' ? { kind: 'segment', a, b: c } : { kind: 'line', a, b }];
      const word = q[0][0].toUpperCase() + q[0].slice(1);
      return { type: 'same', ask: `Same ${word} or Different ${word}s?`, n1: q[1], n2: q[2], fig: f };
    }
    return LEVEL1.lines.tasks[3];
  }

  // Level 2: an angle with whole-degree rays from a vertex.
  function angleFig(deg, targetName) {
    for (let tries = 0; tries < 200; tries++) {
      const L = pick(LETTERS).split(''), V = { x: randInt(6, 13), y: randInt(3, 9) }, d1 = randInt(0, 359);
      const f = fig({ [L[1]]: V, [L[0]]: polar(V, randInt(5, 7), d1), [L[2]]: polar(V, randInt(5, 8), d1 + deg) },
        [{ kind: 'ray', a: L[1], b: L[0] }, { kind: 'ray', a: L[1], b: L[2] }], { angles: [L] });
      if (targetName) f.targetAngle = L;
      if (inside(f)) return f;
    }
    return null;
  }
  function crossAlgebra() {
    const x = randInt(5, 20);
    if (Math.random() < 0.5) {
      const v = pick([40, 50, 55, 65, 70, 75, 80, 100, 105, 110, 115, 125, 130]);
      const e1 = exprFor(v, x), e2 = exprFor(v, x, e1.a);
      const rel = { is: 'equal', a: e1.src, b: e2.src }, wrong = { is: 'sum', parts: [e1.src, e2.src], total: 180 };
      if (!differs(rel, wrong)) return crossAlgebra();
      return { type: 'algebra', ask: 'Find m∠AEB.', fig: Object.assign(CROSSD(v), { labels: [ang('AEB', e1.text), ang('CED', e2.text)] }),
        rel, find: { name: 'AEB', expr: e1.src, angle: true }, hint: '∠AEB and ∠CED are vertical angles.',
        wrong: [{ rel: wrong, why: 'Vertical angles are congruent: their measures are equal, not a sum of 180°.' }] };
    }
    const v = pick([50, 60, 70, 75, 80, 100, 105, 110, 120, 130]), e1 = exprFor(v, x), e2 = exprFor(180 - v, x, e1.a);
    const rel = { is: 'sum', parts: [e1.src, e2.src], total: 180 }, wrong = { is: 'equal', a: e1.src, b: e2.src };
    if (!differs(rel, wrong)) return crossAlgebra();
    return { type: 'algebra', ask: 'Find m∠AEB.', fig: Object.assign(CROSSD(v), { labels: [ang('AEB', e1.text), ang('BEC', e2.text)] }),
      rel, find: { name: 'AEB', expr: e1.src, angle: true }, hint: '∠AEB and ∠BEC are a linear pair.',
      wrong: [{ rel: wrong, why: 'A linear pair adds to 180°. These two angles aren’t equal.' }] };
  }

  // Level 3: parallel lines cut by a transversal, with m∠APE = d.
  const T_ANGLES = ['APE', 'EPB', 'BPQ', 'QPA', 'CQP', 'PQD', 'DQF', 'FQC'];
  function transPair(named) {
    const f = transAt(pick([50, 55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125, 130]));
    for (;;) {
      const g = A3(pick(T_ANGLES.slice(0, 4))), h = A3(pick(T_ANGLES.slice(4)));
      const p = Geom.anglePair(f, g, h);
      if (p && (!named || named.includes(p))) return { f, g, h, p };
    }
  }
  function transAlgebra() {
    const x = randInt(5, 20), v = pick([50, 55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125, 130]);
    // Each pair, with which of its angles measure d (the rest measure 180 - d) at m∠APE = d.
    const kinds = [
      { name: 'corresponding', g: 'APE', h: 'CQP', sum: false }, { name: 'alternate interior', g: 'QPA', h: 'PQD', sum: false },
      { name: 'alternate exterior', g: 'APE', h: 'DQF', sum: false }, { name: 'same-side interior', g: 'BPQ', h: 'PQD', sum: true },
    ];
    const k = pick(kinds), f = transAt(k.g === 'QPA' ? 180 - v : v);
    const vg = Geom.angleDeg(f, ...A3(k.g)), vh = Geom.angleDeg(f, ...A3(k.h));
    const e1 = exprFor(Math.round(vg), x), e2 = exprFor(Math.round(vh), x, e1.a);
    const rel = k.sum ? { is: 'sum', parts: [e1.src, e2.src], total: 180 } : { is: 'equal', a: e1.src, b: e2.src };
    const wrong = k.sum ? { is: 'equal', a: e1.src, b: e2.src } : { is: 'sum', parts: [e1.src, e2.src], total: 180 };
    if (!differs(rel, wrong)) return transAlgebra();
    return { type: 'algebra', ask: `Line m ∥ Line n. Find m∠${k.g}.`, fig: Object.assign(f, { labels: [ang(k.g, e1.text), ang(k.h, e2.text)] }),
      rel, find: { name: k.g, expr: e1.src, angle: true }, hint: `∠${k.g} and ∠${k.h} are ${k.name} angles, and m ∥ n.`,
      wrong: [{ rel: wrong, why: k.sum ? 'Same-side interior angles on parallel lines are supplementary: they add to 180°.' : `${k.name[0].toUpperCase() + k.name.slice(1)} angles on parallel lines are congruent, not supplementary.` }] };
  }

  // Level 4: a triangle with whole-degree angles a at A and b at B, placed to fit the grid.
  function fitTri(a, b, names, extra) {
    for (let L = 13; L >= 4; L--) for (let ax = 2; ax <= 18 - L; ax++) {
      const f = triAt({ x: ax, y: 2.5 }, L, a, b, names, extra && JSON.parse(JSON.stringify(extra)));
      if (inside(f, 1.5, 12.5)) return f;
    }
    return null;
  }
  // A triangle of the given kind that fits the grid (new angles until one does).
  function fittedTri(kind, extra) {
    for (;;) {
      const [a, b] = triAngles3(kind), f = fitTri(a, b, 'ABC', extra(a, b));
      if (f) return { f, a, b };
    }
  }
  // Whole-degree angles at A and B for a triangle of the given kind (the third angle is 180 - a - b).
  function triAngles3(kind) {
    if (kind === 'right') { const r = randInt(25, 65); return pick([[90, r], [r, 90], [r, 90 - r]]); }
    for (;;) {
      const a = randInt(25, 115), b = randInt(25, 115), c = 180 - a - b;
      if (c < 20) continue;
      const k = [a, b, c].includes(90) ? 'right' : Math.max(a, b, c) > 90 ? 'obtuse' : 'acute';
      if (k === kind) return [a, b];
    }
  }
  function sideTri() {
    const kind = pick(['scalene', 'isosceles', 'equilateral']), L = pick(LETTERS);
    if (kind === 'equilateral') return fitTri(60, 60, L);
    for (let tries = 0; tries < 400; tries++) {
      const A = { x: randInt(2, 10), y: randInt(2, 5) }, B = { x: A.x + 2 * randInt(3, 5), y: A.y };
      const C = kind === 'isosceles' ? { x: (A.x + B.x) / 2, y: A.y + randInt(3, 9) } : { x: randInt(2, 18), y: randInt(6, 12) };
      const f = TRI(A, B, C, L);
      if (inside(f) && !Geom.collinearPts(f, ...L.split('')) && Geom.triSides(f, L.split('')) === kind) return f;
    }
    return fitTri(60, 60, L);
  }
  function triAlgebra() {
    const x = randInt(5, 15), [a, b] = triAngles3(pick(['acute', 'obtuse'])), c = 180 - a - b;
    const e1 = exprFor(a, x), e2 = exprFor(b, x, e1.a);
    const rel = { is: 'sum', parts: [e1.src, e2.src, String(c)], total: 180 }, wrong = { is: 'equal', a: e1.src, b: e2.src };
    const f = fitTri(a, b, 'ABC', { labels: [ang('CAB', e1.text), ang('ABC', e2.text), ang('BCA', c + '°')] });
    if (!f || f.points.B.x - f.points.A.x < 8 || !differs(rel, wrong)) return triAlgebra();   // a base wide enough to hold both expressions
    return { type: 'algebra', ask: 'Find m∠CAB.', fig: f, rel, find: { name: 'CAB', expr: e1.src, angle: true },
      hint: 'The three angles of a triangle add to 180°.', wrong: [{ rel: wrong, why: 'These angles aren’t marked congruent. The three angles of a triangle add to 180°.' }] };
  }

  // Two triangles that are congruent (moved, maybe flipped), similar (scale factor 2) or neither,
  // with △DEF's letters in a random order so the statement's order has to be worked out.
  function pairProblem(kind) {
    for (;;) {
      const base = [p2(0, 0), p2(randInt(3, 4), randInt(0, 1)), p2(randInt(0, 3), randInt(3, 4))];
      const flip = Math.random() < 0.5;
      const moved = kind === 'similar' ? base.map(P => p2(10 + 2 * P.x, 1 + 2 * P.y))
        : kind === 'congruent' ? base.map(P => p2(flip ? 17 - P.x : 12 + P.x, 3 + P.y))
          : [p2(11, 3), p2(11 + randInt(3, 6), randInt(2, 5)), p2(11 + randInt(0, 5), randInt(7, 11))];
      const order = pick([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]);
      const abc = base.map(P => p2(2 + P.x, 3 + P.y)), def = order.map(i => moved[i]);
      const f = PAIR(abc[0], abc[1], abc[2], def[0], def[1], def[2]);
      if (!inside(f) || f.triangles.some(t => Geom.collinearPts(f, ...t))) continue;
      const rel = Geom.congruentTri(f, tri('ABC'), tri('DEF')) ? 'congruent' : Geom.similarTri(f, tri('ABC'), tri('DEF')) ? 'similar' : 'neither';
      if (rel === kind) return f;
    }
  }

  // Level 5: circle parts, arcs, inscribed angles and tangents at random whole-degree positions.
  const deg5 = (lo, hi) => 5 * randInt(Math.ceil(lo / 5), Math.floor(hi / 5));
  function partProblem() {
    const kind = pick(['radius', 'diameter', 'chord', 'secant', 'tangent']), a = deg5(0, 355);
    let f;
    if (kind === 'radius') f = CIRC(p2(9, 7), 5, { A: a }, [S2('P', 'A')]);
    if (kind === 'diameter') f = CIRC(p2(9, 7), 5, { A: a, B: (a + 180) % 360 }, [S2('A', 'B')]);
    if (kind === 'chord') f = CIRC(p2(9, 7), 5, { A: a, B: (a + deg5(40, 150)) % 360 }, [S2('A', 'B')]);
    if (kind === 'secant') f = CIRC(p2(9, 7), 5, { A: a, B: (a + deg5(40, 150)) % 360 }, [L2('A', 'B')]);
    if (kind === 'tangent') { f = CIRC(p2(9, 7), 5, { T: pick([0, 90, 180, 270]) }, [L2('J', 'K')]); f.points.K = { tanLine: 'T', circ2: 'P', d: 3 }; f.points.J = { tanLine: 'T', circ2: 'P', d: -3 }; }
    return { type: 'choose', ask: 'The Highlighted Figure Is a', q: { c: 'circlePart', circ: 'P', obj: 0 }, options: PARTS, fig: f };
  }
  function arcProblem() {
    const a = deg5(0, 355), d = deg5(30, 160), major = Math.random() < 0.5;
    const f = CIRC(p2(9, 7), 5, { A: a, B: (a + d) % 360, C: (a + d + deg5(40, 360 - d - 40)) % 360 }, [S2('P', 'A'), S2('P', 'B')],
      { angles: [A3('APB')], targetArc: major ? arcOf('A', 'B', { via: 'C' }) : arcOf('A', 'B'), labels: [angL('APB', d + '°')] });
    return { type: 'measure', ask: major ? 'Find the Measure of the Major Arc' : 'Write the Measure of the Arc', hideMeasures: true,
      hint: major ? `The whole circle is 360°, and the minor arc is ${d}°.` : 'A minor arc has the same measure as its central angle.', fig: f };
  }
  function inscribedProblem() {
    // The arc is centered near the bottom of the circle and B is near the top, so B is never on it.
    const arc = 10 * randInt(4, 17), a = deg5(250, 290) - arc / 2, b = deg5(40, 140);
    const toArc = Math.random() < 0.5, g = arcOf('A', 'C', { opp: 'B' });
    const f = CIRC(p2(9, 7), 5, { A: (a + 360) % 360, B: b, C: (a + arc + 360) % 360 }, [S2('B', 'A'), S2('B', 'C')],
      toArc ? { angles: [A3('ABC')], targetArc: g, labels: [angL('ABC', arc / 2 + '°')] } : { angles: [A3('ABC')], targetAngle: A3('ABC'), labels: [arcL(g, arc + '°')] });
    return { type: 'measure', ask: toArc ? 'Find the Measure of the Intercepted Arc' : 'Find the Measure of ∠ABC', hideMeasures: true,
      hint: toArc ? 'The intercepted arc is twice the inscribed angle.' : 'An inscribed angle is half its intercepted arc.', fig: f };
  }
  function tangentProblem() {
    const t = pick([40, 50, 60, 70, 80, 90, 100]), d = 4 / Math.sin(t / 2 * Math.PI / 180);
    const f = Object.assign(TWO_TAN(6 + d), { targetAngle: A3('PQT'), labels: [angL('SQT', t + '°')] });
    return { type: 'measure', ask: `m∠SQT = ${t}°. Find the Measure of ∠PQT`, hideMeasures: true, hint: 'QP bisects ∠SQT: it splits it into two congruent angles.', fig: f };
  }
  function circumProblem() {
    const t = pick([40, 50, 60, 70, 80, 90, 100]), byArc = Math.random() < 0.5;
    return { type: 'measure', ask: 'Find the Measure of ∠SQT', hideMeasures: true,
      hint: byArc ? 'Minor arc ST has the same measure as central angle ∠SPT, and m∠SQT + m∠SPT = 180°.' : 'A circumscribed angle and its central angle add to 180°.',
      fig: CIRCUM(t, { targetAngle: A3('SQT'), labels: [byArc ? arcL(arcOf('S', 'T'), (180 - t) + '°') : angL('SPT', (180 - t) + '°')] }) };
  }
  function circleAlgebra() {
    const x = randInt(5, 20), v = deg5(25, 80), e1 = exprFor(v, x), e2 = exprFor(2 * v, x, 2 * e1.a);
    const rel = { is: 'equal', a: `2(${e1.src})`, b: e2.src }, wrong = { is: 'equal', a: e1.src, b: e2.src };
    if (!differs(rel, wrong)) return circleAlgebra();
    const a = deg5(250, 290) - v, g = arcOf('A', 'C', { opp: 'B' });
    return { type: 'algebra', ask: 'Find m∠ABC.', fig: CIRC(p2(9, 7), 5, { A: a, B: deg5(40, 140), C: (a + 2 * v) % 360 }, [S2('B', 'A'), S2('B', 'C')], { angles: [A3('ABC')], labels: [ang('ABC', e1.text), arcL(g, e2.text)] }),
      rel, find: { name: 'ABC', expr: e1.src, angle: true }, hint: 'An inscribed angle is half its intercepted arc: m⌒AC = 2 · m∠ABC.',
      wrong: [{ rel: wrong, why: 'An inscribed angle is half its arc, not equal to it.' }] };
  }

  const PRACTICE = {
    1: [generateName, sameProblem],
    2: [
      () => { const f = angleFig(randInt(25, 155), true); return f ? { type: 'name', ask: 'Name the Angle', fig: f } : LEVEL2.angles.tasks[1]; },
      () => { const f = angleFig(randInt(20, 160), true); return f ? { type: 'measure', ask: 'Write the Measure of the Angle', fig: f } : LEVEL2.angles.tasks[8]; },
      () => { const f = angleFig(pick([randInt(20, 80), 90, randInt(100, 160)]), true);
        return f ? { type: 'choose', ask: 'Acute, Right or Obtuse?', q: { c: 'kind', ang: f.angles[0] }, options: ['Acute', 'Right', 'Obtuse'], fig: f } : LEVEL2.angles.tasks[3]; },
      crossAlgebra,
    ],
    3: [
      () => { const { f, g, h } = transPair(); return { type: 'choose', ask: `∠${g.join('')} and ∠${h.join('')} Are`, q: { c: 'pair', g, h }, options: PAIRS, fig: f }; },
      () => { const { f, g, h } = transPair(); return { type: 'choose', ask: `Line m Is Parallel to Line n. ∠${g.join('')} and ∠${h.join('')} Are`, q: { c: 'relation', g, h }, options: ['Congruent', 'Supplementary'], hideMeasures: true, fig: f }; },
      transAlgebra,
    ],
    4: [
      () => { for (;;) { const L = pick(LETTERS), f = TRI({ x: randInt(2, 7), y: randInt(2, 5) }, { x: randInt(12, 18), y: randInt(2, 6) }, { x: randInt(4, 15), y: randInt(8, 12) }, L, { targetTri: L.split('') }); if (inside(f)) return { type: 'name', ask: 'Name the Triangle', fig: f }; } },
      () => { const f = sideTri(); return { type: 'choose', ask: `Classify △${f.triangles[0].join('')} by Its Sides`, q: { c: 'triSides', tri: f.triangles[0] }, options: TRI_SIDES, fig: f }; },
      () => { const { f } = fittedTri(pick(['acute', 'right', 'obtuse']), () => ({}));
        return { type: 'choose', ask: 'Classify △ABC by Its Angles', q: { c: 'triAngles', tri: tri('ABC') }, options: TRI_ANGLES, fig: f }; },
      () => { const { f } = fittedTri(pick(['acute', 'obtuse']), (a, b) => ({ targetAngle: A3('BCA'), labels: [ang('CAB', a + '°'), ang('ABC', b + '°')] }));
        return { type: 'measure', ask: 'Find the Measure of ∠BCA', hideMeasures: true, hint: 'The three angles add to 180°.', fig: f }; },
      () => ({ type: 'choose', ask: 'Congruent, Similar or Neither?', q: { c: 'triRel', t: tri('ABC'), u: tri('DEF') }, options: TRI_REL, fig: pairProblem(pick(['congruent', 'similar', 'neither'])) }),
      () => { const want = pick(['congruent', 'similar']);
        return { type: 'triRel', ask: `Write the ${want === 'congruent' ? 'Congruence' : 'Similarity'} Statement, Starting With △ABC`, want, fig: pairProblem(want) }; },
      triAlgebra,
    ],
    5: [partProblem, arcProblem, inscribedProblem, tangentProblem, circumProblem, circleAlgebra],
  };
  // One new problem for a level (a different kind from the last one when there's a choice).
  let lastKind = -1;
  function practice(key) {
    const list = PRACTICE[key];
    let i;
    do i = randInt(0, list.length - 1); while (list.length > 1 && i === lastKind);
    lastKind = i;
    return list[i]();
  }

  // ---------- Common Mistakes: a new comparable question for each mistake on the Mistakes page ----------
  // Each question offers the correct form, the common mistake itself (the trap) and one more wrong
  // choice, with new letters or a new figure every time. Picking the trap names the mistake and its rule.
  // Options may hold notation tokens: [s:AB] segment, [r:AB] ray, [n:AB] line, [a:ABC] angle,
  // [m:ABC] its measure, [t:ABC] triangle, [c:P] circle, [o:AB] arc, [l:m] a line's letter.
  const POOL = 'ABCDEFGHJKLMNQRSTUVWXYZ'.split('');          // no I or O (they look like 1 and 0); P is a circle's center
  function letters(n) { const a = POOL.slice(), out = []; while (out.length < n) out.push(a.splice(randInt(0, a.length - 1), 1)[0]); return out; }
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
  // extra.q adds to the question (angles to shade, or no trap); the rest of extra replaces task fields.
  const trapQ = (ask, f, right, trap, others, why, trapWhy, extra = {}) => { const { q, ...rest } = extra;
    return Object.assign({ type: 'choose', ask, fig: f, hideMeasures: true, options: shuffle([right, trap].concat(others)),
      q: Object.assign({ c: 'fixed', answer: right, why, trap, trapWhy, hint: 'Compare each choice with the diagram, one letter and symbol at a time.' }, q) }, rest); };
  const TOK = { segment: 's', ray: 'r', line: 'n' };
  // A figure placed at random until every point is on the grid.
  const placed = make => { for (;;) { const f = make(); if (inside(f)) return f; } };
  // Rays (or segments) from V at the given directions (degrees), with the letters in names after V.
  const fan = (V, dirs, names, extra, kind = 'ray') => { const pts = { [names[0]]: V }; dirs.forEach((d, i) => { pts[names[i + 1]] = polar(V, 6, d); });
    return fig(pts, dirs.map((d, i) => ({ kind, a: names[0], b: names[i + 1] })), extra); };
  const LOOKS = 'How a figure looks is never a reason. Every step needs a definition, postulate, theorem or property.';

  const MISTAKES = [
    { key: '1', title: 'Level 1: Lines, Segments, Rays and Planes', list: [
      { name: 'A Ray Named Backwards', gen: () => {
        const [A, B] = letters(2), f = placed(() => { const P = p2(randInt(2, 10), randInt(2, 11)); return fig({ [A]: P, [B]: p2(P.x + randInt(3, 6), P.y + randInt(-3, 3)) }, [{ kind: 'ray', a: A, b: B }]); });
        return trapQ('Which Names This Ray?', f, `[r:${A}${B}]`, `[r:${B}${A}]`, [`[n:${A}${B}]`],
          `A ray is named endpoint first: ${A}, then a point it passes through.`, `That names a ray that starts at ${B}. Name a ray endpoint first.`); } },
      { name: 'A Segment Written Equal to a Number', gen: () => {
        const [A, B] = letters(2), L = randInt(4, 9), f = placed(() => { const P = p2(randInt(2, 8), randInt(3, 11)); return fig({ [A]: P, [B]: p2(P.x + L, P.y) }, [S2(A, B)], { labels: [{ seg: [A, B], text: String(L) }] }); });
        return trapQ(`The Segment Is ${L} Units Long. Which Is Written Correctly?`, f, `${A}${B} = ${L}`, `[s:${A}${B}] = ${L}`, [`[s:${A}${B}] ≅ ${L}`],
          `${A}${B} with no bar is the length, a number. The bar names the segment itself.`, `The bar names the segment, a figure, and a figure can’t equal a number. Write ${A}${B} = ${L}.`); } },
      { name: 'Points in Lowercase', gen: () => {
        const [A, B] = letters(2), kind = pick(['segment', 'ray', 'line']);
        const f = placed(() => { const P = p2(randInt(2, 10), randInt(2, 11)); return fig({ [A]: P, [B]: p2(P.x + randInt(3, 6), P.y + randInt(-3, 3)) }, [{ kind, a: A, b: B }]); });
        return trapQ(`Which Names This ${kind[0].toUpperCase() + kind.slice(1)}?`, f, `[${TOK[kind]}:${A}${B}]`, `${kind} ${A.toLowerCase()}${B.toLowerCase()}`, [`${kind} ${A}${B.toLowerCase()}`],
          'Points are named with capital letters.', 'Lowercase letters name lines and variables, not points. Points are capitals.'); } },
      { name: 'A Line’s Letter in Capitals', gen: () => {
        const [A, B] = letters(2), l = pick(['k', 'm', 'n', 't']).replace(new RegExp(`[${A}${B}]`, 'i'), 'p');
        const f = placed(() => { const P = p2(randInt(3, 9), randInt(3, 10)); return fig({ [A]: P, [B]: p2(P.x + randInt(4, 7), P.y + randInt(-3, 3)) }, [{ kind: 'line', a: A, b: B, label: l }]); });
        return trapQ('Which Names This Line With One Letter?', f, `line [l:${l}]`, `line ${l.toUpperCase()}`, [`point [l:${l}]`],
          'A line’s one-letter name is lowercase.', `A capital ${l.toUpperCase()} would name a point or a plane. A line’s one-letter name is lowercase.`); } },
      { name: 'A Plane Named With Points on One Line', gen: () => {
        const [A, B, C, D] = letters(4), N = pick(['M', 'N', 'R'].filter(x => ![A, B, C, D].includes(x)));
        const f = fig({ [A]: p2(4, 4), [B]: p2(13, 5), [D]: p2(9, 9), [C]: { on: [A, B], t: 0.5 } }, [{ kind: 'line', a: A, b: B }], { planes: [P(N, [A, B, D])] });
        return trapQ('Which Names This Plane?', f, pick([`plane ${N}`, `plane ${A}${B}${D}`]), `plane ${A}${C}${B}`, [`plane ${C}${D}`],
          'A plane is named by its letter, or by three points in it that are not on one line.', `${A}, ${C} and ${B} are on one line, and many planes go through one line (Three Point Postulate).`); } },
    ] },
    { key: '2', title: 'Level 2: Angles', list: [
      { name: 'One Letter for a Shared Vertex', gen: () => {
        const [V, A, B, C] = letters(4), d = randInt(0, 30), f = placed(() => fan(p2(randInt(3, 10), randInt(2, 5)), [d, d + randInt(30, 50), d + randInt(85, 120)], [V, A, B, C], { targetAngle: [A, V, B] }));
        return trapQ('Which Names the Marked Angle?', f, `[a:${A}${V}${B}]`, `∠${V}`, [`[a:${V}${A}${B}]`],
          `Three points, vertex in the middle: ∠${A}${V}${B} or ∠${B}${V}${A}.`, `Three angles share vertex ${V}, so ∠${V} doesn’t say which one. Use three points, vertex in the middle.`); } },
      { name: 'The Vertex Not in the Middle', gen: () => {
        const [V, A, B] = letters(3), d = randInt(0, 40), f = placed(() => fan(p2(randInt(3, 8), randInt(2, 5)), [d, d + randInt(40, 130)], [V, A, B], { angles: [[A, V, B]] }));
        return trapQ('Which Names the Angle?', f, `[a:${A}${V}${B}]`, `[a:${V}${A}${B}]`, [`[a:${A}${B}${V}]`],
          `The vertex, ${V}, goes in the middle.`, `That puts ${A} in the middle, so it names an angle at ${A}. The vertex, ${V}, goes in the middle.`); } },
      { name: 'An Angle Written Equal to a Number', gen: () => {
        const [V, A, B] = letters(3), m = 5 * randInt(5, 31), g = [A, V, B];
        const f = placed(() => fan(p2(randInt(6, 10), randInt(2, 5)), [0, m], [V, A, B], { angles: [g], labels: [{ angle: g, text: m + '°' }] }));
        return trapQ(`The Angle Measures ${m}°. Which Is Written Correctly?`, f, `[m:${g.join('')}] = ${m}°`, `[a:${g.join('')}] = ${m}°`, [`[a:${g.join('')}] ≅ ${m}°`],
          `m∠${g.join('')} is the measure, a number, so it can equal ${m}°.`, `∠${g.join('')} is the angle itself, a figure. Its measure is m∠${g.join('')}.`); } },
      { name: 'Equal Signs Between Angles', gen: () => {
        // Segments, not rays, so the two angles' sides don't run across each other.
        const [V, A, B, W, C, D] = letters(6), m = 5 * randInt(7, 18), d = randInt(0, 40), g = [A, V, B], h = [C, W, D];
        const f = fig(Object.assign(fan(p2(2, 3), [0, m], [V, A, B]).points, fan(p2(13, 3), [d, d + m], [W, C, D]).points),
          [S2(V, A), S2(V, B), S2(W, C), S2(W, D)],
          { angles: [g, h], marks: [{ angle: g, arcs: 1 }, { angle: h, arcs: 1 }] });
        return trapQ('The Marks Show the Angles Are Congruent. Which Is Written Correctly?', f, `[a:${g.join('')}] ≅ [a:${h.join('')}]`, `[a:${g.join('')}] = [a:${h.join('')}]`, [`[m:${g.join('')}] ≅ [m:${h.join('')}]`],
          'Figures are congruent (≅); measures are equal (=).', 'Angles are figures, so they are congruent (≅), not equal. Only their measures are equal: m∠ = m∠.'); } },
    ] },
    { key: '3', title: 'Level 3: Parallel, Perpendicular, and Transversal', list: [
      { name: 'Corresponding Angles Without Parallel Lines', gen: () => {
        const f = TRANS(pick([1, 2, 6, 7]));
        let g, h; do { g = A3(pick(T_ANGLES.slice(0, 4))); h = A3(pick(T_ANGLES.slice(4))); } while (Geom.anglePair(f, g, h) !== 'corresponding');
        return trapQ(`∠${g.join('')} and ∠${h.join('')} Are Corresponding Angles, but Line m Is Not Parallel to Line n. Are They Congruent?`, f, 'No', 'Yes', [],
          'Corresponding angles are congruent only when the lines are parallel. Here they aren’t, so the angles aren’t congruent.', 'The Corresponding Angles Postulate needs parallel lines, and m and n aren’t parallel.', { q: { g, h }, options: ['Yes', 'No'] }); } },
      { name: 'Same-Side Interior Angles Called Congruent', gen: () => {
        const { f, g, h } = transPair(['same-side interior']);
        const why = 'Same-Side Interior Angles Theorem: when the lines are parallel, they add to 180°.';
        return trapQ(`Line m ∥ Line n. ∠${g.join('')} and ∠${h.join('')} Are Same-Side Interior Angles. They Are`, f, 'Supplementary', 'Congruent', [], why,
          'Same-side interior angles aren’t congruent (unless both are right angles). They add to 180°.', { q: { g, h }, options: ['Congruent', 'Supplementary'] }); } },
    ] },
    { key: '4', title: 'Level 4: Lines That Make Triangles', list: [
      { name: 'Letters Out of Order', gen: () => {
        for (;;) {
          const f = pairProblem('congruent'), perms = ['DEF', 'DFE', 'EDF', 'EFD', 'FDE', 'FED'];
          const right = perms.filter(u => Geom.triStatement(f, tri('ABC'), tri(u), 'congruent'));   // order matters here
          const wrong = perms.filter(u => !right.includes(u));
          if (right.length !== 1 || right[0] === 'DEF' || !wrong.includes('DEF')) continue;
          const u = right[0];
          return trapQ('Which Congruence Statement Is Right?', f, `[t:ABC] ≅ [t:${u}]`, '[t:ABC] ≅ [t:DEF]', [`[t:ABC] ≅ [t:${pick(wrong.filter(w => w !== 'DEF'))}]`],
            `Matching vertices go in the same positions: A with ${u[0]}, B with ${u[1]}, C with ${u[2]}.`, `The letter order shows which vertices match, and A matches ${u[0]} here, not D.`, { hideMeasures: false });
        } } },
      { name: 'SSA Used as a Shortcut', gen: () => {
        const stmt = ['ABC', 'EFD'];
        const q = pick([{ sides: [0, 1], angles: [1] }, { sides: [1, 2], angles: [2] }, { sides: [0, 1], angles: [0] }, { sides: [0, 1], angles: [2] }, { sides: [1, 2], angles: [0] }, { sides: [1, 2], angles: [1] }]);
        const found = congCriteria(Object.assign({ stmt }, q)), answer = found[0] || 'Not Enough';
        const why = answer === 'SAS' ? 'The marked angle is between the two marked sides: SAS.' : 'The marked angle isn’t between the two marked sides. That’s SSA, which doesn’t prove triangles congruent.';
        return trapQ('Do the Marks Prove △ABC ≅ △EFD?', Object.assign(CONG_PAIR(), { marks: critMarks(Object.assign({ stmt }, q)) }), answer, 'SSA', [answer === 'SAS' ? 'Not Enough' : 'SAS'], why,
          'SSA is not a shortcut: two sides and an angle that isn’t between them can make two different triangles.'); } },
      { name: 'CPCTC Before the Proof', gen: () => {
        const stmt = ['ABC', 'EFD'], proves = Math.random() < 0.5;
        const q = Object.assign({ stmt }, proves ? pick([{ sides: [0, 1, 2] }, { sides: [0, 1], angles: [1] }, { angles: [0, 1], sides: [0] }])
          : pick([{ sides: [0, 1], angles: [0] }, { angles: [0, 1, 2] }, { sides: [0], angles: [0] }, { sides: [0, 2] }]));
        const found = congCriteria(q), marked = q.angles || [], free = [0, 1, 2].filter(i => !marked.includes(i)), i = pick(free.length ? free : [0, 1, 2]);
        const ang = t => [t[(i + 2) % 3], t[i], t[(i + 1) % 3]].join('');
        const why = found.length ? `The marks prove △ABC ≅ △EFD by ${found[0]}, so CPCTC gives any matching pair.` : 'These marks don’t prove the triangles congruent, so CPCTC can’t be used yet.';
        // When the marks do prove it, "Not Yet" is wrong but it isn't the common mistake, so there's no trap.
        return trapQ(`Only the Marks Are Given. Can You Write ∠${ang('ABC')} ≅ ∠${ang('EFD')} by CPCTC?`, Object.assign(CONG_PAIR(), { marks: critMarks(q) }),
          found.length ? 'Yes' : 'Not Yet', found.length ? 'Not Yet' : 'Yes', [], why, 'CPCTC works only after the triangles are proved congruent, and these marks don’t prove it.',
          { options: ['Yes', 'Not Yet'], q: found.length ? { trap: null, hint: 'Check the marks first: do they prove the triangles congruent?' } : {} }); } },
      { name: 'AA Used to Prove Congruent', gen: () => {
        const atA = Math.random() < 0.5, f = withMarks(PAR_BOWTIE(pick([1.5, 2, 2.5])), [ANG(atA ? 'BAE' : 'ABE', 1), ANG(atA ? 'CDE' : 'DCE', 1), ANG('AEB', 2), ANG('DEC', 2)]);
        return trapQ('m ∥ n. The Marks Show Two Pairs of Congruent Angles. What Do They Prove?', f, '[t:ABE] ∼ [t:DCE]', '[t:ABE] ≅ [t:DCE]', ['[t:ABE] ∼ [t:CDE]'],
          'Two pairs of congruent angles: similar by AA, with A matching D and B matching C.', 'Two angles fix the shape, not the size. AA proves similar; congruent also needs a pair of matching sides.'); } },
      { name: 'Parallel-Line Angles Without Parallel Lines', gen: () => {
        const [g, h] = pick([['ADE', 'ABC'], ['AED', 'ACB']]);
        return trapQ(`Nothing Says DE ∥ BC. Is ∠${g} ≅ ∠${h}?`, PAR_SIDE(false), 'Not Proved', 'Yes, Corresponding Angles', [],
          'The Corresponding Angles Postulate needs DE ∥ BC to be given, with arrows or in words. Here it isn’t.', 'Looking parallel is never a reason. Corresponding angles are congruent only when the lines are given parallel.',
          { q: { g: A3(g), h: A3(h) }, options: ['Yes, Corresponding Angles', 'Not Proved'] }); } },
    ] },
    { key: 'b', title: 'Bridges: Reasons, Triangles and Similarity', list: [
      { name: 'The Wrong Angles for an Exterior Angle', gen: () => {
        const f = placed(() => extAt(p2(randInt(2, 4), 3), randInt(7, 9), randInt(35, 70), randInt(40, 80), { targetAngle: A3('CBD') }));
        return trapQ('∠CBD Is an Exterior Angle. Which Equation Is Right?', f, '[m:CBD] = [m:CAB] + [m:BCA]', '[m:CBD] = [m:CAB] + [m:ABC]', ['[m:CBD] = [m:ABC] + [m:BCA]'],
          'Exterior Angle Theorem: an exterior angle equals the sum of the two angles not next to it, ∠CAB and ∠BCA.', '∠ABC is next to ∠CBD (together they make a straight line), so it isn’t one of the two angles to add.'); } },
      { name: 'Similar Triangles Called Congruent', gen: () => {
        for (;;) {
          const f = pairProblem('similar'), perms = ['DEF', 'DFE', 'EDF', 'EFD', 'FDE', 'FED'];
          const right = perms.filter(u => Geom.triStatement(f, tri('ABC'), tri(u), 'similar')), wrong = perms.filter(u => !right.includes(u));
          if (right.length !== 1 || !wrong.length) continue;
          const u = right[0];
          return trapQ('Which Statement Is Right?', f, `[t:ABC] ∼ [t:${u}]`, `[t:ABC] ≅ [t:${u}]`, [`[t:ABC] ∼ [t:${pick(wrong)}]`],
            `Same shape, different size: similar (∼), with A matching ${u[0]}, B matching ${u[1]} and C matching ${u[2]}.`, 'These triangles are different sizes, so they aren’t congruent. The same shape in a different size is similar (∼).', { hideMeasures: false });
        } } },
      { name: '“It Looks Congruent” as a Reason', gen: () => {
        const [A, B, C, D, E] = letters(5), d1 = randInt(0, 30), d2 = d1 + randInt(40, 140), O = p2(10, 7);
        const f = fig({ [E]: O, [A]: polar(O, 6, d1), [C]: polar(O, 6, d1 + 180), [B]: polar(O, 5, d2), [D]: polar(O, 5, d2 + 180) },
          [{ kind: 'line', a: A, b: C }, { kind: 'line', a: B, b: D }], { angles: [[A, E, B], [B, E, C], [C, E, D], [D, E, A]] });
        const vertical = Math.random() < 0.5, g = [A, E, B], h = vertical ? [C, E, D] : [B, E, C];
        const right = vertical ? 'Vertical Angles Theorem' : 'Linear Pair Postulate', trap = vertical ? 'They Look Congruent' : 'They Look Supplementary';
        const why = vertical ? 'They are vertical angles: across from each other where two lines cross.' : 'They form a linear pair: side by side along a straight line.';
        return trapQ(vertical ? `∠${g.join('')} ≅ ∠${h.join('')}. Which Reason?` : `m∠${g.join('')} + m∠${h.join('')} = 180°. Which Reason?`, f, right, trap,
          [vertical ? 'Linear Pair Postulate' : 'Vertical Angles Theorem'], why, LOOKS, { q: { g, h } }); } },
    ] },
    { key: '5', title: 'Level 5: Circles', list: [
      { name: 'A Major Arc With Two Letters', gen: () => {
        const [A, B, C] = letters(3), a = randInt(0, 359), k = 10 * randInt(6, 13);
        const f = CIRC(p2(9, 7), 5, { [A]: a, [B]: (a + k) % 360, [C]: (a + k + (360 - k) / 2) % 360 }, [], { targetArc: arcOf(A, B, { via: C }) });
        return trapQ('Which Names the Highlighted Arc?', f, `[o:${A}${C}${B}]`, `[o:${A}${B}]`, [`[o:${A}${B}${C}]`],
          'A major arc is named with three letters: its endpoints, with a point on it in the middle.', `Two letters name the minor arc, the short way from ${A} to ${B}. The highlighted arc goes the long way, through ${C}.`); } },
      { name: 'An Inscribed Angle Set Equal to Its Arc', gen: () => {
        const k = 10 * randInt(6, 16), f = INSC(270 - k / 2, randInt(50, 130), 270 + k / 2, null, { labels: [arcL(arcOf('A', 'C', { opp: 'B' }), k + '°')] });
        return trapQ('Find m∠ABC', f, `[m:ABC] = ${k / 2}°`, `[m:ABC] = ${k}°`, [`[m:ABC] = ${2 * k}°`],
          'Inscribed Angle Theorem: an inscribed angle is half its intercepted arc.', 'An inscribed angle is half its arc, not equal to it. A central angle equals its arc.'); } },
      { name: 'A Circle Named by a Point on It', gen: () => {
        const [X, Y, Z] = letters(3), y = randInt(0, 359), f = CIRC(p2(randInt(7, 12), 7), randInt(4, 5), { [Y]: y, [Z]: (y + randInt(90, 270)) % 360 }, [S2(X, Y)], {}, X);
        return trapQ('Which Names the Circle?', f, `[c:${X}]`, `[c:${Y}]`, [`[s:${X}${Y}]`],
          'A circle is named by its center.', `${Y} is a point on the circle, not its center. A circle is named by its center, ${X}.`); } },
    ] },
  ];
  // One new question for the i-th mistake in a group.
  const mistakeQ = (key, i) => MISTAKES.find(g => g.key === key).list[i].gen();

  return { LEVEL1, LEVELS, EXPLORE, PRACTICE, MISTAKES, mistakeQ, congCriteria, critMarks, checkName, checkTriName, checkOpposite, checkTriRel, checkCorresp, matchPart, checkCircleName, checkArcName, checkArcMeasure, arcNames, checkAngleName, checkMeasure, checkNamePair, checkRelation, chooseAnswer, angleNames, checkDraw, checkFind,
    sameReason, claimTruth, claimWhy, goalMet, generateName, practice, transAt, obj };
})();
