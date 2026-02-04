import { apiClient } from '@/lib/api-client';

export interface APIKey {
  id: number;
  name: string;
  prefix: string;
  key_hash: string;
  last_used_at: string | null;
  usage_count: number;
  revoked: boolean;
  revoked_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  expires_at?: string;
}

export interface CreateAPIKeyResponse {
  id: number;
  name: string;
  key: string; // Plain text key - only shown once!
  prefix: string;
  expires_at: string | null;
  created_at: string;
}

export interface APIKeyStats {
  total_keys: number;
  active_keys: number;
  revoked_keys: number;
  total_usage: number;
  last_used: string | null;
}

export interface UpdateAPIKeyNameRequest {
  name: string;
}

class APIKeyService {
  /**
   * Create a new API key
   * IMPORTANT: The plain text key is only returned once!
   */
  async create(request: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> {
    const response = await apiClient.post('/api-keys', request);
    return response.data.api_key;
  }

  /**
   * List all API keys for the current user
   */
  async list(): Promise<APIKey[]> {
    const response = await apiClient.get('/api-keys');
    return response.data.api_keys;
  }

  /**
   * Get a single API key by ID
   */
  async get(id: number): Promise<APIKey> {
    const response = await apiClient.get(`/api-keys/${id}`);
    return response.data;
  }

  /**
   * Update an API key's name
   */
  async updateName(id: number, name: string): Promise<void> {
    await apiClient.patch(`/api-keys/${id}`, { name });
  }

  /**
   * Revoke an API key (soft delete - can't be undone)
   */
  async revoke(id: number): Promise<void> {
    await apiClient.post(`/api-keys/${id}/revoke`, {});
  }

  /**
   * Delete an API key permanently
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api-keys/${id}`);
  }

  /**
   * Get API key usage statistics
   */
  async getStats(): Promise<APIKeyStats> {
    const response = await apiClient.get('/api-keys/stats');
    return response.data;
  }
}

export const apiKeyService = new APIKeyService();
