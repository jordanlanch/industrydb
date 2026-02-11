'use client';

import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

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

interface AnalyticsLineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
    }[];
  };
  options: any;
}

export function AnalyticsLineChart({ data, options }: AnalyticsLineChartProps) {
  return <Line data={data} options={options} />;
}
