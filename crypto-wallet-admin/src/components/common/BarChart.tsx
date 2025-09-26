import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  formatY?: (value: number) => string;
  formatTooltip?: (value: number) => string;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = '#0ea5e9',
  height = 300,
  formatY,
  formatTooltip,
}: BarChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      [yKey]: Number(item[yKey]),
    }));
  }, [data, yKey]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={formatY}
          />
          <Tooltip
            formatter={formatTooltip || ((value: number) => value)}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '0.5rem',
            }}
          />
          <Bar
            dataKey={yKey}
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
