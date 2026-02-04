'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export interface UsageBreakdown {
  searches: number;
  exports: number;
  apiCalls: number;
}

export interface UsageBreakdownChartProps {
  data: UsageBreakdown;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
}

/**
 * UsageBreakdownChart - Doughnut chart showing usage breakdown by action type
 *
 * @param data - Usage breakdown by action type (searches, exports, apiCalls)
 * @param title - Chart title (optional)
 * @param height - Chart height in pixels (default: 300)
 * @param showLegend - Show chart legend (default: true)
 * @param showPercentages - Show percentages in legend (default: true)
 *
 * @example
 * ```tsx
 * const breakdown = {
 *   searches: 150,
 *   exports: 45,
 *   apiCalls: 80,
 * };
 *
 * <UsageBreakdownChart
 *   data={breakdown}
 *   title="Usage by Action Type"
 *   height={350}
 * />
 * ```
 */
export function UsageBreakdownChart({
  data,
  title = 'Usage Breakdown',
  height = 300,
  showLegend = true,
  showPercentages = true,
}: UsageBreakdownChartProps) {
  // Calculate total for percentage calculations
  const total = data.searches + data.exports + data.apiCalls;

  // Calculate percentages
  const searchesPercent =
    total > 0 ? ((data.searches / total) * 100).toFixed(1) : '0';
  const exportsPercent =
    total > 0 ? ((data.exports / total) * 100).toFixed(1) : '0';
  const apiCallsPercent =
    total > 0 ? ((data.apiCalls / total) * 100).toFixed(1) : '0';

  // Chart colors
  const colors = {
    searches: {
      background: 'rgba(59, 130, 246, 0.8)', // Blue-500
      border: 'rgb(59, 130, 246)',
      hover: 'rgba(59, 130, 246, 0.9)',
    },
    exports: {
      background: 'rgba(34, 197, 94, 0.8)', // Green-500
      border: 'rgb(34, 197, 94)',
      hover: 'rgba(34, 197, 94, 0.9)',
    },
    apiCalls: {
      background: 'rgba(168, 85, 247, 0.8)', // Purple-500
      border: 'rgb(168, 85, 247)',
      hover: 'rgba(168, 85, 247, 0.9)',
    },
  };

  // Chart data
  const chartData = {
    labels: ['Searches', 'Exports', 'API Calls'],
    datasets: [
      {
        label: 'Usage',
        data: [data.searches, data.exports, data.apiCalls],
        backgroundColor: [
          colors.searches.background,
          colors.exports.background,
          colors.apiCalls.background,
        ],
        borderColor: [
          colors.searches.border,
          colors.exports.border,
          colors.apiCalls.border,
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          colors.searches.hover,
          colors.exports.hover,
          colors.apiCalls.hover,
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 13,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i] as number;
                const percentage = [
                  searchesPercent,
                  exportsPercent,
                  apiCallsPercent,
                ][i];

                // Format label with or without percentage
                const displayLabel = showPercentages
                  ? `${label}: ${value} (${percentage}%)`
                  : `${label}: ${value}`;

                return {
                  text: displayLabel,
                  fillStyle: Array.isArray(dataset.backgroundColor)
                    ? (dataset.backgroundColor[i] as string)
                    : (dataset.backgroundColor as string),
                  strokeStyle: Array.isArray(dataset.borderColor)
                    ? (dataset.borderColor[i] as string)
                    : (dataset.borderColor as string),
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = [
              searchesPercent,
              exportsPercent,
              apiCallsPercent,
            ][context.dataIndex];

            return `${label}: ${value} (${percentage}%)`;
          },
          afterLabel: (context) => {
            const descriptions = [
              'Lead searches performed',
              'Data exports created',
              'API requests made',
            ];
            return descriptions[context.dataIndex] || '';
          },
        },
      },
    },
    cutout: '65%', // Makes it a doughnut (vs pie chart)
  };

  // Empty state
  if (total === 0) {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div
          className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
          style={{ height }}
        >
          <div className="text-center p-8">
            <p className="text-gray-500 text-sm">No usage data available</p>
            <p className="text-gray-400 text-xs mt-1">
              Usage breakdown will appear here once you start using the platform
            </p>
          </div>
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
        className="relative bg-white rounded-lg border border-gray-200 p-6"
        style={{ height }}
      >
        <Doughnut
          data={chartData}
          options={options}
          aria-label={`${title} chart showing usage distribution`}
          role="img"
        />
      </div>

      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-semibold text-blue-900">Searches</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {data.searches}
          </div>
          <div className="text-xs text-blue-700 mt-1">{searchesPercent}%</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="font-semibold text-green-900">Exports</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {data.exports}
          </div>
          <div className="text-xs text-green-700 mt-1">{exportsPercent}%</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="font-semibold text-purple-900">API Calls</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {data.apiCalls}
          </div>
          <div className="text-xs text-purple-700 mt-1">{apiCallsPercent}%</div>
        </div>
      </div>
    </div>
  );
}

export default UsageBreakdownChart;
