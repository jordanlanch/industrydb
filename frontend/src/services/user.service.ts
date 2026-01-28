import { apiClient } from '@/lib/api-client';

export interface UsageInfo {
  current_usage: number;
  usage_limit: number;
  remaining: number;
  tier: string;
  last_reset: string;
}

export interface PersonalDataExport {
  user: any;
  subscriptions: any[];
  exports: any[];
  api_keys?: any[];
  usage_logs?: any[];
  exported_at: string;
}

export const userService = {
  /**
   * Get current user's usage statistics
   */
  async getUsage(): Promise<UsageInfo> {
    const response = await apiClient.get('/user/usage');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; email?: string }): Promise<any> {
    const response = await apiClient.patch('/user/profile', data);
    return response.data;
  },

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<{ message: string }> {
    const response = await apiClient.post('/user/onboarding/complete', {});
    return response.data;
  },

  /**
   * Export all personal data (GDPR Article 15 - Right of Access)
   */
  async exportPersonalData(): Promise<PersonalDataExport> {
    const response = await apiClient.get('/user/data-export');
    return response.data;
  },

  /**
   * Delete user account permanently (GDPR Article 17 - Right to be Forgotten)
   * @param password - User's current password for verification
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await apiClient.delete('/user/account', {
      data: { password },
    });
    return response.data;
  },

  /**
   * Download personal data export as JSON file
   */
  async downloadPersonalData(): Promise<void> {
    const data = await this.exportPersonalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `industrydb-personal-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default userService;
