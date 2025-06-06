export default function (songs) {
  return songs.map(song => {
    const matches = /\[([^\]]+)\]\(([^)]+)\)/.exec(song)
    if (matches) {
      return {
        name: matches[1],
        url: matches[2]
      }
    }
    return {
        name: "***",
        url: "/"
    }
  })
};