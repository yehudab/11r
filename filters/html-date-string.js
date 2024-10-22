// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string

import { DateTime } from "luxon";

export default function (date) {
    const dt = DateTime.fromISO(date).setZone('Asia/Jerusalem');
    return dt.toFormat('yyyy-LL-dd');
};
