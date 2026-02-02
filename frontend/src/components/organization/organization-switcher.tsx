'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import organizationService, { Organization } from '@/services/organization.service';
import { useToast } from '@/components/toast-provider';

const STORAGE_KEY = 'industrydb_selected_organization';

interface OrganizationSwitcherProps {
  onOrganizationChange?: (organization: Organization | null) => void;
  showCreateButton?: boolean;
}

export function OrganizationSwitcher({
  onOrganizationChange,
  showCreateButton = false,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('personal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationService.listOrganizations();
      setOrganizations(response.organizations);

      // Load saved selection from localStorage
      const savedOrgId = localStorage.getItem(STORAGE_KEY);
      if (savedOrgId && response.organizations.find((org) => org.id.toString() === savedOrgId)) {
        setSelectedOrgId(savedOrgId);
        const selectedOrg = response.organizations.find((org) => org.id.toString() === savedOrgId);
        if (onOrganizationChange && selectedOrg) {
          onOrganizationChange(selectedOrg);
        }
      } else {
        // Default to personal account
        setSelectedOrgId('personal');
        if (onOrganizationChange) {
          onOrganizationChange(null);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load organizations',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationChange = (value: string) => {
    if (value === 'create-new') {
      router.push('/dashboard/organizations/new');
      return;
    }

    setSelectedOrgId(value);

    // Save to localStorage
    if (value === 'personal') {
      localStorage.removeItem(STORAGE_KEY);
      if (onOrganizationChange) {
        onOrganizationChange(null);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, value);
      const selectedOrg = organizations.find((org) => org.id.toString() === value);
      if (onOrganizationChange && selectedOrg) {
        onOrganizationChange(selectedOrg);
      }
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-700';
      case 'starter':
        return 'bg-blue-100 text-blue-700';
      case 'pro':
        return 'bg-purple-100 text-purple-700';
      case 'business':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrgInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Select value={selectedOrgId} onValueChange={handleOrganizationChange}>
      <SelectTrigger className="w-full min-w-[200px]">
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOrgId === 'personal' ? (
            <>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <SelectValue>
                <span className="truncate">Personal Account</span>
              </SelectValue>
            </>
          ) : (
            <>
              {(() => {
                const org = organizations.find((o) => o.id.toString() === selectedOrgId);
                return org ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {getOrgInitial(org.name)}
                      </span>
                    </div>
                    <SelectValue>
                      <span className="truncate">{org.name}</span>
                    </SelectValue>
                  </>
                ) : (
                  <SelectValue />
                );
              })()}
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="w-[280px]">
        {/* Personal Account */}
        <SelectItem value="personal">
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Personal Account</span>
              <span className="text-xs text-muted-foreground">Individual workspace</span>
            </div>
          </div>
        </SelectItem>

        {/* Organizations */}
        {organizations.length > 0 && (
          <>
            <div className="px-2 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Organizations
              </span>
            </div>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id.toString()}>
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {getOrgInitial(org.name)}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{org.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getTierBadgeColor(org.subscription_tier)}`}
                      >
                        {org.subscription_tier.charAt(0).toUpperCase() +
                          org.subscription_tier.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {org.usage_count.toLocaleString()}/{org.usage_limit.toLocaleString()} leads
                      </span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </>
        )}

        {/* Create New Organization */}
        {showCreateButton && (
          <>
            <div className="border-t my-1" />
            <SelectItem value="create-new">
              <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-primary">Create Organization</span>
              </div>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
