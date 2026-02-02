import React from 'react';
import { render, screen } from '@testing-library/react';
import { UsageChart, UsageDataPoint } from '../usage-chart';

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options, ...props }: any) => (
    <div
      data-testid="line-chart"
      data-labels={JSON.stringify(data.labels)}
      data-datasets={JSON.stringify(data.datasets)}
      data-options={JSON.stringify(options)}
      {...props}
    >
      Mocked Line Chart
    </div>
  ),
}));

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    const dateObj = new Date(date);
    if (formatStr === 'MMM d') {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    if (formatStr === 'EEEE, MMMM d, yyyy') {
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateObj.toISOString();
  },
}));

describe('UsageChart', () => {
  const mockData: UsageDataPoint[] = [
    { date: '2026-01-01', count: 50 },
    { date: '2026-01-02', count: 75 },
    { date: '2026-01-03', count: 60 },
    { date: '2026-01-04', count: 90 },
    { date: '2026-01-05', count: 45 },
  ];

  describe('Rendering with data', () => {
    test('renders chart with provided data', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();
    });

    test('displays default title', () => {
      render(<UsageChart data={mockData} />);

      expect(screen.getByText('Daily Usage')).toBeInTheDocument();
    });

    test('displays custom title when provided', () => {
      render(<UsageChart data={mockData} title="API Usage Analytics" />);

      expect(screen.getByText('API Usage Analytics')).toBeInTheDocument();
      expect(screen.queryByText('Daily Usage')).not.toBeInTheDocument();
    });

    test('formats dates correctly for X-axis labels', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const labels = JSON.parse(chart.getAttribute('data-labels') || '[]');

      // Check that dates are formatted with month and day
      expect(labels).toHaveLength(5);
      expect(labels[0]).toBeTruthy();
      expect(labels[1]).toBeTruthy();
      // Labels should be formatted (not ISO strings)
      expect(labels[0]).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('renders correct usage counts on Y-axis', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].data).toEqual([50, 75, 60, 90, 45]);
    });

    test('applies correct chart styling', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].borderColor).toBe('rgb(59, 130, 246)');
      expect(datasets[0].pointRadius).toBe(4);
      expect(datasets[0].pointHoverRadius).toBe(6);
    });
  });

  describe('Props handling', () => {
    test('applies custom height', () => {
      const { container } = render(
        <UsageChart data={mockData} height={500} />
      );

      const chartContainer = container.querySelector('[style*="height"]');
      expect(chartContainer).toBeInTheDocument();
    });

    test('shows legend when showLegend is true', () => {
      render(<UsageChart data={mockData} showLegend={true} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.legend.display).toBe(true);
    });

    test('hides legend by default', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.legend.display).toBe(false);
    });

    test('fills area under line by default', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].fill).toBe(true);
      expect(datasets[0].backgroundColor).toBeDefined();
    });

    test('does not fill area when fillArea is false', () => {
      render(<UsageChart data={mockData} fillArea={false} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].fill).toBe(false);
      expect(datasets[0].backgroundColor).toBeUndefined();
    });
  });

  describe('Empty state', () => {
    test('renders empty state when data is empty array', () => {
      render(<UsageChart data={[]} />);

      expect(screen.getByText('No usage data available')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Usage data will appear here once you start using the API'
        )
      ).toBeInTheDocument();
    });

    test('does not render chart when data is empty', () => {
      render(<UsageChart data={[]} />);

      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    test('empty state respects height prop', () => {
      const { container } = render(<UsageChart data={[]} height={400} />);

      const emptyState = container.querySelector('[style*="height"]');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('includes ARIA label for screen readers', () => {
      render(<UsageChart data={mockData} title="API Usage" />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute(
        'aria-label',
        'API Usage chart showing usage over time'
      );
    });

    test('uses role="img" for accessibility', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute('role', 'img');
    });
  });

  describe('Chart configuration', () => {
    test('sets responsive to true', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
    });

    test('configures Y-axis to begin at zero', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.scales.y.beginAtZero).toBe(true);
    });

    test('sets Y-axis suggested max with 10% padding', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      // Max count is 90, so suggested max should be ceil(90 * 1.1) = 100
      expect(options.scales.y.suggestedMax).toBe(100);
    });

    test('enables tooltips', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.tooltip.enabled).toBe(true);
    });

    test('configures X-axis grid to be hidden', () => {
      render(<UsageChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.scales.x.grid.display).toBe(false);
    });
  });

  describe('Data handling', () => {
    test('handles single data point', () => {
      const singlePoint: UsageDataPoint[] = [{ date: '2026-01-01', count: 10 }];
      render(<UsageChart data={singlePoint} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].data).toEqual([10]);
    });

    test('handles zero usage counts', () => {
      const zeroData: UsageDataPoint[] = [
        { date: '2026-01-01', count: 0 },
        { date: '2026-01-02', count: 0 },
      ];
      render(<UsageChart data={zeroData} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].data).toEqual([0, 0]);
    });

    test('handles large usage counts', () => {
      const largeData: UsageDataPoint[] = [
        { date: '2026-01-01', count: 10000 },
        { date: '2026-01-02', count: 25000 },
      ];
      render(<UsageChart data={largeData} />);

      const chart = screen.getByTestId('line-chart');
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');

      expect(datasets[0].data).toEqual([10000, 25000]);
    });
  });

  describe('Edge cases', () => {
    test('handles invalid date format gracefully', () => {
      const invalidData: UsageDataPoint[] = [
        { date: 'invalid-date', count: 50 },
      ];

      render(<UsageChart data={invalidData} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();

      // Chart should still render even with invalid dates
      const datasets = JSON.parse(chart.getAttribute('data-datasets') || '[]');
      expect(datasets[0].data).toEqual([50]);
    });

    test('renders without crashing when no title provided', () => {
      render(<UsageChart data={mockData} title="" />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});
