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
  name_i18n?: { ku?: string };
  slug: string;
}

export interface Domain {
  id: number;
  name: string;
  name_i18n?: { ku?: string };
  slug: string;
  description: string | null;
  description_i18n?: { ku?: string };
  head_user_id: number | null;
  head_user?: User;
  members_count?: number;
  experts_count?: number;
  concepts_count?: number;
  is_active?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DomainMember {
  id: number;
  name: string;
  email: string;
  role: "expert" | "observer";
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
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
  is_winner?: boolean;
  is_active?: boolean;
  metrics?: CandidateMetrics;
  created_at: string;
}

export interface DeactivatedCandidate {
  id: number;
  kurdish_word: string;
  proposer_name: string;
  consensus_score: number;
  mean_score: number;
  std_deviation: number;
  vote_count: number;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeactivatedPublicTerm {
  id: number;
  kurdish_word: string;
  approved_at: string;
  deactivated_at: string;
  deactivated_by_name: string;
}

export interface CandidatesHistoryResponse {
  deactivated_candidates: DeactivatedCandidate[];
  deactivated_public_terms: DeactivatedPublicTerm[];
}

export interface CandidateMetrics {
  mean: number;
  std_dev: number;
  consensus_score: number;
  vote_count: number;
  score_distribution?: Record<number, number>; // 1-10 score counts
}

// ── Discussions ──
export interface DiscussionReactions {
  upvotes_count: number;
  downvotes_count: number;
  user_reaction: "upvote" | "downvote" | null;
}

export interface DiscussionReply {
  id: number;
  body: string;
  author: { id: number; name: string };
  created_at: string;
}

export interface Discussion {
  id: number;
  body: string;
  author: { id: number; name: string };
  is_edited: boolean;
  edited_at: string | null;
  reactions: DiscussionReactions;
  replies_count: number;
  replies: DiscussionReply[];
  created_at: string;
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
  is_active?: boolean;
}

// Historical (deactivated) public term
export interface HistoricalPublicTerm {
  id: number;
  concept_id: number;
  english_word: string;
  english_definition: string;
  kurdish_word: string;
  kurdish_dialect?: string;
  part_of_speech?: string;
  usage_example?: string;
  approved_at: string;
  deactivated_at: string;
  approved_by_name: string;
  deactivated_by_name: string;
  domain_name: string;
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
  user?: { id: number; name: string };
  action: string;
  model_type: string;
  model_id: number;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string;
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

// ── Concept History & Metrics ──
export interface ConceptHistoryEntry {
  id: number;
  concept_id: number;
  event_type: "created" | "updated" | "status_changed" | "candidate_added" | "candidate_withdrawn" | "voting_started" | "voting_closed" | "approved" | "vetoed" | "recalled" | "reopened";
  description: string;
  user_id: number;
  user?: User;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ConceptMetrics {
  concept_id: number;
  total_candidates: number;
  active_candidates: number;
  total_votes: number;
  total_discussions: number;
  avg_consensus_score: number;
  controversy_score: number;
  days_in_stage: number;
  participation_rate: number;
}

export interface ConceptActivityEntry {
  id: number;
  concept_id: number;
  activity_type: string;
  description: string;
  user_id: number;
  user?: User;
  created_at: string;
}

export interface VotesSummary {
  concept_id: number;
  threshold_result?: {
    yes_count: number;
    no_count: number;
    total_eligible: number;
    yes_ratio: number;
    passed: boolean;
  };
  consensus_results?: {
    candidate_id: number;
    kurdish_term: string;
    mean_score: number;
    std_dev: number;
    consensus_score: number;
    vote_count: number;
  }[];
}

// ── Errata ──
export type ErrataStatus = "pending" | "in_progress" | "resolved" | "rejected";

export interface Errata {
  id: number;
  concept_id: number;
  submitter_name?: string;
  submitter_email?: string;
  report_type?: "typo" | "definition" | "usage" | "other";
  issue_description: string;
  suggested_correction?: string;
  status: ErrataStatus;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicErrataSubmission {
  concept_id: number;
  reporter_name?: string;
  reporter_email?: string;
  issue_description: string;
  suggested_correction?: string;
}

// ── Recalls ──
export type RecallStatus = "pending" | "approved" | "rejected" | "expired";
export type RecallVoteType = "support" | "oppose";

export interface Recall {
  id: number;
  concept_id: number;
  concept?: {
    id: number;
    english_term: string;
    kurdish_term: string;
  };
  requester_id: number;
  requester?: User;
  reason: string;
  status: RecallStatus;
  support_count: number;
  oppose_count: number;
  net_votes: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface RecallSubmission {
  concept_id: number;
  reason: string;
}

export interface RecallVote {
  recall_id: number;
  vote: RecallVoteType;
}

// ── Export/Import ──
export type ExportFormat = "csv" | "json";
export type ExportScope = "concepts" | "domain" | "public_terms";

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  domain_id?: number;
  include_candidates?: boolean;
  include_metadata?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
}

export interface ImportTemplate {
  format: ExportFormat;
  template_url: string;
  example_data: Record<string, unknown>[];
}

// ── Domain Experts ──
export interface DomainExpert {
  user_id: number;
  user: User;
  domains: Array<{
    domain_id: number;
    domain_name: string;
    role: string;
  }>;
  expertise_count: number;
}

// ── API Keys ──
export interface ApiKey {
  id: number;
  name: string;
  last_four: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  abilities: string[];
  created_at: string;
}

export interface CreateApiKeyData {
  name: string;
  abilities?: string[];
  expires_in_days?: number;
}

export interface CreateApiKeyResponse {
  id: number;
  name: string;
  key: string; // Only shown on creation!
  last_four: string;
  expires_at: string | null;
  abilities: string[];
  message: string;
}

// ── MFA ──
export interface MfaStatus {
  mfa_enabled: boolean;
  requires_mfa: boolean;
  setup_required: boolean;
  has_backup_codes: boolean;
}

export interface MfaInitializeData {
  secret: string;
  provisioning_uri: string;
  message: string;
}

export interface MfaEnabledData {
  enabled: boolean;
  backup_codes: string[];
  message: string;
}

// ── My Dashboard ──
export interface MyDashboardUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
}

export interface MyDashboardDomain {
  id: number;
  name: string;
  slug: string;
  role: string;
  concepts_count: number;
}

export interface MyDashboardStats {
  domains_count: number;
  votes_cast: number;
  discussions_posted: number;
  candidates_proposed: number;
}

export interface ExpertRoleData {
  pending_tasks: number;
  concepts_needing_vote: number;
  recent_discussions: Array<{
    id: number;
    body: string;
    created_at: string;
    domain_name: string;
    english_term: string;
  }>;
}

export interface DomainHeadRoleData {
  managed_domains: Array<{
    id: number;
    name: string;
    slug: string;
    pending_concepts: number;
    total_concepts: number;
  }>;
  pending_concepts: number;
}

export interface BoardMemberRoleData {
  review_queue_count: number;
  recent_approvals: Array<{
    id: number;
    updated_at: string;
  }>;
}

export interface AdminRoleData {
  pending_user_approvals: number;
  total_domains: number;
  total_users: number;
  total_concepts: number;
}

export interface RoleSpecificData {
  expert?: ExpertRoleData;
  domain_head?: DomainHeadRoleData;
  board_member?: BoardMemberRoleData;
  admin?: AdminRoleData;
}

export interface MyDashboardData {
  user: MyDashboardUser;
  my_domains: MyDashboardDomain[];
  my_stats: MyDashboardStats;
  role_specific: RoleSpecificData;
}
