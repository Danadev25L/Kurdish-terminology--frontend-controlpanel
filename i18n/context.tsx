"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useUIStore } from "@/stores/ui-store";
import { translations } from "./translations";

type Language = "en" | "ku";

interface I18nContextValue {
  locale: Language;
  dir: "ltr" | "rtl";
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  dir: "ltr",
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useUIStore((s) => s.language);

  const value = useMemo<I18nContextValue>(() => {
    const locale = language as Language;
    const dict = translations[locale] ?? translations.en;

    function t(
      key: string,
      params?: Record<string, string | number>
    ): string {
      const parts = key.split(".");
      let result: unknown = dict;
      for (const part of parts) {
        if (result && typeof result === "object" && part in result) {
          result = (result as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }
      if (typeof result !== "string") return key;
      if (!params) return result;
      return result.replace(/\{\{(\w+)\}\}/g, (_, k) =>
        params[k] !== undefined ? String(params[k]) : `{{${k}}}`
      );
    }

    return { locale, dir: locale === "ku" ? "rtl" : "ltr", t };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = value.locale;
    document.documentElement.dir = value.dir;
  }, [value.locale, value.dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}