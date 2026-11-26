/* Algebra on the diagram: expressions like 2x + 10 on segments and angles, and the equations that
   come from a figure's relationships. No DOM here.
   Students work in three steps: write an equation, solve for x, find the measure. An equation is
   accepted in any arrangement, because what matters is that left minus right is a multiple of the
   relationship's own equation. Loose typing is fine: 2x, 2(x+1), x2 and "3 x" all read as products. */
const Algebra = (() => {
  'use strict';

  // ---------- Reading expressions ----------
  function tokenize(src) {
    const s = String(src).replace(/[−–—]/g, '-').replace(/[×⋅·]/g, '*').replace(/÷/g, '/').replace(/°/g, '');
    const out = [];
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const num = s.slice(i).match(/^\d+(\.\d+)?|^\.\d+/);
      if (num) { out.push({ k: 'num', v: Number(num[0]) }); i += num[0].length; continue; }
      if (/[xX]/.test(c)) { out.push({ k: 'x' }); i++; continue; }
      if ('+-*/^()'.includes(c)) { out.push({ k: c }); i++; continue; }
      throw new Error(`I can't read "${c}" here.`);
    }
    return out;
  }
  // Recursive descent with implicit multiplication. The result is a function of x.
  function parse(src) {
    const t = tokenize(src);
    if (!t.length) throw new Error('Type an expression.');
    let i = 0;
    const peek = () => t[i], take = () => t[i++];
    const startsFactor = tk => tk && (tk.k === 'num' || tk.k === 'x' || tk.k === '(');
    function expr() {
      let f = term();
      while (peek() && (peek().k === '+' || peek().k === '-')) {
        const op = take().k, g = term(), a = f;
        f = op === '+' ? x => a(x) + g(x) : x => a(x) - g(x);
      }
      return f;
    }
    function term() {
      let f = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.k === '*' || tk.k === '/')) {
          take();
          const g = unary(), a = f;
          f = tk.k === '*' ? x => a(x) * g(x) : x => a(x) / g(x);
        } else if (startsFactor(tk)) {
          const g = power(), a = f;           // 2x, 2(x+1), x(x-1), x2
          f = x => a(x) * g(x);
        } else return f;
      }
    }
    function unary() {
      if (peek() && peek().k === '-') { take(); const g = unary(); return x => -g(x); }
      if (peek() && peek().k === '+') { take(); return unary(); }
      return power();
    }
    function power() {
      const b = atom();
      if (peek() && peek().k === '^') { take(); const e = unary(); return x => Math.pow(b(x), e(x)); }
      return b;
    }
    function atom() {
      const tk = take();
      if (!tk) throw new Error('Something is missing at the end.');
      if (tk.k === 'num') { const v = tk.v; return () => v; }
      if (tk.k === 'x') return x => x;
      if (tk.k === '(') {
        const f = expr();
        if (!peek() || peek().k !== ')') throw new Error('A "(" needs a ")".');
        take();
        return f;
      }
      throw new Error(`"${tk.k}" needs a number or x before it.`);
    }
    const f = expr();
    if (i < t.length) throw new Error(t[i].k === ')' ? 'There is a ")" without a "(".' : "I can't read the end of that.");
    return f;
  }
  // a*x + b, found by evaluating; null when the expression isn't linear in x.
  function linear(f) {
    const b = f(0), a = f(1) - b;
    const ok = [2, -3, 0.5].every(x => Math.abs(f(x) - (a * x + b)) < 1e-9 * Math.max(1, Math.abs(f(x))));
    return ok && isFinite(a) && isFinite(b) ? { a, b } : null;
  }

  // ---------- Equations ----------
  // "2x + 10 = 3x - 20" -> the linear form of (left - right).
  function equation(src) {
    const parts = String(src).split('=');
    if (parts.length !== 2) return { error: parts.length < 2 ? 'Write an equation: it needs an = sign.' : 'Use one = sign.' };
    if (/[a-wyzA-WYZ]/.test(src)) return { error: 'Use the expressions on the diagram, with x.' };
    let L, R;
    try { L = parse(parts[0]); R = parse(parts[1]); } catch (e) { return { error: e.message }; }
    const d = linear(x => L(x) - R(x));
    if (!d) return { error: 'That equation isn’t in the form this problem gives.' };
    return { form: d, left: L, right: R };
  }
  // Same equation up to rearranging: both forms describe the same line a*x + b = 0.
  const sameForm = (p, q) => Math.abs(p.a * q.b - q.a * p.b) < 1e-9 * Math.max(1, Math.abs(p.a * q.b)) && Math.abs(p.a) + Math.abs(p.b) > 1e-12 && (Math.abs(p.a) > 1e-12) === (Math.abs(q.a) > 1e-12);
  const root = f => -f.b / f.a;

  // The relationship's own equation, as a linear form, from the expressions on the figure.
  //   rel = { is: 'equal', a, b }               a = b         (vertical, corresponding, midpoint)
  //   rel = { is: 'sum', parts: [a, b], total }  a + b = total (segment addition, linear pair = 180)
  function relForm(rel) {
    const f = rel.is === 'equal'
      ? (() => { const A = parse(rel.a), B = parse(rel.b); return x => A(x) - B(x); })()
      : (() => { const ps = rel.parts.map(parse), T = parse(String(rel.total)); return x => ps.reduce((s, p) => s + p(x), 0) - T(x); })();
    return linear(f);
  }

  // Step 1: the equation. Wrong relationships get named.
  function checkSetup(problem, input) {
    const eq = equation(input);
    if (eq.error) return { status: 'bad', message: eq.error };
    const want = relForm(problem.rel);
    if (sameForm(eq.form, want)) return { status: 'good', x: root(want) };
    for (const alt of problem.wrong || []) {
      if (sameForm(eq.form, relForm(alt.rel))) return { status: 'bad', message: alt.why };
    }
    return { status: 'bad', message: problem.hint };
  }
  // Step 2: x. Accepts "x = 30", "30 = x" or "30".
  function checkSolve(problem, input) {
    const want = root(relForm(problem.rel));
    const m = String(input).replace(/\s+/g, '').match(/^(?:x=)?(-?\d+(?:\.\d+)?)(?:=x)?$/i);
    if (!m) return { status: 'ask', message: 'Write it as x = a number.' };
    if (Math.abs(Number(m[1]) - want) > 1e-9) return { status: 'bad', message: `Check by putting x = ${m[1]} back into your equation: the two sides aren't equal.` };
    return { status: 'good', x: want };
  }
  // Step 3: the measure. Accepts "AB = 11", "m∠ABC = 70°", or just the number.
  function checkFind(problem, input) {
    const x = root(relForm(problem.rel)), want = parse(problem.find.expr)(x);
    const nums = String(input).replace(/−/g, '-').match(/-?\d+(\.\d+)?/g);
    if (!nums) return { status: 'ask', message: `Put x = ${fmt(x)} into ${problem.find.expr}.` };
    const v = Number(nums[nums.length - 1]);
    if (Math.abs(v - want) > 1e-9) return { status: 'bad', message: `Put x = ${fmt(x)} into ${problem.find.expr} and find the value again.` };
    if (problem.find.angle && !/m\s*(∠|<|angle)/i.test(input) && /∠|<|angle/i.test(input)) {
      return { status: 'almost', message: `Almost. The measure is written with m: m∠${problem.find.name} = ${fmt(want)}°.` };
    }
    if (problem.find.arc && !/m\s*(⌒|arc)/i.test(input) && /⌒|arc/i.test(input)) {
      return { status: 'almost', message: `Almost. An arc's measure is written with m: m⌒${problem.find.name} = ${fmt(want)}°.` };
    }
    return { status: 'good', value: want };
  }
  const fmt = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2));

  return { parse, linear, equation, relForm, sameForm, root, checkSetup, checkSolve, checkFind, fmt };
})();
