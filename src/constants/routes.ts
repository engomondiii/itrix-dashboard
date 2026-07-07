/**
 * Centralized dashboard route paths. Components/nav must reference these,
 * never hardcode strings. Source: Surface 2 structure (app router map).
 */

export const ROUTES = {
  // auth
  login: "/login",
  logout: "/logout",

  // dashboard
  overview: "/overview",

  leads: "/leads",
  lead: (id: string) => `/leads/${id}`,
  leadsTier: (n: 1 | 2 | 3 | 4) => `/leads/tier-${n}`,

  pipeline: "/pipeline",
  pipelineStage: (stageId: string) => `/pipeline/${stageId}`,

  followUp: "/follow-up",
  followUpOverdue: "/follow-up/overdue",
  followUpToday: "/follow-up/today",

  nda: "/nda",
  ndaLead: (leadId: string) => `/nda/${leadId}`,

  evaluations: "/evaluations",
  evaluation: (id: string) => `/evaluations/${id}`,

  pocs: "/pocs",
  poc: (id: string) => `/pocs/${id}`,

  analytics: "/analytics",
  analyticsFunnel: "/analytics/funnel",
  analyticsLeads: "/analytics/leads",
  analyticsResponseTime: "/analytics/response-time",
  analyticsBottlenecks: "/analytics/bottlenecks",
  analyticsPitch: "/analytics/pitch",

  // Surface 2 v3.0 — agentic operator core
  console: "/console",
  consoleThread: (id: string) => `/console/${id}`,
  agentApprovals: "/agents/approvals",
  agentRuns: "/agents/runs",

  // Surface 2 v3.0 — governance admin
  governanceClaimCards: "/governance/claim-cards",
  governanceClaimCard: (id: string) => `/governance/claim-cards/${id}`,
  governanceAudit: "/governance/audit",
  settingsGovernance: "/settings/governance",

  templates: "/templates",
  templatesEmails: "/templates/emails",
  templatesFollowUp: "/templates/follow-up",
  templatesEvaluation: "/templates/evaluation",
  templatesPoc: "/templates/poc",
  templatesHandoff: "/templates/handoff",

  reporting: "/reporting",
  report: (id: string) => `/reporting/${id}`,

  settings: "/settings",
  settingsTeam: "/settings/team",
  settingsNotifications: "/settings/notifications",
  settingsSla: "/settings/sla",
  settingsProfile: "/settings/profile",
} as const;

/** API (Next proxy) endpoints — used by lib/api fetchers. */
export const API = {
  authLogin: "/api/auth/login",
  authLogout: "/api/auth/logout",
  me: "/api/auth/me",
  leads: "/api/leads",
  lead: (id: string) => `/api/leads/${id}`,
  leadAssign: (id: string) => `/api/leads/${id}/assign`,
  leadStatus: (id: string) => `/api/leads/${id}/status`,
  leadNote: (id: string) => `/api/leads/${id}/note`,
  leadEscalate: (id: string) => `/api/leads/${id}/escalate`,
  leadNda: (id: string) => `/api/leads/${id}/nda`,
  leadEvaluation: (id: string) => `/api/leads/${id}/evaluation`,
  leadPoc: (id: string) => `/api/leads/${id}/poc`,
  leadMeeting: (id: string) => `/api/leads/${id}/meeting`,
  followUp: "/api/follow-up",
  followUpTask: (taskId: string) => `/api/follow-up/${taskId}`,
  nda: "/api/nda",
  ndaItem: (leadId: string) => `/api/nda/${leadId}`,
  evaluations: "/api/evaluations",
  evaluation: (id: string) => `/api/evaluations/${id}`,
  evaluationKpi: (id: string, kpiId: string) =>
    `/api/evaluations/${id}/kpis/${kpiId}`,
  pocs: "/api/pocs",
  poc: (id: string) => `/api/pocs/${id}`,
  pocMilestone: (id: string, milestoneId: string) =>
    `/api/pocs/${id}/milestones/${milestoneId}`,
  pocKpi: (id: string, kpiId: string) => `/api/pocs/${id}/kpis/${kpiId}`,
  pocRisks: (id: string) => `/api/pocs/${id}/risks`,
  pocRisk: (id: string, riskId: string) => `/api/pocs/${id}/risks/${riskId}`,
  emailSend: "/api/email/send",
  // Surface 2 v3.0 — journey monitor
  journeyLead: (id: string) => `/api/journey/leads/${id}`,
  journeyAdvance: (id: string) => `/api/journey/leads/${id}/advance`,
  journeyOverview: "/api/journey/overview",
  // Surface 2 v3.0 — agent oversight
  agentApprovalQueue: "/api/agents/approval-queue",
  agentApprovalAction: (id: string, action: "approve" | "edit" | "reject") =>
    `/api/agents/approval/${id}/${action}`,
  agentRuns: "/api/agents/runs",
  agentRun: (key: string) => `/api/agents/${key}/run`,
  // Surface 2 v3.0 — cockpit
  cockpitLead: (id: string) => `/api/cockpit/leads/${id}`,
  cockpitNextAction: (id: string) => `/api/cockpit/leads/${id}/next-action`,
  analyticsPitch: "/api/analytics/pitch",
  // Surface 2 v3.0 — console
  consoleConversations: "/api/console/conversations",
  consoleMessages: (id: string) => `/api/console/conversations/${id}/messages`,
  consoleMessage: (id: string) => `/api/console/conversations/${id}/message`,
  // Surface 2 v3.0 — governance
  governanceClaimCards: "/api/governance/claim-cards",
  governanceClaimCard: (id: string) => `/api/governance/claim-cards/${id}`,
  governanceAudit: "/api/governance/audit",
  pipeline: "/api/pipeline",
  analyticsOverview: "/api/analytics/overview",
  analyticsFunnel: "/api/analytics/funnel",
  analyticsResponseTime: "/api/analytics/response-time",
  analyticsBottlenecks: "/api/analytics/bottlenecks",
  templates: "/api/templates",
  template: (id: string) => `/api/templates/${id}`,
  reporting: "/api/reporting",
  report: (id: string) => `/api/reporting/${id}`,
  reportSections: (id: string) => `/api/reporting/${id}/sections`,
  reportSection: (id: string, sectionId: string) =>
    `/api/reporting/${id}/sections/${sectionId}`,
  team: "/api/team",
  teamMember: (id: string) => `/api/team/${id}`,
  notifications: "/api/notifications",
  notification: (id: string) => `/api/notifications/${id}`,
  settingsProfile: "/api/settings/profile",
  settingsSla: "/api/settings/sla",
  settingsNotifications: "/api/settings/notifications",
} as const;
