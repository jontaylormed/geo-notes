/* Screens and the labeling area. The diagram (Diagram) is for doing; the labeling area is for writing. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const clone = o => JSON.parse(JSON.stringify(o));
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const chip = n => `<span class="chip">${Notation.show(n.kind, n.pts)}</span>`;

  // Options from the page's link (#level=1&start=lesson), the query, or the frame name (local preview).
  const opt = new URLSearchParams([location.search.slice(1), location.hash.slice(1), window.name].filter(Boolean).join('&'));

  const state = { part: null, idx: 0, task: null, fig: null, drawn: [], solved: false, practice: false };
  // state.practice is true for More Practice, or MIST for Common Mistakes (group state.mkey, mistake state.midx).
  const MIST = 'mistakes';
  const mistakeGroup = key => Tasks.MISTAKES.find(g => g.key === key) || Tasks.MISTAKES[0];

  // ---------- Feedback and announcements ----------
  function feedback(kind, html) {
    const fb = $('fb');
    fb.className = 'feedback' + (kind ? ' ' + kind : '');
    fb.innerHTML = html || '';
  }
  function announce(text) { $('announce').textContent = ''; setTimeout(() => { $('announce').textContent = text; }, 30); }
  // ---------- Measurements and congruence, live from the diagram ----------
  // A length is a number, so it's written AB = 5 (no bar); congruence is between figures, so it's
  // written with segment notation and the congruence symbol.
  // Angle figures show angle measures, congruent angles and how the labeled lines are related,
  // instead of the (arbitrary) distances between their points.
  // Students can turn measurements and congruent marks on or off; the choice lasts until the tab closes.
  const view = { meas: true, cong: true };
  function renderMeasures(reveal) {
    const hidden = state.task.hideMeasures && !reveal;
    $('view-toggles').hidden = hidden;
    if (hidden) { $('measures').hidden = true; return; }
    fillMeasures();
    if ($('measures').hidden) return;
    // Apply the switches: each list and its title, and the whole card when both are off.
    $('len-title').hidden = $('lengths').hidden = !view.meas;
    if (!view.cong) $('cong-title').hidden = $('congruent').hidden = true;
    if (!view.meas && !view.cong) $('measures').hidden = true;
  }
  function setView(which, on) {
    view[which] = on;
    $(which === 'meas' ? 'tog-meas' : 'tog-cong').setAttribute('aria-pressed', String(on));
    if (which === 'cong') Diagram.setCongMarks(on);
    if (state.task) renderMeasures(state.revealed);
    announce(`${which === 'meas' ? 'Measurements' : 'Congruent marks'} ${on ? 'shown' : 'hidden'}.`);
  }
  $('tog-meas').addEventListener('click', () => setView('meas', !view.meas));
  $('tog-cong').addEventListener('click', () => setView('cong', !view.cong));
  function fillMeasures() {
    const f = state.fig;
    // A circle: its radius, the arcs a figure tracks, its angles (central or inscribed) and the
    // lengths of its drawn segments, with congruent ones grouped.
    if (f.circles) {
      const a = Geom.measureAngles(f), m = Geom.measure(f), k = f.circles[0];
      const segs = m.segments.filter(x => (f.objects || []).some(o => o.kind === 'segment' && [o.a, o.b].every(n => x.pts.includes(n))));
      const arcName = arc => { const n = Tasks.arcNames(f, arc); return n.length ? n[0] : [arc.a, arc.b]; };
      const kindNote = g => { const t = Geom.angleAtCircle(f, k.c, g); return t ? ` <span class="tick-note">${t}</span>` : ''; };
      $('measures').hidden = false;
      $('cong-title').hidden = $('congruent').hidden = false;
      $('len-title').textContent = 'Measurements';
      $('lengths').innerHTML = `<li>radius = ${Geom.round2(k.r)}<span class="sr"> units</span></li>`
        + (f.arcs || []).map(arc => { const d = Geom.arcDeg(f, arc), exact = Math.abs(d - Math.round(d)) < 1e-7;
          return `<li>m${chip({ kind: 'arc', pts: arcName(arc) })} ${exact ? '=' : '≈'} ${exact ? Math.round(d) : d.toFixed(1)}°</li>`; }).join('')
        + a.angles.map(x => `<li>m${chip({ kind: 'angle', pts: x.pts })} ${x.exact ? '=' : '≈'} ${x.text}°${kindNote(x.pts)}</li>`).join('')
        + segs.map(x => `<li><span class="nt-pts">${x.pts.join('')}</span> ${x.exact ? '=' : '≈'} ${x.text}<span class="sr"> units</span></li>`).join('');
      const cs = m.congruent.filter(g => g.every(p => segs.some(x => x.pts.join() === p.join())));
      const is = ' <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ';
      $('congruent').innerHTML = cs.map(g => `<li>${g.map(p => chip({ kind: 'segment', pts: p })).join(is)}</li>`).join('')
        + Geom.congruentArcs(f).map((g, i) => `<li>${g.map(arc => chip({ kind: 'arc', pts: arcName(arc) })).join(is)} <span class="tick-note">${i + 1} ${i ? 'ticks' : 'tick'} on the circle</span></li>`).join('')
        + a.congruent.map((g, i) => `<li>${g.map(p => chip({ kind: 'angle', pts: p })).join(' <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ')} <span class="tick-note">${i + 1} ${i ? 'arcs' : 'arc'}</span></li>`).join('')
        || '<li class="muted">Nothing congruent right now.</li>';
      return;
    }
    // A triangle has both: side lengths with their ticks, and angle measures with their arcs.
    if (f.triangles) {
      const s = Geom.measure(f), a = Geom.measureAngles(f), T = f.triangles;
      const sides = s.segments.filter(x => T.some(t => [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]].some(p => p.every(n => x.pts.includes(n)))));
      $('measures').hidden = false;
      $('cong-title').hidden = $('congruent').hidden = false;
      $('len-title').textContent = 'Measurements';
      // In Explore, each triangle's type, and a congruence statement written in matching vertex order.
      let kind = '';
      if (state.task.type === 'explore') {
        kind = T.map(t => `<li class="tri-kind">${chip({ kind: 'triangle', pts: t })}: ${Geom.triSides(f, t)}, ${Geom.triKind(f, t)}</li>`).join('');
        for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
          const match = Geom.congruentTri(f, T[i], T[j]), sim = !match && Geom.similarTri(f, T[i], T[j]);
          if (match) kind += `<li class="tri-kind">${Notation.triRelShow('congruent', T[i], match)}</li>`;
          else if (sim) kind += `<li class="tri-kind">${Notation.triRelShow('similar', T[i], sim.order)}, scale factor ${Math.abs(sim.k - Math.round(sim.k)) < 1e-9 ? Math.round(sim.k) : sim.k.toFixed(2)}</li>`;
        }
      }
      $('lengths').innerHTML = kind + sides.map(x => `<li><span class="nt-pts">${x.pts.join('')}</span> ${x.exact ? '=' : '≈'} ${x.text}<span class="sr"> units</span></li>`).join('')
        + a.angles.map(x => `<li>m${chip({ kind: 'angle', pts: x.pts })} ${x.exact ? '=' : '≈'} ${x.text}°</li>`).join('');
      const cs = s.congruent.filter(g => g.every(p => sides.some(x => x.pts.join() === p.join())));
      const ticks = g => sides.find(x => x.pts.join() === g[0].join()).ticks;
      $('congruent').innerHTML = cs.map(g => `<li>${g.map(p => chip({ kind: 'segment', pts: p })).join(' <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ')} <span class="tick-note">${ticks(g)} ${ticks(g) > 1 ? 'ticks' : 'tick'}</span></li>`).join('')
        + a.congruent.map((g, i) => `<li>${g.map(p => chip({ kind: 'angle', pts: p })).join(' <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ')} <span class="tick-note">${i + 1} ${i ? 'arcs' : 'arc'}</span></li>`).join('')
        || '<li class="muted">No congruent sides or angles.</li>';
      return;
    }
    const lines = (f.objects || []).filter(o => o.kind === 'line' && o.label);
    const rels = [];
    for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
      const rel = Geom.lineRelation(f, lines[i].a, lines[i].b, lines[j].a, lines[j].b);
      if (rel) rels.push(`<li><em class="nt-letter">${lines[i].label}</em> <span aria-hidden="true">${rel === 'parallel' ? '∥' : '⊥'}</span><span class="sr">is ${rel} to</span> <em class="nt-letter">${lines[j].label}</em></li>`);
    }
    if (f.angles || rels.length) {
      const a = f.angles ? Geom.measureAngles(f) : { angles: [], congruent: [] };
      $('measures').hidden = false;
      $('len-title').textContent = 'Measurements';
      $('lengths').innerHTML = a.angles.map(x => `<li>m${chip({ kind: 'angle', pts: x.pts })} ${x.exact ? '=' : '≈'} ${x.text}°${x.kind === 'right' ? ' <span class="tick-note">right angle</span>' : ''}</li>`).join('') + rels.join('');
      $('cong-title').textContent = 'Congruent';
      $('congruent').innerHTML = a.congruent.length
        ? a.congruent.map((g, i) => `<li>${g.map(p => chip({ kind: 'angle', pts: p })).join(' <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ')} <span class="tick-note">${i + 1} ${i ? 'arcs' : 'arc'}</span></li>`).join('')
        : '<li class="muted">No congruent angles.</li>';
      $('cong-title').hidden = $('congruent').hidden = !f.angles;
      return;
    }
    $('cong-title').hidden = $('congruent').hidden = false;
    const m = Geom.measure(f, state.drawn);
    $('measures').hidden = !m.segments.length;
    if (!m.segments.length) return;
    $('lengths').innerHTML = m.segments.map(s =>
      `<li><span class="nt-pts">${s.pts.join('')}</span> ${s.exact ? '=' : '≈'} ${s.text}<span class="sr"> units</span></li>`).join('');
    $('congruent').innerHTML = m.congruent.length
      ? m.congruent.map((g, i) => `<li>${g.map(p => chip({ kind: 'segment', pts: p })).join(' <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ')} <span class="tick-note">${i + 1} ${i ? 'ticks' : 'tick'}</span></li>`).join('')
      : '<li class="muted">No congruent segments.</li>';
  }

  // ---------- Diagram tools ----------
  const TOOL_LABEL = { move: 'Move', segment: 'Segment', ray: 'Ray', line: 'Line', pick: 'Tap a Figure' };
  const TOOL_HINT = {
    move: 'Drag a point.',
    segment: 'Tap one endpoint, then the other.',
    ray: 'Tap the endpoint first, then a point it goes through.',
    line: 'Tap two points on the line.',
    pick: 'Tap a figure in the diagram.',
  };
  function showTools(list) {
    const bar = $('tools');
    bar.innerHTML = '';
    bar.hidden = list.length < 2;
    for (const t of list) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = TOOL_LABEL[t]; b.dataset.tool = t;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => chooseTool(t));
      bar.appendChild(b);
    }
    chooseTool(list[0]);
  }
  function chooseTool(t) {
    Diagram.setTool(t);
    document.querySelectorAll('#tools button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === t)));
    $('tool-hint').textContent = TOOL_HINT[t];
  }

  // ---------- Explore's plane: one plane, added or removed with a button ----------
  // A flat drawing can't show depth, so in Explore a point dragged inside the plane's shape counts
  // as in the plane. Lessons never use this rule; their planes list their points.
  const EXPLORE_QUAD = [[1, 1], [11, 1], [15, 6.5], [5, 6.5]];
  function addPlaneToggle() {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'toggle';
    const sync = () => {
      const on = (state.fig.planes || []).length > 0;
      b.textContent = on ? 'Remove Plane' : 'Add Plane';
      b.setAttribute('aria-pressed', String(on));
    };
    b.addEventListener('click', () => {
      state.fig.planes = (state.fig.planes || []).length ? [] : [{ label: 'M', quad: EXPLORE_QUAD, pts: [], byShape: true }];
      sync(); Diagram.redraw(); renderFacts(); renderMeasures();
      announce(state.fig.planes.length ? 'Plane M added. Drag points inside it to put them in the plane.' : 'Plane removed.');
    });
    sync();
    $('tools').appendChild(b);
    $('tools').hidden = false;
  }

  // ---------- Explore's tangents: hidden or shown with a button ----------
  // Hiding takes out Q, the points of tangency and everything built on them, so the circle's own
  // angles and arcs are easier to see. Showing puts them back (Q moves outside the circle if needed).
  const TAN_PTS = ['Q', 'S', 'T'];
  let tanStash = null;
  function addTangentToggle() {
    tanStash = null;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'toggle';
    const sync = () => { b.textContent = tanStash ? 'Show Tangents' : 'Hide Tangents'; b.setAttribute('aria-pressed', String(!tanStash)); };
    b.addEventListener('click', () => {
      const f = state.fig, uses = names => names.some(n => TAN_PTS.includes(n));
      if (!tanStash) {
        // Marks go with them too, like the right angles where the tangents meet the radii.
        const markPts = mk => mk.angle || mk.seg || mk.par || [];
        tanStash = { points: {}, objects: f.objects.filter(o => uses([o.a, o.b])), angles: (f.angles || []).filter(uses), arcs: (f.arcs || []).filter(a => uses([a.a, a.b])),
          marks: (f.marks || []).filter(mk => uses(markPts(mk))) };
        for (const n of TAN_PTS) { tanStash.points[n] = f.points[n]; delete f.points[n]; }
        f.objects = f.objects.filter(o => !uses([o.a, o.b])); f.angles = (f.angles || []).filter(g => !uses(g)); f.arcs = (f.arcs || []).filter(a => !uses([a.a, a.b]));
        f.marks = (f.marks || []).filter(mk => !uses(markPts(mk)));
      } else {
        Object.assign(f.points, tanStash.points);
        f.objects = f.objects.concat(tanStash.objects); f.angles = f.angles.concat(tanStash.angles); f.arcs = f.arcs.concat(tanStash.arcs);
        f.marks = (f.marks || []).concat(tanStash.marks);
        tanStash = null;
        // The circle may have moved onto Q: put Q on the nearest grid point where both tangents fit.
        const ok = () => TAN_PTS.every(n => { const P = Geom.pos(f, n); return P.x >= 1 && P.x <= Geom.W - 1 && P.y >= 1 && P.y <= Geom.H - 1; });
        if (!ok()) {
          const Q0 = f.points.Q, spots = [];
          for (let x = 1; x < Geom.W; x++) for (let y = 1; y < Geom.H; y++) spots.push({ x, y });
          spots.sort((a, c) => Math.hypot(a.x - Q0.x, a.y - Q0.y) - Math.hypot(c.x - Q0.x, c.y - Q0.y));
          for (const s of spots) { f.points.Q = s; if (ok() && Math.hypot(s.x - Geom.pos(f, 'P').x, s.y - Geom.pos(f, 'P').y) > Geom.radius(f, 'P') + 1.5) break; }
        }
      }
      Diagram.load(f, { movable: state.task.movable, magnets: state.task.magnets || [] });
      sync(); renderFacts(); renderMeasures();
      announce(tanStash ? 'Tangents hidden.' : 'Tangents shown: tangent segments QS and QT.');
    });
    sync();
    $('tools').appendChild(b);
    $('tools').hidden = false;
  }

  // ---------- Figure Facts: the text mirror of the diagram ----------
  function renderFacts() {
    const f = state.fig;
    const facts = Geom.facts(f);
    const figs = (f.objects || []).concat(state.drawn);
    let h = '<table><caption>Points</caption><tr><th scope="col">Point</th><th scope="col">x</th><th scope="col">y</th></tr>';
    for (const p of facts.points) h += `<tr><th scope="row">${p.name}</th><td>${p.x}</td><td>${p.y}</td></tr>`;
    h += '</table>';
    if (figs.length && !['name', 'find', 'same'].includes(state.task.type)) {
      h += '<table><caption>Figures</caption><tr><th scope="col">Figure</th><th scope="col">Names</th></tr>';
      figs.forEach((o, i) => {
        const names = (o.label ? [[o.label]] : []).concat(Geom.names(f, o)).map(p => Notation.show(o.kind, p)).join(', ');
        h += `<tr><th scope="row">${i + 1}: ${cap(o.kind)}</th><td>${names}</td></tr>`;
      });
      h += '</table>';
    } else if (figs.length) {
      h += '<table><caption>Figures</caption><tr><th scope="col">Figure</th><th scope="col">Points on It</th></tr>';
      figs.forEach((o, i) => {
        const on = Object.keys(f.points).filter(p => Geom.onFigure(f, o, p)).join(', ');
        h += `<tr><th scope="row">${i + 1}: ${cap(o.kind)}</th><td>${on}</td></tr>`;
      });
      h += '</table>';
    }
    // Angles and arcs: each one's name, and what the diagram shows on it (an expression, a right-angle
    // box). Measures stay in the Measurements panel. Left out while a task asks the student to name things.
    if (!['name', 'find', 'same', 'namePair', 'opposite', 'corresp'].includes(state.task.type)) {
      const labels = f.labels || [], marks = f.marks || [], angles = [];
      for (const g of (f.angles || []).concat(labels.filter(l => l.angle).map(l => l.angle))) if (!angles.some(a => Geom.sameAngle(f, a, g))) angles.push(g);
      // Only angles with something on them: a row that says "nothing" is just noise to listen through.
      const rows = angles.map(g => {
        const lb = labels.find(l => l.angle && Geom.sameAngle(f, l.angle, g)), box = marks.some(m => m.angle && m.right && Geom.sameAngle(f, m.angle, g));
        return lb || box ? `<tr><th scope="row">${Notation.show('angle', Array.from(g))}</th><td>${lb ? esc(lb.text) : 'A right-angle box'}</td></tr>` : '';
      }).join('');
      if (rows) h += '<table><caption>Angles</caption><tr><th scope="col">Angle</th><th scope="col">Shown on It</th></tr>' + rows + '</table>';
      // Lengths written on segments: without these, a student who cannot see the figure has no givens.
      const lens = labels.filter(l => l.seg);
      if (lens.length) {
        h += '<table><caption>Lengths</caption><tr><th scope="col">Segment</th><th scope="col">Shown on It</th></tr>';
        for (const l of lens) h += `<tr><th scope="row">${Notation.show('segment', Array.from(l.seg))}</th><td>${esc(l.text)}</td></tr>`;
        h += '</table>';
      }
      const arcs = labels.filter(l => l.arc);
      if (arcs.length) {
        h += '<table><caption>Arcs</caption><tr><th scope="col">Arc</th><th scope="col">Shown on It</th></tr>';
        for (const l of arcs) h += `<tr><th scope="row">${Notation.show('arc', [l.arc.a].concat(l.arc.via ? [l.arc.via] : [], [l.arc.b]))}</th><td>${esc(l.text)}</td></tr>`;
        h += '</table>';
      }
    }
    if (facts.planes.length) {
      h += '<table><caption>Planes</caption><tr><th scope="col">Plane</th><th scope="col">Points in It</th></tr>';
      for (const p of facts.planes) h += `<tr><th scope="row">${p.label}</th><td>${p.pts.join(', ')}</td></tr>`;
      h += '</table>';
    }
    $('facts-body').innerHTML = h;
  }

  // ---------- Levels, parts and tasks ----------
  const levelOf = key => Tasks.LEVELS.find(l => l.key === key);
  const shortLevel = key => (key[0] === 'b' ? 'Bridge ' + key.slice(1) : 'Level ' + key);
  const partsOf = key => Object.keys(levelOf(key).parts);
  // A level's algebra set runs like a part of its own.
  const ALG = 'algebra';
  function taskList() {
    if (state.practice || !state.part) return null;
    return state.part === ALG ? levelOf(state.level).algebra : levelOf(state.level).parts[state.part].tasks;
  }
  const partTitle = () => (state.part === ALG ? 'Algebra Connections' : levelOf(state.level).parts[state.part].title);
  function startPart(level, part) {
    state.level = level; state.part = part || partsOf(level)[0]; state.idx = 0; state.practice = false;
    loadTask(taskList()[0]);
  }
  // What comes after this part: the next part of the level, then the next level.
  function nextStop() {
    if (state.part === ALG) return null;          // algebra ends back at the menu
    const parts = partsOf(state.level), i = parts.indexOf(state.part);
    if (i < parts.length - 1) return { level: state.level, part: parts[i + 1] };
    const L = Tasks.LEVELS, j = L.findIndex(l => l.key === state.level);
    return j < L.length - 1 ? { level: L[j + 1].key, part: null } : null;
  }
  const ANGLE_TASKS = ['measure', 'namePair'];
  function loadTask(task) {
    state.task = task; state.fig = clone(task.fig); state.drawn = []; state.solved = false; state.revealed = false;
    show('task');
    const list = taskList();
    $('where').textContent = task.type === 'explore' ? shortLevel(state.level) : state.practice === MIST ? mistakeWhere()
      : state.practice ? `${shortLevel(state.level)} · More Practice`
      : `${shortLevel(state.level)} · ${partTitle()} · ${state.idx + 1} of ${list.length}`;
    // The side a question is about follows the words: "Name the Angle Opposite Side AC".
    const askSide = task.givenSide || (task.type === 'corresp' && task.part.length === 2 ? task.part : null);
    $('ask').innerHTML = esc(task.ask) + (task.want && task.want.pts ? ' ' + chip(task.want) : '') + (askSide ? ' ' + chip({ kind: 'segment', pts: askSide }) : '');
    // Label it (a question, or a worked example to read), and repeat it at the top of the labeling area.
    const kind = task.type === 'show' ? 'Example' : task.type === 'explore' ? '' : 'Question';
    $('ask-kind').textContent = kind;
    $('ask-kind').hidden = !kind;
    $('ask-copy').hidden = !kind;
    $('ask-copy').innerHTML = kind ? `<p class="ask-kind">${kind}</p><p class="ask-text">${$('ask').innerHTML}</p>` : '';
    feedback('', '');
    $('next').hidden = true; $('next2').hidden = true;
    // Points in a plane figure stay put: whether a point is in the plane is part of how the figure
    // was built, so dragging one out of the drawing would make the picture disagree with the facts.
    const still = ['same', 'mistake', 'draw', 'find', 'fixcase', 'choose', 'measure', 'namePair', 'algebra', 'relate', 'opposite', 'triRel', 'corresp', 'proof'];
    const movable = task.movable ? task.movable : task.type === 'build' ? [task.move]
      : still.includes(task.type) || (task.fig.planes || []).length || state.fig.angles || state.fig.circles ? 'none' : 'all';
    // Algebra figures are drawn to scale but not measured: the numbers would give the answers away.
    if (task.type === 'algebra') task.hideMeasures = true;
    const hlPlane = state.fig.targetPlane || state.fig.hlPlane;
    const hlAngle = state.fig.targetAngle || task.given || (task.type === 'corresp' && task.part.length === 3 ? task.part : undefined);
    // The angles a question is about are shaded, so students don't have to hunt for them.
    const hlAngles = task.q ? [task.q.g, task.q.h, task.q.ang].filter(Boolean) : [];
    // The side a question is about is highlighted too.
    const side = askSide ? state.fig.objects.findIndex(o => askSide.every(p => [o.a, o.b].includes(p))) : undefined;
    const highlight = ['name', 'fixcase'].includes(task.type) ? state.fig.target : task.q && task.q.obj !== undefined ? task.q.obj : side;
    Diagram.load(state.fig, { movable, magnets: task.magnets || [], highlight, hlPlane, hlAngle, hlAngles, hlArc: state.fig.targetArc, hideMeasures: !!task.hideMeasures, drawn: state.drawn });
    showTools(task.tools || (task.type === 'draw' ? ['segment', 'ray', 'line'] : task.type === 'find' ? ['pick'] : ['move']));
    // Nothing to drag: don't tell students to drag.
    if (movable === 'none' && Diagram.tool === 'move') $('tool-hint').textContent = '';
    if (task.planeToggle) addPlaneToggle();
    if (task.tangentToggle) addTangentToggle();
    renderLabelArea(task);
    renderFacts();
    renderMeasures();
    announce(`${task.ask}${task.want && task.want.pts ? ' ' + Notation.speak(task.want.kind, task.want.pts) : ''}.`);
  }
  function show(screen) { for (const id of ['home', 'checkpoint', 'task']) $(id).hidden = id !== screen; }

  // What to look at again after a wrong choice.
  const CHOOSE_HINT = {
    kind: 'Compare the measure with 90° and 180°.',
    pair: 'Look at where each angle sits: which side of the transversal, and between the lines or outside them.',
    lineRel: 'Do the lines meet? If they do, is it at a right angle?',
    relation: 'Which kind of pair are these angles?',
    isCongruent: 'Check whether the two lines are parallel.',
    triSides: 'Count the congruent sides: look at the tick marks.',
    triAngles: 'Find the largest angle and compare it with 90°.',
    congPair: 'Find the congruent sides. The congruent angles are opposite them.',
    fixed: 'Think about what each angle measures.',
    triRel: 'Compare the sides: are they the same lengths, or all the same number of times as long?',
    circlePart: 'Where are its ends: at the center, on the circle, or does it keep going?',
    arcKind: 'Is the arc less than half the circle, more than half, or exactly half?',
    angleType: 'Look at where the vertex is: at the center, or on the circle?',
    always: 'Do the two angles share a vertex, or are they at different crossings?',
    reason: 'Which statement says exactly this? Look at what the figure shows: vertical angles, a linear pair, parallel lines?',
    crit: 'Count the marked pairs of sides and angles. Is the marked angle between the marked sides, or the marked side between the marked angles?',
  };

  // ---------- The labeling area, per task ----------
  function renderLabelArea(task) {
    const area = $('label-area');
    area.innerHTML = '';
    if (task.type === 'show') {
      area.innerHTML = `<p class="names">${task.names.map(chip).join(' ')}</p><p>${esc(task.say)}</p>`;
      return solved();
    }
    if (task.type === 'name' || task.type === 'explore') return nameEntry(area, task.type === 'explore');
    if (task.type === 'fixcase') return nameEntry(area, false, `<p class="written">Written as <span class="as-typed">${esc(task.wrong)}</span></p>`);
    if (task.type === 'same') {
      area.innerHTML = `<p class="names">${chip(task.n1)} <span class="and">and</span> ${chip(task.n2)}</p><p class="row"><button type="button" id="ans-same">Same Figure</button><button type="button" id="ans-diff">Different Figures</button></p>`;
      const answer = isSame => {
        const r = Tasks.sameReason(state.fig, task.n1, task.n2);
        if (r.same === isSame) { feedback('good', `✓ ${r.same ? 'Same.' : 'Different.'} ${esc(r.why)}`); solved(); }
        else feedback('bad', `Look again. ${esc(r.why)}`);
      };
      $('ans-same').addEventListener('click', () => answer(true));
      $('ans-diff').addEventListener('click', () => answer(false));
      return;
    }
    if (task.type === 'mistake') {
      const wrong = task.claims.findIndex(c => !Tasks.claimTruth(state.fig, c));
      const ol = document.createElement('ol');
      ol.className = 'claims';
      task.claims.forEach((c, i) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'claim'; b.innerHTML = claimHtml(c);
        b.addEventListener('click', () => {
          if (state.solved) return;
          if (i === wrong) { b.classList.add('found'); feedback('good', `✓ That one is false. ${esc(Tasks.claimWhy(state.fig, c))}`); solved(); }
          else { b.classList.add('okline'); feedback('bad', 'That one is true. Find the false one.'); }
        });
        li.appendChild(b); ol.appendChild(li);
      });
      area.appendChild(ol);
      return;
    }
    if (['measure', 'namePair', 'relate', 'opposite', 'triRel', 'corresp'].includes(task.type)) return nameEntry(area, false);
    if (task.type === 'algebra') return algebraSteps(area, task);
    if (task.type === 'proof') return proofTable(area, task);
    if (task.type === 'choose') {
      const { answer, why, also = [] } = Tasks.chooseAnswer(state.fig, task.q);
      const row = document.createElement('div');
      row.className = 'choices';
      for (const opt of task.options) {
        const b = document.createElement('button');
        b.type = 'button'; b.innerHTML = stmtHtml(opt);     // options may hold notation tokens like [s:AC]
        b.addEventListener('click', () => {
          if (state.solved) return;
          // Some questions have more than one true answer (an equilateral triangle is isosceles too).
          const other = also.find(x => x.opt === opt);
          if (opt === answer) { b.classList.add('right'); feedback('good', `✓ ${stmtHtml(answer)}. ${esc(why)}`); solved(); reveal(); }
          else if (other) { b.classList.add('right'); feedback('good', `✓ ${stmtHtml(opt)}. ${esc(other.why)}`); solved(); reveal(); }
          // The common mistake itself is named, with its rule.
          else if (task.q.trap && opt === task.q.trap) { b.classList.add('wrong'); feedback('bad', 'That’s the common mistake. ' + esc(task.q.trapWhy)); }
          else { b.classList.add('wrong'); feedback('bad', 'Not that one. ' + esc(task.q.hint || CHOOSE_HINT[task.q.c] || task.q.why)); }
        });
        row.appendChild(b);
      }
      area.appendChild(row);
      return;
    }
    if (task.type === 'draw') { area.innerHTML = '<p class="muted">Use the tools above the diagram.</p>'; return; }
    if (task.type === 'find') { area.innerHTML = '<p class="muted">Tap it in the diagram.</p>'; return; }
    if (task.type === 'build') { area.innerHTML = `<p class="muted">Drag ${esc(task.move)} in the diagram.</p>`; return checkBuild(false); }
  }
  function claimHtml(c) {
    if (c.c === 'same') return `${chip(c.n1)} and ${chip(c.n2)} are the same ${c.n1.kind}.`;
    if (c.c === 'ends') return `${chip(c.f)} has ${c.n === 0 ? 'no endpoints' : c.n === 1 ? 'one endpoint' : 'two endpoints'}.`;
    if (c.c === 'lineIn') return `${chip(c.n)} lies in plane ${c.plane}.`;
    if (c.c === 'inPlane') return `Point ${c.pt} is in plane ${c.plane}.`;
    if (c.c === 'crosses') return `${chip(c.n)} crosses plane ${c.plane} at ${c.at}.`;
    const ang = g => chip({ kind: 'angle', pts: g });
    if (c.c === 'pairIs') return `${ang(c.g)} and ${ang(c.h)} are ${c.name === 'vertical' ? 'vertical angles' : c.name === 'linear pair' ? 'a linear pair' : c.name + ' angles'}.`;
    if (c.c === 'mEq') return `m${ang(c.g)} = m${ang(c.h)}`;
    if (c.c === 'congruent') return `${ang(c.g)} <span aria-hidden="true">≅</span><span class="sr">is congruent to</span> ${ang(c.h)}`;
    const triC = t => chip({ kind: 'triangle', pts: t });
    if (c.c === 'triSame') return `${triC(c.t1)} and ${triC(c.t2)} name the same triangle.`;
    if (c.c === 'triRel') return Notation.triRelShow(c.rel, c.t, c.u);
    if (c.c === 'part') { const o = state.fig.objects[c.obj]; return `${chip({ kind: o.kind, pts: [o.a, o.b] })} is ${c.is === 'radius' ? 'a radius' : 'a ' + c.is} of ${chip({ kind: 'circle', pts: [c.circ] })}.`; }
    if (c.c === 'arcIs') { const n = c.arc.via ? [c.arc.a, c.arc.via, c.arc.b] : [c.arc.a, c.arc.b]; return `m${chip({ kind: 'arc', pts: n })} = ${c.deg}°`; }
    if (c.c === 'segEq') return `${c.s1.join('')} = ${c.s2.join('')}`;
    if (c.c === 'angleArc') return `m${ang(c.g)} = ${c.k === 0.5 ? '½ ' : ''}m${chip({ kind: 'arc', pts: [c.arc.a, c.arc.b] })}`;
    if (c.c === 'lineRel') return `Line <em class="nt-letter">${c.a}</em> <span aria-hidden="true">${c.rel === 'parallel' ? '∥' : '⊥'}</span><span class="sr">is ${c.rel} to</span> line <em class="nt-letter">${c.b}</em>`;
    if (c.c === 'opp') return `${chip({ kind: 'segment', pts: c.side })} is the side opposite ${ang(c.g)}.`;
    if (c.c === 'triIs') return `${triC(c.tri)} is ${c.sides || c.angles}.`;
    if (c.c === 'angleSum') return Geom.triAngles(c.tri).map(g => 'm' + ang(g)).join(' + ') + ' = 180°';
    if (c.c === 'ext') return `m${ang(c.ext)} = m${ang(c.parts[0])} + m${ang(c.parts[1])}`;
    return `Points ${c.pts.slice(0, -1).join(', ')} and ${c.pts[c.pts.length - 1]} are collinear.`;
  }

  // ---------- Complete the Proof: a two-column proof; the student picks each step's reason ----------
  // Statements use tokens: [s:AB] segment, [a:ABC] angle, [m:ABC] measure, [t:ABC] triangle, [l:m] line.
  function stmtHtml(s) {
    return esc(s).replace(/\[(s|r|n|a|m|t|c|o|l):(\w+)\]/g, (_, k, v) => k === 'l' ? `<em class="nt-letter">${v}</em>`
      : k === 'm' ? 'm' + Notation.show('angle', v.split(''))
        : Notation.show({ s: 'segment', r: 'ray', n: 'line', a: 'angle', t: 'triangle', c: 'circle', o: 'arc' }[k], v.split('')));
  }
  function proofTable(area, task) {
    const opts = ['<option value="">Choose a reason</option>'].concat(task.options.map(o => `<option>${esc(o)}</option>`)).join('');
    area.innerHTML = `<table class="proof"><tr><th scope="col">Statement</th><th scope="col">Reason</th></tr>` +
      task.rows.map((r, i) => `<tr><td>${i + 1}. ${stmtHtml(r.s)}</td><td><select id="pf-${i}" aria-label="Reason for step ${i + 1}">${opts}</select><span class="pf-mark" id="pfm-${i}"></span></td></tr>`).join('') +
      `</table><p class="row"><button type="button" class="primary" id="pf-check">Check</button></p>`;
    $('pf-check').addEventListener('click', () => {
      let wrong = 0, blank = 0;
      const whys = [];   // a step's own explanation, shown when that step's reason is wrong
      task.rows.forEach((r, i) => {
        const v = $('pf-' + i).value, ok = v === r.r;
        if (!v) blank++; else if (!ok) { wrong++; if (r.why) whys.push(`Step ${i + 1}: ${esc(r.why)}`); }
        $('pfm-' + i).textContent = !v ? '' : ok ? ' ✓' : ' ✗';
        $('pfm-' + i).className = 'pf-mark ' + (!v ? '' : ok ? 'ok' : 'no');
        $('pf-' + i).setAttribute('aria-invalid', String(!!v && !ok));
      });
      if (!wrong && !blank) { feedback('good', '✓ ' + esc(task.done)); return solved(); }
      feedback(wrong ? 'bad' : 'almost', wrong ? `${wrong} ${wrong > 1 ? 'reasons don’t' : 'reason doesn’t'} fit. ${whys.concat(wrong > whys.length ? ['Which definition, postulate, theorem or property says exactly that statement?'] : []).join(' ')}` : 'Choose a reason for every step.');
    });
  }

  // ---------- Algebra: three steps, each checked before the next opens ----------
  function algebraSteps(area, task) {
    const findName = task.find.angle ? `m∠${task.find.name}` : task.find.arc ? `m⌒${task.find.name}` : task.find.name;
    const steps = [
      { label: 'Write an Equation', ph: '___ = ___', check: v => Algebra.checkSetup(task, v) },
      { label: 'Solve for x', ph: 'x = ', check: v => Algebra.checkSolve(task, v) },
      { label: `Find ${findName}`, ph: `${findName} = `, check: v => Algebra.checkFind(task, v) },
    ];
    area.innerHTML = '<ol class="steps">' + steps.map((s, i) => `
      <li id="step-${i}" ${i ? 'hidden' : ''}>
        <label for="alg-${i}" class="lead-sm">${esc(s.label)}</label>
        <div class="entry-row">
          <input type="text" id="alg-${i}" autocomplete="off" autocapitalize="off" spellcheck="false" data-gramm="false" placeholder="${esc(s.ph)}">
          <button type="button" class="primary" id="alg-check-${i}">Check</button>
        </div>
        <p class="done-line" id="alg-done-${i}" hidden></p>
      </li>`).join('') + '</ol>' +
      // The equation keys serve steps 1 and 2; an angle's Find step swaps in m∠ and the degree sign.
      '<div class="keypad" id="alg-keys"><button type="button" data-sym="x" data-steps="01">x</button><button type="button" data-sym="(" data-steps="01">(</button><button type="button" data-sym=")" data-steps="01">)</button><button type="button" data-sym=" + " data-steps="01" aria-label="plus">+</button><button type="button" data-sym=" − " data-steps="01" aria-label="minus">−</button>' +
      (task.find.angle ? '<button type="button" data-sym="m∠" data-steps="2" aria-label="measure of angle">m∠</button>' : task.find.arc ? '<button type="button" data-sym="m⌒" data-steps="2" aria-label="measure of arc">m⌒</button>' : '') +
      '<button type="button" data-sym=" = " data-steps="012" aria-label="equals">=</button>' +
      (task.find.angle || task.find.arc ? '<button type="button" data-sym="°" data-steps="2" aria-label="degrees">°</button>' : '') + '</div>' +
      `<details class="hint-box"><summary>Hint</summary><p>${esc(task.hint)}</p></details>`;
    let at = 0;
    const input = () => $('alg-' + at);
    const showKeys = () => $('alg-keys').querySelectorAll('button').forEach(b => { b.hidden = !b.dataset.steps.includes(String(at)); });
    showKeys();
    $('alg-keys').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const el = input(), s = el.selectionStart == null ? el.value.length : el.selectionStart, e = el.selectionEnd == null ? s : el.selectionEnd;
      el.value = el.value.slice(0, s) + b.dataset.sym + el.value.slice(e);
      el.focus(); el.setSelectionRange(s + b.dataset.sym.length, s + b.dataset.sym.length);
    }));
    steps.forEach((s, i) => {
      const run = () => {
        if (i !== at) return;
        const v = $('alg-' + i).value, r = s.check(v);
        if (r.status === 'good') {
          $('alg-done-' + i).hidden = false;
          $('alg-done-' + i).textContent = '✓ ' + v.trim();
          $('alg-' + i).closest('.entry-row').hidden = true;
          feedback('', '');
          at++;
          if (at < steps.length) { $('step-' + at).hidden = false; showKeys(); input().focus(); announce('Correct. Next: ' + steps[at].label + '.'); }
          else {
            const val = Algebra.fmt(r.value);
            feedback('good', `✓ ${esc(findName)} = ${val}${task.find.angle ? '°' : ''}.`);
            $('alg-keys').hidden = true;
            solved();
          }
          return;
        }
        feedback(r.status === 'bad' ? 'bad' : 'almost', esc(r.message));
      };
      $('alg-check-' + i).addEventListener('click', run);
      $('alg-' + i).addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    });
  }

  // Typed names, with a keypad for the figure words. Explore mode checks any name against the diagram.
  function nameEntry(area, explore, before) {
    const exploreAngles = explore && !!state.fig.angles;
    const exploreLines = explore && (state.fig.objects || []).filter(o => o.kind === 'line' && o.label).length >= 2;
    const relate = state.task.type === 'relate', triRel = state.task.type === 'triRel';
    const triName = !!state.fig.targetTri || triRel || (explore && !!state.fig.triangles);
    const angles = !relate && ['measure', 'namePair'].includes(state.task.type) || (!!state.fig.targetAngle && state.task.type === 'name') || exploreAngles || !!state.task.givenSide
      || (state.task.type === 'corresp' && state.task.part.length === 3);
    const TRI_REL_KEYS = '<button type="button" data-sym=" ≅ " aria-label="is congruent to">≅</button><button type="button" data-sym=" ∼ " aria-label="is similar to">∼</button>';
    const TRI_KEY = triName ? '<button type="button" data-sym="△" aria-label="triangle sign">△</button>' + (triRel || (explore && (state.fig.triangles || []).length > 1) ? TRI_REL_KEYS : '') : '';
    // Circles: ⊙ names a circle, ⌒ an arc, m⌒ an arc's measure.
    const circTask = !!state.fig.targetCircle, arcTask = !!state.fig.targetArc && ['name', 'measure'].includes(state.task.type);
    const CIRC_KEYS = (circTask || explore ? '<button type="button" data-sym="⊙" aria-label="circle sign">⊙</button>' : '')
      + (arcTask || explore ? '<button type="button" data-sym="⌒" aria-label="arc sign">⌒</button>' : '')
      + (arcTask && state.task.type === 'measure' || explore ? '<button type="button" data-sym="m⌒" aria-label="measure of arc">m⌒</button>' : '')
      + (arcTask && state.task.type === 'measure' ? '<button type="button" data-sym=" = " aria-label="equals">=</button><button type="button" data-sym="°" aria-label="degrees">°</button>' : '');
    // Figure keys replace the figure word; symbol keys insert a symbol where the cursor is.
    const REL_KEYS = '<button type="button" data-sym=" ∥ " aria-label="is parallel to">∥</button><button type="button" data-sym=" ⊥ " aria-label="is perpendicular to">⊥</button>';
    const ANGLE_KEYS = '<button type="button" data-sym="∠" aria-label="angle sign">∠</button><button type="button" data-sym="m∠" aria-label="measure of angle">m∠</button><button type="button" data-sym=" = " aria-label="equals">=</button><button type="button" data-sym="°" aria-label="degrees">°</button>';
    const keys = relate ? REL_KEYS
      : circTask || arcTask ? CIRC_KEYS
      : explore && state.fig.circles ? CIRC_KEYS + ANGLE_KEYS
      : triName && !explore ? TRI_KEY
      : angles ? TRI_KEY + ANGLE_KEYS + (exploreLines ? REL_KEYS : '')
        : '<button type="button" data-ins="segment ">Segment</button><button type="button" data-ins="ray ">Ray</button><button type="button" data-ins="line ">Line</button>' + ((state.fig.planes || []).length || state.task.planeToggle ? '<button type="button" data-ins="plane ">Plane</button>' : '');
    area.innerHTML = (before || '') + `
      <label for="name-input" class="${explore ? 'lead-sm' : 'sr'}">${explore ? 'Check a Name' : 'Type your answer'}</label>
      <div class="entry-row">
        <input type="text" id="name-input" autocomplete="off" autocapitalize="off" spellcheck="false" data-gramm="false" placeholder="${relate ? 'm ∥ n' : triRel ? '△ABC ≅ △DEF' : circTask ? '⊙P' : arcTask ? (state.task.type === 'measure' ? 'm⌒AB = 40°' : '⌒AB') : triName && !explore ? '△ABC' : angles ? '∠ABC' : 'ray AB'}" aria-describedby="name-preview">
        <button type="button" id="name-check" class="primary">Check</button>
      </div>
      <div class="keypad">${keys}</div>
      <p id="name-preview" class="preview" aria-live="polite"></p>`;
    const input = $('name-input');
    // The output box shows the case exactly as typed, so a lowercase point looks wrong on screen too.
    const preview = () => {
      const r = Notation.parse(input.value);
      if (r.kind === 'relation' && !r.error) {
        const side = s => s.letter ? `<em class="nt-letter">${esc(s.letter)}</em>` : `<span class="nt-pts">${esc(s.raw.join(''))}</span>`;
        $('name-preview').innerHTML = `${side(r.left)} ${r.rel === 'parallel' ? '∥' : '⊥'} ${side(r.right)}`;
        return;
      }
      if (r.kind === 'triangle' && r.raw) { $('name-preview').innerHTML = Notation.show('triangle', r.raw); return; }
      if (r.kind === 'triRel' && !r.error) { $('name-preview').innerHTML = Notation.triRelShow(r.rel, r.left.raw, r.right.raw); return; }
      if (r.kind === 'circle') { $('name-preview').innerHTML = Notation.show('circle', r.raw); return; }
      if (r.kind === 'arc' && r.raw) { const name = Notation.show('arc', r.raw); $('name-preview').innerHTML = (r.measure ? 'm' : '') + name + (r.value != null ? ` = ${r.value}°` : ''); return; }
      if (r.kind === 'angle' && r.raw) {
        const name = Notation.show('angle', r.raw);
        $('name-preview').innerHTML = r.value != null ? `${r.measure ? 'm' : ''}${name} = ${r.value}°` : (r.measure ? 'm' : '') + name;
        return;
      }
      $('name-preview').innerHTML = r.letter ? Notation.show('line', [r.letter]) : r.raw ? Notation.show(r.kind, r.raw) : '';
    };
    input.addEventListener('input', preview);
    area.querySelectorAll('.keypad button').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.sym) {
        const s = input.selectionStart == null ? input.value.length : input.selectionStart, e = input.selectionEnd == null ? s : input.selectionEnd;
        input.value = input.value.slice(0, s) + b.dataset.sym + input.value.slice(e);
        input.focus();
        input.setSelectionRange(s + b.dataset.sym.length, s + b.dataset.sym.length);
      } else {
        const words = input.value.replace(/^\s*(line segment|segment|seg|ray|line|plane)\b\s*/i, '');
        input.value = b.dataset.ins + words;
        input.focus();
      }
      preview();
    }));
    const check = () => explore ? exploreName(input.value) : typedName(input.value);
    $('name-check').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  }
  function typedName(value) {
    const f = state.fig, task = state.task;
    let r;
    if (task.type === 'relate' || task.type === 'triRel') {
      r = task.type === 'relate' ? Tasks.checkRelation(f, task.lines, value) : Tasks.checkTriRel(f, task.want, value);
      if (r.status === 'almost') {
        feedback('almost', `${esc(r.message)} <button type="button" id="use-fix">Use ${esc(r.fixText)}</button>`);
        $('use-fix').addEventListener('click', () => { $('name-input').value = r.fixText; $('name-input').dispatchEvent(new Event('input')); $('name-input').focus(); });
        return;
      }
      if (r.status === 'good') { feedback('good', '✓ ' + esc(r.message)); solved(); return reveal(); }
      return feedback(r.status === 'ask' ? 'almost' : 'bad', esc(r.message));
    }
    if (task.type === 'measure' && f.targetArc) r = Tasks.checkArcMeasure(f, f.targetArc, value, task.hint);
    else if (task.type === 'measure') r = Tasks.checkMeasure(f, f.targetAngle, value, task.hint);
    else if (f.targetCircle) r = Tasks.checkCircleName(f, f.targetCircle, value);
    else if (f.targetArc) r = Tasks.checkArcName(f, f.targetArc, value);
    else if (task.type === 'namePair') r = Tasks.checkNamePair(f, task.given, task.want, value);
    else if (task.type === 'opposite') r = Tasks.checkOpposite(f, task, value);
    else if (task.type === 'corresp') r = Tasks.checkCorresp(f, task, value);
    else if (f.targetAngle) r = Tasks.checkAngleName(f, f.targetAngle, value);
    else r = Tasks.checkName(f, f.targetTri ? { kind: 'triangle', pts: f.targetTri } : f.targetPlane ? { kind: 'plane', label: f.targetPlane } : f.objects[f.target], value);
    if (r.status === 'good') {
      if (r.kind === 'measure') { feedback('good', `✓ ${esc(Notation.measureText(r.pts, r.value))}`); return solved(); }
      if (r.kind === 'arcMeasure') { feedback('good', `✓ ${esc(Notation.arcMeasureText(r.pts, r.value))}`); return solved(); }
      const also = r.others && r.others.length ? ` Also correct: ${r.others.slice(0, 3).map(p => chip({ kind: r.kind, pts: p.split('') })).join(', ')}.` : '';
      feedback('good', `✓ ${esc(r.message)}${also}`);
      return solved();
    }
    if (r.status === 'almost' && r.fix) {
      const fixText = r.fix.kind === 'measure' ? Notation.measureText(r.fix.pts, r.fix.value) : r.fix.kind === 'arcMeasure' ? Notation.arcMeasureText(r.fix.pts, r.fix.value) : Notation.text(r.fix.kind, r.fix.pts);
      feedback('almost', `${esc(r.message)} <button type="button" id="use-fix">Use ${esc(fixText)}</button>`);
      $('use-fix').addEventListener('click', () => { $('name-input').value = fixText; $('name-input').dispatchEvent(new Event('input')); $('name-input').focus(); });
      return;
    }
    feedback(r.status === 'ask' || r.status === 'almost' ? 'almost' : 'bad', esc(r.message));
  }
  function exploreName(value) {
    const r = Notation.parse(value);
    if (r.error) return feedback('bad', esc(r.error));
    const f = state.fig;
    if (r.kind === 'circle') {
      const k = (f.circles || []).find(x => x.c === r.pts[0]);
      if (!k) return feedback('bad', (f.circles || []).length ? `A circle is named by its center, ${f.circles[0].c}.` : 'There’s no circle here.');
      if (r.lowercase) return feedback('almost', `Almost. Points are named with capital letters: ${chip({ kind: 'circle', pts: r.pts })}.`);
      return feedback('good', `✓ ${chip({ kind: 'circle', pts: r.pts })} has radius ${Geom.round2(k.r)}.`);
    }
    if (r.kind === 'arc') {
      const k = (f.circles || [])[0];
      if (!k) return feedback('bad', 'There’s no circle here.');
      const missing = r.pts.find(p => !f.points[p]);
      if (missing) return feedback('bad', `There's no point ${missing} yet.`);
      if (!r.pts.every(p => Geom.onCircle(f, k.c, p))) return feedback('bad', `Every point in an arc’s name is on ⊙${k.c}.`);
      const arc = r.pts.length === 2 ? { c: k.c, a: r.pts[0], b: r.pts[1] } : { c: k.c, a: r.pts[0], b: r.pts[2], via: r.pts[1] };
      const d = Geom.arcDeg(f, arc), kind = Geom.arcKind(f, arc), dt = Geom.round2(d);
      if (r.pts.length === 3 && kind === 'minor') return feedback('almost', `That’s a minor arc (${dt}°): name it with just its endpoints, ${chip({ kind: 'arc', pts: [r.pts[0], r.pts[2]] })}.`);
      if (r.lowercase) return feedback('almost', 'Almost. Points are named with capital letters.');
      if (r.value != null && Math.abs(r.value - d) > 0.5) return feedback('almost', `Not right now: m${chip({ kind: 'arc', pts: r.pts })} = ${dt}°.`);
      if (r.value != null && !r.measure) return feedback('almost', `Almost. The measure is written with m: m${chip({ kind: 'arc', pts: r.pts })} = ${dt}°.`);
      return feedback('good', `✓ m${chip({ kind: 'arc', pts: r.pts })} = ${dt}°: ${kind === 'minor' ? 'a minor arc' : kind === 'major' ? 'a major arc' : 'a semicircle'}.`);
    }
    if (r.kind === 'triRel') {
      if ((f.triangles || []).length < 2) return feedback('bad', 'There’s only one triangle here.');
      const res = Tasks.checkTriRel(f, r.rel, value, true);
      if (res.status === 'good') return feedback('good', `✓ ${esc(res.message)}`);
      return feedback(res.status === 'almost' ? 'almost' : 'bad', esc(res.message) + (res.fixText ? ` It would be ${esc(res.fixText)}.` : ''));
    }
    if (r.kind === 'triangle') {
      if (!(f.triangles || []).length) return feedback('bad', 'There’s no triangle in this diagram.');
      const missing = r.pts.find(p => !f.points[p]);
      if (missing) return feedback('bad', `There's no point ${missing} yet.`);
      const t = f.triangles.find(x => Geom.sameTri(f, x, r.pts));
      if (!t) return feedback('bad', 'Use one triangle’s three vertices.');
      if (r.lowercase) return feedback('almost', `Almost. Points are named with capital letters: ${chip({ kind: 'triangle', pts: r.pts })}.`);
      return feedback('good', `✓ ${chip({ kind: 'triangle', pts: r.pts })} is ${Geom.triSides(f, t)} and ${Geom.triKind(f, t)}.`);
    }
    if (r.kind === 'plane') {
      if (!(f.planes || []).length) return feedback('almost', 'There’s no plane yet. Use Add Plane.');
      const res = Geom.resolvePlane(f, r.pts);
      if (res.error === 'noPlane') return feedback('bad', `The plane is labeled ${f.planes[0].label}.`);
      if (res.error === 'noPoint') return feedback('bad', `There's no point ${res.pt} yet.`);
      if (res.error === 'collinear') return feedback('almost', `${r.pts.join(', ')} are on one line, so many planes go through them. Use three points not on one line.`);
      if (res.error === 'notIn') return feedback('almost', `${res.pt} isn’t in plane ${res.plane}. Drag it inside the plane first.`);
      if (r.lowercase) return feedback('almost', `Almost. ${r.pts.length === 1 ? 'A plane’s letter is a capital' : 'Points are named with capital letters'}: ${chip({ kind: 'plane', pts: r.pts })}.`);
      return feedback('good', `✓ ${chip({ kind: 'plane', pts: r.pts })} names plane ${res.label}.`);
    }
    if (r.kind === 'angle') {
      if (r.pts.length === 1) return feedback('almost', 'Name angles with three points, vertex in the middle.');
      const g = (f.angles || []).find(a => Geom.sameAngle(f, a, r.pts));
      if (!g) return feedback('bad', 'That isn’t one of the angles in this diagram. Put the vertex in the middle.');
      const deg = Geom.angleDeg(f, ...g), k = Geom.angleKind(deg), exact = Math.abs(deg - Math.round(deg)) < 1e-7;
      return feedback('good', `✓ m${chip({ kind: 'angle', pts: r.pts })} ${exact ? '=' : '≈'} ${exact ? Math.round(deg) : deg.toFixed(1)}°: ${k === 'acute' || k === 'obtuse' ? 'an' : 'a'} ${k} angle.`);
    }
    if (r.kind === 'relation') {
      const labels = (f.objects || []).filter(o => o.kind === 'line' && o.label).map(o => o.label);
      const sides = [r.left, r.right].map(s => s.letter || '');
      if (sides.some(s => !labels.includes(s))) return feedback('bad', `Use the lines' letters: ${labels.join(', ')}.`);
      const L = f.objects.find(o => o.label === sides[0]), R = f.objects.find(o => o.label === sides[1]);
      const rel = Geom.lineRelation(f, L.a, L.b, R.a, R.b);
      return rel === r.rel ? feedback('good', `✓ Yes, right now ${sides[0]} ${rel === 'parallel' ? '∥' : '⊥'} ${sides[1]}.`)
        : feedback('almost', `Not right now: lines ${sides[0]} and ${sides[1]} are ${rel || 'neither parallel nor perpendicular'}. Drag to change that.`);
    }
    if (r.letter) return feedback('almost', 'No line here has a letter name yet. Name it with two of its points.');
    const missing = r.pts.find(p => !state.fig.points[p]);
    if (missing) return feedback('bad', `There's no point ${missing} yet.`);
    if (!r.kind) return feedback('almost', `With no mark, ${r.pts.join('')} is a length. Add segment, ray or line.`);
    const typed = { kind: r.kind, a: r.pts[0], b: r.pts[1] };
    const figs = (state.fig.objects || []).concat(state.drawn);
    const match = figs.findIndex(o => Geom.same(state.fig, o, typed));
    if (match >= 0 && r.lowercase) feedback('almost', `Almost. Points are named with capital letters: ${chip({ kind: r.kind, pts: r.pts })} is figure ${match + 1}.`);
    else if (match >= 0) { feedback('good', `✓ ${chip({ kind: r.kind, pts: r.pts })} is figure ${match + 1} in the diagram.`); }
    else feedback('almost', `${chip({ kind: r.kind, pts: r.pts })} isn't drawn yet. Draw it with the ${cap(r.kind)} tool.`);
  }

  // ---------- Diagram input ----------
  function onDraw(drawn) {
    const task = state.task;
    if (task.type === 'explore') {
      state.drawn.push(drawn);
      Diagram.redraw(); renderFacts(); renderMeasures();
      announce(`Drew ${Notation.speak(drawn.kind, [drawn.a, drawn.b])}.`);
      return;
    }
    if (task.type !== 'draw' || state.solved) return;
    const r = Tasks.checkDraw(state.fig, task.want, drawn);
    state.drawn.splice(0, state.drawn.length, drawn);
    Diagram.redraw(); renderFacts(); renderMeasures();
    announce(`Drew ${Notation.speak(drawn.kind, [drawn.a, drawn.b])}. ${r.message}`);
    if (r.status === 'good') { feedback('good', '✓ ' + esc(r.message)); solved(); }
    else feedback(r.status === 'almost' ? 'almost' : 'bad', esc(r.message));
  }
  function onPick(index) {
    const task = state.task;
    if (task.type !== 'find' || state.solved) return;
    const r = Tasks.checkFind(state.fig, task.want, index, task.wantIn);
    Diagram.load(state.fig, { movable: 'none', picked: index, drawn: state.drawn });
    Diagram.setTool('pick');
    const o = state.fig.objects[index];
    if (r.status === 'good') { feedback('good', '✓ ' + esc(r.message)); solved(); }
    else feedback('bad', esc(r.message));
    announce(r.message);
  }
  function onMove(name, final) {
    renderFacts(); renderMeasures();
    if (!final) return;
    const P = Geom.pos(state.fig, name);
    announce(`${name} is at ${Geom.round2(P.x)}, ${Geom.round2(P.y)}.`);
    if (state.task.type === 'build') checkBuild(true);
  }
  function checkBuild(moved) {
    const task = state.task;
    if (Tasks.goalMet(state.fig, task.goal)) {
      if (!state.solved) { feedback('good', '✓ ' + esc(task.done)); announce(task.done); solved(); }
    } else if (moved && state.solved) {
      feedback('almost', 'Not any more. Move it back.');
      state.solved = false; $('next').hidden = true;
    }
  }
  // A task that hid its measurements (so they wouldn't give the answer away) shows them once answered.
  function reveal() {
    if (!state.task.hideMeasures) return;
    state.revealed = true;
    const q = state.task.q;
    Diagram.load(state.fig, { movable: 'none', hlAngle: state.fig.targetAngle, hlAngles: q ? [q.g, q.h, q.ang].filter(Boolean) : [], drawn: state.drawn });
    renderMeasures(true);
  }
  function solved() {
    state.solved = true;
    const list = taskList();
    const last = !list || state.idx >= list.length - 1;
    const stop = !state.practice && state.part ? nextStop() : null;
    // Themes run straight on; the end of a level stops at a checkpoint first.
    const label = !stop ? 'Finish' : stop.level === state.level ? `Next: ${levelOf(stop.level).parts[stop.part].title}` : `Finish ${shortLevel(state.level).split(' ')[0]}`;
    $('next').textContent = state.practice === MIST ? 'Another Like This' : state.practice ? 'Another One' : !last ? 'Next' : label;
    $('next').hidden = state.task.type === 'explore';
    $('next2').hidden = state.practice !== MIST;
  }
  $('next').addEventListener('click', () => {
    if (state.practice === MIST) return loadTask(Tasks.mistakeQ(state.mkey, state.midx));
    if (state.practice) return loadTask(Tasks.practice(state.level));
    const list = taskList();
    if (state.idx < list.length - 1) { state.idx++; return loadTask(list[state.idx]); }
    const stop = nextStop();
    if (stop && stop.level === state.level) return startPart(stop.level, stop.part);
    if (stop) return checkpoint(stop);
    goHome();
  });

  // ---------- Common Mistakes: a new comparable question for each mistake, one mistake at a time ----------
  // "Another Like This" gives a new question for the same mistake; "Next Mistake" moves on (and around).
  function startMistakes(key, i = 0) {
    const g = mistakeGroup(key);
    state.practice = MIST; state.mkey = g.key; state.midx = i % g.list.length; state.part = null; state.level = g.key === 'b' ? 'b2' : g.key;
    loadTask(Tasks.mistakeQ(state.mkey, state.midx));
  }
  const mistakeWhere = () => { const g = mistakeGroup(state.mkey);
    return `Common Mistakes · ${g.title.split(':')[0]} · ${g.list[state.midx].name} (${state.midx + 1} of ${g.list.length})`; };
  $('next2').addEventListener('click', () => startMistakes(state.mkey, state.midx + 1));

  // ---------- Checkpoint: a clear break between levels, so a new level doesn't start without warning ----------
  function checkpoint(stop) {
    const L = levelOf(stop.level), parts = partsOf(stop.level), kind = shortLevel(stop.level).split(' ')[0];
    $('cp-done').textContent = `✓ ${shortLevel(state.level)} Complete`;
    $('cp-next').textContent = L.title;
    $('cp-note').textContent = `New ${kind.toLowerCase()}: start a new heading in your notes.`;
    // The new level's themes, so students see what's coming.
    $('cp-themes').innerHTML = parts.map((p, i) => `<li${i ? '' : ' class="next"'}>${esc(L.parts[p].title)}</li>`).join('');
    $('cp-themes').hidden = parts.length < 2;
    $('cp-go').textContent = `Start Next ${kind}`;
    $('cp-go').onclick = () => startPart(stop.level);
    show('checkpoint');
    $('where').textContent = shortLevel(stop.level);
    $('cp-next').focus();
  }

  // ---------- Home: every level has its lesson, its own Explore, and its own Algebra ----------
  const button = (text, cls, label, onClick) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.textContent = text;
    if (label) b.setAttribute('aria-label', label);
    b.addEventListener('click', onClick);
    return b;
  };
  function startExplore(key) {
    state.level = key; state.practice = false; state.part = null;
    loadTask(levelOf(key).explore());
  }
  function startAlgebra(key) {
    state.level = key; state.part = ALG; state.idx = 0; state.practice = false;
    loadTask(taskList()[0]);
  }
  function renderHome() {
    const box = $('levels');
    box.innerHTML = '';
    for (const L of Tasks.LEVELS) {
      const sec = document.createElement('div');
      sec.className = 'level';
      sec.innerHTML = `<h2 class="lead">${esc(L.title)}</h2>`;
      const row = (cls, label) => { const d = document.createElement('div'); d.className = cls; if (label) d.setAttribute('aria-label', label); sec.appendChild(d); return d; };
      // Lesson on its own line, its themes below it, then Explore and Algebra Connections.
      row('modes').appendChild(button('Lesson', 'big primary-big', 'Lesson: ' + L.title, () => startPart(L.key)));
      const parts = Object.keys(L.parts);
      if (parts.length > 1) {
        const themes = row('parts', 'Lesson themes');
        for (const p of parts) themes.appendChild(button(L.parts[p].title, 'part', `${L.parts[p].title}: ${L.title}`, () => startPart(L.key, p)));
      }
      // Bridges are lessons only; levels also have Explore and Algebra Connections.
      if (L.explore || L.algebra) {
        const more = row('modes');
        if (L.explore) more.appendChild(button('Explore', 'big', 'Explore: ' + L.title, () => startExplore(L.key)));
        if (L.algebra) more.appendChild(button('Algebra Connections', 'big', 'Algebra Connections: ' + L.title, () => startAlgebra(L.key)));
      }
      if (L.bridge) sec.classList.add('bridge');
      box.appendChild(sec);
    }
    // More Practice sits at the bottom of the page, after every level.
    // Every level's More Practice: new problems each time.
    const practice = Tasks.LEVELS.filter(L => Tasks.PRACTICE[L.key]);
    if (practice.length) {
      const sec = document.createElement('div');
      sec.className = 'level';
      sec.innerHTML = '<h2 class="lead">More Practice</h2>';
      const d = document.createElement('div');
      d.className = 'practice-list';
      for (const L of practice) d.appendChild(button(L.title, 'big', 'More Practice: ' + L.title, () => { state.level = L.key; state.practice = true; state.part = null; loadTask(Tasks.practice(L.key)); }));
      sec.appendChild(d);
      box.appendChild(sec);
    }
    renderMistakesHome(box);
  }
  // Common Mistakes, after More Practice: one button per group, matching the Mistakes page.
  function renderMistakesHome(box) {
    const sec = document.createElement('div');
    sec.className = 'level';
    sec.innerHTML = '<h2 class="lead">Common Mistakes</h2>';
    const d = document.createElement('div');
    d.className = 'practice-list';
    for (const g of Tasks.MISTAKES) d.appendChild(button(g.title, 'big', 'Common Mistakes: ' + g.title, () => startMistakes(g.key)));
    sec.appendChild(d);
    box.appendChild(sec);
  }
  function goHome() { show('home'); $('where').textContent = ''; }
  $('menu').addEventListener('click', goHome);
  renderHome();

  Diagram.mount($('svg'), { onDraw, onPick, onMove, onFirst: n => announce(`${n} selected. Now choose the second point.`), onBlocked: n => announce(`${n} can't move there.`) });

  // #level=2&start=lesson opens that level's lesson (start=explore, start=algebra, start=practice or start=mistakes for the
  // others; Common Mistakes takes level=1 to 5, or b for the bridges);
  // part= picks a lesson part. With no start, the tool opens on its menu.
  function route(o) {
    const start = o.get('start');
    const level = levelOf(o.get('level') || '1') ? (o.get('level') || '1') : '1';
    const part = o.get('part');
    if (part && partsOf(level).includes(part)) startPart(level, part);
    else if (start === 'lesson') startPart(level);
    else if (start === 'explore') startExplore(level);
    else if (start === 'algebra') startAlgebra(level);
    else if (start === 'mistakes') startMistakes(o.get('level') || '1');
    // start=practice: a level's More Practice (from its page's "Not yet" button); a bridge has none, so its lesson.
    else if (start === 'practice') {
      if (Tasks.PRACTICE[level]) { state.level = level; state.practice = true; state.part = null; loadTask(Tasks.practice(level)); }
      else startPart(level);
    }
    else goHome();
  }
  route(opt);
  // A page's link can point at this frame with a new #hash (the Start page's Exploring and Algebra
  // Connections buttons do); the hash changes without reloading, so follow it here.
  window.addEventListener('hashchange', () => route(new URLSearchParams(location.hash.slice(1))));
})();
