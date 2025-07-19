import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { Row, Col, Typography } from "antd";
import { 
  FREE_MEMBERS_DISTRIBUTION, 
  PREMIUM_MEMBERS_DISTRIBUTION,
  MEMBERS_STATS 
} from "../../../data/mockData";
import { dashboardService } from "../../../../services/dashboardService";

const { Text } = Typography;

// Default colors (will be overridden by props if provided) - matching Overall Members Distribution
const DEFAULT_COLORS = {
  success: "#16c784",           // Green for success
  failed: "#FF4D4F",            // Red for failed
  freeMembers: "#1814F3",       // Primary blue for Free Members (same as Overall Members)
  premiumMembers: "#FFD600",    // Yellow for Premium Members (same as Overall Members)
  text: "#333",                 // Dark text color (same as Overall Members)
  pink: "#FF4FEE",              // Pink accent
  purple: "#9747FF",            // Purple accent
  yellow: "#FFD600"             // Yellow accent
};

const DoughnutChart = ({ data, centerText, centerSubText, colors }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill || (index === 0 ? colors.success : colors.failed)} 
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} members`, name]} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Text */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none"
      }}>
        <div style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}>
          {centerText}
        </div>
        <div style={{ fontSize: 14, color: "#8C8C8C" }}>
          {centerSubText}
        </div>
      </div>
    </div>
  </div>
);

const QuitRate = ({ colors: propColors, theme }) => {
  // Use passed colors or default colors - matching Overall Members Distribution pattern
  const chartColors = {
    success: propColors?.accent3 || theme?.success || DEFAULT_COLORS.success,
    failed: propColors?.accent2 || theme?.danger || DEFAULT_COLORS.failed,
    freeMembers: propColors?.primary || theme?.primary || DEFAULT_COLORS.freeMembers,
    premiumMembers: propColors?.secondary || theme?.warning || DEFAULT_COLORS.premiumMembers,
    text: theme?.secondary || DEFAULT_COLORS.text,
    pink: theme?.accent || DEFAULT_COLORS.pink,
    purple: propColors?.accent1 || DEFAULT_COLORS.purple,
    yellow: theme?.warning || DEFAULT_COLORS.yellow
  };
  // Define colors for each chart type
  const FREE_MEMBERS_COLORS = [chartColors.success, chartColors.failed]; // Success, Failed
  const PREMIUM_MEMBERS_COLORS = [chartColors.success, chartColors.failed]; // Success, Failed

  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardService.getPlanStats().then(setStats);
  }, []);

  if (!stats) return null; // hoặc loading indicator

  // Chuẩn hóa dữ liệu cho chart
  const freeWithColors = (stats.free?.distribution || []).map((item, index) => ({
    ...item,
    fill: FREE_MEMBERS_COLORS[index]
  }));

  const premiumWithColors = (stats.premium?.distribution || []).map((item, index) => ({
    ...item,
    fill: PREMIUM_MEMBERS_COLORS[index]
  }));

  return (
    <div style={{ width: "100%", height: "100%", padding: "20px 0" }}>
      <Row gutter={[24, 24]}>
        {/* Chart 1: Free Members */}
        <Col xs={24} md={12}>
          <h2 style={{ textAlign: "center", color: chartColors.text, marginBottom: 16 }}>Free Members</h2>
          <DoughnutChart
            data={freeWithColors}
            title="Free Members"
            centerText={stats.free?.total ?? 0}
            centerSubText={`${stats.free?.successRate ?? 0}% Success`}
            colors={chartColors}
          />
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginTop: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                backgroundColor: chartColors.success,
                width: 12,
                height: 12,
                borderRadius: "50%",
                display: "inline-block"
              }}></span>
              <Text style={{ fontWeight: "500" }}>
                {stats.free?.success ?? 0} Success
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                backgroundColor: chartColors.failed,
                width: 12,
                height: 12,
                borderRadius: "50%",
                display: "inline-block"
              }}></span>
              <Text style={{ fontWeight: "500" }}>
                {stats.free?.failed ?? 0} Failed
              </Text>
            </div>
          </div>
        </Col>

        {/* Chart 2: Premium Members */}
        <Col xs={24} md={12}>
          <h2 style={{ textAlign: "center", color: chartColors.text, marginBottom: 16 }}>Premium Members</h2>
          <DoughnutChart
            data={premiumWithColors}
            title="Premium Members"
            centerText={stats.premium?.total ?? 0}
            centerSubText={`${stats.premium?.successRate ?? 0}% Success`}
            colors={chartColors}
          />
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginTop: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                backgroundColor: chartColors.success,
                width: 12,
                height: 12,
                borderRadius: "50%",
                display: "inline-block"
              }}></span>
              <Text style={{ fontWeight: "500" }}>
                {stats.premium?.success ?? 0} Success
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                backgroundColor: chartColors.failed,
                width: 12,
                height: 12,
                borderRadius: "50%",
                display: "inline-block"
              }}></span>
              <Text style={{ fontWeight: "500" }}>
                {stats.premium?.failed ?? 0} Failed
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default QuitRate;
