# Flexi Hire — website

A nine-page site for Flexi Hire (Pty) Ltd, Centurion. Plain HTML, CSS and
JavaScript — no build step, no framework, no dependencies. Upload the `site/`
folder to any host and it works.

## Pages

| File | Page | Contents |
|---|---|---|
| `index.html` | Home | Hero, 5 "why choose us" pillars, 5 range cards, all 7 package teasers |
| `tents.html` | Tents | 8-row rate table (6×4m to 12×15m + umbrellas), 6-item tent collection |
| `lounge.html` | Lounge | Couch/ottoman/coffee-table rates, 6-item collection, package teasers |
| `cocktail.html` | Cocktail | 6-item collection (tables, cooler table, VIP + waterfall chairs), rates |
| `packages.html` | Packages | **All 7 tent & lounge packages** with every item listed, the 6 T&Cs, tent rate table |
| `tv-screens.html` | TV Screens | 43", 50", 65" screens + mobile stand, each with full feature list |
| `home-furniture.html` | Home Furniture | 3 monthly packages with contents, deposits and minimums; accessories + appliances |
| `gallery.html` | Gallery | 32 photos, filterable by category, with a keyboard-operable lightbox |
| `contact.html` | Contact | 3 branches with click-to-call, payment options, appointment note |

## Structure

```
site/
  *.html                  The nine pages
  assets/
    css/styles.css        Design system + all layout (one file, every page)
    js/main.js            Preloader, mobile menu, reveals, parallax, starfield, gallery, lightbox
    img/                  54 photos from the old site + the logo
.claude/
  static-server.js        Local preview server (dev only — do not upload)
  launch.json             Preview config for Claude Code
```

## Previewing locally

```bash
node .claude/static-server.js
```

Then open <http://localhost:4321>.

## Editing

Header and footer markup is duplicated across the nine pages (standard for a
static site, and the same approach your old site used). If you change a nav item
or a phone number, find-and-replace across `site/*.html` so they stay in sync.

The current page is marked with `aria-current="page"` on its own nav link — keep
that on exactly one link per page.

## Brand

Colours were sampled directly from the pixels of your existing logo file, so
they match your artwork exactly:

| Token | Value | Use |
|---|---|---|
| `--orange` | `#FF7F00` | Primary CTA, accents, prices, active states |
| `--blue` | `#0072E4` | Atmospheric glow, icon surfaces |
| `--blue-lit` | `#4DA3FF` | Blue used for *text* on dark (7.4:1 contrast) |
| `--ink-850` | `#060B18` | Page background |

`#0072E4` only reaches 4.2:1 on the dark background, under the 4.5:1 minimum, so
`--blue-lit` is used wherever blue carries text.

Type: **Signika** for headings (your existing brand font) and **Inter** for body
and UI, with tabular figures so price columns line up.

### Logo

`assets/img/flexihire-logo.png` is your original logo with the white background
removed so it sits on the dark theme. `flexihiresa.png` is the untouched
original, kept for reference.

The source is only 294×33px. It is sharp at the size used here, but a vector
(SVG) or higher-resolution export would be better for print and larger displays.

## Verified

Checked programmatically on **all nine pages**, at both 1366px and 375px:

- No horizontal overflow at either width.
- No text below its WCAG AA contrast threshold (4.5:1 body, 3:1 large).
- No pointer target under 24×24px; buttons and phone links are 44px+.
- Exactly one `h1` per page, no heading-level skips, every image has alt text.
- Every internal link and image path resolves — 0 broken references.
- Visible orange focus ring on every interactive element; the lightbox traps
  focus and restores it on close.
- `prefers-reduced-motion` disables the starfield, parallax, reveals and cue.
- Every image has explicit `width`/`height` so nothing shifts as photos load.
- Icons are inline SVG — no emoji, no icon font.

## Things worth your attention

- **Pricing validity has expired.** Your old site said package prices were valid
  for events up to 30 April 2026, and the tent rates to various 2025 dates. All
  have passed. I carried the *prices* across but dropped the stale dates rather
  than publish them; pages now say "confirm current rates when you enquire".
  Send me updated figures and I will drop them in.
- **The 43-inch TV was commented out on your old page** (hidden, at R600/day). I
  have included it because a 43-inch Smart TV also appears in your home-furniture
  appliance list. If you no longer hire it, say so and I will remove it.
- **TV photos do not match the advertised sizes.** The files are named
  `hisense_32inchtv`, `samsung_40inchtv` and `hisense_55inchtv`, but the products
  are 43, 50 and 65-inch. They are generic product shots, so it reads fine — but
  actual photos of the real units would be better.
- **Watermarks.** Most photos carry a `www.flexihire.co.za` watermark burnt into
  the image. Un-watermarked originals would look considerably better.
- **Photo resolution.** Most images are around 600×400px. Only
  `lounge-webp-vegascouch.webp` (3264×2448) and `blackcocktailtables.webp`
  (1024×684) are high-resolution. The home hero uses the night tent shot blurred
  as atmosphere precisely because it is only 500×333.
- **Tent collection photos are not size-labelled.** Your old site paired size
  names with photos, but the filenames do not reliably match the price-list
  sizes, so I kept the rate table authoritative and gave the photos honest
  descriptive captions instead of asserting specific dimensions.
- **Home-furniture PNGs are 500–950KB each.** Several are used; converting them
  to WebP would cut the page weight noticeably.
- **No quote form.** Every CTA opens WhatsApp with a pre-filled message
  (date / venue / guests). If you want a real form that emails you, that needs a
  form backend — tell me which one and I will wire it up.
