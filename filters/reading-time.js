const WORDS_PER_MINUTE = 200;

export default function (html) {
    const words = String(html || "")
        .replace(/<[^>]+>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

    return minutes === 1 ? "דקת קריאה אחת" : `${minutes} דקות קריאה`;
};
