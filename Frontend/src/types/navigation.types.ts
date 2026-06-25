import { Permission, UserRole } from '@/constants/permissions';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: Permission;
  role?: UserRole;
  badge?: string | number;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface CommandPaletteAction {
  id: string;
  title: string;
  description?: string;
  section: string;
  onSelect: () => void;
  icon?: string;
}
