import '../styles/tailwind.css';
import { attachFormEvents, attachReplyToEvents } from './comment-form.js';
import { fixLinks, fixEmail, fixTimeTicker } from './utils.js';

if (DEV_MODE) console.log('Dev mode is currently enabled.');

$(() => {
    attachFormEvents();
    attachReplyToEvents();
    // fixLinks();
    fixEmail();
    fixTimeTicker();
});