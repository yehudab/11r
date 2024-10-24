import { DateTime } from "luxon";

export const YEAR = "yyyy";
export const DATE = "d בMMMM yyyy";
export const DATE_AND_TIME = "d בMMMM yyyy בשעה H:mm";
export const ISO_DATE = "ISO_DATE";
export const ISO_DATE_AND_TIME = "ISO_DATE_AND_TIME";

export function formattedDate(date, format) {
    const dateObj = new Date(date);
    const dt = DateTime.fromJSDate(dateObj).setZone('Asia/Jerusalem').setLocale('he-IL');
    switch (format) {
      case ISO_DATE_AND_TIME:
        return dt.toISO();
      case ISO_DATE:
        return dt.toISODate();
      default:
        return dt.toFormat(format);
    }
};
