import { api } from "./client";
import type {
  DialectEquityData,
  WordVersatilityData,
  DomainHealthData,
} from "./types";

export function getDialectEquity() {
  return api.get<DialectEquityData[]>("/api/analytics/dialect-equity");
}

export function getWordVersatility() {
  return api.get<WordVersatilityData[]>("/api/analytics/word-versatility");
}

export function getDomainHealth() {
  return api.get<DomainHealthData[]>("/api/analytics/domain-health");
}
