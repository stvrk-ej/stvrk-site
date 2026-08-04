# stvrk.ca

Next.js (App Router) site for stvrk. The landing page is two full-height panels: the
black one with the spinning logo, and the white "who are you?" panel a scroll below it.
`/beats` and `/soundkits` exist as stubs.

## Running it

Node isn't installed on this machine yet. Install Node 20+ (`brew install node`, or
from nodejs.org), then:

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. To reach it from a phone on the same Wi‑Fi:

```bash
npm run dev -- -H 0.0.0.0
```

## Layout

Everything is measured off `Mobile reference 1.jpg` and `Mobile reference 2.jpg`
(1179 x 2556), converted into container-query units of the panel each element sits in —
`cqw` is the design column, `cqh` is that panel's height — so the composition scales as
one piece. Each position carries its reference pixel value in a comment.

- `app/globals.css` — `--content-w` (the design column), `--baseline` (Apple Garamond's
  baseline offset, used to place type by its baseline), and the scroll-snap setup.
- `app/page.module.css` — the full-height panel.
- `components/Hero.module.css` — video, wordmark, `beats • sound-kits`.
- `components/ChoosePath.module.css` — the question artwork, the two choices, the bars.

## Parallax

The hero is three layers moving at different rates as you scroll:

| Layer | Rate | What it is |
| --- | --- | --- |
| logo | 0.42 | the spinning halftone |
| mark | 0.58 | the wordmark and `beats • sound-kits` |
| border | 1.0 | the top edge of the white panel — plain document scroll |

Where the border sweeps across the other two, `mix-blend-mode: difference` flips them
white-to-black per pixel so they stay readable on either side. Over black, difference
returns the source unchanged, so the hero at rest looks exactly as before.

Three constraints are load-bearing, all found by testing:

- **The layers can't be `sticky` or `fixed`.** Both create a stacking context, which
  isolates the blend — the layers stop being able to see the white panel as their
  backdrop and never invert. Pinning is done with a transform instead: an element at
  document top translated by `s * (1 - rate)` tracks the viewport at `rate`.
- **Nothing between `<main>` and a layer may create a stacking context.** That's why the
  hero uses plain lengths rather than container units (a size container applies
  `contain: layout`), and why `.page` uses `overflow-x: clip` rather than `hidden`.
- **The rate gap is capped by a collision, not by taste.** The mark layer starts ~0.21vh
  below the bottom of the logo's dot field and closes that gap at `(MARK - LOGO)` per
  viewport, so much past 0.20 drives the nav into the halftone and it stops being
  readable. 0.16 keeps a gap the whole way down; measured minimum is 0.05vh.

After the sweep the layers dissolve (1.05→1.4 viewports) rather than loitering over the
text, and `.lead` in the white panel holds 45svh of clear space so nothing lands on
"who are you?". Scroll snapping was removed — it yanked you past the middle of the
effect, which is the part worth seeing.

## Scroll reveal

`ChoosePath.tsx` observes each element individually rather than the panel as a whole.
One shared trigger on the panel fired as its top edge appeared, and the fade had long
finished before `artist` (35% down) or the social row (66% down) were near the screen —
on a slow scroll everything was simply already there. Per-element triggers put the fade
where the eye is, and the stagger falls out of document order for free: measured at
393x760, artist and its bar fire together, producer's pair 100px of scroll later, the
socials 145px after that.

`rootMargin: 0px 0px -22% 0px` pulls the trigger line up from the bottom edge so nothing
starts while it's still clipping the very bottom of the screen. Fade is 950ms.

## Desktop

Two things are branched at `min-width: 900px`; everything else is shared.

- **Grain opacity** goes 0.085 → 0.13 (`FilmGrain.module.css`). The phone value all but
  disappears on a bigger screen viewed from further away.
