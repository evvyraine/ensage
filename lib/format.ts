// Deterministic date formatting. `toLocaleDateString()` renders differently on
// the server and in the browser (locale + timezone), which causes hydration
// mismatches; pinning the locale and timezone keeps both renders identical.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
})

export function formatDate(value: string | number | Date) {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string | number | Date) {
  return dateTimeFormatter.format(new Date(value))
}
