import type { Severity } from './constants'

const ANTHROPIC_API_URL = import.meta.env.VITE_ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages'
const MODEL = import.meta.env.VITE_MODEL || 'claude-sonnet-4-20250514'

export interface KeyFact {
  label: string
  value: string
}

export interface TranslationResult {
  severity: Severity
  headline: string
  explanation: string
  key_facts: KeyFact[]
  action_needed: string
}

function parseApiError(status: number, errorData: unknown): string {
  if (status === 401) return 'Invalid API key. Check your key at console.anthropic.com.'
  if (status === 429) return 'Rate limit reached. Wait a moment and try again.'
  if (status === 529) return 'Anthropic API is overloaded. Try again in a few seconds.'
  if (status === 500) return 'Anthropic server error. Try again shortly.'
  const msg = (errorData as { error?: { message?: string } })?.error?.message
  return msg || `API error (${status})`
}

export async function translateDatadog(
  datadogInput: string,
  audiencePrompt: string,
  apiKey: string,
  onStream?: (accumulated: string) => void,
): Promise<TranslationResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
  if (apiKey) headers['x-api-key'] = apiKey

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(datadogInput, audiencePrompt) }],
    }),
  })

  if (!response.ok) {
    let errorData: unknown = null
    try { errorData = await response.json() } catch {}
    throw new Error(parseApiError(response.status, errorData))
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const event = JSON.parse(data) as { type: string; error?: { message?: string }; delta?: { type: string; text: string } }
        if (event.type === 'error') {
          throw new Error(event.error?.message || 'Stream error from API')
        }
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          accumulated += event.delta.text
          onStream?.(accumulated)
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes('Stream error')) throw e
        // ignore JSON parse errors on malformed SSE chunks
      }
    }
  }

  const parsed = extractFirstJson(accumulated)
  if (!parsed) {
    const preview = accumulated.slice(0, 120).trim()
    throw new Error(
      preview
        ? `Unexpected AI response: "${preview}${accumulated.length > 120 ? '…' : ''}"`
        : 'AI returned an empty response. Please try again.'
    )
  }
  return parsed as TranslationResult
}

function extractFirstJson(text: string): unknown {
  // Try the whole string first (ideal case: model returns pure JSON)
  try { return JSON.parse(text.trim()) } catch {}
  // Walk forward to find the first balanced { ... } object
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)) } catch {}
        return null
      }
    }
  }
  return null
}

const SYSTEM_PROMPT = `You are a Datadog monitoring expert. Your job is to translate Datadog alerts, logs, metrics, monitors, and traces into clear, plain English.

Always respond with a single valid JSON object — no markdown, no backticks, no commentary outside the JSON.

JSON schema:
{
  "severity": "ok" | "info" | "warn" | "critical",
  "headline": "One sentence — what is happening RIGHT NOW, in plain English. Max 15 words. Do not start with 'The'.",
  "explanation": "2-4 sentences. What is happening, why it matters, and what impact it has. Zero jargon. Use analogies if helpful.",
  "key_facts": [
    { "label": "What", "value": "brief description" },
    { "label": "Where", "value": "service or host name" },
    { "label": "Since when", "value": "time or duration" },
    { "label": "Severity", "value": "how bad is this" }
  ],
  "action_needed": "What should a human do about this right now? Be specific and direct. If nothing, say: No action needed — this is just informational."
}`

function buildUserMessage(input: string, audiencePrompt: string): string {
  return `Explain the following Datadog content clearly for ${audiencePrompt}:

---
${input}
---`
}
