'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Shield, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useRouter } from '@/i18n/routing';
import organizationService, { PendingInvite } from '@/services/organization.service';

export default function OrganizationInvitesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingInvites();
  }, []);

  const loadPendingInvites = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getPendingInvites();
      setInvites(data.invites);
    } catch (error: any) {
      toast({
        title: 'Failed to load invitations',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      setProcessingId(inviteId);
      await organizationService.acceptInvite(inviteId);

      toast({
        title: 'Invitation accepted',
        description: 'You are now a member of the organization',
        variant: 'success',
      });

      await loadPendingInvites();
      router.push('/dashboard/organizations');
    } catch (error: any) {
      toast({
        title: 'Failed to accept invitation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      setProcessingId(inviteId);
      await organizationService.declineInvite(inviteId);

      toast({
        title: 'Invitation declined',
        description: 'The invitation has been removed',
        variant: 'success',
      });

      await loadPendingInvites();
    } catch (error: any) {
      toast({
        title: 'Failed to decline invitation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-orange-100 text-orange-700';
      case 'member':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-spinner">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Invitations</h1>
        <p className="text-muted-foreground mt-2">
          Accept or decline invitations to join organizations
        </p>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No pending invitations
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll see organization invitations here when someone invites you
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite) => (
            <Card key={invite.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{invite.organization_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {invite.invited_by_email && (
                          <>
                            <Mail className="h-3 w-3" />
                            Invited by {invite.invited_by_email}
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getTierBadgeColor(invite.organization_tier)}>
                      {invite.organization_tier.charAt(0).toUpperCase() + invite.organization_tier.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <Badge variant="outline" className={getRoleBadgeColor(invite.role)}>
                      {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDeclineInvite(invite.id)}
                      disabled={processingId === invite.id}
                    >
                      {processingId === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAcceptInvite(invite.id)}
                      disabled={processingId === invite.id}
                    >
                      {processingId === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
