# The Intentional Edit — project memory

Context for Claude sessions working on this site. First written on 2026-11-25 from the git history, READMEs and the Cloudflare API. Keep it up to date when something important changes.

## Working on this repo
- **Pushing to `main` deploys the site.** Cloudflare Pages rebuilds in about a minute, so run `npm run build` before you push.
- Content edits (copy, photos, options) belong in `src/_data/*.json`, which Pages CMS also edits. Layout goes in `src/index.njk`, styles in `src/css/styles.css`, behaviour in `src/js/main.js`.
- The owner also commits through Pages CMS, so run `git pull` before you start.
- Commit messages describe the visible change in plain words, e.g. "Slider (phones): 10% taller".
- Check mobile (iOS Safari) as well as desktop. Most past work has been fine-tuning for phones.

## What it is
A one-page website for **The Intentional Edit**, a travel-planning business run by **Tyler** (the "Meet Tyler" section). Built from the Figma file "The Intentional Edit" → **Web MVP**. Right now it's a client preview, not a launched site.

## Repositories (GitHub: `hipaulinaaway-hub`)
| Repo | Status | Stack | Hosting |
|---|---|---|---|
| `the-intentional-edit-mvp` | **Active.** 72 commits, 21–22 Nov 2026, last one `daaae6c` | Eleventy 3 + `@11ty/eleventy-img`, Node 22 | Cloudflare **Pages** → `https://the-intentional-edit-mvp.pages.dev` |
| `the-intentional-edit` | **Earlier v1, superseded.** 7 commits, 10–18 Nov 2026 | Plain `build.js` (no dependencies) fills `src/index.html` from `content/home.json` | Cloudflare **Workers** static assets (`wrangler.jsonc`, name `the-intentional-edit`, serves `public/`) |

## How the active site works
```
Pages CMS edit (= commit to main) ──► Cloudflare Pages: npm run build ──► _site/ goes live (~1 min)
```
- Cloudflare Pages settings: build command `npm run build`, output folder `_site`, env var `NODE_VERSION=22`.
- Content: one JSON file per section in `src/_data/`: site, hero, services, about, cta, faq, instagram, inquiry, destinations (slider), testimonials (reviews). The template is `src/index.njk`. Styles and scripts are in `src/css/styles.css` and `src/js/main.js`.
- CMS: Pages CMS (app.pagescms.org), configured in `.pages.yml`. Media libraries: `src/assets/img`, `src/assets/ig`, `src/assets/video`.
- Images: upload the original JPGs. The build makes AVIF, WebP and JPEG in several sizes and uses `<picture>`/srcset. Settings are in `eleventy.config.js` (`IMAGE_OPTIONS`).
- `.npmrc` plus the lockfile fix: the Mac-only `fsevents` package was removed so `npm ci` works on Cloudflare's Linux builders (commit `07a92c3`).

## Features built (from the commit history)
- Hero with an image or video background (the image is the video poster and the reduced-motion fallback). Centred, stepped headline on phones.
- Service cards that open the inquiry pop-up with the matching option already ticked. On phones they scroll horizontally and snap to the centre.
- **Destinations slider:** Portugal first, plus Switzerland, Croatia and Greece. Calm crossfade, round arrows, a countdown ring on the "next" arrow. On scroll it opens from inset to full width. Fixed heights stop jumps when the iOS Safari toolbar shows or hides. Below 1024px it uses the arrows layout. Photos open the inquiry form.
- Meet Tyler section (3:4 photo, sand background), CTA banner "Ready to unplug?", FAQ (the first question starts open), Instagram strip.
- Inquiry pop-up in 2 steps, sent through **Formspree** (the form ID goes in the CMS under Site settings).
- **Reviews ("Kind words")** after the FAQ: editable in the CMS, autoplay with a countdown ring, seconds per review set in the CMS. **They're currently on for the client preview with SAMPLE reviews, clearly labelled.**
- Link previews: share image (hero sunset + logo + headline), Open Graph and X tags. Site URL and share image are editable in the CMS.
- A switch to hide the site from search engines, currently ON. Favicon and Apple touch icon, custom text-selection colours, scroll reveals, lots of mobile polish.

## Cloudflare (checked through the API on 2026-11-25)
- Account: "Default account". Workers subdomain: `hi-paulinaaway`.
- **Pages project `the-intentional-edit-mvp`:** connected to the GitHub repo `the-intentional-edit-mvp`, production branch `main`, build `npm run build` → `_site`, env var `NODE_VERSION`. No custom domain yet (only `*.pages.dev`). Latest deploy: 2026-11-22 17:41 UTC, **success**, "Reviews (desktop/tablet): taller".
- **Worker `the-intentional-edit`:** the old v1 site, last changed 2026-11-18. It's still deployed, presumably at `the-intentional-edit.hi-paulinaaway.workers.dev`.
- Claude access: use the cloud environment **the-intentional-edit**. It allows `api.cloudflare.com`, and the Cloudflare API token "Claude – The Intentional Edit" is saved there as a network secret. The proxy adds it to requests automatically, so never put it in code or chat.

## Before launch / open items
- [ ] Turn off **Hide site from search engines** (Pages CMS → Site settings).
- [x] Formspree connected (form `mkjryqjq`, set in `src/_data/site.json` → `formspree_id`). Test it with a real submission before launch.
- [ ] Replace the sample reviews with real ones, or switch the section off.
- [ ] Tyler signs off the copy (FAQ, hero, About).
- [ ] Terms & Conditions and Privacy pages (not built yet).
- [ ] Custom domain on Cloudflare. Then update `url` in `src/_data/site.json`, which is still `the-intentional-edit-mvp.pages.dev`.
- [ ] Optional: retire or archive the old `the-intentional-edit` repo and its Worker.

## Run locally
```bash
npm install
npm start      # http://localhost:8080
npm run build  # → _site/
```
