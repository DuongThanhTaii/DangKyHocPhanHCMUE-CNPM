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

interface DangKyTheoNganhChartProps {
  data: Array<{ ten_nganh: string; so_dang_ky: number }>;
}

export const DangKyTheoNganhChart: React.FC<DangKyTheoNganhChartProps> = ({
  data,
}) => {
  return (
    <ResponsiveContainer>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="ten_nganh"
          angle={-20}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="so_dang_ky" name="Số đăng ký" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
};
