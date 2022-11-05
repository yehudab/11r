const tz = require('timezone/loaded');

module.exports = (date) => {
    const utc = tz(date);
    return tz(utc, '%-d ב%B %Y בשעה %-H:%M', 'he_IL', 'Asia/Jerusalem')
};
