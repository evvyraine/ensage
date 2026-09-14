import "server-only"
import { createReadStream, createWriteStream } from "node:fs"
import { mkdir, rename, rm } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { Readable, Transform } from "node:stream"
import { pipeline } from "node:stream/promises"

const root = resolve(process.cwd(), "data", "storage")
function pathFor(key: string) {
  const file = resolve(root, key)
  if (!file.startsWith(`${root}/`)) throw new Error("Invalid storage key")
  return file
}
export async function putStream(
  key: string,
  source: ReadableStream<Uint8Array>,
  options: { maxBytes?: number } = {}
) {
  const target = pathFor(key),
    temporary = `${target}.pending`
  await mkdir(dirname(target), { recursive: true })
  let written = 0
  // Count bytes as they stream so the limit is enforced regardless of what the
  // client claims in Content-Length.
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      written += chunk.length
      if (options.maxBytes !== undefined && written > options.maxBytes)
        callback(new Error("UPLOAD_TOO_LARGE"))
      else callback(null, chunk)
    },
  })
  try {
    await pipeline(
      Readable.fromWeb(source as import("node:stream/web").ReadableStream),
      limiter,
      createWriteStream(temporary, { flags: "wx", mode: 0o600 })
    )
    await rename(temporary, target)
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {})
    throw error
  }
}
export function readStream(key: string) {
  return Readable.toWeb(
    createReadStream(pathFor(key))
  ) as ReadableStream<Uint8Array>
}
export async function deleteObject(key: string) {
  await rm(pathFor(key), { force: true })
}
export const storagePath = (...parts: string[]) => join(root, ...parts)
