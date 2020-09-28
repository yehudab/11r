module.exports = (obj) => {
    const allComments = obj ? Object.values(obj) : [];
    const commentsById = {};
    allComments.forEach(c => {
        const id = c.id || c._id;
        commentsById[id] = c;
    });
    const rootComments = [];
    allComments.forEach(c => {
        if (c.parentId && c.parentId !== "0") {
            const parent = commentsById[c.parentId];
            if (parent) {
                parent.replies = parent.replies || [];
                parent.replies.push(c);
            } else {
                console.error(`can't find parentID: ${c.parentId} for ID: ${c.id || c._id}`);
            }
        } else {
            rootComments.push(c);
        }

    });
    return rootComments;
};