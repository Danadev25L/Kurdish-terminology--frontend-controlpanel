import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "ku";

interface UIState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "ktp-cp-ui",
      partialize: (state) => ({ language: state.language }),
    }
  )
);