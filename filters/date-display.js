const IntlPolyfill = require('intl');
Intl.NumberFormat = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

const Hebrew = new Intl.DateTimeFormat('he', { year: 'numeric', month: 'long', day: 'numeric' });

module.exports = (date) =>
  Hebrew.format(new Date(date));
