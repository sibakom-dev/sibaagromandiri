module.exports = function(eleventyConfig) {
  // Passthrough copy for assets and admin folder
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes"
    }
  };
};
