// Eleventy config — builds src/ into _site/ (the folder Cloudflare Pages serves).
import path from "node:path";
import Image from "@11ty/eleventy-img";

// ---------------------------------------------------------------------------
// Responsive images
// Photos in src/assets/img and src/assets/ig (including ones uploaded through
// Pages CMS) are high-quality masters. At build time each one becomes AVIF,
// WebP and JPEG in several widths, and the page gets a <picture> with srcset,
// so every browser downloads the smallest file that still looks sharp.
// ---------------------------------------------------------------------------
const IMAGE_OPTIONS = {
  formats: ["avif", "webp", "jpeg"],
  outputDir: "_site/img/",
  urlPath: "/img/",
  sharpAvifOptions: { quality: 58 },
  sharpWebpOptions: { quality: 78 },
  sharpJpegOptions: { quality: 80, mozjpeg: true, progressive: true },
  // PNG is only the fallback for very old browsers (transparent images): palette-compress it
  sharpPngOptions: { palette: true, quality: 85, effort: 10 },
  // readable file names: hero-1600w.avif
  filenameFormat: (id, src, width, format) => `${path.parse(src).name}-${width}w.${format}`,
};

// "/assets/img/hero.jpg" (what Pages CMS stores) → "src/assets/img/hero.jpg"
const toInputPath = (src) => path.join("src", String(src).replace(/^\//, ""));
const isRaster = (src) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(String(src));

// `options` (optional) overrides IMAGE_OPTIONS for one image, e.g. a higher quality for fine artwork
async function picture(src, alt = "", sizes = "100vw", widths = [800, 1600], attrs = {}, options = {}) {
  if (!src) return "";
  const htmlAttrs = { alt, sizes, loading: "lazy", decoding: "async", ...attrs };
  // External links, SVGs and GIFs are used as they are
  if (/^https?:\/\//.test(src) || !isRaster(src)) {
    const extra = Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("");
    return `<img src="${src}" alt="${alt}"${extra}>`;
  }
  // PNGs keep their transparency (no JPEG fallback)
  const formats = /\.png$/i.test(src) ? ["avif", "webp", "png"] : IMAGE_OPTIONS.formats;
  const metadata = await Image(toInputPath(src), { ...IMAGE_OPTIONS, widths, formats, ...options });
  return Image.generateHTML(metadata, htmlAttrs);
}

// URL of one generated size, e.g. for the hero video's poster
async function imageUrl(src, width = 1600, format = "jpeg") {
  if (!src || /^https?:\/\//.test(src) || !isRaster(src)) return src || "";
  const metadata = await Image(toInputPath(src), { ...IMAGE_OPTIONS, widths: [width], formats: [format] });
  const list = metadata[format];
  return list[list.length - 1].url;
}

export default function (eleventyConfig) {
  // Static files are copied as they are. Photo masters (assets/img, assets/ig)
  // are not copied: the optimized versions in /img/ are used instead.
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/favicon": "/" }); // favicon.svg, apple-touch-icon.png at the site root
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/svg": "assets/svg" });
  eleventyConfig.addPassthroughCopy({ "src/assets/video": "assets/video" });

  eleventyConfig.addAsyncShortcode("picture", picture);
  eleventyConfig.addAsyncShortcode("imageUrl", imageUrl);

  // "(910) 742-0438" → "+19107420438" for tel: links (US numbers without a country code get +1)
  eleventyConfig.addFilter("tel", (value = "") => {
    const raw = String(value).trim();
    const digits = raw.replace(/\D/g, "");
    if (raw.startsWith("+")) return `+${digits}`;
    return digits.length === 10 ? `+1${digits}` : digits;
  });

  // Section headings: words wrapped in *asterisks* (typed in the CMS) are set in italics.
  eleventyConfig.addFilter("emphasis", (value = "") => String(value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>"));
  eleventyConfig.addFilter("endsWith", (value = "", suffix = "") => String(value).endsWith(suffix));

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
