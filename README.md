# Geometric Interactive Notes

Students read a short lesson, work on a live diagram, and name what they see in correct geometry notation.

**Live site:** <https://jontaylormed.github.io/geo-notes/>

**Source:** <https://github.com/jontaylormed/geo-notes>

**Site created by Claude and Jon Taylor.**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

## What it does

| Section | What the student does |
|---|---|
| Lesson | Reads one idea at a time beside a diagram, then names or marks it |
| Explore | Moves points on a live diagram and watches what stays true |
| Algebra Connections | Writes and solves equations from angle and length relationships |
| More Practice | Gets new problems for the same level |
| Common Mistakes | Finds and fixes the mistakes students make most often at that level |

There are five levels with three bridges between them:
1. Lines, segments, rays and planes
2. Angles
3. Parallel lines, perpendicular lines and transversals
4. Lines that make triangles: congruent by ASA, AAS or HL, and congruent or similar
5. Circles: parts, arcs, tangents and inscribed angles

The bridges cover giving reasons, triangles (naming, classifying, angle sums, similar by AA, SSS or SAS) and triangles inside circles.

## Who it's for

Geometry students, usually grades 8–10.

Common Core State Standards for Mathematics:

| Standard | What it asks |
|---|---|
| HSG.CO.A.1 | Know precise definitions of angle, circle, perpendicular line, parallel line and line segment |
| HSG.CO.C.9 | Prove theorems about lines and angles, such as vertical angles and angles formed by a transversal |
| HSG.CO.C.10 | Prove theorems about triangles, such as the interior angles summing to 180° |
| HSG.C.A.2 | Describe relationships among inscribed angles, radii, chords and tangents |

Students use and name the congruence and similarity criteria. The tool doesn't derive them from rigid motions or similarity transformations, so HSG.CO.B.8 and HSG.SRT.A.3 aren't listed.

## How it teaches

- **See it first.** Every idea starts on a diagram the student can move, before it appears as notation.
- **Notation is taught, not just accepted.** Angles are named with three points, vertex in the middle. Points and planes are capitals, and a line's one-letter name is lowercase. A right answer in the wrong case gets "Almost," with the fix, so the case is taught without calling the math wrong.
- **Labels never mislead.** Arc marks mean congruent, so an angle that only carries an expression is marked by a pale wedge instead. No label may cover a name.
- **No one feels remedial.** Levels are named by topic, not grade. Any level, bridge or mode can be opened from the menu.

## How the math was checked

- **Test page:** [`tests.html`](https://jontaylormed.github.io/geo-notes/tests.html) runs 430 tests in the browser. They cover naming and notation (segments, rays, lines, three-point angle names, triangles, parallel and perpendicular), transversal angle pairs, checking typed answers, the Explore modes, and every figure's labels at phone and laptop width. All 430 pass.
- **Build checks:** `build.ps1` fails if the tool would make a network request or store data, if any of 27 color pairs is below its contrast target, or if a button or heading is not in Title Case.
- **Known limits:** the tool checks the figures and questions it builds itself. It doesn't grade written proofs.

## Accessibility

- Every control is a standard button, link or form field, so it works with the keyboard. Diagram points can also be reached by keyboard, with a visible focus ring.
- Feedback is announced to screen readers through live regions.
- All text meets WCAG 2.1 AA contrast. Figure strokes, marks and focus rings meet 3:1 against the diagram. Both are checked at every build.
- The tool has no animation.
- The layout works at phone width (375 px) and with browser zoom. There is no separate text-size setting.

## Privacy

No accounts, no tracking, no cookies and no stored data. The tool makes no network requests, and the build fails if one is added. Everything resets when the tab closes.

## Running it

Open `index.html` in any modern browser. Open `tests.html` to run the tests.

To rebuild after changing anything in `src/`, run this in Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

**Publishing:** GitHub Pages, deployed from the `main` branch at the repository root. `index.html` is committed already built, so GitHub needs no build step.

You can send students to one spot by adding to the link, for example `#level=2&start=lesson`. The `start` options are `lesson`, `explore`, `algebra`, `practice` and `mistakes`. Bridges are `b1`, `b2` and `b3`.

## License

[CC BY-NC-SA 4.0](LICENSE). Free to share and adapt for non-commercial use, with credit, under the same license.
