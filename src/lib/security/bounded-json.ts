export type BoundedJsonResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: 'payload_too_large' | 'invalid_json' }

export async function readBoundedJson<T>(
  request: Request,
  maxBytes: number,
): Promise<BoundedJsonResult<T>> {
  if (!Number.isInteger(maxBytes) || maxBytes < 1) {
    throw new Error('invalid_bounded_json_limit')
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, code: 'payload_too_large' }
  }

  if (!request.body) {
    return { ok: false, code: 'invalid_json' }
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel('payload_too_large').catch(() => undefined)
        return { ok: false, code: 'payload_too_large' }
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(bytes)) as T,
    }
  } catch {
    return { ok: false, code: 'invalid_json' }
  }
}
