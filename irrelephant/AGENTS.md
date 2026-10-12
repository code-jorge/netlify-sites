# AGENTS.md

## Overview
Static single-page site "Irrelephant". No package.json, no bundler, no build. `netlify.toml` publishes `.`.

## Files
- `index.html`: markup, inline SVG elephant, the curtain-open script, and the trunk/projectile physics script.
- `styles.css`: all styling plus the animation timeline.
- `netlify.toml`: publish config only.

## How it works
- `body.is-open` drives everything: intro card drops away, B&W curtains (`.curtain-left/right`) and `.valance` slide off, the `.stage` behind them is revealed, the title pops in. There is no way to close the curtain again (by request).
- `inert` is toggled on `#stage` / `#intro`; after opening, focus moves to the title (`tabindex=-1`).

## Animation conventions (important)
- Animated SVG parts are wrapped as `<g transform="translate(px py)"><g class="part">…</g></g>`, so each part's pivot is its local `0,0`. CSS uses `transform-origin: 0 0; transform-box: view-box`.
- One shared loop length: `--cycle` (3.2s). **Release happens at 42%**.
- Ears, tail, body squash, whoosh, YEET! and the held bulb are CSS keyframes. The trunk and the flying bulb are driven by JS (`requestAnimationFrame`), which reads the phase from the `.ear` CSS animation's `currentTime` so everything stays in lockstep.
- Loop beats: 0-12% trunk rests down while the held bulb pops in (`held` keyframes 1-10%); 12-31% small wind-back (kept small so the bulb never dips below the ground line); 31-42% swing; 42% release, with whoosh arcs + YEET! snapping in on that same frame (keyframes switch at 41.9% → 42%, no fade-in); follow-through, hang until 62%, lower back down by 86%, rest.
- `trunkAngle(p)` eases into the release and starts the follow-through at the same angular speed. The flyer's launch state is derived from it: position = trunk tip (pivot `(520,262)` + grip `(64,136)` rotated by the trunk angle), velocity = tip tangential velocity, rotation/spin = held bulb's world angle and the trunk's angular speed. The flight is pre-integrated once (gravity, quadratic drag, floor bounce) and sampled per frame. Change the constants at the top of the script, never hard-code a start position.
- Physics runs in nominal 3.2s-cycle seconds, so the reduced-motion `--cycle` just slows playback.
- The `.held` keyframes hide the held bulb at 42% and keep it hidden until the next cycle; keep that in sync with `RELEASE` and `REST_END` in the script.
- Whoosh arcs are drawn around the trunk pivot at radii 128/150/172, between 30° and 75°, i.e. the tip path just before release. The buttons and the intro card have no box-shadows. The title is set in Great Vibes (solid black, no stroke/shadow).
- The whole site is strictly black (`#000`) and white (`#fff`): no greys, no partial opacity on static art. Everything is cartoon line art: white fills (only to hide lines behind) with black outlines. Curtains and valance are SVG data-URI line tiles in `styles.css`.
- Leg tops blend into the body by drawing a stroke-less white fill shape plus an open stroked path for the sides.
