const SINGLE_EMOJI = /^\p{RGI_Emoji}$/v;
// Pictographs some keyboards send without the emoji variation selector, e.g. a bare ❤
const BARE_PICTOGRAPH = /^[\p{Extended_Pictographic}--[©®™]]$/v;

// A reply whose whole message is one emoji is a reaction to its parent comment.
// Returns that emoji, or null for anything else.
export function reactionEmoji(comment) {
    if (!comment.parentId || comment.parentId === "0") return null;
    const message = String(comment.message ?? "").trim();
    if (SINGLE_EMOJI.test(message)) return message;
    if (BARE_PICTOGRAPH.test(message)) return `${message}️`;
    return null;
}
