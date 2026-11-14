# Delivery gate, 14 November 2026

antislop mode: during. Design read and reasons: see `DESIGN.md`.

## Block 1: Hard gate

| Rule | Result | Evidence |
| --- | --- | --- |
| R-02 em dash | PASS | Searched `src/` and `index.html`, and the robot data at runtime: none found. |
| R-03 mobile | PASS | At 375 x 812 the page width equals the viewport (375). Saturn's rings and the 3D canvas are clipped at the screen edge. Buttons are at least 42 px tall. |
| R-17, R-18, R-36, R-38 invented content | PASS | No testimonials or marketing numbers. Mission figures come from the NASA pages linked on each robot. Distances come from NASA/JPL Horizons values queried on 14 Nov 2026. |
| R-23 assets | PASS with note | No logo. The site title is a working title and is labeled as such in `DESIGN.md`. Robot photos are NASA's. Uranus and Saturn's rings are drawn and labeled as drawn. |
| R-24 navigation | PASS | The only navigation is the nine world stops. Each one scrolls to a slide that exists. |
| R-25 contrast | PASS by calculation | Body text `#ecebe6` and muted text `#a6aab6` on `#07080b` and `#101218` are above 7:1. Button text `#17120a` on gold is about 9:1. Not measured with an audit tool. |
| R-26 controls | PASS | See the click-through below. |
| R-27 states | PASS with note | Photo: loading and error states exist. Robot list: empty state exists. 3D: loading note and a fallback notice exist. The photo error state and the 3D fallback were not triggered in testing. |
| R-28 FAQ | PASS | No FAQ. |
| R-32 keyboard | PASS with note | All controls are native buttons and links with a visible gold focus ring. Dialogs are native and close with Escape (tested). Arrow keys move the slider (tested). A full Tab walk was not done by hand. |
| R-33 patch scripts | PASS | None. |
| R-34 themes | PASS | One theme. |
| R-35 verified | PASS | Built with `npm run build`, ran in the browser, no console errors. Click-through below. |
| R-37 direction | PASS | Direction came from the conversation and is written in `DESIGN.md`. |
| R-39 semantics | PASS | `lang`, `title`, header, nav, main, footer, one `h1`. Photos have alt text. Status never relies on color alone. Motion has a pause control and starts paused under reduced motion. |
| R-40 performance | PASS, not measured | Images have width and height or a fixed aspect ratio. The first planet map is preloaded. No third-party scripts. three.js loads only when 3D is chosen. No Lighthouse or Web Vitals numbers were measured. |

### Click-through

Desktop (1024 wide):
- Next button: Mercury to Venus. Right arrow key: Venus to the Moon. Left arrow key: back to Venus.
- Rail stop "Mars": slider centers Mars.
- "See the 9 robots that visited Mars": list of 9 appears below, focus moves to its heading, legend visible.
- Row "Curiosity": detail panel opens on the right with photo, status, facts, journey, science, people, sources.
- Escape: panel closes, focus returns to the Curiosity row.
- "Pause motion": globe stops, label becomes "Play motion". Again: globe turns.
- "3D": Mars, Saturn (with rings) and Deep Space render in WebGL. "2D": back to the flat globes. Choice is stored.

Phone (375 x 812):
- Scroll down: snaps to the next world. Rail stop 6: jumps to Saturn.
- "See the 4 robots that visited Saturn": sheet opens from the bottom.
- Row "Voyager 2": detail sheet opens with an "At Saturn" fact and the live distance block.
- "Back to list": returns to the Saturn list. "Close": sheet closes.
- "3D": Saturn and Uranus render, and the 3D view follows the active slide.

Not tested: mouse drag on the desktop slider, touch drag to rotate a 3D planet, the 3D failure notice,
and real phones (only an emulated viewport).

## Block 2: Purpose gate

All PASS. One gradient (globe shading, reason in `DESIGN.md`). No icon library: three status glyphs and
two chevrons, each tied to its meaning. No background pattern. No arrows on buttons. Status tags are
functional labels. No glass, glow or shadows. Robots are rows, not cards. Motion matches MOTION 2.

## Block 3: Liveliness

All yes. Dials ENERGY 2 / RHYTHM 2 / MOTION 2. Focal point: the centered planet. Accent: foil gold.
Motif: the line the worlds sit on, repeated in the rail and the journey timeline.

## Block 4: Craft and quality locks

All PASS. The layout is a slider, a list and a detail panel, driven by the content. Radius is 4 to 6 px
on controls and round only on planets. Button text names its action ("See the 9 robots that visited
Mars"). Palette: one accent plus two status colors. Dark theme has a subject reason.
