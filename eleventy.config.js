// Eleventy config — builds src/ into _site/ (the folder Cloudflare Pages serves).
export default function (eleventyConfig) {
  // Static files are copied as they are
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.ignores.add("src/index.original.html");

  // "(910) 742-0438" → "+19107420438" for tel: links (US numbers without a country code get +1)
  eleventyConfig.addFilter("tel", (value = "") => {
    const raw = String(value).trim();
    const digits = raw.replace(/\D/g, "");
    if (raw.startsWith("+")) return `+${digits}`;
    return digits.length === 10 ? `+1${digits}` : digits;
  });

  eleventyConfig.addFilter("endsWith", (value = "", suffix = "") => String(value).endsWith(suffix));

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
