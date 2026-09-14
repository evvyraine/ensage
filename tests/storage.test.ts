import { randomUUID } from "node:crypto"
import { access } from "node:fs/promises"
import { afterEach, describe, expect, it } from "vitest"
import {
  deleteObject,
  putStream,
  readStream,
  storagePath,
} from "@/lib/server/storage"

const written: string[] = []
const streamOf = (text: string) =>
  new Blob([text]).stream() as ReadableStream<Uint8Array>

afterEach(async () => {
  for (const key of written.splice(0)) await deleteObject(key).catch(() => {})
})

describe("putStream", () => {
  it("writes a file that can be read back", async () => {
    const key = `test/${randomUUID()}`
    written.push(key)
    await putStream(key, streamOf("hello storage"))
    expect(await new Response(readStream(key)).text()).toBe("hello storage")
  })

  it("rejects payloads over the limit and leaves nothing behind", async () => {
    const key = `test/${randomUUID()}`
    written.push(key)
    await expect(
      putStream(key, streamOf("0123456789"), { maxBytes: 4 })
    ).rejects.toThrow("UPLOAD_TOO_LARGE")
    await expect(access(storagePath(key))).rejects.toThrow()
    await expect(access(`${storagePath(key)}.pending`)).rejects.toThrow()
  })
})
