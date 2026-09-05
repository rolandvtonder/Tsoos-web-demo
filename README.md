# TSOOS Event Styling Entertainment — Website

A 7-page static website. No build step, no dependencies to install.
**To view it: double-click `index.html`.** It opens in your browser and works offline
(fonts and animations load from the internet when you have a connection).

---

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About us |
| `services.html` | Services (4 detailed sections) |
| `gallery.html` | Gallery — filterable, with a lightbox viewer |
| `hire.html` | Hire catalogue — 16 items, filter + search |
| `reviews.html` | Reviews — all 5 Facebook recommendations |
| `contact.html` | Contact, enquiry form, map, FAQ |

## Folders

```
website/
├── index.html … contact.html     the 7 pages
├── assets/
│   ├── css/style.css             all styling + the design tokens
│   ├── js/main.js                animation, filters, lightbox, form
│   └── img/                      photos + favicon
└── README.md                     this file
```

---

## Your brand, as used here

Colours were **sampled directly from your logo artwork**, not guessed.
They live at the top of `assets/css/style.css` — change them there once and the
whole site follows.

| Token | Value | Where it came from |
|---|---|---|
| `--rose` | `#E8C0B0` | the TSOOS wordmark |
| `--rose-deep` | `#D9A08E` | the chair mark in your badge |
| `--rose-pale` | `#F4E2DC` | "EVENT STYLING ENTERTAINMENT" line |
| `--gold` | `#B89068` | the gold desk lighting on your signage |
| `--ink` | `#0A0A0C` | your logo background |

**Fonts:** Cormorant Garamond (headings), Montserrat (body), Parisienne (the
"We Never Disappoint" script) — chosen to match the three lettering styles in your logo.

**The arch shape** used around images is deliberate — it echoes the arch backdrops
in your own set-ups.

---

## Details taken from your Facebook page

- Phone / WhatsApp: **063 391 4837**
- Email: **tsoojacky@gmail.com**
- Address: **23805 Intunja Street, Palmridge, Alberton, Gauteng**
- Tagline: **We Never Disappoint**
- Services: Events · Decor · Furniture Hire · Tent & Draping
- Stats: 100% recommend · 5 recommendations · 484 followers

To change any of these, search for the old value across the 7 HTML files and replace it.
The WhatsApp links use the international format `wa.me/27633914837`.

---

## What still needs you

1. **Your story** (`about.html`) — there's a marked note where your founder name,
   the year you started, and a line in your own words should go.
2. **Prices** — every item says "Enquire for rate" because you haven't given me
   figures. Send them through and I'll add a pricing page or per-item rates.
3. **Logo file** — the chair mark is a clean SVG I rebuilt from your cover image.
   If you have the original logo file, send it and I'll swap it in at full quality.
4. **More photos** — only 8 came off your Facebook page, and the hire catalogue only
   lists items I could photograph from them. Send photos of anything else you stock
   (Tiffany chairs, round tables, draping, crockery, candle holders, charger plates,
   the fur plinth) and I'll add those items back.

### Done

- **Reviews** — all five Facebook recommendations are live on `reviews.html`, with the
  three longest also featured on the home page. Quotes are word for word, including each
  reviewer's own spelling and emoji. Say the word if you'd rather they were tidied up.

---

## The enquiry form

There is no server behind it, so nothing can break or go missing. When someone
submits it, the form **composes the message and opens their own WhatsApp or email**
with everything filled in — they press send themselves. Their message arrives from
their real number, which also means you can reply straight away.

If you'd rather have enquiries land in an inbox automatically, tell me and I'll wire
it to a free form service (Formspree or Netlify Forms) — about ten minutes of work.

---

## Putting it online

The whole `website/` folder is what gets uploaded. Options, easiest first:

1. **Netlify Drop** — go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag
   the `website` folder onto the page. Live in about 30 seconds, free, gives you a URL
   you can point a domain at.
2. **Your own domain** — buy one (e.g. `tsoosevents.co.za` from a South African
   registrar) and connect it to the Netlify site.
3. **Any normal web host** — upload the contents of `website/` via FTP.

---

## Accessibility & performance notes

- All text meets WCAG AA contrast (body text is 7.3:1 or better on the dark background).
- Every interactive element is keyboard-reachable with a visible focus ring.
- All animation is disabled automatically for visitors who have "reduce motion" turned
  on in their phone or computer settings.
- The gallery lightbox traps focus, closes on Escape, and navigates with arrow keys.
- Images are lazy-loaded below the fold and have fixed dimensions so the page doesn't
  jump while loading.
- If the animation library fails to load, all content still displays normally.
