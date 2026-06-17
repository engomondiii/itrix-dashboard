import {
  LayoutDashboardIcon,
  UsersIcon,
  KanbanSquareIcon,
  ClockIcon,
  FileSignatureIcon,
  ClipboardCheckIcon,
  FlaskConicalIcon,
  BarChart3Icon,
  FileTextIcon,
  LayoutTemplateIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";

/** Resolves the string icon names used in navigation.config to components. */
export const NAV_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  Users: UsersIcon,
  KanbanSquare: KanbanSquareIcon,
  Clock: ClockIcon,
  FileSignature: FileSignatureIcon,
  ClipboardCheck: ClipboardCheckIcon,
  FlaskConical: FlaskConicalIcon,
  BarChart3: BarChart3Icon,
  FileText: FileTextIcon,
  LayoutTemplate: LayoutTemplateIcon,
  Settings: SettingsIcon,
};
