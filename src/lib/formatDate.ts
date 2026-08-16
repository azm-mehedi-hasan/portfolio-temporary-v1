export function formatDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : date;
  return value.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
