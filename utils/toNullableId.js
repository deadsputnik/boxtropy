const EMPTY_VALUES = ["", null, undefined, 0, "0"];

export function toNullableId (value) => {
  if (EMPTY_VALUES.includes(value)) return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
};