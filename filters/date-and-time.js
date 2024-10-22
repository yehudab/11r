import { DateTime } from "luxon";

export default function (date) {
    const dt = DateTime.fromISO(date).setZone('Asia/Jerusalem').setLocale('he-IL');
    return dt.toFormat('d בMMMM yyyy בשעה H:mm');
};
