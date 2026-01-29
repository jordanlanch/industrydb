'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, type AdminStats } from '@/services/admin.service';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, CreditCard, FileDown, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'Admin access required',
          variant: 'destructive',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load statistics',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) return null;

  const totalRevenue =
    stats.subscriptions.starter * 49 +
    stats.subscriptions.pro * 149 +
    stats.subscriptions.business * 349;

  const conversionRate = (stats.users.active_subscriptions / stats.users.total) * 100;
  const verificationRate = (stats.users.verified / stats.users.total) * 100;

  // Calculate subscription percentages for visual bars
  const totalSubscribers = stats.subscriptions.free + stats.subscriptions.starter +
    stats.subscriptions.pro + stats.subscriptions.business;

  const subscriptionPercentages = {
    free: (stats.subscriptions.free / totalSubscribers) * 100,
    starter: (stats.subscriptions.starter / totalSubscribers) * 100,
    pro: (stats.subscriptions.pro / totalSubscribers) * 100,
    business: (stats.subscriptions.business / totalSubscribers) * 100,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and user management
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stats.users.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>{stats.users.verified} verified ({verificationRate.toFixed(1)}%)</span>
            </div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${verificationRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paying Customers
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {stats.users.active_subscriptions.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>{conversionRate.toFixed(1)}% conversion rate</span>
            </div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Exports */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stats.exports.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.exports.this_month}</span> this month
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {(stats.exports.total / stats.users.total).toFixed(1)} per user
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated MRR
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ARR: ${(totalRevenue * 12).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>
              {totalSubscribers} total users across all tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Free Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="font-medium">Free</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.subscriptions.free} ({subscriptionPercentages.free.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 transition-all duration-500"
                    style={{ width: `${subscriptionPercentages.free}%` }}
                  />
                </div>
              </div>

              {/* Starter Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="font-medium">Starter</span>
                    <span className="text-xs text-muted-foreground">$49/mo</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.subscriptions.starter} ({subscriptionPercentages.starter.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${subscriptionPercentages.starter}%` }}
                  />
                </div>
              </div>

              {/* Pro Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="font-medium">Pro</span>
                    <span className="text-xs text-muted-foreground">$149/mo</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.subscriptions.pro} ({subscriptionPercentages.pro.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 transition-all duration-500"
                    style={{ width: `${subscriptionPercentages.pro}%` }}
                  />
                </div>
              </div>

              {/* Business Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="font-medium">Business</span>
                    <span className="text-xs text-muted-foreground">$349/mo</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.subscriptions.business} ({subscriptionPercentages.business.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 transition-all duration-500"
                    style={{ width: `${subscriptionPercentages.business}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>
              Monthly recurring revenue by tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Starter Tier</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.subscriptions.starter} × $49
                  </p>
                </div>
                <p className="text-lg font-bold">
                  ${(stats.subscriptions.starter * 49).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Pro Tier</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.subscriptions.pro} × $149
                  </p>
                </div>
                <p className="text-lg font-bold">
                  ${(stats.subscriptions.pro * 149).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Business Tier</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.subscriptions.business} × $349
                  </p>
                </div>
                <p className="text-lg font-bold">
                  ${(stats.subscriptions.business * 349).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div>
                  <p className="text-sm font-bold">Total MRR</p>
                  <p className="text-xs text-muted-foreground">
                    Annual: ${(totalRevenue * 12).toLocaleString()}
                  </p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => router.push('/admin/users')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start hover:bg-primary/5 hover:border-primary"
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Manage Users</h3>
              <p className="text-xs text-muted-foreground text-left">
                View, edit, and manage user accounts
              </p>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/leads')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start hover:bg-primary/5 hover:border-primary"
            >
              <FileDown className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">View Leads</h3>
              <p className="text-xs text-muted-foreground text-left">
                Search and export lead database
              </p>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/analytics')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start hover:bg-primary/5 hover:border-primary"
            >
              <TrendingUp className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-xs text-muted-foreground text-left">
                View platform usage analytics
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
