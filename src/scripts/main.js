import '../styles/tailwind.css';
import { attachFormEvents, attachReplyToEvents } from './comment-form.js';

if (DEV_MODE) console.log('Dev mode is currently enabled.');

$(() => {
    const replaceEmail = document.querySelector('a[href=to-be-replaced-by-email]');
    if (replaceEmail) {
        const emailArr = ['yehudab', '\u0040', 'gm\u0061il', '\u002e', 'com'];
        replaceEmail.href = `mailto:${emailArr.join('')}`;
        replaceEmail.innerHTML = emailArr.join('');
    }
});



$(() => {
    attachFormEvents();
    attachReplyToEvents();
});