import { ROUTES } from "@/constants/routes";
import { isFeatureEnabled, type FeatureFlag } from "@/config/site.config";

/**
 * Sidebar navigation. `icon` is a lucide-react icon name resolved by the
 * Sidebar via NAV_ICONS. Items with `children` render as collapsible groups.
 * An optional `flag` hides the item/section until that feature flag is on.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Optional nested links — rendered as a collapsible sub-menu. */
  children?: NavItem[];
  /** Hide until this feature flag is enabled. */
  flag?: FeatureFlag;
}

export interface NavSection {
  /** Section label (uppercase micro-label), or null for the top group. */
  label: string | null;
  items: NavItem[];
  /** Hide the whole section until this feature flag is enabled. */
  flag?: FeatureFlag;
}

export const navigation: NavSection[] = [
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
    label: "Operations",
    flag: "agentConsole",
    items: [
      { label: "Console", href: ROUTES.console, icon: "MessagesSquare" },
      { label: "Approvals", href: ROUTES.agentApprovals, icon: "ShieldCheck" },
      { label: "Agent runs", href: ROUTES.agentRuns, icon: "History" },
    ],
  },
  {
    label: "Governance",
    flag: "governance",
    items: [
      { label: "Claim-Cards", href: ROUTES.governanceClaimCards, icon: "BadgeCheck" },
      { label: "Audit", href: ROUTES.governanceAudit, icon: "ScrollText" },
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
          { label: "Pitch", href: ROUTES.analyticsPitch, icon: "Presentation", flag: "cockpit" },
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
            flag: "governance",
          },
          { label: "Profile", href: ROUTES.settingsProfile, icon: "User" },
        ],
      },
    ],
  },
];

/** Navigation with feature-flagged sections/items/children filtered out. */
export function visibleNavigation(): NavSection[] {
  return navigation
    .filter((section) => isFeatureEnabled(section.flag))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => isFeatureEnabled(item.flag))
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => isFeatureEnabled(child.flag)),
        })),
    }))
    .filter((section) => section.items.length > 0);
}
