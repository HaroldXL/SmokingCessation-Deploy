import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Space,
  Tag,
} from "antd";
import {
  CalendarOutlined,
  RiseOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import styles from "./Report.module.css";

const { Title, Text } = Typography;

export const MentorReports = () => {
  // Mock data for reports
  const monthlyStats = [
    { month: "Jan", sessions: 45, clients: 12, revenue: 2400 },
    { month: "Feb", sessions: 52, clients: 15, revenue: 2800 },
    { month: "Mar", sessions: 48, clients: 14, revenue: 2600 },
    { month: "Apr", sessions: 61, clients: 18, revenue: 3200 },
  ];

  const clientProgress = [
    {
      key: "1",
      name: "Matthew Paul",
      smokeFreedays: 45,
      sessionsAttended: 8,
      successRate: 85,
      status: "Excellent",
    },
    {
      key: "2",
      name: "Sophia Rodriguez",
      smokeFreedays: 28,
      sessionsAttended: 6,
      successRate: 72,
      status: "Good",
    },
    {
      key: "3",
      name: "David Chen",
      smokeFreedays: 15,
      sessionsAttended: 4,
      successRate: 58,
      status: "Needs Support",
    },
    {
      key: "4",
      name: "Emily Johnson",
      smokeFreedays: 60,
      sessionsAttended: 12,
      successRate: 92,
      status: "Excellent",
    },
  ];

  // Table columns
  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Smoke-Free Days",
      dataIndex: "smokeFreedays",
      key: "smokeFreedays",
      render: (days) => (
        <Text strong style={{ color: "#0d9488" }}>
          {days}
        </Text>
      ),
    },
    {
      title: "Sessions Attended",
      dataIndex: "sessionsAttended",
      key: "sessionsAttended",
    },
    {
      title: "Success Rate",
      dataIndex: "successRate",
      key: "successRate",
      render: (rate) => (
        <Progress
          percent={rate}
          size="default"
          strokeColor={
            rate >= 80 ? "#52c41a" : rate >= 60 ? "#faad14" : "#ff4d4f"
          }
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "Excellent") color = "green";
        else if (status === "Good") color = "blue";
        else if (status === "Needs Support") color = "orange";

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  //Component
  return (
    <>
      <Title level={2} className={styles.title}>
        Reports & Analytics
      </Title>

      {/* Key Metrics */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className={styles.card}>
            <Statistic
              title="Total Sessions This Month"
              value={61}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
              suffix={
                <Space>
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <Text style={{ color: "#52c41a", fontSize: 12 }}>+12%</Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.card}>
            <Statistic
              title="Monthly Revenue"
              value={3200}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#722ed1" }}
              suffix={
                <Space>
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <Text style={{ color: "#52c41a", fontSize: 12 }}>+23%</Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.card}>
            <Statistic
              title="Success Rate"
              value={87}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={16}>
          {/* Client Progress Table */}
          <Card
            title="Client Progress Overview"
            className={styles.clientProgressTable}
          >
            <Table
              columns={columns}
              dataSource={clientProgress}
              pagination={false}
              size="middle"
            />
            <div style={{ marginTop: "16px", maxWidth: "80%" }}>
              <Text italic type="secondary" style={{ fontSize: 12 }}>
                *Sessions Attended: Number of counseling sessions attended by
                the client. This is an important indicator of client commitment
                and is closely correlated with the likelihood of successfully
                quitting smoking.
              </Text>
            </div>
          </Card>

          {/* Monthly Performance */}
          {/* <Card 
            title="Monthly Performance" 
            className={styles.monthlyPerformance}
          >
            <Row gutter={16}>
              {monthlyStats.map((stat, index) => (
                <Col span={6} key={index}>
                  <Card 
                    size="small" 
                    className={styles.monthlyCard}
                  >
                    <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                      {stat.month}
                    </Title>
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Sessions: <Text strong>{stat.sessions}</Text>
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Clients: <Text strong>{stat.clients}</Text>
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Revenue: <Text strong>${stat.revenue}</Text>
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card> */}
        </Col>

        <Col span={8}>
          {/* Success Metrics */}
          <Card title="Success Metrics" className={styles.successMetrics}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>Client Retention Rate</Text>
                </div>
                <Progress percent={94} strokeColor="#52c41a" />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>Session Completion Rate</Text>
                </div>
                <Progress percent={89} strokeColor="#52c41a" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default MentorReports;
