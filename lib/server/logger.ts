import "server-only"

type Level = "debug" | "info" | "warn" | "error"

const order: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}
const configured = (process.env.LOG_LEVEL ?? "info").toLowerCase() as Level
const threshold = order[configured] ?? order.info

// Minimal dependency-free structured logger. Emits one JSON object per line so
// logs can be shipped to any collector without a client library.
function emit(
  level: Level,
  message: string,
  fields: Record<string, unknown> = {}
) {
  if (order[level] < threshold) return
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg: message,
    ...fields,
  })
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (message: string, fields?: Record<string, unknown>) =>
    emit("debug", message, fields),
  info: (message: string, fields?: Record<string, unknown>) =>
    emit("info", message, fields),
  warn: (message: string, fields?: Record<string, unknown>) =>
    emit("warn", message, fields),
  error: (message: string, fields?: Record<string, unknown>) =>
    emit("error", message, fields),
}

export function newRequestId() {
  return crypto.randomUUID()
}
