// ── Pagination ──
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ── Auth ──
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  domains: DomainSummary[];
  created_at: string;
}

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// ── Domains ──
export interface DomainSummary {
  id: number;
  name: string;
  slug: string;
}

export interface Domain {
  id: number;
  name: string;
  slug: string;
  description: string;
  head_user_id: number;
  head_user?: User;
  members_count?: number;
  concepts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DomainMember {
  user_id: number;
  user: User;
  role: "expert" | "observer";
  joined_at: string;
}

// ── Lexicons ──
export interface LexiconWord {
  id: number;
  word: string;
  part_of_speech: string;
  etymology?: string;
  root_word?: string;
  dialect_tag?: string;
  created_at: string;
}

export interface LexiconSynonym {
  id: number;
  word_id: number;
  synonym_id: number;
  source_id?: number;
}

// ── Concepts ──
export type ConceptStatus =
  | "draft"
  | "threshold"
  | "voting"
  | "review"
  | "published"
  | "recalled";

export interface Concept {
  id: number;
  domain_id: number;
  domain?: Domain;
  english_term_id: number;
  english_term?: LexiconWord;
  definition: string;
  status: ConceptStatus;
  priority: "critical" | "urgent" | "high" | "normal" | "low";
  stage_entered_at: string;
  threshold_deadline?: string;
  voting_deadline?: string;
  candidates?: Candidate[];
  winner_candidate_id?: number;
  winner_candidate?: Candidate;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// ── Candidates ──
export interface Candidate {
  id: number;
  concept_id: number;
  kurdish_term_id: number;
  kurdish_term?: LexiconWord;
  morphology_notes?: string;
  usage_example?: string;
  author_id: number;
  author?: User;
  withdrawn_at?: string;
  metrics?: CandidateMetrics;
  created_at: string;
}

export interface CandidateMetrics {
  mean: number;
  std_dev: number;
  consensus_score: number;
  vote_count: number;
}

// ── Discussions ──
export interface Discussion {
  id: number;
  concept_id: number;
  body: string;
  parent_id?: number;
  author_id: number;
  author?: User;
  reactions_count: number;
  user_reacted: boolean;
  deleted_at?: string;
  replies?: Discussion[];
  created_at: string;
  updated_at: string;
}

// ── Voting ──
export interface ThresholdVote {
  id: number;
  concept_id: number;
  user_id: number;
  vote: boolean;
  created_at: string;
}

export interface ThresholdResult {
  yes_count: number;
  no_count: number;
  total_eligible: number;
  yes_ratio: number;
  passed: boolean;
  user_voted: boolean;
  user_vote?: boolean;
}

export interface ConsensusVote {
  candidate_id: number;
  score: number; // 1-10
}

export interface ConsensusVotePayload {
  votes: ConsensusVote[];
}

// ── Board ──
export interface BoardDecision {
  id: number;
  concept_id: number;
  board_member_id: number;
  action: "approve" | "veto" | "request_info";
  reason?: string;
  note?: string;
  created_at: string;
}

export interface ReviewQueueItem {
  id: number;
  concept: Concept;
  leading_candidate?: Candidate;
  close_call: boolean;
  consensus_score: number;
  vote_count: number;
  updated_at: string;
}

export interface BatchApproveResult {
  results: {
    concept_id: number;
    success: boolean;
    message?: string;
  }[];
}

// ── Public Terms ──
export interface PublicTerm {
  id: number;
  english_term: string;
  kurdish_term: string;
  definition: string;
  domain: string;
  dialect_tag?: string;
  part_of_speech?: string;
  usage_example?: string;
  published_at: string;
}

// ── References ──
export type ReferenceSourceType = "academic" | "dictionary" | "government" | "encyclopedia" | "journal" | "other";

export interface ReferenceSource {
  id: number;
  name: string;
  type: ReferenceSourceType;
  description?: string;
  url?: string;
  is_verified?: boolean;
  entry_count?: number;
  created_at: string;
}

export interface ReferenceEntry {
  id: number;
  source_id: number;
  english_word: string;
  kurdish_word: string;
  definition?: string;
}

// ── Notifications ──
export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  concept_id?: number;
  created_at: string;
}

// ── Audit ──
export interface AuditEvent {
  id: number;
  user_id: number;
  user?: User;
  action: string;
  entity_type: string;
  entity_id: number;
  details?: Record<string, unknown>;
  created_at: string;
}

// ── Settings ──
export interface Setting {
  key: string;
  value: string;
}

// ── Analytics ──
export interface DialectEquityData {
  dialect: string;
  count: number;
  percentage: number;
}

export interface WordVersatilityData {
  kurdish_term: string;
  concept_count: number;
  domains: string[];
}

export interface DomainHealthData {
  domain_id: number;
  domain_name: string;
  total_concepts: number;
  finalized_count: number;
  finalized_percentage: number;
  avg_controversy: number;
}
