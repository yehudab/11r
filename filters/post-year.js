import { formattedDate, YEAR } from './date-utils.js';

export default (post) => formattedDate(post.date, YEAR);
