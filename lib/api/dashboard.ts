import { api } from "./client";

interface DashboardStats {
  total_concepts: number;
  published_terms: number;
  active_domains: number;
  pending_reviews: number;
  recent_activity_count: number;
}

interface ConceptsByDomain {
  domain_name: string;
  count: number;
  published_count: number;
}

interface PublicationTrend {
  date: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  created_at: string;
  user?: {
    name: string;
  };
}

/**
 * GET /api/v1/dashboard/stats
 * Get overall dashboard statistics
 */
export function getDashboardStats() {
  return api.get<DashboardStats>("/api/v1/dashboard/stats");
}

/**
 * GET /api/v1/dashboard/concepts-by-domain
 * Get concepts count by domain
 */
export function getConceptsByDomain() {
  return api.get<ConceptsByDomain[]>("/api/v1/dashboard/concepts-by-domain");
}

/**
 * GET /api/v1/dashboard/publication-trend
 * Get publication trend over time
 */
export function getPublicationTrend(days: number = 30) {
  return api.get<PublicationTrend[]>(`/api/v1/dashboard/publication-trend?days=${days}`);
}

/**
 * GET /api/v1/dashboard/status-distribution
 * Get concepts by status
 */
export function getStatusDistribution() {
  return api.get<StatusDistribution[]>("/api/v1/dashboard/status-distribution");
}

/**
 * GET /api/v1/dashboard/priority-distribution
 * Get concepts by priority
 */
export function getPriorityDistribution() {
  return api.get<PriorityDistribution[]>("/api/v1/dashboard/priority-distribution");
}

/**
 * GET /api/v1/dashboard/recent-activity
 * Get recent activity across all concepts
 */
export function getRecentActivity(limit: number = 20) {
  return api.get<RecentActivity[]>(`/api/v1/dashboard/recent-activity?limit=${limit}`);
}
