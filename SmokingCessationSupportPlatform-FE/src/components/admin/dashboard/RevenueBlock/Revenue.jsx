import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from "recharts";
import { dashboardService } from "../../../../services/dashboardService";

const DEFAULT_COLORS = {
  premium: "#1814F3",
  text: "#181818",
  grid: "#e0e6ed"
};

const formatMoney = (value) =>
  value?.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VNĐ";

const Revenue = ({ colors, theme }) => {
  const [data, setData] = useState([]);

  const chartColors = {
    premium: colors?.primary || theme?.primary || DEFAULT_COLORS.premium,
    text: theme?.secondary || DEFAULT_COLORS.text,
    grid: colors?.grid || DEFAULT_COLORS.grid
  };

  useEffect(() => {
    dashboardService.getRevenue().then((res) => {
      setData(Array.isArray(res) ? res : []);
    });
  }, []);

  return (
    <div style={{ width: "100%", height: 320, marginTop: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 30, bottom: 30 }} // tăng left margin
        >
          <CartesianGrid stroke={chartColors.grid} horizontal vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: chartColors.text, fontSize: 16, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatMoney}
            tick={{ fill: chartColors.text, fontSize: 15, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={90}
          >
            <Label
              value="Revenue (VNĐ)"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", fill: chartColors.text, fontSize: 14, fontWeight: 600 }}
            />
          </YAxis>
          <Tooltip
            formatter={(value) => formatMoney(value)}
            labelStyle={{ fontWeight: 600, color: chartColors.text }}
            contentStyle={{ borderRadius: 8, fontSize: 15 }}
          />
          <Bar
            dataKey="premium"
            fill={chartColors.premium}
            radius={[6, 6, 0, 0]}
            barSize={32}
            name="Premium Plan"
            label={{
              position: "top",
              fill: chartColors.premium,
              fontWeight: 600,
              fontSize: 14,
              formatter: formatMoney
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Revenue;
