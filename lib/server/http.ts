import { ZodError } from "zod"
import { logger, newRequestId } from "./logger"

function respond(
  status: number,
  body: Record<string, unknown>,
  requestId: string
) {
  return Response.json(body, {
    status,
    headers: { "x-request-id": requestId },
  })
}

export function apiError(error: unknown) {
  const requestId = newRequestId()
  if (error instanceof ZodError) {
    logger.warn("invalid_request", { requestId, issues: error.issues })
    return respond(400, { error: "Invalid request", issues: error.issues }, requestId)
  }
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR"
  if (message === "UNAUTHORIZED")
    return respond(401, { error: "Authentication required" }, requestId)
  if (message === "RATE_LIMITED")
    return respond(429, { error: "Too many requests" }, requestId)
  if (message === "UPLOAD_TOO_LARGE")
    return respond(
      413,
      { error: "File exceeds your workspace upload limit" },
      requestId
    )
  // Malformed identifiers (for example a non-uuid path segment) surface from
  // PostgreSQL as 22P02; treat them as a missing resource, not a server error.
  // Drizzle wraps driver errors, so the SQLSTATE lives on `cause`.
  const dbError = error as
    | { code?: string; cause?: { code?: string } }
    | null
    | undefined
  if (dbError?.code === "22P02" || dbError?.cause?.code === "22P02")
    return respond(404, { error: "Not found" }, requestId)
  logger.error("unhandled_error", {
    requestId,
    message,
    stack: error instanceof Error ? error.stack : undefined,
  })
  return respond(500, { error: "Internal server error", requestId }, requestId)
}
