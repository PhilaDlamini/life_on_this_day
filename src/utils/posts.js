import { dateFromKey, dateKey } from "./calendar.js";

export function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && dateKey(dateFromKey(value)) === value;
}

// The reader and publishing function share the same content validation.
export { isValidPost } from "../../functions/shared/posts.js";
