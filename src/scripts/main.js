import '../styles/tailwind.css';
import { attachFormEvents, attachReplyToEvents } from './comment-form.js';
import { fixEmail, fixTimeTicker, setupMenu } from './utils.js';
import { fixMap } from './vega-map.js';

if (DEV_MODE) console.log('Dev mode is currently enabled.');

$(() => {
    attachFormEvents();
    attachReplyToEvents();
    fixEmail();
    fixTimeTicker();
    fixMap();
    setupMenu();
});