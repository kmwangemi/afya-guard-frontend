import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  selectedClaim: number | null;
  selectedAlert: number | null;
  selectedProvider: number | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSelectedClaim: (id: number | null) => void;
  setSelectedAlert: (id: number | null) => void;
  setSelectedProvider: (id: number | null) => void;
}

export const useUIStore = create<UIState>(set => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  selectedClaim: null,
  selectedAlert: null,
  selectedProvider: null,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: open => set({ sidebarOpen: open }),
  toggleMobileMenu: () =>
    set(state => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: open => set({ mobileMenuOpen: open }),
  setSelectedClaim: id => set({ selectedClaim: id }),
  setSelectedAlert: id => set({ selectedAlert: id }),
  setSelectedProvider: id => set({ selectedProvider: id }),
}));
