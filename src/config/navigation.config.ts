import { ROUTES } from "@/constants/routes";

/**
 * Sidebar navigation. `icon` is a lucide-react icon name resolved by the
 * Sidebar component (Phase 3). Sections render as grouped nav blocks.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface NavSection {
  /** Section label (10px uppercase micro-label), or null for the top group. */
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
      { label: "Follow-up", href: ROUTES.followUp, icon: "Clock" },
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
      { label: "Analytics", href: ROUTES.analytics, icon: "BarChart3" },
      { label: "Reporting", href: ROUTES.reporting, icon: "FileText" },
    ],
  },
  {
    label: "Library",
    items: [{ label: "Templates", href: ROUTES.templates, icon: "LayoutTemplate" }],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: ROUTES.settings, icon: "Settings" }],
  },
];
