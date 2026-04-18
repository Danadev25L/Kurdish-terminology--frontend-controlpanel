import { api } from "./client";
import type {
  DialectEquityData,
  WordVersatilityData,
  DomainHealthData,
} from "./types";

export function getDialectEquity() {
  return api.get<DialectEquityData[]>("/v1/board/analytics/dialect-equity");
}

export function getWordVersatility() {
  return api.get<WordVersatilityData[]>("/v1/board/analytics/word-versatility");
}

export function getDomainHealth() {
  return api.get<DomainHealthData[]>("/v1/board/analytics");
}
