import { apiClient } from '@/lib/api-client';

export interface AdminStats {
  users: {
    total: number;
    verified: number;
    active_subscriptions: number;
  };
  subscriptions: {
    free: number;
    starter: number;
    pro: number;
    business: number;
  };
  exports: {
    total: number;
    this_month: number;
  };
  timestamp: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  subscription_tier: string;
  role: string;
  usage_count: number;
  usage_limit: number;
  email_verified: boolean;
  created_at: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminService = {
  /**
   * Get platform statistics
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/admin/stats');
    return response.data;
  },

  /**
   * List users with pagination and filters
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    tier?: string;
    verified?: string;
    role?: string;
  }): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>('/admin/users', { params });
    return response.data;
  },

  /**
   * Get detailed user information
   */
  async getUser(userId: number): Promise<any> {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user details (admin only)
   */
  async updateUser(
    userId: number,
    updates: {
      subscription_tier?: string;
      role?: string;
      email_verified?: boolean;
      usage_limit?: number;
    }
  ): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${userId}`, updates);
    return response.data;
  },

  /**
   * Suspend user account (soft delete)
   */
  async suspendUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
