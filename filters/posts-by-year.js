import postYear from './post-year.js';

export default function (posts, year) {
  return posts.filter(post => {
      return postYear(post) == year;
  });
};