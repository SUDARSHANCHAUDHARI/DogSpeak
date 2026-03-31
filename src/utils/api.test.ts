import { describe, it, expect, vi, beforeEach } from 'vitest'
import { translateDatadog } from './api'

// Helper: create a ReadableStream that yields encoded string chunks
function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let idx = 0
  return new ReadableStream({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx++]))
      } else {
        controller.close()
      }
    },
  })
}

// Helper: format a single SSE data line
function sseChunk(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

const textDelta = (text: string) =>
  sseChunk({ type: 'content_block_delta', delta: { type: 'text_delta', text } })

describe('translateDatadog — error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('throws a user-friendly message on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }))
    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('Invalid API key')
  })

  it('throws a user-friendly message on 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }))
    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('Rate limit')
  })

  it('throws a user-friendly message on 529', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 529, json: async () => ({}) }))
    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('overloaded')
  })

  it('throws a user-friendly message on 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }))
    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('Server error')
  })

  it('falls back to error.message for unknown status codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: { message: 'Service unavailable' } }) }))
    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('Service unavailable')
  })
})

describe('translateDatadog — streaming', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns parsed JSON from a successful stream', async () => {
    const result = {
      severity: 'warn',
      headline: 'High CPU usage',
      explanation: 'CPU is at 94%.',
      key_facts: [{ label: 'Where', value: 'web-01' }],
      action_needed: 'Check the server.',
    }
    const chunks = [textDelta(JSON.stringify(result)), 'data: [DONE]\n\n']
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: makeStream(chunks) }))

    const onStream = vi.fn()
    const parsed = await translateDatadog('input', 'audience', 'key', onStream)

    expect(parsed.severity).toBe('warn')
    expect(parsed.headline).toBe('High CPU usage')
    expect(onStream).toHaveBeenCalled()
  })

  it('calls onStream with accumulated length as text arrives', async () => {
    const result = { severity: 'ok', headline: 'All clear', explanation: 'Fine.', key_facts: [], action_needed: 'None.' }
    const json = JSON.stringify(result)
    const half = Math.floor(json.length / 2)
    const chunks = [textDelta(json.slice(0, half)), textDelta(json.slice(half)), 'data: [DONE]\n\n']
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: makeStream(chunks) }))

    const lengths: number[] = []
    await translateDatadog('input', 'audience', 'key', (acc) => lengths.push(acc.length))

    expect(lengths.length).toBeGreaterThanOrEqual(2)
    expect(lengths[lengths.length - 1]).toBe(json.length)
  })

  it('throws when stream yields no JSON object', async () => {
    const chunks = [textDelta('This is plain text, no JSON here.'), 'data: [DONE]\n\n']
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: makeStream(chunks) }))

    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('Unexpected AI response')
  })

  it('throws with empty response message when stream is empty', async () => {
    const chunks = ['data: [DONE]\n\n']
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: makeStream(chunks) }))

    await expect(translateDatadog('input', 'audience', 'key', vi.fn())).rejects.toThrow('empty response')
  })

  it('ignores malformed SSE lines without throwing', async () => {
    const result = { severity: 'info', headline: 'OK', explanation: 'All good.', key_facts: [], action_needed: 'None.' }
    const chunks = ['data: not-valid-json\n\n', textDelta(JSON.stringify(result)), 'data: [DONE]\n\n']
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: makeStream(chunks) }))

    const parsed = await translateDatadog('input', 'audience', 'key', vi.fn())
    expect(parsed.headline).toBe('OK')
  })
})
