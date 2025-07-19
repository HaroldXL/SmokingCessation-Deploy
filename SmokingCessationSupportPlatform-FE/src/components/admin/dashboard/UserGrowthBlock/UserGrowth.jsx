import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { USER_GROWTH_DATA } from "../../../data/mockData";
import { Typography, Select, Row, Col } from "antd";
import { dashboardService } from "../../../../services/dashboardService"; // Thêm dòng này

// Default colors (will be overridden by props if provided)
const DEFAULT_COLORS = {
  lastWeek: {
    stroke: "#FFD600",
    fill: "#FFD600",
    gradient: {
      start: "#FFD600",
      end: "#FFD600"
    }
  },
  thisWeek: {
    stroke: "#1814F3", // Updated to primary blue color
    fill: "#1814F3", 
    gradient: {
      start: "#1814F3",
      end: "#1814F3"
    }
  },
  grid: "#EEEEEE",
  background: "#FFFFFF",
  negative: "#FF4D4F",
  positive: "#52C41A"
};

// Title and label styles
const TEXT_STYLES = {
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#333333",
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: "#666666"
  },
  analytics: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 12
  },
  newUsers: {
    color: "#FF9500"
  }
};

const UserGrowth = ({ colors, theme }) => {
  // Use passed colors or default colors
  const CHART_COLORS = {
    lastWeek: {
      stroke: colors?.secondary || DEFAULT_COLORS.lastWeek.stroke,
      fill: colors?.secondary || DEFAULT_COLORS.lastWeek.fill,
      gradient: {
        start: colors?.secondary || DEFAULT_COLORS.lastWeek.gradient.start,
        end: colors?.secondary || DEFAULT_COLORS.lastWeek.gradient.end
      }
    },
    thisWeek: {
      stroke: colors?.primary || DEFAULT_COLORS.thisWeek.stroke,
      fill: colors?.primary || DEFAULT_COLORS.thisWeek.fill,
      gradient: {
        start: colors?.primary || DEFAULT_COLORS.thisWeek.gradient.start,
        end: colors?.primary || DEFAULT_COLORS.thisWeek.gradient.end
      }
    },
    grid: colors?.grid || DEFAULT_COLORS.grid,
    background: colors?.background || DEFAULT_COLORS.background,
    negative: theme?.danger || DEFAULT_COLORS.negative,
    positive: theme?.success || DEFAULT_COLORS.positive
  };
  const [timePeriod, setTimePeriod] = useState("7Days");
  const [data, setData] = useState([]);
  const [userDifference, setUserDifference] = useState("");
  const [loading, setLoading] = useState(false);

  // Tính toán sự khác biệt người dùng
  const calculateUserDifference = (currentData, periodType) => {
    const lastKey = periodType === "Monthly" ? "last_month" : "last_period";
    const thisKey = periodType === "Monthly" ? "this_month" : "this_period";
    const sumLastPeriod = currentData.reduce((sum, item) => sum + (item[lastKey] || 0), 0);
    const sumThisPeriod = currentData.reduce((sum, item) => sum + (item[thisKey] || 0), 0);
    const difference = sumThisPeriod - sumLastPeriod;

    if (sumLastPeriod === 0 && sumThisPeriod === 0) {
      return "No change";
    }
    if (sumLastPeriod === 0 && sumThisPeriod > 0) {
      return `↑ ${sumThisPeriod} new users (new)`;
    }
    if (sumLastPeriod > 0) {
      const percentChange = ((difference / sumLastPeriod) * 10).toFixed(1);
      const prefix = difference >= 0 ? "↑" : "↓";
      return `${prefix} ${Math.abs(difference)} new users (${difference >= 0 ? '+' : ''}${percentChange}%)`;
    }
    return "No change";
  };

  // Hàm fetch data theo period
  const fetchData = async (period) => {
    setLoading(true);
    let newData = [];
    if (period === "7Days") {
      newData = await dashboardService.getUserGrowth7Days();
    } else if (period === "30Days") {
      newData = await dashboardService.getUserGrowth30Days();
    } else {
      newData = USER_GROWTH_DATA; // Monthly dùng mock data
    }
    
    console.log(`Data for ${period}:`, newData); // Debug line
    
    setData(newData);
    setUserDifference(calculateUserDifference(newData, period === "Monthly" ? "Monthly" : "Period"));
    setLoading(false);
  };

  // Khi đổi period
  const handlePeriodChange = (value) => {
    setTimePeriod(value);
    fetchData(value);
  };

  // Lấy dữ liệu khi mount và khi đổi period
  useEffect(() => {
    fetchData(timePeriod);
    // eslint-disable-next-line
  }, [timePeriod]);

  return (
    <div style={{ background: CHART_COLORS.background, borderRadius: 12, padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Row align="middle" gutter={8}>
            <Col>
              <Typography.Text style={TEXT_STYLES.label}>
                Time Period:
              </Typography.Text>
            </Col>
            <Col>
              <Select
                defaultValue="7Days"
                style={{ width: 120 }}
                onChange={handlePeriodChange}
                options={[
                  { value: '7Days', label: '7 Days' },
                  { value: '30Days', label: '30 Days' },
                  { value: 'Monthly', label: 'Monthly' }
                ]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      
      <div style={{ marginBottom: 12 }}>
        <Typography.Text 
          style={{ 
            color: userDifference.startsWith('↑') ? CHART_COLORS.positive : CHART_COLORS.negative, 
            fontWeight: 500, 
            fontSize: 14 
          }}
        >
          {userDifference}
        </Typography.Text>
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.lastWeek.gradient.start} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_COLORS.lastWeek.gradient.end} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorThis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.thisWeek.gradient.start} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_COLORS.thisWeek.gradient.end} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis 
            dataKey={timePeriod === "Monthly" ? "month" : "period"} 
            tick={{ fill: '#666666' }}
          />
          <YAxis 
            tick={{ fill: '#666666' }}
            domain={[0, (dataMax) => Math.max(dataMax + 2, 5)]}
            allowDataOverflow={false}
            tickCount={6}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
            }} 
          />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
            align="right"
          />
          <Area
            type="monotone"
            dataKey={timePeriod === "Monthly" ? "last_month" : "last_period"}
            stroke={CHART_COLORS.lastWeek.stroke}
            strokeWidth={2}
            fillOpacity={0.6}
            fill="url(#colorLast)"
            name="Last Week"
          />
          <Area
            type="monotone"
            dataKey={timePeriod === "Monthly" ? "this_month" : "this_period"}
            stroke={CHART_COLORS.thisWeek.stroke}
            strokeWidth={2}
            fillOpacity={0.6}
            fill="url(#colorThis)"
            name="This Week"
          />
        </AreaChart>
      </ResponsiveContainer>
      {loading && (
        <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
          <Typography.Text>Loading...</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default UserGrowth;
