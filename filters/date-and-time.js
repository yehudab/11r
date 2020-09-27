const Hebrew = new Intl.DateTimeFormat('he',
    {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }
);

module.exports = (date) =>
    Hebrew.format(new Date(date));
