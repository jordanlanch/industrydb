'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('dashboard.organizations.orgSettings');
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
        title: t('toast.error'),
        description: error.response?.data?.message || t('toast.loadFailed'),
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
        title: t('toast.validationError'),
        description: t('toast.nameRequired'),
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
        title: t('toast.success'),
        description: t('toast.updated'),
      });
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.response?.data?.message || t('toast.updateFailed'),
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
        title: t('toast.success'),
        description: t('toast.deleted'),
      });

      router.push('/dashboard/organizations');
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.response?.data?.message || t('toast.deleteFailed'),
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
          <p className="text-muted-foreground">{t('loading')}</p>
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
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>{t('general.title')}</CardTitle>
            <CardDescription>{t('general.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('slugLabel')}</Label>
              <Input id="slug" value={organization.slug} disabled />
              <p className="text-xs text-muted-foreground">
                {t('slugReadonly')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">{t('billingEmailLabel')}</Label>
              <Input
                id="billing_email"
                type="email"
                value={formData.billing_email}
                onChange={(e) =>
                  setFormData({ ...formData, billing_email: e.target.value })
                }
                placeholder={t('billingEmailPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('billingEmailHint')}
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? t('saving') : t('saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
          <CardDescription>{t('subscription.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('subscription.currentPlan')}</Label>
            <p className="text-2xl font-bold capitalize mt-1">
              {organization.subscription_tier}
            </p>
          </div>

          <div>
            <Label>{t('subscription.monthlyLimit')}</Label>
            <p className="text-muted-foreground mt-1">
              {t('subscription.leadsPerMonth', { count: organization.usage_limit })}
            </p>
          </div>

          <div>
            <Label>{t('subscription.currentUsage')}</Label>
            <p className="text-muted-foreground mt-1">
              {t('subscription.leadsThisMonth', { used: organization.usage_count, limit: organization.usage_limit })}
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
              <Label>{t('subscription.stripeCustomerId')}</Label>
              <p className="text-muted-foreground font-mono text-sm mt-1">
                {organization.stripe_customer_id}
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline">{t('subscription.manageBilling')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">{t('dangerZone.title')}</CardTitle>
          <CardDescription>
            {t('dangerZone.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">{t('dangerZone.deleteTitle')}</h3>
              <p className="text-sm text-red-700 mt-1">
                {t('dangerZone.deleteDescription')}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('dangerZone.deleteButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    {t('dangerZone.confirmTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-2">
                      <p>
                        {t('dangerZone.confirmAsk', { name: organization.name })}
                      </p>
                      <p className="text-red-600 font-medium">
                        {t('dangerZone.confirmWarning')}
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>{t('dangerZone.consequenceMembers')}</li>
                        <li>{t('dangerZone.consequenceExports')}</li>
                        <li>{t('dangerZone.consequenceUsage')}</li>
                        <li>{t('dangerZone.consequenceSubscriptions')}</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? t('dangerZone.deleting') : t('dangerZone.confirmButton')}
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
