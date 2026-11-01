import { test } from "node:test";
import assert from "node:assert/strict";
import commentsTree from "./comments-tree.js";
import commentsCount from "./comments-count.js";
import { reactionEmoji } from "./comment-reaction.js";

const reply = message => ({ parentId: "p", message });

test("single emoji replies are reactions", () => {
    for (const emoji of ["🙏", "👍🏽", "👨‍👩‍👧", "🇮🇱", "❤️", "1️⃣"]) {
        assert.equal(reactionEmoji(reply(emoji)), emoji);
    }
    assert.equal(reactionEmoji(reply(" 🙏\n")), "🙏");
});

test("a bare pictograph gets the emoji variation selector", () => {
    assert.equal(reactionEmoji(reply("❤")), "❤️");
});

test("anything else is a regular reply", () => {
    for (const message of ["תודה", "🙏🙏", "🙏 תודה", "1", "#", "©", "", 5]) {
        assert.equal(reactionEmoji(reply(message)), null);
    }
});

test("a top-level emoji stays a regular comment", () => {
    assert.equal(reactionEmoji({ parentId: "", message: "🙏" }), null);
    assert.equal(reactionEmoji({ parentId: "0", message: "🙏" }), null);
});

const comments = () => ({
    a: { _id: "root", parentId: "", message: "שלום", name: "רלי" },
    b: { _id: "r1", parentId: "root", message: "🙏", name: "יהודה" },
    c: { _id: "r2", parentId: "root", message: "🙏", name: "ברי" },
    d: { _id: "r3", parentId: "root", message: "👍", name: "דנה" },
    e: { _id: "r4", parentId: "root", message: "תודה", name: "יהודה" },
    f: { _id: "r5", parentId: "r4", message: "👍", name: "רלי" },
});

test("reactions are grouped by emoji under their parent, not listed as replies", () => {
    const [root, ...others] = commentsTree(comments());
    assert.equal(others.length, 0);
    assert.deepEqual(root.reactions, [
        { emoji: "🙏", names: ["יהודה", "ברי"] },
        { emoji: "👍", names: ["דנה"] },
    ]);
    assert.deepEqual(root.replies.map(r => r._id), ["r4"]);
    assert.deepEqual(root.replies[0].reactions, [{ emoji: "👍", names: ["רלי"] }]);
});

test("reactions are not counted as comments", () => {
    assert.equal(commentsCount(comments()).count, 2);
});