- **The bottom halftone swaps to its own 16:9 artwork** (`halftone-fade-desktop.png`).
  The phone file is 1179x2556 stretched to fill the box; on a phone that box is nearly
  the same shape so the dots come out ~12% wide, but on 1440x900 the stretch is 3.5:1
  and they smear into ellipses. The desktop box is sized to *match* the file's aspect
  (`height: 100vw / 1.7827`) so `object-fit: fill` does no stretching at all, and `top`
  solves for the ink landing at the same 70.19svh as mobile. Verified across 1024x640 →
  3440x1440: ink on target with zero error, dot aspect 1.000, black overhang 145–698px
  against a 64px drift.

Whichever image the breakpoint hides is `display: none`, and next/image is lazy by
default, so neither device downloads the file it isn't using.

The mobile path is untouched by both — confirmed at 393x760: media query doesn't match,
grain still 0.085, `.fadeInner` still `19.56svh / 100svh`, ink still 70.19%.

### Still unverified

**The composition itself.** The embedded preview browser used to build this
fails to paint at non-native viewport sizes: at 1440x900 a plain `position: fixed` div
with `background: #ff0000` and `z-index: 99999` reports a correct rect and computed
colour but renders nothing. That rules out a CSS explanation, so desktop has to be
checked in a real browser before any conclusions are drawn about it.

Everything is driven by `--content-w` plus a set of ratio constants, so a desktop pass is
mechanically cheap — a `@media (min-width: 900px)` block overriding `--content-w` and the
handful of positions in `ChoosePath.module.css` would do it. The parallax maths is
viewport-agnostic and needs no changes. The real work is deciding the desktop
*composition*: the white panel's positions are percentages tuned to a phone-shaped
reference, so on a wide screen they produce a narrow centred column rather than a layout
that uses the width.

## Type

**EB Garamond**, via `next/font/google`.

The mockups were set in Apple Garamond, which is Apple/Bitstream's proprietary 1991
face with no webfont licence, so it isn't shippable. EB Garamond runs a little wider
with a smaller x-height, so the sizes are tuned to match the reference by *word width*
rather than by nominal size: `14.4cqw` for artist/producer, `4.26cqw` for the nav. If
the wording on those ever changes, re-check the widths against the reference.

## Assets

| In `public/` | Source | Notes |
| --- | --- | --- |
| `spinning-logo.mp4` | `spinning logo video.mov` | Unmodified. See "Video" below. |
| `wordmark.png` | `wordmark.png` | Cropped to the ink, 1200px wide. |
| `who-are-you.png` | `who are you wordmark.png` | Cropped to the ink, 1400px wide. |
| `dotted-bar.png` | `Dotted bar graphic.png` | Next to `artist`. |
| `dotted-bar-2.png` | `Dotted bar graphic2.png` | Next to `producer`. |
| `halftone-fade.png` | `halftone bottom pattern3.png` | Closes the white panel out in black — mobile. |
| `halftone-fade-desktop.png` | `halftone bottom pattern4.png` | Same, desktop. 16:9; top 3 rows cropped to remove a stray band of ink at the very edge. |
| `logo-frame.png` | frame 0 of the clip | Still fallback, see below. |

Both bar files share one canvas geometry (1200 x 225, ink 79px tall, flush to the left
edge), so they render at the same element width and come out the same height — the
second one simply has shorter ink. No mirroring or per-bar sizing involved.

## Video

`spinning-logo.mp4` is **14.8 MB** with its `moov` atom at the end, so Safari downloads
the whole file before it can start. Both are worth fixing before launch:

```bash
ffmpeg -i public/spinning-logo.mp4 -c:v libx264 -crf 30 -preset slow -an -movflags +faststart public/spinning-logo.mp4
```

The filter chain on the `<video>` is `blur() contrast(1.12) url(#stvrk-luma-key)`.

