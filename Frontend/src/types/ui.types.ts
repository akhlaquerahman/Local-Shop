export type Size = 'sm' | 'md' | 'lg' | 'xl';

export type ThemeMode = 'light' | 'dark';

export type CardVariant = 'default' | 'outlined' | 'elevated';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'draft' | 'active' | 'inactive';

export type AccentColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export type SpacingScale = 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64;

export type RadiusScale = 'sm' | 'md' | 'lg' | 'xl' | 'none' | 'full';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}
