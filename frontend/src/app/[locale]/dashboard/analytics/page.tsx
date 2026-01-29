'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import analyticsService, {
  DailyUsage,
  UsageSummary,
  ActionBreakdown
} from '@/services/analytics.service';
import { TrendingUp, Search, FileDown, Activity, Calendar } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [breakdown, setBreakdown] = useState<ActionBreakdown[]>([]);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dailyData, summaryData, breakdownData] = await Promise.all([
        analyticsService.getDailyUsage(days),
        analyticsService.getUsageSummary(days),
        analyticsService.getActionBreakdown(days),
      ]);

      setDailyUsage(dailyData.daily_usage || []);
      setSummary(summaryData);
      setBreakdown(breakdownData.breakdown || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chart.js configuration for daily usage line chart
  const lineChartData = {
    labels: dailyUsage.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Searches',
        data: dailyUsage.map(d => d.search),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Exports',
        data: dailyUsage.map(d => d.export),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // Chart.js configuration for action breakdown doughnut chart
  const doughnutChartData = {
    labels: breakdown.map(b => b.action.charAt(0).toUpperCase() + b.action.slice(1)),
    datasets: [
      {
        label: 'Actions',
        data: breakdown.map(b => b.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(251, 146, 60)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usage Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your platform usage and activity
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_searches || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(summary?.total_searches || 0) > 0 ? `${days} days` : 'No activity yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_exports || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(summary?.total_exports || 0) > 0 ? `${days} days` : 'No activity yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads Accessed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_leads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {summary?.avg_per_day.toFixed(1) || 0}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.peak_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.peak_day ? new Date(summary.peak_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Usage Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>
              Searches and exports over the last {days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Action Breakdown Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Action Breakdown</CardTitle>
            <CardDescription>
              Distribution by action type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>

            {/* Fallback: Show breakdown as list */}
            {breakdown.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Action Summary:</p>
                {breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{item.action}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-muted-foreground">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Table */}
      {dailyUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Daily Breakdown</CardTitle>
            <CardDescription>
              Day-by-day usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-right py-2 px-4">Searches</th>
                    <th className="text-right py-2 px-4">Exports</th>
                    <th className="text-right py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyUsage.slice(0, 10).map((day, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="text-right py-2 px-4">{day.search}</td>
                      <td className="text-right py-2 px-4">{day.export}</td>
                      <td className="text-right py-2 px-4 font-medium">{day.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dailyUsage.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing 10 most recent days of {dailyUsage.length} total
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {dailyUsage.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Usage Data</h3>
              <p className="text-sm">
                Start searching and exporting leads to see your analytics here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
