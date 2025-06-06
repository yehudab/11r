import yaml from "js-yaml";
import siteSettings from "./src/globals/site.js";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginRss from "@11ty/eleventy-plugin-rss";
import dateDisplay from "./filters/date-display.js";
import htmlDateString from "./filters/html-date-string.js";
import dateAndTime from "./filters/date-and-time.js";
import dateISO from "./filters/date-iso.js";
import yearMonthFile from "./filters/year-month-file.js";
import commentsTree from "./filters/comments-tree.js";
import commentsCount from "./filters/comments-count.js";
import getTags from "./filters/get-tags.js";
import isCommentable from "./filters/is-commentable.js";
import postsByYear from "./filters/posts-by-year.js";
import getYears from "./filters/get-years.js";
import postYear from "./filters/post-year.js";
import parseSongs from "./filters/parse-songs.js";
import { execSync } from 'node:child_process';

export default function (config) {
  config.addPlugin(syntaxHighlight);
  config.addPlugin(pluginRss);
  config.setLiquidOptions({
    strictFilters: false,
    dynamicPartials: false
  })

  config.addFilter('dateDisplay', dateDisplay);
  config.addFilter('htmlDateString', htmlDateString);
  config.addFilter('dateAndTime', dateAndTime);
  config.addFilter('dateISO', dateISO);
  config.addFilter('yearMonthFile', yearMonthFile);
  config.addFilter('commentsTree', commentsTree);
  config.addFilter('commentsCount', commentsCount);
  config.addFilter('getTags', getTags);
  config.addFilter('isCommentable', isCommentable);
  config.addFilter('postsByYear', postsByYear);
  config.addFilter('getYears', getYears);
  config.addFilter('postYear', postYear);
  config.addFilter('parseSongs', parseSongs);

  config.addPassthroughCopy({
    "public": './',
    "favicon_io": './',
    "img": './img',
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

  config.addCollection('postsAndPagesWithoutDrafts', (collection) =>
    [...collection.getFilteredByGlob('src/{post,page}s/**/*.md')].filter(
      (post) => !post.data.draft && post.data.status === 'publish'
    )
  );

  config.on('eleventy.after', () => {
    execSync('npx pagefind --site dist --glob \"**/*.html\"', { encoding: 'utf-8' })
  })

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
