# The Intentional Edit — website

One-page site built with [Eleventy](https://www.11ty.dev/) from the Figma file
"The Intentional Edit" → **Web MVP**. All copy and images live in editable JSON files
managed with [Pages CMS](https://pagescms.org/). Planned hosting: Cloudflare Pages.

## How it fits together

```
GitHub repo ──(edit in Pages CMS = a commit)──► Cloudflare Pages runs `npm run build` ──► _site/ goes live
```

## Project structure

```
.pages.yml              Pages CMS config (which fields are editable, where uploads go)
eleventy.config.js      Build config (src/ → _site/)
src/
  index.njk             The page template (markup only; no copy lives here)
  _data/                ← the content Pages CMS edits, one file per section
    site.json           title, Google description, email, phone, Instagram, footer, Formspree ID
    hero.json           headline, button, background image OR video
    services.json       service cards (add/remove/reorder)
    about.json          Meet Tyler text, photos, signature
    cta.json            "Ready to unplug?" banner
    faq.json            questions & answers (add/remove/reorder; the first one starts open)
    instagram.json      Instagram tiles
    inquiry.json        all texts and options of the inquiry pop-up
  css/styles.css
  js/main.js
  assets/
    img/                photos (Pages CMS "Photos" media library)
    ig/                 Instagram tiles (Pages CMS "Instagram tiles" library)
    video/              hero videos (Pages CMS "Videos" library)
    svg/                logo, stamps, icons (design assets, not edited in the CMS)
design-source/          full-size Figma exports (incl. the 6.5 MB seal SVG); not used by the site, not in git
```

## Run it locally

```bash
npm install
```

```bash
npm start
```

Then open http://localhost:8080. It rebuilds whenever you save a file. `npm run build` writes
the final site to `_site/`.

The page now uses root paths (`/assets/...`), so opening `src/index.njk` or `_site/index.html`
by double-clicking won't load styles or images. Always use `npm start`.

If `npm install` fails with an "EACCES … ~/.npm" error, your npm cache folder belongs to root.
Fix it once with `sudo chown -R $(id -u):$(id -g) ~/.npm`, or install with
`npm install --cache /tmp/npm-cache`.

## Hero: image or video

In Pages CMS → Homepage → **Hero**:

- **Background type = Image**: the background image is shown.
- **Background type = Video**: the background video plays muted, looped and inline, behind
  the same dark gradient. The background image is still required. It's the video's poster,
  shown while the video loads and to visitors who turn on reduced motion in their system
  settings (for them the video doesn't play).

Video tips: MP4 (H.264) or WebM, landscape, 10–20 s seamless loop, ideally under 8 MB. Phones
use a center crop of the same file.

Pages CMS can't hide fields based on another field, so the video field is always visible. It's
simply ignored while the type is Image.

## Pages CMS setup (when the repo is on GitHub)

1. Push this folder to a GitHub repository. `.pages.yml` must stay at the repo root.
2. Go to https://app.pagescms.org, sign in with GitHub, and open the repository.
3. The sidebar shows **Homepage** (Hero, Services, Meet Tyler, Ready to unplug banner, FAQ,
   Instagram strip, Inquiry form) and **Site settings**.

Uploads go to `src/assets/img`, `src/assets/ig` and `src/assets/video`.

### Images are optimized automatically

Photos in `src/assets/img` and `src/assets/ig` are **masters**: upload the original,
good-quality JPG (no need to compress it first). On every build, `@11ty/eleventy-img` turns each
photo into AVIF, WebP and JPEG in several widths, and the page uses `<picture>` with
`srcset`/`sizes`, so each visitor downloads only the size their screen needs, in the best
format their browser supports. A visitor scrolling the whole page downloads about 0.5 MB of
images. PNGs keep their transparency (AVIF/WebP/PNG). Sizes and quality are set in
`eleventy.config.js` (`IMAGE_OPTIONS` and the `picture` calls in `src/index.njk`).

Hero videos are served as uploaded, so keep them small (see below).

Service cards have a "Pre-selects this inquiry option" field. It must match an option title in
Inquiry form → Options exactly (e.g. `Trip planning`), or the card opens the form with nothing
ticked.

## Cloudflare Pages setup

Create a project from the GitHub repo with:

| Setting | Value |
| --- | --- |
| Framework preset | None (or Eleventy) |
| Build command | `npm run build` |
| Build output directory | `_site` |
| Environment variable | `NODE_VERSION` = `22` |

Every save in Pages CMS commits to GitHub, and Cloudflare rebuilds and publishes in about a minute.

## Inquiry form (Formspree)

1. Create a free account at formspree.io with the contact email and create a form.
2. Paste the form ID (the code after `/f/`) into Pages CMS → **Site settings → Formspree form ID**.

Until then the pop-up works fully (validation and the Thank-you screen) but nothing is sent.

## Before launch

- **Search engines:** the site currently tells search engines not to index it (it's a client
  preview on `the-intentional-edit-mvp.pages.dev`). At launch, turn off
  Pages CMS → Site settings → **Hide site from search engines**.
- **Formspree:** add the form ID (see above) so inquiries are actually delivered.

## Open items (from the Figma dev notes)

- Hero photo: the current file is 1182×665; a 2880×1800+ original will look sharper on large screens.
- Copy sign-off from Tyler (FAQ answers, hero and About text).
- Terms & Conditions and Privacy pages don't exist yet.
