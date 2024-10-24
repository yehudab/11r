export default function (fileName) {
    let matches = fileName.match(/\.\/src\/posts\/(.*)\.md/);
    if (matches) {
        return matches[1];
    }
    matches = fileName.match(/\/([^/]+)\.md/);
    if (matches) {
        return matches[1];
    }
    return Date.now;
};
