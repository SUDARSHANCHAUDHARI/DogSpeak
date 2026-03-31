export type Severity = 'ok' | 'info' | 'warn' | 'critical'

export interface Example {
  label: string
  text: string
}

export interface AudienceOption {
  key: string
  label: string
  prompt: string
  schema: string
}

export interface SeverityConfigEntry {
  label: string
  dotColor: string
  badgeClass: string
  dotClass: string
  actionClass: string
  icon: string
}

export const EXAMPLES: Example[] = [
  {
    label: '[P1] Payment API',
    text: `[P1][ALERT] service:payment-api env:prod
Monitor: High error rate detected
Value: 18.4% (threshold: 5%)
Host: ip-10-0-1-42
Message: The error rate for payment-api has exceeded the critical threshold of 5% for the last 10 minutes. Current value is 18.4%. Notifying @pagerduty @slack-oncall`,
  },
  {
    label: 'CPU spike',
    text: `system.cpu.user{host:web-prod-03, env:production}
Current: 94.2%
Avg (last 1h): 87.6%
Max (last 1h): 98.1%
Status: ALERT — exceeds threshold of 90%
Tags: service:frontend, region:ap-southeast-1`,
  },
  {
    label: 'DB timeout error',
    text: `2024-03-15T08:42:17.883Z ERROR [checkout-service] Unhandled exception in OrderController.createOrder
java.sql.SQLTimeoutException: Timeout waiting for connection from pool after 30000ms
  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)
  at com.checkout.OrderController.createOrder(OrderController.java:87)
ddtags: env:prod, service:checkout, version:2.4.1`,
  },
  {
    label: 'Latency WARN',
    text: `Monitor "Database query latency > 500ms" changed status from OK to WARN
Query: avg:postgresql.query.mean{env:staging} > 500
Current value: 843ms
Evaluation window: last 5 minutes
Triggered at: 2024-03-15 09:15:00 UTC`,
  },
  {
    label: 'Memory OOM',
    text: `[ALERT] Memory usage critical
service: recommendation-engine
env: production
metric: system.mem.used / system.mem.total = 97.3%
OOM killer triggered: 3 times in last 15 minutes
Affected pods: rec-eng-7d9f4b-xkzp2, rec-eng-7d9f4b-mnlq8
k8s namespace: ml-services`,
  },
]

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    key: 'non-technical',
    label: 'Non-technical',
    prompt: 'a completely non-technical person — use everyday analogies, no jargon at all',
    schema: `{
  "severity": "ok" | "info" | "warn" | "critical",
  "headline": "One sentence in everyday language. No jargon. Max 15 words. Do not start with 'The'.",
  "analogy": "One sentence everyday analogy explaining what happened (e.g. 'It's like a restaurant kitchen that stopped taking orders'). Make it relatable.",
  "explanation": "2-3 sentences. What happened, whether regular users are affected, and whether someone is already working on it. Absolutely zero technical terms.",
  "key_facts": [
    { "label": "What happened", "value": "plain English description, no acronyms" },
    { "label": "Who's affected", "value": "customers, teams, or services impacted" },
    { "label": "How serious", "value": "casual everyday language — e.g. minor hiccup, serious problem, all systems down" },
    { "label": "Status", "value": "is the tech team handling it, or does someone need to act?" }
  ],
  "action_needed": "What should a non-technical person do right now? If the tech team is handling it, say so clearly. If they need to communicate to customers or stakeholders, say that."
}`,
  },
  {
    key: 'manager',
    label: 'Manager / exec',
    prompt: 'a manager or executive who cares about business impact, user impact, and decisions — not technical details',
    schema: `{
  "severity": "ok" | "info" | "warn" | "critical",
  "headline": "One sentence focused on business or customer impact. Max 15 words. Do not start with 'The'.",
  "explanation": "2-3 sentences. Customer impact, business risk, and whether the team is on it. No technical jargon.",
  "business_impact": "Specific impact statement: estimated number of users affected, revenue risk (high/medium/low with brief reason), SLA implications, and whether this is customer-facing.",
  "key_facts": [
    { "label": "Users affected", "value": "estimate or unknown" },
    { "label": "Revenue risk", "value": "high / medium / low — brief reason" },
    { "label": "Customer-facing", "value": "yes or no" },
    { "label": "Est. time to resolve", "value": "best estimate or unknown" }
  ],
  "action_needed": "What decision or communication does the manager need to make RIGHT NOW? Should they notify customers? Escalate? Stand up an incident call? Be direct."
}`,
  },
  {
    key: 'developer',
    label: 'Junior developer',
    prompt: 'a junior developer who is new to production monitoring, observability, and DevOps',
    schema: `{
  "severity": "ok" | "info" | "warn" | "critical",
  "headline": "One sentence describing what is broken or degraded. Max 15 words. Do not start with 'The'.",
  "explanation": "2-3 sentences: what the alert means technically, why this specific threshold matters, and what commonly causes this kind of issue.",
  "concepts": [
    { "label": "technical term from the alert", "value": "plain explanation of what this term or metric means, why it matters, and how to think about it" }
  ],
  "key_facts": [
    { "label": "What", "value": "which metric or service is affected" },
    { "label": "Where", "value": "service name, host, or component" },
    { "label": "Threshold breached", "value": "what the limit was vs the current value" },
    { "label": "Duration", "value": "how long this has been happening" }
  ],
  "action_needed": "Numbered steps a junior dev should take: 1) Check X dashboard or log 2) Look for Y pattern 3) If you see Z, escalate to a senior engineer. Name specific tools or dashboards where possible."
}`,
  },
]

export const SEVERITY_CONFIG: Record<Severity, SeverityConfigEntry> = {
  ok: {
    label: 'All clear',
    dotColor: '#3ecf8e',
    badgeClass: 'sev-ok',
    dotClass: 'dot-ok',
    actionClass: 'action-ok',
    icon: '✓',
  },
  info: {
    label: 'For your information',
    dotColor: '#5b9cf6',
    badgeClass: 'sev-info',
    dotClass: 'dot-info',
    actionClass: 'action-info',
    icon: 'ℹ',
  },
  warn: {
    label: 'Needs attention',
    dotColor: '#f5a623',
    badgeClass: 'sev-warn',
    dotClass: 'dot-warn',
    actionClass: 'action-warn',
    icon: '⚠',
  },
  critical: {
    label: 'Urgent',
    dotColor: '#ff5757',
    badgeClass: 'sev-crit',
    dotClass: 'dot-crit',
    actionClass: 'action-crit',
    icon: '🔴',
  },
}
