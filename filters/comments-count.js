import { reactionEmoji } from "./comment-reaction.js";

export default function (obj) {
    const allComments = obj ? Object.values(obj) : [];
    const count = allComments.filter(c => !reactionEmoji(c)).length;
    const text = count == 0 ?
        "אין תגובות" : count == 1 ?
        "תגובה אחת" : count + " תגובות"
    return { count, text };
};
