'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface UsageDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
}

export interface UsageChartProps {
  data: UsageDataPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  fillArea?: boolean;
}

/**
 * UsageChart - Line chart displaying daily usage over time
 *
 * @param data - Array of usage data points with date and count
 * @param title - Chart title (optional)
 * @param height - Chart height in pixels (default: 300)
 * @param showLegend - Show chart legend (default: false)
 * @param fillArea - Fill area under line (default: true)
 *
 * @example
 * ```tsx
 * const usageData = [
 *   { date: '2026-01-01', count: 50 },
 *   { date: '2026-01-02', count: 75 },
 *   { date: '2026-01-03', count: 60 },
 * ];
 *
 * <UsageChart
 *   data={usageData}
 *   title="Daily API Usage"
 *   height={400}
 * />
 * ```
 */
export function UsageChart({
  data,
  title = 'Daily Usage',
  height = 300,
  showLegend = false,
  fillArea = true,
}: UsageChartProps) {
  // Format dates for display on X-axis
  const labels = data.map((point) => {
    try {
      return format(new Date(point.date), 'MMM d');
    } catch {
      return point.date;
    }
  });

  // Extract usage counts for Y-axis
  const counts = data.map((point) => point.count);

  // Calculate max value for better Y-axis scaling
  const maxCount = Math.max(...counts, 0);
  const suggestedMax = Math.ceil(maxCount * 1.1); // 10% padding above max

  // Chart configuration
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Usage',
        data: counts,
        borderColor: 'rgb(59, 130, 246)', // Blue-500
        backgroundColor: fillArea
          ? 'rgba(59, 130, 246, 0.1)' // Blue-500 with transparency
          : undefined,
        fill: fillArea,
        tension: 0.3, // Smooth line curves
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: false, // Title handled outside chart for better styling
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const dateStr = data[index]?.date;
            if (dateStr) {
              try {
                return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
              } catch {
                return dateStr;
              }
            }
            return '';
          },
          label: (context) => {
            const count = context.parsed.y;
            return `Usage: ${count} ${count === 1 ? 'request' : 'requests'}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax,
        ticks: {
          precision: 0, // No decimal places for count
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center p-8">
          <p className="text-gray-500 text-sm">No usage data available</p>
          <p className="text-gray-400 text-xs mt-1">
            Usage data will appear here once you start using the API
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div
        className="relative bg-white rounded-lg border border-gray-200 p-4"
        style={{ height }}
      >
        <Line
          data={chartData}
          options={options}
          aria-label={`${title} chart showing usage over time`}
          role="img"
        />
      </div>
    </div>
  );
}

export default UsageChart;
