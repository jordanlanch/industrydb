import { apiClient } from '@/lib/api-client';

export interface DailyUsage {
  date: string;
  search: number;
  export: number;
  total: number;
}

export interface UsageSummary {
  total_searches: number;
  total_exports: number;
  total_leads: number;
  avg_per_day: number;
  peak_day: string;
  peak_count: number;
}

export interface ActionBreakdown {
  action: string;
  count: number;
  percentage: number;
}

export interface DailyUsageResponse {
  daily_usage: DailyUsage[];
  days: number;
}

export interface ActionBreakdownResponse {
  breakdown: ActionBreakdown[];
  days: number;
}

class AnalyticsService {
  /**
   * Get daily usage statistics for the last N days
   * @param days Number of days to retrieve (default: 30, max: 365)
   */
  async getDailyUsage(days: number = 30): Promise<DailyUsageResponse> {
    const response = await apiClient.get<DailyUsageResponse>(`/user/analytics/daily?days=${days}`);
    return response.data;
  }

  /**
   * Get aggregated usage summary
   * @param days Number of days to aggregate (default: 30, max: 365)
   */
  async getUsageSummary(days: number = 30): Promise<UsageSummary> {
    const response = await apiClient.get<UsageSummary>(`/user/analytics/summary?days=${days}`);
    return response.data;
  }

  /**
   * Get usage breakdown by action type
   * @param days Number of days to analyze (default: 30, max: 365)
   */
  async getActionBreakdown(days: number = 30): Promise<ActionBreakdownResponse> {
    const response = await apiClient.get<ActionBreakdownResponse>(`/user/analytics/breakdown?days=${days}`);
    return response.data;
  }
}

export default new AnalyticsService();
