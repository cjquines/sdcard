/** "Sat May  6 02:22:24 2023" */
export function parseDate(date: string): number {
  const [, month, dayStr, hms, yearStr] = date
    .split(" ")
    .filter((s) => s !== "");
  const [day, year] = [dayStr, yearStr].map((n) => parseInt(n));
  const [hours, minutes, seconds] = hms.split(":").map((n) => parseInt(n));

  const monthIndex =
    {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    }[month] ?? 0;

  return new Date(year, monthIndex, day, hours, minutes, seconds).getTime();
}

/** fuzzy datetime formatting */
export function formatDate(dateNumber: number): string {
  const now = new Date();
  const date = new Date(dateNumber);

  const format = (() => {
    if (now.getFullYear() !== date.getFullYear()) {
      return { year: "2-digit", month: "numeric", day: "numeric" } as const;
    } else if (
      now.getMonth() !== date.getMonth() ||
      now.getDate() !== date.getDate()
    ) {
      return { month: "short", day: "numeric" } as const;
    } else {
      return { hour: "numeric", minute: "numeric" } as const;
    }
  })();

  return new Intl.DateTimeFormat(undefined, format).format(date);
}
