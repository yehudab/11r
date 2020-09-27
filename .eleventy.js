const yaml = require("js-yaml");
const siteSettings = require('./src/globals/site.json');

module.exports = (config) => {
  config.addPlugin(require('@11ty/eleventy-plugin-syntaxhighlight'));

  config.addFilter('dateDisplay', require('./filters/date-display.js'));
  config.addFilter('yeatMonthFile', require('./filters/yeat-month-file.js'));
  config.addFilter('commentsTree', require('./filters/comments-tree.js'));

  config.addPassthroughCopy({ public: './' });

  // Yaml
  config.addDataExtension("yaml", (contents) =>
    yaml.safeLoad(contents)
  );

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: false,
  });

  config.setDataDeepMerge(true);

  config.addCollection('postsWithoutDrafts', (collection) =>
    [...collection.getFilteredByGlob('src/posts/*.md')].filter(
      (post) => !post.data.draft
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
