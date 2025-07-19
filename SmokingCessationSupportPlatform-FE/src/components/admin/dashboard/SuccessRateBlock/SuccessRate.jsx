import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList } from "recharts";
import { Select, Space, Typography } from "antd";
import { 
  SUCCESS_RATE_ALL_USERS, 
  SUCCESS_RATE_FREE_MEMBERS, 
  SUCCESS_RATE_PREMIUM_MEMBERS 
} from "../../../data/mockData";

const { Text } = Typography;

// Color constants for maintainability - Updated for better visual consistency
const PRIMARY_COLOR = "#1814F3";  // Primary blue
const SUCCESS_COLOR = "#16c784";  // Green for success/growth
const FAILED_COLOR = "#FF4D4F";   // Red for failure/decline  
const TARGET_COLOR = "#FFD600";   // Yellow for target line
const FREE_COLOR = "#1814F3";     // Primary blue for free members
const PREMIUM_COLOR = "#FFD600";  // Yellow for premium members
const TEXT_COLOR = "#333";        // Dark text for better readability

const SuccessRate = ({ colors, theme }) => {
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  
  // Use passed colors or default colors
  const chartColors = {
    primary: colors?.primary || theme?.primary || PRIMARY_COLOR,
    secondary: colors?.secondary || theme?.warning || PREMIUM_COLOR,
    success: theme?.success || SUCCESS_COLOR,
    danger: theme?.danger || FAILED_COLOR,
    warning: colors?.accent1 || theme?.warning || TARGET_COLOR,
    text: theme?.secondary || TEXT_COLOR
  };

  // Get data based on filter
  const getDataByFilter = () => {
    switch (userTypeFilter) {
      case 'free':
        return { 
          data: SUCCESS_RATE_FREE_MEMBERS, 
          lineColor: chartColors.primary,
          label: 'Free Members Success Rate'
        };
      case 'premium':
        return { 
          data: SUCCESS_RATE_PREMIUM_MEMBERS, 
          lineColor: chartColors.secondary,
          label: 'Premium Members Success Rate'
        };
      case 'comparison':
        // Merge data for comparison view
        return {
          data: SUCCESS_RATE_ALL_USERS.map((item, index) => ({
            ...item,
            freeRate: SUCCESS_RATE_FREE_MEMBERS[index]?.successRate || 0,
            premiumRate: SUCCESS_RATE_PREMIUM_MEMBERS[index]?.successRate || 0
          })),
          isComparison: true
        };
      default:
        return { 
          data: SUCCESS_RATE_ALL_USERS, 
          lineColor: chartColors.success,
          label: 'Overall Success Rate'
        };
    }
  };

  // Calculate month-over-month change
  const calculateChange = () => {
    const { data } = getDataByFilter();
    if (data.length < 2) return { change: 0, isPositive: true };
    
    // Lấy 2 tháng gần nhất
    const currentMonth = data[data.length - 1].successRate;  // June: 25%
    const previousMonth = data[data.length - 2].successRate; // May: 22%
    
    // Tính chênh lệch tuyệt đối: 25 - 22 = +3
    const change = currentMonth - previousMonth;
    
    return {
      change: Math.abs(change).toFixed(1),
      isPositive: change >= 0,                       // true (xanh) hoặc false (đỏ)
      percentage: ((change / previousMonth) * 100).toFixed(1) 
    };
  };

  // Custom label component for data points
  const DataLabel = (props) => {
    const { x, y, value } = props;
    return (
      <text 
        x={x} 
        y={y - 10} 
        textAnchor="middle" 
        fontSize={11} 
        fontWeight={500}
        fill={TEXT_COLOR}
      >
        {value}%
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "8px 12px",
            border: `1px solid ${SUCCESS_COLOR}`,
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <p style={{ margin: 0, color: TEXT_COLOR, fontWeight: 500 }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: "4px 0 0 0", color: entry.color, fontWeight: 600 }}>
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const { data, lineColor, label, isComparison } = getDataByFilter();
  const { change, isPositive, percentage } = calculateChange();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Summary Section and Filter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        paddingLeft: 20,
        paddingRight: 20
      }}>
        {/* Summary Section */}
        <div style={{ textAlign: 'right' }}>
          <Text 
            style={{ 
              color: isPositive ? chartColors.success : chartColors.danger,
              fontWeight: 600,
              fontSize: 14,
              // paddingTop: 4,
            }}
          >
            {isPositive ? '+' : '-'}{change}% Success Rate
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            (vs. last month {isPositive ? '+' : ''}{percentage}%)
          </Text>
        </div>

        {/* User Type Filter */}
        <Space align="center">
          <Text type="secondary" style={{ fontSize: 12 }}>User Type:</Text>
          <Select
            value={userTypeFilter}
            onChange={setUserTypeFilter}
            style={{ width: 140 }}
            size="small"
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'free', label: 'Free Members' },
              { value: 'premium', label: 'Premium Members' },
              { value: 'comparison', label: 'Compare Both' },
            ]}
          />
        </Space>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 30, right: 35, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e8e8e8"
            horizontal={true}
            vertical={false}
          />
          <XAxis 
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 12, 
              fill: "#999999",
              fontWeight: 400
            }}
            interval={0}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 12, 
              fill: "#999999",
              fontWeight: 400
            }}
            domain={[0, 40]}
            tickFormatter={(value) => `${value}%`}
          />
          
          {/* Target Line at 30% */}
          <ReferenceLine 
            y={30} 
            stroke={chartColors.warning} 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: "Target: 30%", 
              position: "insideTopRight",
              offset: -10,
              style: { 
                fontSize: 12, 
                fill: chartColors.warning, 
                fontWeight: 500,
                background: "#fff",
                padding: "2px 4px"
              }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Render lines based on filter */}
          {isComparison ? (
            <>
              <Line
                type="monotone"
                dataKey="freeRate"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 2, stroke: "#fff", r: 5 }}
                activeDot={{ r: 7, fill: chartColors.primary, stroke: "#fff", strokeWidth: 2 }}
                name="Free Members"
              >
                <LabelList content={<DataLabel />} dataKey="freeRate" />
              </Line>
              <Line
                type="monotone"
                dataKey="premiumRate"
                stroke={chartColors.secondary}
                strokeWidth={3}
                dot={{ fill: chartColors.secondary, strokeWidth: 2, stroke: "#fff", r: 5 }}
                activeDot={{ r: 7, fill: chartColors.secondary, stroke: "#fff", strokeWidth: 2 }}
                name="Premium Members"
              >
                <LabelList content={<DataLabel />} dataKey="premiumRate" />
              </Line>
            </>
          ) : (
            <Line
              type="monotone"
              dataKey="successRate"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, strokeWidth: 2, stroke: "#fff", r: 6 }}
              activeDot={{ r: 8, fill: lineColor, stroke: "#fff", strokeWidth: 2 }}
              name={label}
            >
              <LabelList content={<DataLabel />} />
            </Line>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Color Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 20,
        marginTop: 8,
        fontSize: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            backgroundColor: chartColors.secondary,
            width: 12,
            height: 12,
            borderRadius: "50%",
            display: "inline-block"
          }}></span>
          <Text style={{ fontSize: 14, color: chartColors.text }}>Premium</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            backgroundColor: chartColors.primary,
            width: 12,
            height: 12,
            borderRadius: "50%",
            display: "inline-block"
          }}></span>
          <Text style={{ fontSize: 14, color: chartColors.text }}>Free</Text>
        </div>
      </div>
    </div>
  );
};

export default SuccessRate;
