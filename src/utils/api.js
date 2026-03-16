const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

function parseApiError(status, errorData) {
  if (status === 401) return 'Invalid API key. Check your key at console.anthropic.com.'
  if (status === 429) return 'Rate limit reached. Wait a moment and try again.'
  if (status === 529) return 'Anthropic API is overloaded. Try again in a few seconds.'
  if (status === 500) return 'Anthropic server error. Try again shortly.'
  return errorData?.error?.message || `API error (${status})`
}

/**
 * Calls the Anthropic API with streaming and returns a parsed translation result.
 * @param {string} datadogInput - Raw Datadog content pasted by the user
 * @param {string} audiencePrompt - Audience description for the AI
 * @param {string} apiKey - Anthropic API key
 * @param {function} onStream - Called with accumulated text as it streams in
 * @returns {Promise<TranslationResult>}
 */
export async function translateDatadog(datadogInput, audiencePrompt, apiKey, onStream) {
  const prompt = buildPrompt(datadogInput, audiencePrompt)

  const headers = {
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
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    let errorData = null
    try { errorData = await response.json() } catch {}
    throw new Error(parseApiError(response.status, errorData))
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const event = JSON.parse(data)
        if (event.type === 'error') {
          throw new Error(event.error?.message || 'Stream error')
        }
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          accumulated += event.delta.text
          onStream?.(accumulated)
        }
      } catch (e) {
        if (e.message === 'Stream error' || e.message.includes('Stream error')) throw e
        // ignore JSON parse errors on malformed chunks
      }
    }
  }

  // Extract JSON from the accumulated text (handles any stray backtick wrappers)
  const jsonMatch = accumulated.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response. Please try again.')

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

function buildPrompt(input, audiencePrompt) {
  return `You are a Datadog monitoring expert who explains technical alerts and metrics in plain, human language.

Given this Datadog content:
---
${input}
---

Explain it clearly for ${audiencePrompt}.

Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text):
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
}