The luma key is the important one. The clip's background is rgb(3,2,4), not `#000`.
Crushing it with `contrast()` only gets it to *approximately* black, and the residue
shows up as a sharp rectangle edge on a bright screen. The filter in `Hero.tsx` throws
luminance into the alpha channel instead, so the background is genuinely *transparent*
and matches whatever is behind it by construction rather than by rounding.

It takes two stages. The `feColorMatrix` alone left the background at ~2/255 alpha —
rgb(3,2,4) has a small but non-zero luminance — which was still faintly visible at full
brightness. The `feComponentTransfer` ahead of it subtracts a black point (anything
under ~9/255 clamps to zero) so the key has a clean floor. Measured result: background
alpha 0 across the frame, brightest dot still 254.

`drop-shadow` is deliberately not used: the video is a fully opaque rectangle, so it
would halo the rectangle rather than the logo.

## Low Power Mode

`components/SpinningLogo.tsx` handles it. iOS Low Power Mode won't autoplay a `<video>`
regardless of encoding, and Safari then draws its own play button over the element, so
the first frame of the clip (`logo-frame.png`) sits *on top* as an overlay and is only
faded out once playback is confirmed. The play button is never visible; Low Power Mode
gets a still logo.

Two failed approaches worth not repeating, both verified in a browser:

- **Hiding the video** (`opacity: 0`, revealing it on success) breaks it for everyone.
  A video at zero opacity has `play()` *resolve* and then never advance a frame, so
  success becomes undetectable and the clip is dead on every device.
- **Trusting `play()`** to mean playback started. It resolves in the case above. The
  component waits for `currentTime` to actually move instead.

Covering the video with an opaque sibling does not affect playback — that was A/B
tested against a bare video, and the covered one played fine.

## Film grain

`components/FilmGrain.tsx` — a fullscreen WebGL quad with hash noise, fixed above all
content at 5% opacity. It renders at half resolution and updates at 24fps rather than
60: grain wants to be slightly soft, 60fps noise reads as electronic fizz rather than
film, and this has to share a phone GPU with a filtered video and two blend layers.

Falls back to a static CSS `feTurbulence` tile when WebGL is unavailable, and freezes on
a single frame under `prefers-reduced-motion` — the texture stays, the motion doesn't.

Two dials: `opacity` in the stylesheet (0.085) and `SCALE` in the component (0.5, so one
noise texel covers ~2 CSS px — lower it for chunkier grain, raise it for finer). Note the
grain lifts pure black by a few values, but uniformly across the page, so no edges.

## The bottom halftone

`BottomFade.tsx` plus `.fade` / `.fadeInner`. Two things about it are load-bearing:

- **The drift only ever moves down.** The artwork is what makes the page end in black,
  so moving it *up* past its resting place opens a white sliver at the very bottom. It
  starts low and settles up to rest instead, and the artwork hangs ~0.2 of a viewport
  below the page inside a clipping box, so travelling down just buries more black.
- **The artwork is offset, not resized.** `pattern3`'s dots start at 50.63% of the file
  (the previous one started at 70.19%) with the last 23% solid black. `.fadeInner` is
  hung 19.56svh lower so the first dots land back at 70.19svh — where the reference has
  them, clear of the social row — rather than squashing the file to fit, which would
  have flattened the dots to ellipses.

Measured: ink top 70.19% of the panel at rest, black overhang 149px at rest growing to
182px mid-drift. The overhang never shrinks, so no scroll position can expose white.

## Known gaps

- **The BeatStars icon is a placeholder.** `components/BeatstarsIcon.tsx` is a stand-in.
  `react-icons/si` ships a real BeatStars mark — see the comment in `SocialLinks.tsx`.
- **`/beats` and `/soundkits` are orphaned.** Every link on the page now points out to
  BeatStars or Payhip, so nothing reaches these two routes. They're harmless, but delete
  them if they aren't coming back.
- **Desktop is unreviewed.** The column caps and the panels still work, but the
  composition hasn't been checked against a desktop design.
