'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import organizationService, { Organization } from '@/services/organization.service';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const organizationId = parseInt(params.id as string);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    billing_email: '',
  });

  useEffect(() => {
    loadOrganization();
  }, [organizationId]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const org = await organizationService.getOrganization(organizationId);
      setOrganization(org);
      setFormData({
        name: org.name,
        billing_email: org.billing_email || '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load organization',
        variant: 'destructive',
      });

      if (error.response?.status === 404 || error.response?.status === 403) {
        router.push('/dashboard/organizations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Organization name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await organizationService.updateOrganization(organizationId, {
        name: formData.name,
        billing_email: formData.billing_email || undefined,
      });

      setOrganization(updated);
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update organization',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await organizationService.deleteOrganization(organizationId);

      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });

      router.push('/dashboard/organizations');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete organization',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Save className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/dashboard/organizations/${organizationId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization details and preferences
          </p>
        </div>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Update your organization's basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Inc"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" value={organization.slug} disabled />
              <p className="text-xs text-muted-foreground">
                Slug cannot be changed after creation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">Billing Email</Label>
              <Input
                id="billing_email"
                type="email"
                value={formData.billing_email}
                onChange={(e) =>
                  setFormData({ ...formData, billing_email: e.target.value })
                }
                placeholder="billing@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Billing notifications will be sent to this email
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Current subscription plan and usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Plan</Label>
            <p className="text-2xl font-bold capitalize mt-1">
              {organization.subscription_tier}
            </p>
          </div>

          <div>
            <Label>Monthly Limit</Label>
            <p className="text-muted-foreground mt-1">
              {organization.usage_limit.toLocaleString()} leads per month
            </p>
          </div>

          <div>
            <Label>Current Usage</Label>
            <p className="text-muted-foreground mt-1">
              {organization.usage_count.toLocaleString()} /{' '}
              {organization.usage_limit.toLocaleString()} leads this month
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (organization.usage_count / organization.usage_limit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {organization.stripe_customer_id && (
            <div>
              <Label>Stripe Customer ID</Label>
              <p className="text-muted-foreground font-mono text-sm mt-1">
                {organization.stripe_customer_id}
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline">Manage Billing</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">Delete Organization</h3>
              <p className="text-sm text-red-700 mt-1">
                Once deleted, all data will be lost and cannot be recovered. All members will
                lose access.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Delete Organization
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-2">
                      <p>
                        Are you sure you want to delete{' '}
                        <strong>{organization.name}</strong>?
                      </p>
                      <p className="text-red-600 font-medium">
                        This action cannot be undone. All organization data will be
                        permanently deleted.
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>All members will lose access</li>
                        <li>All exports will be deleted</li>
                        <li>Usage history will be lost</li>
                        <li>Subscriptions will be cancelled</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete Organization'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
