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
            if (parent) {
                parent.replies = parent.replies || [];
                parent.replies.push(c);
            } else {
                console.error(`can't find parentID: ${c.parentId} for ID: ${c.id}`);
            }
        } else {
            rootComments.push(c);
        }

    });
    return rootComments;
};