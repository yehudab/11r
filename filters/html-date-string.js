// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string

module.exports = (dateObj) =>
    dateObj.toISOString().split('T')[0];