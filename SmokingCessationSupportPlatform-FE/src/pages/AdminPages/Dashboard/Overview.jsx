import { useState, useEffect } from "react";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import { Row, Col, Card, Typography } from "antd";
import { UserOutlined, DollarOutlined } from "@ant-design/icons";
import { userService } from "../../../services/userService.js";
import Revenue from "../../../components/admin/dashboard/RevenueBlock/Revenue";
import UserGrowth from "../../../components/admin/dashboard/UserGrowthBlock/UserGrowth";
import OverallMembers from "../../../components/admin/dashboard/OverallMembersBlock/OverallMembers";
import { dashboardService } from "../../../services/dashboardService.js";

const { Title, Text } = Typography;

const THEME_COLORS = {
  primary: "#1814F3",
  secondary: "#5572AF",
  success: "#16c784",
  danger: "#FF4D4F",
  warning: "#FFD600",
  accent: "#FF4FEE",
  blue: "#1814F3",
  orange: "#FF7723",
  darkBlue: "#2A324B",
  purple: "#9747FF",
};

const UI_COLORS = {
  cards: {
    totalUsers: "#1814F3",
    activeUsers: "#16c784",
    totalRevenue: "#FFD600",
    avgQuitDays: "#FF4FEE",
  },
  backgrounds: {
    totalUsers: "#EDF0FF",
    activeUsers: "#EDFBF5",
    totalRevenue: "#FFFAED",
    avgQuitDays: "#FDF0F0",
  },
  charts: {
    primary: "#1814F3",
    secondary: "#FFD600",
    accent1: "#FF4FEE",
    accent2: "#FF7723",
    accent3: "#16c784",
    background: "#FFFFFF",
    grid: "#EEEEEE",
  },
};

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
    span: { xs: 24 },
    key: "userGrowth",
  },
  {
    title: "Total Revenue",
    component: Revenue,
    span: { xs: 24 },
    key: "revenue",
  },
  {
    title: "Overall Members Distribution",
    component: OverallMembers,
    span: { xs: 24, lg: 12 },
    key: "overallMembers",
  },
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
        const userData = await userService.fetchAdminUsers();

        const revenueValue = await dashboardService.getTotalRevenue();

        if (userData && Array.isArray(userData)) {
          const totalUsers = userData.length;

          const activeUsers = userData.filter((user) => !user.block).length;

          const activePercentage =
            totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

          const formatRevenue = (value) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M VND`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K VND`;
            }
            return `${value} VND`;
          };

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
              value: formatRevenue(revenueValue || 0),
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
