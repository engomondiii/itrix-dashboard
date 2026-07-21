import { ROUTES } from "@/constants/routes";
import { features } from "@/config/features.config";

/**
 * Sidebar navigation. `icon` is a lucide-react icon name resolved by the
 * Sidebar via NAV_ICONS. Items with `children` render as collapsible groups.
 *
 * FLAG-GATED SECTIONS. The five v5.0 areas (threads, attachments, customers,
 * support, personas) are reserved here and filtered out until their flag is on,
 * so a build with the flags off is byte-for-byte the shipped v3.0 CRM
 * navigation. `enabled` is evaluated once at module scope — `NEXT_PUBLIC_*` is
 * inlined at build time, so there is nothing dynamic to react to.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Optional nested links — rendered as a collapsible sub-menu. */
  children?: NavItem[];
  /** When false, the item is not rendered. Defaults to true. */
  enabled?: boolean;
}

export interface NavSection {
  /** Section label (uppercase micro-label), or null for the top group. */
  label: string | null;
  items: NavItem[];
}

const rawNavigation: NavSection[] = [
  {
    label: null,
    items: [{ label: "Overview", href: ROUTES.overview, icon: "LayoutDashboard" }],
  },
  {
    label: "Pipeline",
    items: [
      { label: "Leads", href: ROUTES.leads, icon: "Users" },
      { label: "Pipeline", href: ROUTES.pipeline, icon: "KanbanSquare" },
      {
        label: "Follow-up",
        href: ROUTES.followUp,
        icon: "Clock",
        children: [
          { label: "Today", href: ROUTES.followUpToday, icon: "CalendarClock" },
          { label: "Overdue", href: ROUTES.followUpOverdue, icon: "AlertTriangle" },
        ],
      },
      { label: "NDA", href: ROUTES.nda, icon: "FileSignature" },
    ],
  },
  {
    label: "Deals",
    items: [
      { label: "Evaluations", href: ROUTES.evaluations, icon: "ClipboardCheck" },
      { label: "PoCs", href: ROUTES.pocs, icon: "FlaskConical" },
    ],
  },
  {
    label: "Conversations",
    items: [
      {
        label: "Threads",
        href: ROUTES.threads,
        icon: "Radio",
        enabled: features.threadOversight,
        children: [
          {
            label: "Loop productivity",
            href: ROUTES.threadsCoverage,
            icon: "Target",
            enabled: features.coverageReading,
          },
        ],
      },
      {
        label: "Attachments",
        href: ROUTES.attachments,
        icon: "Paperclip",
        enabled: features.attachmentReview,
      },
      { label: "Console", href: ROUTES.console, icon: "MessagesSquare" },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "Customers",
        href: ROUTES.customers,
        icon: "HeartHandshake",
        enabled: features.customerSuccess,
        children: [
          {
            label: "Outcomes",
            href: ROUTES.customersOutcomes,
            icon: "Target",
            enabled: features.customerSuccess,
          },
          {
            label: "Success reviews",
            href: ROUTES.customersReviews,
            icon: "CalendarCheck",
            enabled: features.customerSuccess,
          },
        ],
      },
      {
        label: "Support",
        href: ROUTES.support,
        icon: "LifeBuoy",
        enabled: features.customerSuccess,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Approvals", href: ROUTES.agentApprovals, icon: "ShieldCheck" },
      { label: "Agent runs", href: ROUTES.agentRuns, icon: "History" },
      { label: "Personas", href: ROUTES.personas, icon: "Contact" },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Claim-Cards", href: ROUTES.governanceClaimCards, icon: "BadgeCheck" },
      { label: "Audit", href: ROUTES.governanceAudit, icon: "ScrollText" },
      {
        label: "Streaming",
        href: ROUTES.governanceStreaming,
        icon: "Waves",
        enabled: features.streamingApproval,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        href: ROUTES.analytics,
        icon: "BarChart3",
        children: [
          { label: "Funnel", href: ROUTES.analyticsFunnel, icon: "Filter" },
          { label: "Leads", href: ROUTES.analyticsLeads, icon: "Users" },
          { label: "Response time", href: ROUTES.analyticsResponseTime, icon: "Timer" },
          { label: "Bottlenecks", href: ROUTES.analyticsBottlenecks, icon: "Gauge" },
          { label: "Pitch", href: ROUTES.analyticsPitch, icon: "Presentation" },
          {
            label: "Conversations",
            href: ROUTES.analyticsConversations,
            icon: "Radio",
            enabled: features.threadOversight,
          },
          {
            label: "Attachments",
            href: ROUTES.analyticsAttachments,
            icon: "Paperclip",
            enabled: features.attachmentReview,
          },
          {
            label: "Streaming",
            href: ROUTES.analyticsStreaming,
            icon: "Waves",
            enabled: features.streamingApproval,
          },
          {
            label: "Customers",
            href: ROUTES.analyticsCustomers,
            icon: "HeartHandshake",
            enabled: features.customerSuccess,
          },
          {
            label: "Support",
            href: ROUTES.analyticsSupport,
            icon: "LifeBuoy",
            enabled: features.customerSuccess,
          },
          {
            label: "Outcomes",
            href: ROUTES.analyticsOutcomes,
            icon: "Activity",
            enabled: features.customerSuccess,
          },
        ],
      },
      { label: "Reporting", href: ROUTES.reporting, icon: "FileText" },
    ],
  },
  {
    label: "Library",
    items: [
      {
        label: "Templates",
        href: ROUTES.templates,
        icon: "LayoutTemplate",
        children: [
          { label: "Emails", href: ROUTES.templatesEmails, icon: "Mail" },
          { label: "Follow-up", href: ROUTES.templatesFollowUp, icon: "Clock" },
          { label: "Evaluation", href: ROUTES.templatesEvaluation, icon: "ClipboardCheck" },
          { label: "PoC", href: ROUTES.templatesPoc, icon: "FlaskConical" },
          { label: "Handoff", href: ROUTES.templatesHandoff, icon: "Send" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: ROUTES.settings,
        icon: "Settings",
        children: [
          { label: "Team", href: ROUTES.settingsTeam, icon: "UsersRound" },
          { label: "Notifications", href: ROUTES.settingsNotifications, icon: "Bell" },
          { label: "SLA", href: ROUTES.settingsSla, icon: "Timer" },
          {
            label: "Governance",
            href: ROUTES.settingsGovernance,
            icon: "ShieldCheck",
          },
          { label: "Profile", href: ROUTES.settingsProfile, icon: "User" },
        ],
      },
    ],
  },
];

/** Drop disabled items (and their children), then drop any section left empty. */
function prune(items: NavItem[]): NavItem[] {
  return items
    .filter((item) => item.enabled !== false)
    .map((item) =>
      item.children ? { ...item, children: prune(item.children) } : item,
    );
}

export const navigation: NavSection[] = rawNavigation
  .map((section) => ({ ...section, items: prune(section.items) }))
  .filter((section) => section.items.length > 0);
