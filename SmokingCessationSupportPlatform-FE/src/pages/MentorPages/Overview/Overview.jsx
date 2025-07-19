import styles from "./Overview.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Spin,
  Alert,
  Space,
  Modal,
  Avatar,
  Divider,
  Rate,
} from "antd";
import api from "../../../config/axios";
import { coachService } from "../../../services/coachService";
import AppointmentSVG from "./AppointmentSVG";

const { Title, Text } = Typography;

export const MentorOverview = () => {
  const navigate = useNavigate();
  const [completedConsultations, setCompletedConsultations] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [smokingProgress, setSmokingProgress] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // State for feedback modal
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy overview stats và all consultations
        const [overviewRes, consultations] = await Promise.all([
          coachService.getDashboardOverview(),
          coachService.getMentorConsultations(),
        ]);

        setOverviewStats(overviewRes);

        // Lọc chỉ lấy những consultation đã completed
        const completed = consultations.filter(
          (consultation) => consultation.status === "completed"
        );
        setCompletedConsultations(completed);
      } catch {
        setError("Failed to fetch overview data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: get slot time range like in Appointment
  const getSlotTimeRange = (slotNumber) => {
    const timeRanges = {
      1: "7:00 AM - 9:30 AM",
      2: "9:30 AM - 12:00 PM",
      3: "13:00 PM - 15:30 PM",
      4: "15:30 PM - 18:00 PM",
    };
    return timeRanges[slotNumber] || "";
  };

  // Fetch consultation details for modal
  const fetchConsultationDetails = async (consultationId, userId) => {
    setModalLoading(true);
    try {
      const [consultationRes, progressRes] = await Promise.all([
        api.get(`/mentor-dashboard/consultations/${consultationId}`),
        coachService.getUserSmokingProgress(userId),
      ]);
      setSelectedConsultation(consultationRes.data);
      setSmokingProgress(progressRes[0] || null);
      setModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch consultation details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle click on client name
  const handleClientNameClick = (consultationId, userId) => {
    if (consultationId && userId) {
      fetchConsultationDetails(consultationId, userId);
    }
  };

  // Function to view user feedback
  const handleViewUserFeedback = async (consultation) => {
    try {
      setSelectedFeedback({
        clientName: consultation.user.fullName,
        date: `${consultation.slot.slotDate} ${getSlotTimeRange(
          consultation.slot.slotNumber
        )}`,
        rating: consultation.rating,
        feedback: consultation.feedback,
      });
      setFeedbackModalVisible(true);
    } catch (error) {
      console.error("Error preparing feedback display:", error);
    }
  };

  // Function to render completed consultation cards
  const renderCompletedConsultationCard = (consultation) => {
    const { consultationId, slot, user, rating, feedback } = consultation;
    const timeRange = getSlotTimeRange(slot.slotNumber);

    // Create slot object để match với format của Appointment.jsx
    const slotObj = {
      time: timeRange,
      isAvailable: false,
      clientName: user.fullName,
      clientId: user.userId,
      consultationId: consultationId,
      status: "completed",
    };

    return (
      <Card
        key={consultationId}
        className={styles.slotBookedCard}
        styles={{ body: { padding: 0 } }}
      >
        <div className={styles.slotCardContent}>
          <Text
            style={{
              fontSize: "16px",
              color: "#0A52B5",
              marginBottom: "8px",
              display: "block",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {new Date(slot.slotDate).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <Title level={4} className={styles.slotTimeText}>
            {slotObj.time}
          </Title>

          <CheckCircleOutlined className={styles.slotIconBooked} />
          <Text className={styles.slotStatusBooked}>
            Booked by{" "}
            <Typography.Link
              onClick={() =>
                handleClientNameClick(slotObj.consultationId, slotObj.clientId)
              }
              className={styles.clientNameLink}
            >
              {slotObj.clientName}
            </Typography.Link>
          </Text>

          {/* Show completed status and feedback button like in Appointment.jsx */}
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                padding: "6px 12px",
                backgroundColor: "#f6ffed",
                border: "1px solid #d9f7be",
                borderRadius: "4px",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              <Text
                style={{
                  color: "#52c41a",
                  fontWeight: "500",
                  fontSize: "12px",
                }}
              >
                ✓ Completed
              </Text>
            </div>

            {rating && feedback ? (
              <Button
                type="default"
                size="small"
                icon={<StarOutlined />}
                onClick={() => handleViewUserFeedback(consultation)}
                className={styles.startConsultationButton}
                style={{
                  width: "100%",
                  borderRadius: "4px",
                  backgroundColor: "#fff2e8",
                  borderColor: "#ffb84d",
                  color: "#d46b08",
                }}
              >
                View Feedback
              </Button>
            ) : (
              <Text
                style={{
                  fontSize: "12px",
                  color: "#8c8c8c",
                  textAlign: "center",
                  display: "block",
                }}
              >
                No feedback available
              </Text>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) return <Spin size="large" className={styles.loader} />;
  if (error)
    return (
      <Alert
        type="error"
        message={error}
        showIcon
        className={styles.errorAlert}
      />
    );

  return (
    <div className={styles.overviewPage}>
      <Title level={1} className={styles.pageTitle}>
        Overview
      </Title>

      {/* Stat Cards */}
      <Row gutter={24} className={styles.statCardsRow}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <div className={styles.statCardIconBg}>
              <CalendarOutlined className={styles.statCardIcon} />
            </div>
            <div>
              <div className={styles.statCardLabel}>Days with Appointments</div>
              <div className={styles.statCardValueTeal}>
                {overviewStats?.totalAppointmentDays ?? 0}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <div className={styles.statCardIconBg}>
              <CheckCircleOutlined className={styles.statCardIcon} />
            </div>
            <div>
              <div className={styles.statCardLabel}>Booked Slots</div>
              <div className={styles.statCardValueBlue}>
                {overviewStats?.totalBookedSlots ?? 0}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <div className={styles.statCardIconBg}>
              <ClockCircleOutlined className={styles.statCardIcon} />
            </div>
            <div>
              <div className={styles.statCardLabel}>Available Slots</div>
              <div className={styles.statCardValueGray}>
                {overviewStats?.availableSlots ?? 0}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <div className={styles.statCardIconBg}>
              <TeamOutlined className={styles.statCardIcon} />
            </div>
            <div>
              <div className={styles.statCardLabel}>Unique Clients</div>
              <div className={styles.statCardValueTeal}>
                {overviewStats?.uniqueClients ?? 0}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Completed Appointments */}
      <Card className={styles.todayCard}>
        <div className={styles.todayHeader}>
          <Title level={3} className={styles.todayTitle}>
            Completed Appointments
          </Title>
        </div>
        {completedConsultations.length === 0 ? (
          <div className={styles.emptyState}>
            <AppointmentSVG className={styles.emptySVG} />
            <Text className={styles.emptyText}>
              No completed appointments yet
            </Text>
            <Button
              type="primary"
              className={styles.ctaButton}
              onClick={() => navigate("/mentor/appointments")}
            >
              View All Appointments
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]} className={styles.timeSlotsRow}>
            {completedConsultations.map((consultation) => (
              <Col
                xs={24}
                sm={12}
                md={12}
                lg={6}
                key={consultation.consultationId}
                className={styles.timeSlotCol}
              >
                {renderCompletedConsultationCard(consultation)}
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Consultation Details Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: "16px" }}>
              Consultation Details
            </Text>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          selectedConsultation?.user?.userId && (
            <Button
              key="profile"
              type="primary"
              onClick={() => {
                navigate(`/mentor/clients/${selectedConsultation.user.userId}`);
                setModalVisible(false);
              }}
            >
              View Client Profile
            </Button>
          ),
        ]}
        width={700}
        loading={modalLoading}
      >
        {selectedConsultation && (
          <div>
            {/* Client Information Card */}
            <Card style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <Title level={5} style={{ margin: 0 }}>
                  Client Information
                </Title>
              </div>
              <Space align="start" size={16}>
                <Avatar
                  size={64}
                  src={selectedConsultation.user?.avatarUrl}
                  icon={<UserOutlined />}
                />
                <div style={{ flex: 1 }}>
                  <Text
                    strong
                    style={{ fontSize: 16, display: "block", marginBottom: 4 }}
                  >
                    {selectedConsultation.user?.fullName}
                  </Text>
                  <Text
                    style={{
                      display: "block",
                      marginBottom: 2,
                      color: "#8c8c8c",
                    }}
                  >
                    {selectedConsultation.user?.email}
                  </Text>
                  <Text
                    style={{
                      display: "block",
                      marginBottom: 2,
                      color: "#8c8c8c",
                    }}
                  >
                    Gender: {selectedConsultation.user?.gender || "N/A"}
                  </Text>
                  {selectedConsultation.user?.birthDate && (
                    <Text style={{ display: "block", color: "#8c8c8c" }}>
                      Birth Date:{" "}
                      {new Date(
                        selectedConsultation.user.birthDate
                      ).toLocaleDateString("en-GB")}
                    </Text>
                  )}
                </div>
              </Space>
            </Card>

            {/* Consultation Information Card */}
            <Card style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <CalendarOutlined
                  style={{ marginRight: 8, color: "#1890ff" }}
                />
                <Title level={5} style={{ margin: 0 }}>
                  Consultation Information
                </Title>
              </div>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: "4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#8c8c8c",
                        fontSize: "12px",
                        display: "block",
                      }}
                    >
                      DATE
                    </Text>
                    <Text strong>
                      {new Date(
                        selectedConsultation.slot?.slotDate
                      ).toLocaleDateString("en-GB")}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: "4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#8c8c8c",
                        fontSize: "12px",
                        display: "block",
                      }}
                    >
                      TIME
                    </Text>
                    <Text strong>
                      {getSlotTimeRange(selectedConsultation.slot?.slotNumber)}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: "4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#8c8c8c",
                        fontSize: "12px",
                        display: "block",
                      }}
                    >
                      STATUS
                    </Text>
                    <Text strong style={{ textTransform: "capitalize" }}>
                      {selectedConsultation.status}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: "4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#8c8c8c",
                        fontSize: "12px",
                        display: "block",
                      }}
                    >
                      CREATED
                    </Text>
                    <Text strong>
                      {new Date(
                        selectedConsultation.createdAt
                      ).toLocaleDateString("en-GB")}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Smoking Cessation Progress Card */}
            {smokingProgress && (
              <Card style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    Smoking Cessation Progress
                  </Title>
                </div>
                <Row gutter={[16, 12]}>
                  <Col span={8}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#1890ff",
                          marginBottom: 4,
                        }}
                      >
                        {smokingProgress.daysSinceStart}
                      </div>
                      <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        DAYS SMOKE-FREE
                      </Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#52c41a",
                          marginBottom: 4,
                        }}
                      >
                        {smokingProgress.moneySaved}
                      </div>
                      <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        MONEY SAVED
                      </Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#722ed1",
                          marginBottom: 4,
                        }}
                      >
                        {smokingProgress.cigarettesAvoided}
                      </div>
                      <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                        CIGARETTES AVOIDED
                      </Text>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#8c8c8c",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        START DATE
                      </Text>
                      <Text strong>
                        {new Date(smokingProgress.startDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#8c8c8c",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        STATUS
                      </Text>
                      <Text strong style={{ textTransform: "capitalize" }}>
                        {smokingProgress.status}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#8c8c8c",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        PLAN RESULT
                      </Text>
                      <Text strong style={{ textTransform: "capitalize" }}>
                        {smokingProgress.planResult}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#8c8c8c",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        CIGARETTES/DAY
                      </Text>
                      <Text strong>{smokingProgress.cigarettesPerDay}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#8c8c8c",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        CIGARETTES/PACK
                      </Text>
                      <Text strong>{smokingProgress.cigarettesPerPack}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#8c8c8c",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        PACK COST
                      </Text>
                      <Text strong>{smokingProgress.cigarettePackCost}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* User Feedback Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <StarOutlined style={{ marginRight: 8, color: "#faad14" }} />
            <Text strong style={{ fontSize: "16px" }}>
              User Feedback
            </Text>
          </div>
        }
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFeedbackModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={500}
      >
        {selectedFeedback && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Client: {selectedFeedback.clientName}
              </Text>
              <Text style={{ color: "#8c8c8c" }}>
                Consultation Time: {selectedFeedback.date}
              </Text>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Rating:
              </Text>
              <Rate
                disabled
                value={selectedFeedback.rating}
                style={{ fontSize: 20 }}
              />
              <Text
                style={{ marginLeft: 8, color: "#faad14", fontWeight: "500" }}
              >
                ({selectedFeedback.rating}/5)
              </Text>
            </div>

            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Feedback:
              </Text>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                  border: "1px solid #e8e8e8",
                }}
              >
                <Text>{selectedFeedback.feedback}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default MentorOverview;
