/* Reading and showing figure names. Loose typing is accepted ("seg AB", "ray BA", "line AB"); the
   answer is judged against the figure. Capital and lowercase letters are part of the notation, so
   the reader keeps the case exactly as typed and the checker teaches it:
     points and planes use capitals (A, plane N); a line's one-letter name is lowercase (line m).
   No DOM here. */
const Notation = (() => {
  'use strict';
  const WORDS = { 'line segment': 'segment', segment: 'segment', seg: 'segment', ray: 'ray', line: 'line', plane: 'plane' };

  // Results:
  //   "segment AB"  -> { kind: 'segment', pts: ['A', 'B'], raw: ['A', 'B'] }
  //   "line m"      -> { kind: 'line', letter: 'm' }            (a line's own one-letter name)
  //   "plane N"     -> { kind: 'plane', pts: ['N'], raw: ['N'] }
  //   "AB"          -> { kind: null, pts: ['A', 'B'] }         (no mark: a length, so the checker asks)
  // pts are always capitals, for looking points up; raw keeps what was typed, for teaching case.
  // Angles: "angle ABC", "<ABC", "∠ABC"; a measure adds m: "m<ABC = 75", "m∠ABC=75°",
  // "measure of angle ABC = 75 degrees".
  //   -> { kind: 'angle', pts: ['A', 'B', 'C'], raw, measure: true, value: 75 }
  const ANGLE = /^(?:(m|measure of)\s*)?(?:∠|<|angle\b)\s*([A-Za-z]+)\s*(?:=\s*(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)?)?$/i;
  function parseAngle(s) {
    const m = s.replace(/\s+/g, ' ').trim().match(ANGLE);
    if (!m) return null;
    const raw = m[2].split(''), pts = m[2].toUpperCase().split('');
    if (pts.length !== 1 && pts.length !== 3) return { kind: 'angle', error: 'Name an angle with three points, vertex in the middle, like angle ABC.' };
    if (new Set(pts).size !== pts.length) return { kind: 'angle', error: 'Use three different points.' };
    return { kind: 'angle', pts, raw, lowercase: raw.some(c => c !== c.toUpperCase()), measure: !!m[1], value: m[3] != null ? Number(m[3]) : null };
  }

  // A relationship between two lines: "line m ∥ line n", "m || n", "AB ⊥ EF",
  // "m is perpendicular to t".  -> { kind: 'relation', rel: 'parallel' | 'perpendicular', left, right }
  // where each side is a line name: { letter } or { pts, raw, lowercase }.
  function parseRelation(s) {
    const t = s.replace(/\s+/g, ' ').trim()
      .replace(/\s*(∥|\|\||\/\/|\bis parallel to\b|\bparallel to\b|\bparallel\b)\s*/i, ' PAR ')
      .replace(/\s*(⊥|_\|_|\bis perpendicular to\b|\bperpendicular to\b|\bperpendicular\b|\bperp\b)\s*/i, ' PERP ');
    const m = t.match(/^(.*) (PAR|PERP) (.*)$/);
    if (!m) return null;
    const side = x => {
      const letters = x.replace(/^\s*line\b/i, '').replace(/[^A-Za-z]/g, '');
      if (letters.length === 1) return { letter: letters };
      if (letters.length === 2) return { pts: letters.toUpperCase().split(''), raw: letters.split(''), lowercase: letters !== letters.toUpperCase() };
      return null;
    };
    const left = side(m[1]), right = side(m[3]);
    if (!left || !right) return { kind: 'relation', error: 'Write two lines with a sign between them, like m ∥ n.' };
    return { kind: 'relation', rel: m[2] === 'PAR' ? 'parallel' : 'perpendicular', left, right };
  }

  // A triangle: "△ABC", "triangle ABC", "tri ABC".  -> { kind: 'triangle', pts, raw, lowercase }
  const TRI = /^(?:△|∆|triangle\b|tri\b)\s*([A-Za-z\s]+)$/i;
  function parseTriangle(s) {
    const m = s.replace(/\s+/g, ' ').trim().match(TRI);
    if (!m) return null;
    const letters = m[1].replace(/\s+/g, ''), raw = letters.split(''), pts = letters.toUpperCase().split('');
    if (pts.length !== 3) return { kind: 'triangle', error: 'Name a triangle with its three vertices, like △ABC.' };
    if (new Set(pts).size !== 3) return { kind: 'triangle', error: 'Use three different points.' };
    return { kind: 'triangle', pts, raw, lowercase: raw.some(c => c !== c.toUpperCase()) };
  }

  // A statement about two triangles: "△ABC ≅ △DEF", "tri ABC ~= tri DEF", "△ABC ∼ △DEF",
  // "triangle ABC is similar to triangle DEF". The vertex order is part of the statement.
  //   -> { kind: 'triRel', rel: 'congruent' | 'similar', left, right, lowercase, noSign }
  const REL_WORDS = /\s*(≅|~=|≃|\bis congruent to\b|\bcongruent to\b|\bcong\b|∼|~|\bis similar to\b|\bsimilar to\b|\bsim\b)\s*/i;
  function parseTriRel(s) {
    const m = s.replace(/\s+/g, ' ').trim().split(REL_WORDS);
    if (m.length !== 3) return null;
    const side = x => {
      const sign = /^(△|∆|triangle\b|tri\b)/i.test(x.trim());
      const letters = x.replace(/^\s*(△|∆|triangle\b|tri\b)/i, '').replace(/\s+/g, '');
      return /^[A-Za-z]{3}$/.test(letters) ? { pts: letters.toUpperCase().split(''), raw: letters.split(''), sign } : null;
    };
    const left = side(m[0]), right = side(m[2]);
    if (!left || !right) return /^[A-Za-z△∆\s]+$/.test(m[0] + m[2]) ? { kind: 'triRel', error: 'Name each triangle with △ and three vertices, like △ABC ≅ △DEF.' } : null;
    const rel = /≅|~=|≃|cong/i.test(m[1]) ? 'congruent' : 'similar';
    const lowercase = left.raw.concat(right.raw).some(c => c !== c.toUpperCase());
    return { kind: 'triRel', rel, left, right, lowercase, noSign: !left.sign || !right.sign };
  }

  // A circle is named by its center: "⊙P", "circle P".  -> { kind: 'circle', pts: ['P'], raw, lowercase }
  // An arc: "⌒AB", "arc AB", "arc ACB"; its measure adds m: "m arc AB = 70", "m⌒AB = 70°".
  //   -> { kind: 'arc', pts, raw, lowercase, measure, value }
  const CIRCLE = /^(?:⊙|circle\b)\s*([A-Za-z])$/i;
  const ARC = /^(?:(m|measure of)\s*)?(?:⌒|arc\b)\s*([A-Za-z\s]+?)\s*(?:=\s*(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)?)?$/i;
  function parseCircleArc(s) {
    const t = s.replace(/\s+/g, ' ').trim();
    const c = t.match(CIRCLE);
    if (c) return { kind: 'circle', pts: [c[1].toUpperCase()], raw: [c[1]], lowercase: c[1] !== c[1].toUpperCase() };
    const m = t.match(ARC);
    if (!m) return null;
    const letters = m[2].replace(/\s+/g, ''), raw = letters.split(''), pts = letters.toUpperCase().split('');
    if (pts.length !== 2 && pts.length !== 3) return { kind: 'arc', error: 'Name an arc with its two endpoints, like arc AB, or three points for a major arc, like arc ACB.' };
    if (new Set(pts).size !== pts.length) return { kind: 'arc', error: 'Use different points.' };
    return { kind: 'arc', pts, raw, lowercase: raw.some(ch => ch !== ch.toUpperCase()), measure: !!m[1], value: m[3] != null ? Number(m[3]) : null };
  }

  function parse(src) {
    let s = String(src == null ? '' : src).trim();
    if (!s) return { error: 'Type a name first.' };
    const circ = parseCircleArc(s);
    if (circ) return circ;
    const triRel = parseTriRel(s);
    if (triRel) return triRel;
    const tri = parseTriangle(s);
    if (tri) return tri;
    const ang = parseAngle(s);
    if (ang) return ang;
    const relation = parseRelation(s);
    if (relation) return relation;
    s = s.replace(/↔|<->|<>/g, ' line ').replace(/→|->/g, ' ray ').replace(/[^A-Za-z ]+/g, ' ').replace(/\s+/g, ' ').trim();
    let kind = null, rest = s;
    const m = s.match(/^(line segment|segment|seg|ray|line|plane)\b\s*(.*)$/i);
    if (m) { kind = WORDS[m[1].toLowerCase()]; rest = m[2]; }
    const letters = rest.replace(/\s+/g, '');
    const raw = letters.split('');
    const pts = letters.toUpperCase().split('');
    const lowercase = raw.some(c => c !== c.toUpperCase());
    if (kind === 'plane') {
      if (!letters) return { kind, error: 'Add a letter or three points, like plane M or plane ABC.' };
      if (pts.length !== 1 && pts.length !== 3) return { kind, error: 'Name a plane with one letter or three points, like plane M or plane ABC.' };
      if (new Set(pts).size !== pts.length) return { kind, error: 'Use three different points.' };
      return { kind, pts, raw, lowercase };
    }
    if (kind === 'line' && letters.length === 1) return { kind, letter: letters };
    if (!letters) return { kind, error: 'Add two point letters, like ' + (kind || 'segment') + ' AB.' };
    if (pts.length !== 2) return { kind, error: pts.length < 2 ? 'Use two points to name it.' : 'Use exactly two points, like ray AB.' };
    if (pts[0] === pts[1]) return { kind, error: 'Use two different points.' };
    return { kind, pts, raw, lowercase };
  }

  const PREFIX = { angle: '∠', triangle: '△', circle: '⊙', arc: '⌒' };
  const text = (kind, pts) => PREFIX[kind] ? PREFIX[kind] + pts.join('') : (kind ? kind + ' ' : '') + pts.join('');
  const speak = (kind, pts) => (kind ? kind + ' ' : '') + pts.join(' ');
  // m∠ABC = 75°, as text and as words.
  const measureText = (pts, value) => `m∠${pts.join('')} = ${value}°`;
  const measureSpeak = (pts, value) => `the measure of angle ${pts.join(' ')} is ${value} degrees`;
  // True notation: a bar over a segment, a bar with one arrowhead over a ray, two over a line.
  // The mark is drawn in CSS so it spans the letters exactly and scales with them. It is hidden
  // from screen readers, which get the words instead.
  function show(kind, pts) {
    const letters = pts.join('');
    // A plane has no mark over it: "plane M" or "plane ABC". Neither does a line's one-letter name.
    if (kind === 'plane') return `<span aria-hidden="true">plane <span class="nt-pts">${letters}</span></span><span class="sr">${speak(kind, pts)}</span>`;
    if (kind === 'line' && pts.length === 1) return `<span aria-hidden="true">line <em class="nt-letter">${letters}</em></span><span class="sr">line ${letters}</span>`;
    if (kind === 'angle') return `<span aria-hidden="true">∠<span class="nt-pts">${letters}</span></span><span class="sr">${speak(kind, pts)}</span>`;
    if (kind === 'triangle') return `<span aria-hidden="true">△<span class="nt-pts">${letters}</span></span><span class="sr">${speak(kind, pts)}</span>`;
    if (kind === 'circle') return `<span aria-hidden="true">⊙<span class="nt-pts">${letters}</span></span><span class="sr">circle ${letters}</span>`;
    if (kind === 'arc') return `<span aria-hidden="true"><span class="nt">${arcMark(letters.length)}<span class="nt-pts">${letters}</span></span></span><span class="sr">${speak(kind, pts)}</span>`;
    const body = !kind
      ? `<span class="nt-pts">${letters}</span>`
      : `<span class="nt">${mark(kind, letters.length)}<span class="nt-pts">${letters}</span></span>`;
    return `<span aria-hidden="true">${body}</span><span class="sr">${speak(kind, pts)}</span>`;
  }
  // The bar and arrowheads are one small SVG in one coordinate system, so the heads always sit
  // exactly on the bar at any size (separate CSS pieces round to pixels apart). Its width is set in
  // em from the letter count, and its viewBox has the same proportions, so the heads never stretch.
  function mark(kind, n) {
    const W = n * 68, mid = 15, head = 17;
    const x1 = kind === 'line' ? head - 2 : 2, x2 = kind === 'segment' ? W - 2 : W - head + 2;
    let d = `<path d="M${x1},${mid} L${x2},${mid}" stroke="currentColor" stroke-width="7" stroke-linecap="butt" fill="none"></path>`;
    if (kind !== 'segment') d += `<path d="M${W - head},${mid - 11} L${W},${mid} L${W - head},${mid + 11} Z" fill="currentColor"></path>`;
    if (kind === 'line') d += `<path d="M${head},${mid - 11} L0,${mid} L${head},${mid + 11} Z" fill="currentColor"></path>`;
    return `<svg class="nt-svg" viewBox="0 0 ${W} 30" style="width:${n * 0.68}em" focusable="false">${d}</svg>`;
  }

  // The arc mark: a shallow curve over the letters, in the same coordinate system as the bars.
  function arcMark(n) {
    const W = n * 68;
    return `<svg class="nt-svg" viewBox="0 0 ${W} 30" style="width:${n * 0.68}em" focusable="false"><path d="M4,26 Q${W / 2},-8 ${W - 4},26" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"></path></svg>`;
  }
  // m⌒AB = 70°, as text.
  const arcMeasureText = (pts, value) => `m⌒${pts.join('')} = ${value}°`;

  // △ABC ≅ △DEF, as text and as HTML (with words for screen readers).
  const triRelText = (rel, t, u) => `△${t.join('')} ${rel === 'congruent' ? '≅' : '∼'} △${u.join('')}`;
  const triRelShow = (rel, t, u) => `${show('triangle', t)} <span aria-hidden="true">${rel === 'congruent' ? '≅' : '∼'}</span><span class="sr">is ${rel} to</span> ${show('triangle', u)}`;

  return { parse, text, speak, show, measureText, measureSpeak, triRelText, triRelShow, arcMeasureText };
})();
