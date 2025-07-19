import { useState, useEffect } from "react";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import { Row, Col, Card, Typography, Button, Space } from "antd";
import {
  DownloadOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { userService } from "../../../services/userService.js";
import Revenue from "../../../components/admin/dashboard/RevenueBlock/Revenue";
import UserGrowth from "../../../components/admin/dashboard/UserGrowthBlock/UserGrowth";
import QuitRate from "../../../components/admin/dashboard/QuitRateBlock/QuitRate";
import OverallMembers from "../../../components/admin/dashboard/OverallMembersBlock/OverallMembers";
import SuccessRate from "../../../components/admin/dashboard/SuccessRateBlock/SuccessRate";
import { dashboardService } from "../../../services/dashboardService.js";

const { Title, Text } = Typography;

// Theme Colors
const THEME_COLORS = {
  primary: "#1814F3", // Main blue color from image
  secondary: "#5572AF",
  success: "#16c784", // Green from image for positive values
  danger: "#FF4D4F",
  warning: "#FFD600", // Yellow from image
  accent: "#FF4FEE", // Pink from image (for pie chart)
  blue: "#1814F3", // Deep blue
  orange: "#FF7723", // Orange from pie chart
  darkBlue: "#2A324B", // Dark blue/navy from pie chart
  purple: "#9747FF", // Purple accent
};

// UI Colors for Components
const UI_COLORS = {
  cards: {
    totalUsers: "#1814F3", // Main blue
    activeUsers: "#16c784", // Green for success
    totalRevenue: "#FFD600", // Yellow for revenue
    avgQuitDays: "#FF4FEE", // Pink accent
  },
  backgrounds: {
    totalUsers: "#EDF0FF", // Light blue for blue cards
    activeUsers: "#EDFBF5", // Light green for active users
    totalRevenue: "#FFFAED", // Light yellow for revenue
    avgQuitDays: "#FDF0F0", // Light pink for quit days
  },
  charts: {
    primary: "#1814F3", // Main blue for primary chart elements
    secondary: "#FFD600", // Yellow for secondary chart elements
    accent1: "#FF4FEE", // Pink for accent chart elements
    accent2: "#FF7723", // Orange for accent chart elements
    accent3: "#16c784", // Green for accent chart elements
    background: "#FFFFFF", // White chart background
    grid: "#EEEEEE", // Light grey for chart grid lines
  },
};

// Dashboard Statistics Configuration - Initial values
const INITIAL_STATS = [
  {
    title: "Total Users",
    value: "0",
    change: "0%",
    icon: UserOutlined,
    colorKey: "totalUsers",
  },
  {
    title: "Active Users",
    value: "0",
    change: "0%",
    icon: UserOutlined,
    colorKey: "activeUsers",
  },
  {
    title: "Total Revenue",
    value: "0 VND",
    change: "0%",
    icon: DollarOutlined,
    colorKey: "totalRevenue",
  },
];

// Chart Configuration
const CHART_CONFIG = [
  {
    title: "User Growth",
    component: UserGrowth,
    span: { xs: 24 }, // Full width
    key: "userGrowth",
  },
  {
    title: "Total Revenue",
    component: Revenue,
    span: { xs: 24 },
    key: "revenue",
  },
  {
    title: "Member Type Distribution",
    component: QuitRate,
    span: { xs: 24, lg: 12 },
    key: "memberType",
  },
  {
    title: "Overall Members Distribution",
    component: OverallMembers,
    span: { xs: 24, lg: 12 },
    key: "overallMembers",
  },
  // {
  //   title: "Success Rate Over The Months",
  //   component: SuccessRate,
  //   span: { xs: 24, lg: 12 },
  //   key: "successRate",
  // },
];

// Component: Dashboard Header
const DashboardHeader = () => (
  <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
    <Col>
      <Title
        level={2}
        style={{
          marginBottom: 0,
          color: THEME_COLORS.primary,
          fontWeight: 600,
        }}
      >
        Dashboard
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>
        Comprehensive analytics for your smoking cessation program
      </Text>
    </Col>
  </Row>
);

// Component: Statistics Card
const StatCard = ({ config }) => {
  const IconComponent = config.icon;
  return (
    <Card
      bordered={false}
      style={{
        background: UI_COLORS.backgrounds[config.colorKey],
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <Row align="middle" justify="space-between">
        <Col>
          <Text style={{ color: "#666", fontSize: 14, fontWeight: 500 }}>
            {config.title}
          </Text>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#333",
              marginTop: 6,
            }}
          >
            {config.value}
          </div>
          <Text
            style={{
              color: config.change.includes("+")
                ? THEME_COLORS.success
                : THEME_COLORS.danger,
              fontWeight: 500,
            }}
          >
            {config.change}
          </Text>
        </Col>
        <Col>
          <div
            style={{
              background: UI_COLORS.cards[config.colorKey],
              borderRadius: "50%",
              padding: 12,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <IconComponent
              style={{
                fontSize: 24,
                color: "#fff",
              }}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// Component: Chart Grid
const ChartGrid = () => {
  // Split charts into groups for better layout
  const fullWidthCharts = CHART_CONFIG.filter(
    (chart) => chart.span.xs === 24 && !chart.span.lg
  );
  const twoColumnCharts = CHART_CONFIG.filter((chart) => chart.span.lg === 12);

  // Card title style
  const cardTitleStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
    margin: 0,
  };

  // Card style
  const cardStyle = {
    height: "100%",
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  };

  return (
    <>
      {/* Full Width Charts */}
      {fullWidthCharts.map((chart) => (
        <Row key={chart.key} gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col {...chart.span}>
            <Card
              title={<span style={cardTitleStyle}>{chart.title}</span>}
              bordered={false}
              style={cardStyle}
              headStyle={{
                borderBottom: "1px solid #f0f0f0",
                padding: "16px 24px",
              }}
              bodyStyle={{ padding: "0px" }}
            >
              <chart.component colors={UI_COLORS.charts} theme={THEME_COLORS} />
            </Card>
          </Col>
        </Row>
      ))}

      {/* Two Column Charts */}
      {twoColumnCharts
        .reduce((rows, chart, index) => {
          if (index % 2 === 0) {
            rows.push([chart]);
          } else {
            rows[rows.length - 1].push(chart);
          }
          return rows;
        }, [])
        .map((chartRow, rowIndex) => (
          <Row
            key={`row-${rowIndex}`}
            gutter={[24, 24]}
            style={{ marginBottom: 24 }}
          >
            {chartRow.map((chart) => (
              <Col key={chart.key} {...chart.span}>
                <Card
                  title={<span style={cardTitleStyle}>{chart.title}</span>}
                  bordered={false}
                  style={cardStyle}
                  headStyle={{
                    borderBottom: "1px solid #f0f0f0",
                    padding: "16px 24px",
                  }}
                  bodyStyle={{ padding: "0px" }}
                >
                  <chart.component
                    colors={UI_COLORS.charts}
                    theme={THEME_COLORS}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ))}
    </>
  );
};

// Main Component
const Overview = () => {
  const [stats, setStats] = useState(INITIAL_STATS);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch users from API
        const userData = await userService.fetchAdminUsers();

        // Fetch revenue data
        const revenueValue = await dashboardService.getTotalRevenue();

        if (userData && Array.isArray(userData)) {
          // Calculate total users
          const totalUsers = userData.length;

          // Calculate active users (users who are not blocked)
          const activeUsers = userData.filter((user) => !user.block).length;

          // Calculate percentages
          const activePercentage =
            totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

          // Format revenue value
          const formatRevenue = (value) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M VND`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K VND`;
            }
            return `${value} VND`;
          };

          // Update stats with real data
          setStats([
            {
              title: "Total Users",
              value: totalUsers.toLocaleString(),
              change: `${totalUsers > 0 ? "+" : ""}${totalUsers}`,
              icon: UserOutlined,
              colorKey: "totalUsers",
            },
            {
              title: "Active Users",
              value: activeUsers.toLocaleString(),
              change: `${activePercentage}%`,
              icon: UserOutlined,
              colorKey: "activeUsers",
            },
            {
              title: "Total Revenue",
              value: formatRevenue(revenueValue || 0), // revenueValue = 198
              change: "+0",
              icon: DollarOutlined,
              colorKey: "totalRevenue",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch user statistics:", error);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <AdminLayout title="Dashboard Overview">
      <div style={{ padding: 24, height: "100%", width: "100%" }}>
        <DashboardHeader />

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {stats.map((config, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <StatCard config={config} />
            </Col>
          ))}
        </Row>

        <ChartGrid />
      </div>
    </AdminLayout>
  );
};

export default Overview;
