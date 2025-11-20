import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TaiGiangVienChartProps {
  data: Array<{ ho_ten: string; so_lop: number }>;
}

export const TaiGiangVienChart: React.FC<TaiGiangVienChartProps> = ({
  data,
}) => {
  return (
    <ResponsiveContainer>
      <BarChart
        data={data.slice(0, 10).reverse()}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="ho_ten" width={180} />
        <Tooltip />
        <Legend />
        <Bar dataKey="so_lop" name="Số lớp" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
};
