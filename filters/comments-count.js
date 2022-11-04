module.exports = (obj) => {
    const allComments = obj ? Object.values(obj) : [];
    const count = allComments.length;
    const text = count == 0 ?
        "אין תגובות" : count == 1 ?
        "תגובה אחת" : count + " תגובות"
    return { count, text };
};