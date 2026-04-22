import { api } from "./client";
import type {
  DialectEquityData,
  WordVersatilityData,
  DomainHealthData,
} from "./types";

export function getDialectEquity() {
  return api.get<DialectEquityData[]>("/api/v1/analytics/dialect-equity");
}

export function getWordVersatility() {
  return api.get<WordVersatilityData[]>("/api/v1/analytics/word-versatility");
}

export function getDomainHealth() {
  return api.get<DomainHealthData[]>("/api/v1/board/analytics");
}

/**
 * GET /api/v1/analytics/my-contributions
 * Get expert's contribution history and alignment metrics
 */
export interface ExpertContribution {
  concept_id: number;
  concept_name: string;
  domain_name: string;
  voted: boolean;
  vote_aligned: boolean | null; // null if concept not published
  candidate_supported: number | null;
  winner_candidate: number | null;
  status: string;
  voted_at: string | null;
  published_at: string | null;
}

export interface ExpertAnalytics {
  total_votes: number;
  aligned_votes: number;
  alignment_rate: number;
  contributions: ExpertContribution[];
  by_domain: {
    domain_name: string;
    total_votes: number;
    aligned_votes: number;
  }[];
}

export function getMyContributions() {
  return api.get<ExpertAnalytics>("/api/v1/analytics/my-contributions");
}
