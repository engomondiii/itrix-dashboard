import { ROUTES } from "@/constants/routes";

/**
 * Sidebar navigation. `icon` is a lucide-react icon name resolved by the
 * Sidebar via NAV_ICONS. Items with `children` render as collapsible groups.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Optional nested links — rendered as a collapsible sub-menu. */
  children?: NavItem[];
}

export interface NavSection {
  /** Section label (uppercase micro-label), or null for the top group. */
  label: string | null;
  items: NavItem[];
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
          { label: "Profile", href: ROUTES.settingsProfile, icon: "User" },
        ],
      },
    ],
  },
];
