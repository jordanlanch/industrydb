'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import organizationService, { Organization } from '@/services/organization.service';
import { useToast } from '@/components/toast-provider';

const STORAGE_KEY = 'industrydb_selected_organization';

interface OrganizationContextType {
  // Current organization state
  currentOrganization: Organization | null;
  isPersonalAccount: boolean;

  // Organizations list
  organizations: Organization[];
  organizationsLoading: boolean;

  // Actions
  switchOrganization: (organizationId: number | null) => void;
  refreshOrganizations: () => Promise<void>;
  clearOrganization: () => void;

  // Computed properties
  canInviteMembers: boolean;
  canManageSettings: boolean;
  isOwner: boolean;
  isAdmin: boolean;

  // Usage limits
  currentUsage: number;
  usageLimit: number;
  usagePercentage: number;
  remainingLeads: number;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);

  // Load organizations on mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setOrganizationsLoading(true);
      const response = await organizationService.listOrganizations();
      setOrganizations(response.organizations);

      // Restore saved organization from localStorage
      const savedOrgId = localStorage.getItem(STORAGE_KEY);
      if (savedOrgId) {
        const savedOrg = response.organizations.find(
          (org) => org.id.toString() === savedOrgId
        );
        if (savedOrg) {
          setCurrentOrganization(savedOrg);
        } else {
          // Saved org no longer exists, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error: any) {
      console.error('Failed to load organizations:', error);
      toast({
        title: 'Failed to load organizations',
        description: error.message || 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setOrganizationsLoading(false);
    }
  };

  const refreshOrganizations = useCallback(async () => {
    await loadOrganizations();
  }, []);

  const switchOrganization = useCallback((organizationId: number | null) => {
    if (organizationId === null) {
      // Switch to personal account
      setCurrentOrganization(null);
      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: 'Switched to Personal Account',
        description: 'You are now using your personal workspace',
        variant: 'default',
      });
    } else {
      // Switch to organization
      const org = organizations.find((o) => o.id === organizationId);
      if (org) {
        setCurrentOrganization(org);
        localStorage.setItem(STORAGE_KEY, organizationId.toString());

        toast({
          title: `Switched to ${org.name}`,
          description: `Now using ${org.name} workspace`,
          variant: 'default',
        });
      }
    }
  }, [organizations, toast]);

  const clearOrganization = useCallback(() => {
    setCurrentOrganization(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Computed properties
  const isPersonalAccount = currentOrganization === null;

  // TODO: Get user's role in current organization from API
  // For now, assume user has full permissions
  const isOwner = false; // currentOrganization?.owner_id === currentUser?.id
  const isAdmin = false; // Check if user's role is 'admin' or 'owner'

  const canInviteMembers = currentOrganization !== null && (isOwner || isAdmin);
  const canManageSettings = currentOrganization !== null && (isOwner || isAdmin);

  // Usage limits
  const currentUsage = currentOrganization?.usage_count ?? 0;
  const usageLimit = currentOrganization?.usage_limit ?? 0;
  const usagePercentage = usageLimit > 0 ? (currentUsage / usageLimit) * 100 : 0;
  const remainingLeads = usageLimit - currentUsage;

  const value: OrganizationContextType = {
    currentOrganization,
    isPersonalAccount,
    organizations,
    organizationsLoading,
    switchOrganization,
    refreshOrganizations,
    clearOrganization,
    canInviteMembers,
    canManageSettings,
    isOwner,
    isAdmin,
    currentUsage,
    usageLimit,
    usagePercentage,
    remainingLeads,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to access organization context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentOrganization, switchOrganization } = useOrganization();
 *
 *   if (currentOrganization) {
 *     return <div>Using {currentOrganization.name}</div>;
 *   }
 *
 *   return <div>Using Personal Account</div>;
 * }
 * ```
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

/**
 * Hook to check if user has specific permission in current organization
 *
 * @example
 * ```tsx
 * function InviteButton() {
 *   const { canInviteMembers } = useOrganization();
 *
 *   if (!canInviteMembers) return null;
 *
 *   return <Button>Invite Member</Button>;
 * }
 * ```
 */
export function useOrganizationPermission() {
  const { canInviteMembers, canManageSettings, isOwner, isAdmin } = useOrganization();

  return {
    canInviteMembers,
    canManageSettings,
    isOwner,
    isAdmin,
  };
}

/**
 * Hook to access organization usage statistics
 *
 * @example
 * ```tsx
 * function UsageDisplay() {
 *   const { currentUsage, usageLimit, usagePercentage, remainingLeads } = useOrganizationUsage();
 *
 *   return (
 *     <div>
 *       <p>Used: {currentUsage} / {usageLimit}</p>
 *       <p>Remaining: {remainingLeads} leads</p>
 *       <ProgressBar value={usagePercentage} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganizationUsage() {
  const { currentUsage, usageLimit, usagePercentage, remainingLeads, currentOrganization } = useOrganization();

  return {
    currentUsage,
    usageLimit,
    usagePercentage,
    remainingLeads,
    hasOrganization: currentOrganization !== null,
  };
}
