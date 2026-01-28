import { apiClient } from '@/lib/api-client';

// Types
export interface Organization {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  subscription_tier: 'free' | 'starter' | 'pro' | 'business';
  usage_limit: number;
  usage_count: number;
  last_reset_at: string;
  stripe_customer_id?: string;
  billing_email?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by_email?: string;
  status: 'pending' | 'active' | 'suspended';
  invited_at?: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  edges?: {
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  tier?: 'free' | 'starter' | 'pro' | 'business';
  limit?: number;
}

export interface UpdateOrganizationRequest {
  name?: string;
  billing_email?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member' | 'viewer';
}

class OrganizationService {
  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.post<Organization>('/organizations', data);
    return response.data;
  }

  /**
   * List all organizations the current user belongs to
   */
  async listOrganizations(): Promise<{ organizations: Organization[]; total: number }> {
    const response = await apiClient.get<{ organizations: Organization[]; total: number }>(
      '/organizations'
    );
    return response.data;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id: number): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response.data;
  }

  /**
   * Update organization details
   */
  async updateOrganization(
    id: number,
    data: UpdateOrganizationRequest
  ): Promise<Organization> {
    const response = await apiClient.patch<Organization>(`/organizations/${id}`, data);
    return response.data;
  }

  /**
   * Delete organization (soft delete)
   */
  async deleteOrganization(id: number): Promise<void> {
    await apiClient.delete(`/organizations/${id}`);
  }

  /**
   * List all members of an organization
   */
  async listMembers(
    organizationId: number
  ): Promise<{ members: OrganizationMember[]; total: number }> {
    const response = await apiClient.get<{ members: OrganizationMember[]; total: number }>(
      `/organizations/${organizationId}/members`
    );
    return response.data;
  }

  /**
   * Invite a new member to the organization
   */
  async inviteMember(
    organizationId: number,
    data: InviteMemberRequest
  ): Promise<{ message: string; member: OrganizationMember }> {
    const response = await apiClient.post<{ message: string; member: OrganizationMember }>(
      `/organizations/${organizationId}/invite`,
      data
    );
    return response.data;
  }

  /**
   * Remove a member from the organization
   */
  async removeMember(organizationId: number, userId: number): Promise<void> {
    await apiClient.delete(`/organizations/${organizationId}/members/${userId}`);
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(
    organizationId: number,
    userId: number,
    data: UpdateMemberRoleRequest
  ): Promise<void> {
    await apiClient.patch(`/organizations/${organizationId}/members/${userId}`, data);
  }

  /**
   * Generate a slug from organization name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default new OrganizationService();
