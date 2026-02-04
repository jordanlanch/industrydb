'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Shield, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useRouter } from 'next/navigation';

/**
 * Organization Invitations Page
 *
 * Displays pending organization invitations for the current user.
 * Allows accepting or declining invitations.
 *
 * BACKEND REQUIREMENTS (Not yet implemented):
 * - GET /api/v1/organizations/invites/pending - List user's pending invites
 * - POST /api/v1/organizations/invites/:id/accept - Accept invitation
 * - POST /api/v1/organizations/invites/:id/decline - Decline invitation
 *
 * Expected Response Format:
 * {
 *   "invites": [
 *     {
 *       "id": 1,
 *       "organization_id": 123,
 *       "organization_name": "Acme Corp",
 *       "organization_tier": "business",
 *       "role": "member",
 *       "invited_by_email": "admin@acme.com",
 *       "invited_at": "2026-02-02T10:00:00Z",
 *       "status": "pending"
 *     }
 *   ],
 *   "total": 1
 * }
 */

interface PendingInvite {
  id: number;
  organization_id: number;
  organization_name: string;
  organization_tier: 'free' | 'starter' | 'pro' | 'business';
  role: 'admin' | 'member' | 'viewer';
  invited_by_email?: string;
  invited_at: string;
  status: 'pending';
}

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

      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/v1/organizations/invites/pending', {
      //   headers: {
      //     'Authorization': `Bearer ${getToken()}`,
      //   },
      // });
      // const data = await response.json();
      // setInvites(data.invites);

      // Mock data for development
      setInvites([]);

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

      // TODO: Replace with actual API call when backend is ready
      // await fetch(`/api/v1/organizations/invites/${inviteId}/accept`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${getToken()}`,
      //   },
      // });

      toast({
        title: 'Invitation accepted',
        description: 'You are now a member of the organization',
        variant: 'success',
      });

      // Reload invites and redirect
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

      // TODO: Replace with actual API call when backend is ready
      // await fetch(`/api/v1/organizations/invites/${inviteId}/decline`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${getToken()}`,
      //   },
      // });

      toast({
        title: 'Invitation declined',
        description: 'The invitation has been removed',
        variant: 'success',
      });

      // Reload invites
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
      <div className="flex items-center justify-center h-64">
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

      {/* Backend Not Ready Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Backend Integration Pending
          </CardTitle>
          <CardDescription className="text-orange-700">
            This feature requires backend API endpoints that are not yet implemented.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-orange-700">
          <p className="mb-2 font-medium">Required endpoints:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>GET /api/v1/organizations/invites/pending</li>
            <li>POST /api/v1/organizations/invites/:id/accept</li>
            <li>POST /api/v1/organizations/invites/:id/decline</li>
          </ul>
          <p className="mt-3">
            Once these endpoints are implemented, this page will display pending invitations
            and allow users to accept or decline them.
          </p>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
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
