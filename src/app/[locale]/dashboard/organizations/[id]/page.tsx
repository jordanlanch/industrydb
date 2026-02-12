'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import organizationService, { Organization } from '@/services/organization.service';
import { ArrowLeft, Building2, Users, Settings, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations, useLocale } from 'next-intl';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('dashboard.organizations.detail');
  const locale = useLocale();
  const organizationId = parseInt(params.id as string);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganization();
  }, [organizationId]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const org = await organizationService.getOrganization(organizationId);
      setOrganization(org);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load organization',
        variant: 'destructive',
      });

      // If not found or forbidden, redirect back
      if (error.response?.status === 404 || error.response?.status === 403) {
        router.push('/dashboard/organizations');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
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

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Building2 className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  const usagePercentage = (organization.usage_count / organization.usage_limit) * 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-4 sm:pt-6 lg:pt-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/dashboard/organizations')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{organization.name}</h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${getTierColor(
                organization.subscription_tier
              )}`}
            >
              {getTierLabel(organization.subscription_tier)}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">/{organization.slug}</p>
        </div>

        <Button onClick={() => router.push(`/dashboard/organizations/${organization.id}/settings`)}>
          <Settings className="h-4 w-4 mr-2" />
          {t('settingsLink')}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('usageThisMonth')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.usage_count}</div>
            <p className="text-xs text-muted-foreground">
              {t('ofLimit', { limit: organization.usage_limit })}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usagePercentage >= 90
                    ? 'bg-red-500'
                    : usagePercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('subscription')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {organization.subscription_tier}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('leadsPerMonth', { count: organization.usage_limit })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('members')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">{t('activeMembers')}</p>
            <Button
              variant="link"
              className="px-0 h-auto mt-2"
              onClick={() => router.push(`/dashboard/organizations/${organization.id}/members`)}
            >
              {t('viewAll')} →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('created')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(organization.created_at).toLocaleDateString(locale, {
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(organization.created_at).toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="activity">{t('tabs.activity')}</TabsTrigger>
          <TabsTrigger value="billing">{t('tabs.billing')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('details.title')}</CardTitle>
              <CardDescription>{t('details.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('details.name')}</label>
                <p className="text-muted-foreground">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t('details.slug')}</label>
                <p className="text-muted-foreground">/{organization.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t('details.billingEmail')}</label>
                <p className="text-muted-foreground">
                  {organization.billing_email || t('details.notSet')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">{t('details.status')}</label>
                <p className="text-muted-foreground">
                  {organization.active ? (
                    <span className="text-green-600">{t('details.active')}</span>
                  ) : (
                    <span className="text-red-600">{t('details.inactive')}</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions.title')}</CardTitle>
              <CardDescription>{t('quickActions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/dashboard/organizations/${organization.id}/members`)
                }
              >
                <Users className="h-4 w-4 mr-2" />
                {t('quickActions.manageMembers')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/dashboard/organizations/${organization.id}/settings`)
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('quickActions.orgSettings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t('activity.title')}</CardTitle>
              <CardDescription>{t('activity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                {t('activity.comingSoon')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>{t('billing.title')}</CardTitle>
              <CardDescription>{t('billing.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('billing.currentPlan')}</label>
                  <p className="text-2xl font-bold capitalize mt-1">
                    {organization.subscription_tier}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('billing.monthlyLimit')}</label>
                  <p className="text-muted-foreground">
                    {t('billing.leads', { count: organization.usage_limit })}
                  </p>
                </div>
                {organization.stripe_customer_id && (
                  <div>
                    <label className="text-sm font-medium">{t('billing.stripeCustomerId')}</label>
                    <p className="text-muted-foreground font-mono text-sm">
                      {organization.stripe_customer_id}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
