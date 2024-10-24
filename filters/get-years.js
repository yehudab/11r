import postYear from './post-year.js';

const thisYear = new Date().getFullYear();

export default function(collections) {
  let years = {};
  collections.post.forEach(post => {
      const year = postYear(post);
      if (!years[year]) {
          years[year] = 0;
      }
      years[year]++;
  });

  return Object.keys(years).map(year => ({
      year: year,
      slag: year == thisYear ? "" : `${year}/`,
      count: years[year]
  })).sort((a, b) => b.year - a.year);
};