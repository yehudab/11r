// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string

const tz = require('timezone/loaded');

module.exports = (date) => {
    const utc = tz(date);
    return tz(utc, '%Y-%m-%d', 'he_IL', 'Asia/Jerusalem')
};
