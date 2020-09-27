module.exports = (obj) => {
    const allComments = obj ? Object.values(obj) : [];
    const commentsById = {};
    allComments.forEach(c => {
        c.id = parseInt(c.id);
        c.parentId = parseInt(c.parentId);
        commentsById[c.id] = c;
    });
    const rootComments = [];
    allComments.forEach(c => {
        if (c.parentId) {
            const parent = commentsById[c.parentId];
            if (parent) {
                parent.replies = parent.replies || [];
                parent.replies.push(c);
            }
        } else {
            rootComments.push(c);
        }

    });
    return rootComments;
};