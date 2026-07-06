import { format, parseISO } from "date-fns";

export function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function formatMonthYear(iso: string) {
  try {
    return format(parseISO(iso), "MMM yyyy");
  } catch {
    return iso;
  }
}
