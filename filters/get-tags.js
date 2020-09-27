module.exports = (collections) => {
    const allTags = Object.keys(collections);
    return allTags.filter((tag) =>
        tag !== "postsWithoutDrafts" &&
        tag !== "post" &&
        tag !== "all"
    ).map((tag) => {
        return {
            "tagName": tag,
            "count": collections[tag].length
        }
    })
};