import { api } from "./client";
import type {
  DialectEquityData,
  WordVersatilityData,
  DomainHealthData,
} from "./types";

export function getDialectEquity() {
  return api.get<DialectEquityData[]>("/api/v1/board/analytics/dialect-equity");
}

export function getWordVersatility() {
  return api.get<WordVersatilityData[]>("/api/v1/board/analytics/word-versatility");
}

export function getDomainHealth() {
  return api.get<DomainHealthData[]>("/api/v1/board/analytics");
}
