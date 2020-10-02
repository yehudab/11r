var { DateTime, Interval } = require('luxon');

// Allow comments on posts from the last 6 months
module.exports = (date) => {
    try {
        const isoDate = typeof date === "string" ? date : date.toISOString();
        const postDate = DateTime.fromISO(isoDate);
        const current = DateTime.local();
        const i = Interval.fromDateTimes(postDate, current);

        const result = i.length('days') <= 183;
        return result;
    } catch (err) {
        console.error(`can't parse date: "${date}"`);
        return false;
    }

};
