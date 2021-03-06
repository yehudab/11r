const yaml = require("js-yaml");
const siteSettings = require('./src/globals/site.json');
const pluginSyntaxhighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = (config) => {
  config.addPlugin(pluginSyntaxhighlight);
  config.addPlugin(pluginRss);

  config.addFilter('dateDisplay', require('./filters/date-display.js'));
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
    yaml.safeLoad(contents)
  );
  // Yml
  config.addDataExtension("yml", (contents) =>
    yaml.safeLoad(contents)
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
