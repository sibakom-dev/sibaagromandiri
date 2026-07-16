const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // Passthrough copy for assets and admin folder
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  // Allow LAN access to the dev server
  eleventyConfig.setServerOptions({
    host: "0.0.0.0",
    port: 8080
  });

  return {
    dir: {
      input: "src",
      output: "../docs",
      includes: "_includes"
    }
  };
};
