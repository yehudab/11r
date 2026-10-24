import { load as yamlLoad } from "js-yaml";
import siteSettings from "./src/globals/site.js";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { rssPlugin } from "@11ty/eleventy-plugin-rss";
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
import readingTime from "./filters/reading-time.js";
import imageFigures from "./markdown/image-figures.js";
import { execSync } from 'node:child_process';

export default function (config) {
  config.addPlugin(syntaxHighlight);
  config.addPlugin(rssPlugin);
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
  config.addFilter('readingTime', readingTime);

  config.amendLibrary('md', (md) => md.use(imageFigures));

  config.addPassthroughCopy({
    "public": './',
    "favicon_io": './',
    "img": './img',
    "node_modules/cash-dom/dist/cash.min.js": "./assets/lib/cash.js",
    "node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2": "./assets/fonts/heebo-hebrew-wght-normal.woff2",
    "node_modules/@fontsource-variable/heebo/files/heebo-latin-wght-normal.woff2": "./assets/fonts/heebo-latin-wght-normal.woff2",
    "CNAME": "./CNAME"
  });

  // Yaml
  config.addDataExtension("yaml", (contents) =>
    yamlLoad(contents)
  );
  // Yml
  config.addDataExtension("yml", (contents) =>
    yamlLoad(contents)
  );

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: false,
  });

  config.setDataDeepMerge(true);

  // Draft posts are previewable with `npm run dev` but never published
  config.addPreprocessor('drafts', 'md', (data) => {
    if (data.status === 'draft' && process.env.NODE_ENV === 'production') {
      return false;
    }
  });

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
