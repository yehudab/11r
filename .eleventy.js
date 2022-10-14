const yaml = require("js-yaml");
const siteSettings = require('./src/globals/site.json');
const pluginSyntaxhighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const charts = require('eleventy-charts');

module.exports = (config) => {
  config.addPlugin(charts);
  config.addPlugin(pluginSyntaxhighlight, {
    ignoreInvalidLanguages: "md"
  });
  config.addPlugin(pluginRss);
  config.setLiquidOptions({
    strictFilters: false,
    dynamicPartials: false
  })

  config.addFilter('dateDisplay', require('./filters/date-display.js'));
  config.addFilter('htmlDateString', require('./filters/html-date-string.js'));
  config.addFilter('dateAndTime', require('./filters/date-and-time.js'));
  config.addFilter('yearMonthFile', require('./filters/year-month-file.js'));
  config.addFilter('commentsTree', require('./filters/comments-tree.js'));
  config.addFilter('getTags', require('./filters/get-tags.js'));
  config.addFilter('isCommentable', require('./filters/is-commentable.js'));

  config.addPassthroughCopy({
    "public": './',
    "node_modules/cash-dom/dist/cash.min.js": "./assets/lib/cash.js",
    "CNAME": "./CNAME"
  });

  // Yaml
  config.addDataExtension("yaml", (contents) =>
    yaml.load(contents)
  );
  // Yml
  config.addDataExtension("yml", (contents) =>
    yaml.load(contents)
  );

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: false,
  });

  config.setDataDeepMerge(true);

  config.addCollection('postsWithoutDrafts', (collection) =>
    [...collection.getFilteredByGlob('src/posts/**/*.md')].filter(
      (post) => !post.data.draft && post.data.status === 'publish'
    )
  );

  return {
    pathPrefix: siteSettings.baseUrl,
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'includes/layouts',
      data: 'globals',
    },
  };
};
