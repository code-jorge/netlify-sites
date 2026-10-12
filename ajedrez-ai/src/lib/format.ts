const ordinalSuffix = (n: number): string => {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// e.g. 2026-05-03T... -> "May 3rd, 2026"
export const formatDateLong = (iso: string | Date): string => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
}
