function fixLinks() {
    $('a').each((index, a) => {
        let element = $(a);
        let href = element.attr('href');
        if (href && href.indexOf('http') == 0) {
            element.attr('target', '_blank');
        }
    });
}

function fixEmail() {
    const replaceEmail = $('a[href=to-be-replaced-by-email]');
    if (replaceEmail.length) {
        // trick the robots...
        const emailArr = ['yehudab', '\u0040', 'gm\u0061il', '\u002e', 'com'];
        replaceEmail
            .attr('href', `mailto:${emailArr.join('')}`)
            .text(emailArr.join(''));
    }
}

function fixTimeTicker() {
    const timeTicker = $('.to-be-replaced-by-time-ticker');
    if (timeTicker.length) {
        timeTicker.each((i, e) => { $(e).text(msTime()) }); 
        window.setInterval(function(){
            timeTicker.each((i, e) => { $(e).text(msTime()) });
        }, 1000);
    }
}

function msTime() { return Math.floor(Date.now()/1000); }

export { fixLinks, fixEmail, fixTimeTicker };