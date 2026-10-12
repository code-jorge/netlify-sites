## Irrelephant

A one-page joke site. Visitors land on a stark black-and-white page that says "Here is what I think of your idea". Pressing the button draws back the curtains to reveal **Irrelephant**: a smug cartoon elephant that swings its trunk and yeets a light bulb (your idea) off the stage, over and over.

### Tech

- Plain HTML and CSS. No framework, no build step.
- The elephant is a hand-drawn inline SVG. Ears, tail and squash are CSS keyframes; the trunk swing and the thrown bulb are driven by a small physics simulation (tangential release velocity, gravity, air drag, floor bounce) in vanilla JavaScript.
- Everything is pure black-and-white line art, like a cartoon: outlines only, no greys.

### Run locally

Serve the folder with any static server, for example:

```bash
npx serve .
# or, with Netlify features emulated
netlify dev
```

Then open the printed URL.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/code-jorge/netlify-sites&base=irrelephant)
