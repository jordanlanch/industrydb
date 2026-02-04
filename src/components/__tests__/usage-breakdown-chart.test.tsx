import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  UsageBreakdownChart,
  UsageBreakdown,
} from '../usage-breakdown-chart';

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Doughnut: ({ data, options, ...props }: any) => (
    <div
      data-testid="doughnut-chart"
      data-labels={JSON.stringify(data.labels)}
      data-datasets={JSON.stringify(data.datasets)}
      data-options={JSON.stringify(options)}
      {...props}
    >
      Mocked Doughnut Chart
    </div>
  ),
}));

describe('UsageBreakdownChart', () => {
  const mockData: UsageBreakdown = {
    searches: 150,
    exports: 45,
    apiCalls: 85,
  };

  describe('Rendering with data', () => {
    test('renders doughnut chart with provided data', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      expect(chart).toBeInTheDocument();
    });

    test('displays default title', () => {
      render(<UsageBreakdownChart data={mockData} />);

      expect(screen.getByText('Usage Breakdown')).toBeInTheDocument();
    });

    test('displays custom title when provided', () => {
      render(
        <UsageBreakdownChart data={mockData} title="Action Distribution" />
      );

      expect(screen.getByText('Action Distribution')).toBeInTheDocument();
      expect(screen.queryByText('Usage Breakdown')).not.toBeInTheDocument();
    });

    test('renders correct labels for chart sections', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');

      expect(labels).toEqual(['Searches', 'Exports', 'API Calls']);
    });

    test('renders correct data values', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].data).toEqual([150, 45, 85]);
    });

    test('applies correct colors to chart sections', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      // Blue for searches, green for exports, purple for API calls
      expect(datasets[0].backgroundColor).toHaveLength(3);
      expect(datasets[0].backgroundColor[0]).toContain('59, 130, 246'); // Blue
      expect(datasets[0].backgroundColor[1]).toContain('34, 197, 94'); // Green
      expect(datasets[0].backgroundColor[2]).toContain('168, 85, 247'); // Purple
    });
  });

  describe('Summary statistics cards', () => {
    test('displays searches count and percentage', () => {
      render(<UsageBreakdownChart data={mockData} />);

      // Total: 150 + 45 + 85 = 280
      // Searches: 150/280 = 53.6%
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('53.6%')).toBeInTheDocument();
    });

    test('displays exports count and percentage', () => {
      render(<UsageBreakdownChart data={mockData} />);

      // Total: 280
      // Exports: 45/280 = 16.1%
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('16.1%')).toBeInTheDocument();
    });

    test('displays API calls count and percentage', () => {
      render(<UsageBreakdownChart data={mockData} />);

      // Total: 280
      // API Calls: 85/280 = 30.4%
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('30.4%')).toBeInTheDocument();
    });

    test('renders all three summary cards', () => {
      render(<UsageBreakdownChart data={mockData} />);

      expect(screen.getByText('Searches')).toBeInTheDocument();
      expect(screen.getByText('Exports')).toBeInTheDocument();
      expect(screen.getByText('API Calls')).toBeInTheDocument();
    });
  });

  describe('Props handling', () => {
    test('applies custom height', () => {
      const { container } = render(
        <UsageBreakdownChart data={mockData} height={400} />
      );

      const chartContainer = container.querySelector('[style*="height"]');
      expect(chartContainer).toBeInTheDocument();
    });

    test('shows legend by default', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.legend.display).toBe(true);
    });

    test('hides legend when showLegend is false', () => {
      render(<UsageBreakdownChart data={mockData} showLegend={false} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.legend.display).toBe(false);
    });

    test('shows percentages in legend by default', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      // Legend should be configured with labels
      expect(options.plugins.legend.labels).toBeDefined();
      expect(options.plugins.legend.labels.padding).toBe(15);
    });

    test('hides percentages when showPercentages is false', () => {
      render(
        <UsageBreakdownChart data={mockData} showPercentages={false} />
      );

      const chart = screen.getByTestId('doughnut-chart');
      expect(chart).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    test('renders empty state when all counts are zero', () => {
      const emptyData: UsageBreakdown = {
        searches: 0,
        exports: 0,
        apiCalls: 0,
      };

      render(<UsageBreakdownChart data={emptyData} />);

      expect(screen.getByText('No usage data available')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Usage breakdown will appear here once you start using the platform'
        )
      ).toBeInTheDocument();
    });

    test('does not render chart when data is empty', () => {
      const emptyData: UsageBreakdown = {
        searches: 0,
        exports: 0,
        apiCalls: 0,
      };

      render(<UsageBreakdownChart data={emptyData} />);

      expect(screen.queryByTestId('doughnut-chart')).not.toBeInTheDocument();
    });

    test('does not render summary cards when data is empty', () => {
      const emptyData: UsageBreakdown = {
        searches: 0,
        exports: 0,
        apiCalls: 0,
      };

      render(<UsageBreakdownChart data={emptyData} />);

      // Summary cards should not exist
      const summaryCards = screen.queryByText('Searches');
      expect(summaryCards).not.toBeInTheDocument();
    });

    test('empty state respects height prop', () => {
      const emptyData: UsageBreakdown = {
        searches: 0,
        exports: 0,
        apiCalls: 0,
      };

      const { container } = render(
        <UsageBreakdownChart data={emptyData} height={500} />
      );

      const emptyState = container.querySelector('[style*="height"]');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Percentage calculations', () => {
    test('calculates percentages correctly', () => {
      const data: UsageBreakdown = {
        searches: 50,
        exports: 30,
        apiCalls: 20,
      };

      render(<UsageBreakdownChart data={data} />);

      // Total: 100
      expect(screen.getByText('50.0%')).toBeInTheDocument(); // 50/100
      expect(screen.getByText('30.0%')).toBeInTheDocument(); // 30/100
      expect(screen.getByText('20.0%')).toBeInTheDocument(); // 20/100
    });

    test('handles decimal percentages', () => {
      const data: UsageBreakdown = {
        searches: 100,
        exports: 33,
        apiCalls: 67,
      };

      render(<UsageBreakdownChart data={data} />);

      // Total: 200
      expect(screen.getByText('50.0%')).toBeInTheDocument(); // 100/200
      expect(screen.getByText('16.5%')).toBeInTheDocument(); // 33/200
      expect(screen.getByText('33.5%')).toBeInTheDocument(); // 67/200
    });

    test('handles single action type usage', () => {
      const data: UsageBreakdown = {
        searches: 100,
        exports: 0,
        apiCalls: 0,
      };

      render(<UsageBreakdownChart data={data} />);

      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getAllByText('0.0%')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    test('includes ARIA label for screen readers', () => {
      render(
        <UsageBreakdownChart data={mockData} title="Usage Distribution" />
      );

      const chart = screen.getByTestId('doughnut-chart');
      expect(chart).toHaveAttribute(
        'aria-label',
        'Usage Distribution chart showing usage distribution'
      );
    });

    test('uses role="img" for accessibility', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      expect(chart).toHaveAttribute('role', 'img');
    });
  });

  describe('Chart configuration', () => {
    test('sets responsive to true', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
    });

    test('sets doughnut cutout to 65%', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.cutout).toBe('65%');
    });

    test('enables tooltips', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.tooltip.enabled).toBe(true);
    });

    test('positions legend at bottom', () => {
      render(<UsageBreakdownChart data={mockData} />);

      const chart = screen.getByTestId('doughnut-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.legend.position).toBe('bottom');
    });
  });

  describe('Data handling', () => {
    test('handles large numbers', () => {
      const largeData: UsageBreakdown = {
        searches: 10000,
        exports: 5000,
        apiCalls: 7500,
      };

      render(<UsageBreakdownChart data={largeData} />);

      expect(screen.getByText('10000')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('7500')).toBeInTheDocument();
    });

    test('handles equal distribution', () => {
      const equalData: UsageBreakdown = {
        searches: 100,
        exports: 100,
        apiCalls: 100,
      };

      render(<UsageBreakdownChart data={equalData} />);

      // All should be 33.3%
      expect(screen.getAllByText('33.3%')).toHaveLength(3);
    });
  });

  describe('Edge cases', () => {
    test('renders without crashing when no title provided', () => {
      render(<UsageBreakdownChart data={mockData} title="" />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    test('handles partial zero values', () => {
      const partialData: UsageBreakdown = {
        searches: 100,
        exports: 0,
        apiCalls: 50,
      };

      render(<UsageBreakdownChart data={partialData} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });
});
