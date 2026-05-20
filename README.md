# Rapid Loans

Marketing website for Rapid Loans — a tech-first banking correspondent providing inclusive microloans and financial services across rural India.

**Live site:** https://kunaldsoni.github.io/rapidloans/

## Running locally

The site is a single static HTML file with no build step.

```bash
# Option 1 — open directly
open index.html

# Option 2 — serve (recommended, avoids file:// quirks)
python3 -m http.server 8765
# then visit http://localhost:8765/
```

## Testing

Automated tests use [Playwright](https://playwright.dev) + [axe-core](https://github.com/dequelabs/axe-core) and run against the static site on both desktop and mobile viewports.

```bash
npm install                 # one-time
npx playwright install chromium   # one-time, downloads the browser
npm test                    # runs the suite (auto-starts the static server)
```

Coverage:

- **Accessibility** — full axe scan against WCAG 2.0/2.1 A & AA.
- **Color contrast** — dedicated WCAG AA contrast check.
- **Images** — every content image has `alt` text.
- **Structure** — exactly one `<h1>`, `html[lang]` set, non-empty `<title>`, `viewport` meta present.
- **Controls** — all links/buttons have an accessible name.
- **Responsive** — no horizontal overflow.
- **i18n** — language switching actually translates content.

## Project structure

```
.
├── index.html            # Entire site (markup, styles, scripts, i18n dictionaries)
├── Images/               # Logo, hero illustrations, partner cards, screenshots
├── tests/                # Playwright + axe accessibility/quality tests
├── playwright.config.js  # Test runner config (desktop + mobile projects)
├── package.json
└── README.md
```

Everything lives in `index.html`. Styles, copy, translations, the animated gradient canvas, the loan calculator, and the nav/menu logic are all inline.

## Features

- **12 languages** — English plus Hindi, Gujarati, Marathi, Tamil, Kannada, Telugu, Bengali, Punjabi, Malayalam, Odia, Assamese. Strings live in per-language dictionaries in `index.html` under the `setLanguage()` data.
- **7 visual themes** — white, pre-dawn, sunrise, daytime, dusk, sunset, night. Driven by the `data-site-theme` attribute and a set of CSS custom properties (`--t-*`).
- **Loan calculator** — EMI / amount / tenure interactive calculator with live-translated labels.
- **Responsive navigation** — full nav on desktop, auto-collapses to a hamburger overlay on mobile or when the nav would overflow (`checkNavOverflow()`).
- **Stripe-style animated gradient canvas** on the hero and across themed sections.

## Editing content

- **Copy and translations** — search for the `i18n` object in `index.html`. Each language key holds the full string table. Use `data-i18n="key"` on an element to hook it up.
- **Colors / themes** — edit the `--t-*` CSS variables in the `[data-site-theme="..."]` blocks near the top of the `<style>` section.
- **Images** — drop into `Images/` and reference from HTML.

## Deployment

Deployed via GitHub Pages at https://kunaldsoni.github.io/rapidloans/.

Any static host will work (GitHub Pages, Netlify, S3, Cloudflare Pages). Upload `index.html` and the `Images/` folder — no server or build pipeline required.
