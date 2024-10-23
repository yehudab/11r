import { DateTime } from "luxon";

export default function (post) {
    const dt = DateTime.fromISO(post.data.date).setZone('Asia/Jerusalem');
    return dt.toFormat('yyyy');
};
