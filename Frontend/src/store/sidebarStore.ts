import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isOpenMobile: boolean;
  toggleCollapse: () => void;
  setCollapse: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobile: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isOpenMobile: false,
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapse: (collapsed) => set({ isCollapsed: collapsed }),
  toggleMobile: () => set((state) => ({ isOpenMobile: !state.isOpenMobile })),
  setMobile: (open) => set({ isOpenMobile: open }),
}));
