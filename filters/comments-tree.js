import { reactionEmoji } from "./comment-reaction.js";

function addReaction(parent, emoji, name) {
    parent.reactions = parent.reactions || [];
    let reaction = parent.reactions.find(r => r.emoji === emoji);
    if (!reaction) {
        reaction = { emoji, names: [] };
        parent.reactions.push(reaction);
    }
    reaction.names.push(name);
}

export default function (obj) {
    const allComments = obj ? Object.values(obj) : [];
    const commentsById = {};
    allComments.forEach(c => {
        c.id = c.id || c._id;
        commentsById[c.id] = c;
    });
    const rootComments = [];
    allComments.forEach(c => {
        if (c.parentId && c.parentId !== "0") {
            const parent = commentsById[c.parentId];
            const emoji = reactionEmoji(c);
            if (!parent) {
                console.error(`can't find parentID: ${c.parentId} for ID: ${c.id}`);
            } else if (emoji) {
                addReaction(parent, emoji, c.name);
            } else {
                parent.replies = parent.replies || [];
                parent.replies.push(c);
            }
        } else {
            rootComments.push(c);
        }

    });
    return rootComments;
};
