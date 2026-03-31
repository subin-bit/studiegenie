export function toVectorString(values: number[]) {
  return `[${values.join(",")}]`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function trimPreview(value: string, length = 160) {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length - 1).trimEnd()}…`;
}

export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString).getTime();
  const diff = date - Date.now();
  const absDiff = Math.abs(diff);
  const units = [
    { label: "day", ms: 1000 * 60 * 60 * 24 },
    { label: "hour", ms: 1000 * 60 * 60 },
    { label: "minute", ms: 1000 * 60 },
  ] as const;

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const unit of units) {
    if (absDiff >= unit.ms || unit.label === "minute") {
      return formatter.format(Math.round(diff / unit.ms), unit.label);
    }
  }

  return "just now";
}

export function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
