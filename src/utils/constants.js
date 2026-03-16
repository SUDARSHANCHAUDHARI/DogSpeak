export const EXAMPLES = [
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

export const AUDIENCE_OPTIONS = [
  {
    key: 'non-technical',
    label: 'Non-technical',
    prompt:
      'a completely non-technical person (no jargon at all, use everyday analogies like comparing servers to kitchens or traffic)',
  },
  {
    key: 'manager',
    label: 'Manager / exec',
    prompt:
      'a manager or executive (focus entirely on business impact, user impact, revenue risk, and what decisions they need to make)',
  },
  {
    key: 'developer',
    label: 'Junior developer',
    prompt:
      'a junior developer who is new to observability tools, DevOps, and production monitoring',
  },
]

export const SEVERITY_CONFIG = {
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
