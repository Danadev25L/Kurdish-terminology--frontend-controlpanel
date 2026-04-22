"use client";

import { useUIStore } from "@/stores/ui-store";

export function LanguageToggle() {
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);

  const toggle = () => setLanguage(language === "en" ? "ku" : "en");

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    >
      {language === "en" ? "کوردی" : "English"}
    </button>
  );
}