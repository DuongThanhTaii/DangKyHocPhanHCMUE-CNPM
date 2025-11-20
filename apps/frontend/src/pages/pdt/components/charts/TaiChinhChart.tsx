import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TaiChinhChartProps {
  data: Array<{
    name: string;
    "Thực thu": number;
    "Kỳ vọng": number;
  }>;
  formatCurrency: (v: number) => string;
}

export const TaiChinhChart: React.FC<TaiChinhChartProps> = ({
  data,
  formatCurrency,
}) => {
  return (
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
        <Legend />
        <Line
          type="monotone"
          dataKey="Thực thu"
          stroke="#10b981"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Kỳ vọng"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
