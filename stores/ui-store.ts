import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "ku";

interface UIState {
  language: Language;
  sidebarCollapsed: boolean;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: "en",
      sidebarCollapsed: false,
      setLanguage: (lang) => set({ language: lang }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "ktp-cp-ui",
      partialize: (state) => ({ language: state.language }),
    }
  )
);
