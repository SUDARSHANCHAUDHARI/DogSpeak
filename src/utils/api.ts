import type { Severity } from './constants'
import { PROVIDER_CONFIGS, type Provider } from '../hooks/useApiKey'

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
  // Audience-specific optional fields
  analogy?: string       // non-technical: everyday analogy
  business_impact?: string // manager: users affected, revenue risk, SLA
  concepts?: KeyFact[]   // junior dev: jargon definitions
}

function parseApiError(status: number, errorData: unknown): string {
  if (status === 401) return 'Invalid API key. Check your key and try again.'
  if (status === 429) return 'Rate limit reached. Wait a moment and try again.'
  if (status === 529) return 'API is overloaded. Try again in a few seconds.'
  if (status === 500) return 'Server error. Try again shortly.'
  const msg = (errorData as { error?: { message?: string } })?.error?.message
  return msg || `API error (${status})`
}

const REQUEST_TIMEOUT_MS = 45_000

interface TranslateOptions {
  provider?: Provider
  model?: string
  baseUrl?: string
  signal?: AbortSignal
  audienceSchema?: string
}

export async function translateDatadog(
  datadogInput: string,
  audiencePrompt: string,
  apiKey: string,
  onStream?: (accumulated: string) => void,
  options?: TranslateOptions,
): Promise<TranslationResult> {
  const provider = options?.provider ?? 'anthropic'
  const config = PROVIDER_CONFIGS[provider]
  const model = options?.model || config.defaultModel || import.meta.env.VITE_MODEL || 'claude-sonnet-4-20250514'
  const url = (provider === 'custom' || provider === 'ollama')
    ? (options?.baseUrl || config.defaultUrl)
    : config.defaultUrl

  if (provider !== 'anthropic') {
    try { new URL(url) } catch {
      throw new Error(`Invalid API URL: "${url}". Please check your Base URL setting.`)
    }
  }

  // Combine user abort signal with a timeout signal
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const signal = options?.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal

  const audienceSchema = options?.audienceSchema ?? ''

  if (provider === 'anthropic') {
    return translateAnthropic(datadogInput, audiencePrompt, audienceSchema, apiKey, model, signal, onStream)
  }
  return translateOpenAI(datadogInput, audiencePrompt, audienceSchema, apiKey, model, url, signal, onStream)
}

async function translateAnthropic(
  datadogInput: string,
  audiencePrompt: string,
  audienceSchema: string,
  apiKey: string,
  model: string,
  signal: AbortSignal,
  onStream?: (accumulated: string) => void,
): Promise<TranslationResult> {
  const url = import.meta.env.VITE_ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages'

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(datadogInput, audiencePrompt, audienceSchema) }],
    }),
  })

  if (!response.ok) {
    let errorData: unknown = null
    try { errorData = await response.json() } catch {}
    throw new Error(parseApiError(response.status, errorData))
  }

  return readAnthropicStream(response, onStream)
}

async function translateOpenAI(
  datadogInput: string,
  audiencePrompt: string,
  audienceSchema: string,
  apiKey: string,
  model: string,
  url: string,
  signal: AbortSignal,
  onStream?: (accumulated: string) => void,
): Promise<TranslationResult> {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(datadogInput, audiencePrompt, audienceSchema) },
      ],
    }),
  })

  if (!response.ok) {
    let errorData: unknown = null
    try { errorData = await response.json() } catch {}
    throw new Error(parseApiError(response.status, errorData))
  }

  return readOpenAIStream(response, onStream)
}

async function readAnthropicStream(
  response: Response,
  onStream?: (accumulated: string) => void,
): Promise<TranslationResult> {
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
        const event = JSON.parse(data) as {
          type: string
          error?: { message?: string }
          delta?: { type: string; text: string }
        }
        if (event.type === 'error') throw new Error(event.error?.message || 'Stream error from API')
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          accumulated += event.delta.text
          onStream?.(accumulated)
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes('Stream error')) throw e
      }
    }
  }

  return finalize(accumulated)
}

async function readOpenAIStream(
  response: Response,
  onStream?: (accumulated: string) => void,
): Promise<TranslationResult> {
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
        const event = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>
          error?: { message?: string }
        }
        const chunk = event.choices?.[0]?.delta?.content
        if (chunk) {
          accumulated += chunk
          onStream?.(accumulated)
        }
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }

  return finalize(accumulated)
}

function finalize(accumulated: string): TranslationResult {
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
  try { return JSON.parse(text.trim()) } catch {}
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

const SYSTEM_PROMPT = `You are a Datadog monitoring expert. Translate Datadog alerts, logs, metrics, monitors, and traces into clear explanations tailored to a specific audience.

Always respond with a single valid JSON object matching the schema provided — no markdown, no backticks, no commentary outside the JSON. Only include fields defined in the schema.`

function buildUserMessage(input: string, audiencePrompt: string, audienceSchema: string): string {
  return `Explain the following Datadog content for ${audiencePrompt}.

Respond with this exact JSON schema:
${audienceSchema}

Datadog content:
---
${input}
---`
}
