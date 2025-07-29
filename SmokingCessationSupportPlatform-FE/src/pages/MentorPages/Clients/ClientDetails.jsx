import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Typography,
  Space,
  Tabs,
  Row,
  Col,
  Tag,
  Modal,
  Input,
  Statistic,
  List,
  Badge,
  Spin,
  Alert,
  Rate,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  DollarOutlined,
  FireOutlined,
  VideoCameraOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  StarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { coachService } from "../../../services/coachService";
import styles from "./ClientDetails.module.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const MentorClientDetails = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [coachNotes, setCoachNotes] = useState("");
  const [clientData, setClientData] = useState(null);
  const [smokingProgress, setSmokingProgress] = useState(null);
  const [userReasons, setUserReasons] = useState([]);
  const [userTriggers, setUserTriggers] = useState([]);
  const [userStrategies, setUserStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [latestConsultationId, setLatestConsultationId] = useState(null);
  const [userBadges, setUserBadges] = useState([]);

  const slotNumberToTime = (slotNumber) => {
    const timeRanges = {
      1: "7:00 AM - 9:30 AM",
      2: "9:30 AM - 12:00 PM",
      3: "13:00 PM - 15:30 PM",
      4: "15:30 PM - 18:00 PM",
    };
    return timeRanges[slotNumber] || "Time not available";
  };

  const mapConsultationStatusToClientStatus = (consultationStatus) => {
    switch (consultationStatus) {
      case "completed":
        return "completed";
      case "scheduled":
        return "active";
      case "cancelled":
        return "inactive";
      default:
        return "active";
    }
  };

  useEffect(() => {
    const buildClientData = (consultations, progressData) => {
      const clientConsultations = consultations.filter(
        (consultation) => consultation.user.userId.toString() === clientId
      );

      if (clientConsultations.length === 0) {
        return null; // Client không tồn tại
      }

      // Lấy thông tin client từ consultation đầu tiên
      const firstConsultation = clientConsultations[0];
      const user = firstConsultation.user;

      // Xây dựng consultation history
      const consultationHistory = clientConsultations.map((consultation) => ({
        id: consultation.consultationId,
        type: "Video Consultation",
        date: consultation.slot.slotDate,
        time: slotNumberToTime(consultation.slot.slotNumber),
        status: consultation.status,
        notes:
          consultation.notes || "No notes available for this consultation.",
        rating: consultation.rating,
        feedback: consultation.feedback,
      })); // Xác định trạng thái client
      const latestStatus = clientConsultations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0]?.status;

      // Lấy consultation mới nhất để lưu notes
      const latestConsultation = clientConsultations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      // Sử dụng dữ liệu từ smoking progress nếu có
      const progress = progressData || {};

      return {
        id: user.userId,
        name: user.fullName || user.profileName || "Unknown Client",
        email: user.email || "N/A",
        avatar: user.avatarUrl || "",
        profileName: user.profileName || null,
        gender: user.gender || null,
        birthDate: user.birthDate || null,
        status: mapConsultationStatusToClientStatus(latestStatus),
        joinDate: firstConsultation.createdAt,
        currentProgress: {
          daysSmokeFreee: progress.daysSinceStart || 0,
          cravingLevel: progress.averageCravingLevel || 5,
          nextSession: null, // Có thể tính toán từ scheduled consultations
        },
        detailedInfo: {
          totalSavings: progress.moneySaved || 0,
          consultationsAttended: clientConsultations.filter(
            (c) => c.status === "completed"
          ).length,
          motivations: ["Improve health", "Save money", "Family"], // Default values
          goals: ["30 days smoke-free", "Reduce daily cigarettes"], // Default values
          notes: latestConsultation?.notes || "", // Lấy notes từ consultation mới nhất
          consultationHistory: consultationHistory,
          cigarettesPerDay: progress.cigarettesPerDay || 0,
          cigarettesAvoided: progress.cigarettesAvoided || 0,
          smokingHistoryByDate: progress.smokingHistoryByDate || {},
        },
        latestConsultationId: latestConsultation?.consultationId || null,
      };
    };

    const fetchClientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [consultations, progressData, reasons, triggers, strategies] =
          await Promise.all([
            coachService.getMentorConsultations(),
            coachService.getUserSmokingProgress(clientId).catch(() => null), // Không bắt buộc có progress data
            coachService.getUserReasons(clientId).catch(() => []), // Lấy reasons của user
            coachService.getUserTriggers(clientId).catch(() => []), // Lấy triggers của user
            coachService.getUserStrategies(clientId).catch(() => []), // Lấy strategies của user
          ]);

        // Lấy badges riêng biệt
        const badges = await coachService
          .getUserBadges(clientId)
          .catch(() => []);

        // Xây dựng dữ liệu client
        const clientInfo = buildClientData(consultations, progressData?.[0]);

        if (!clientInfo) {
          setError("Client not found");
          return;
        }

        setClientData(clientInfo);
        setSmokingProgress(progressData?.[0]); // Take the first progress record
        setUserReasons(reasons || []);
        setUserTriggers(triggers || []);
        setUserStrategies(strategies || []);
        setUserBadges(badges || []);
        setLatestConsultationId(clientInfo.latestConsultationId);

        if (clientInfo?.detailedInfo?.notes) {
          setCoachNotes(clientInfo.detailedInfo.notes);
        }
      } catch (err) {
        setError("Failed to load client data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading client details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Alert message="Error" description={error} type="error" showIcon />
        <Button
          type="primary"
          onClick={() => navigate("/mentor/clients")}
          style={{ marginTop: 16 }}
        >
          Back to Clients List
        </Button>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Title level={2}>Client Not Found</Title>
        <Paragraph>
          The client with ID "{clientId}" could not be found.
        </Paragraph>
        <Button type="primary" onClick={() => navigate("/mentor/clients")}>
          Back to Clients List
        </Button>
      </div>
    );
  }

  const handleBackToList = () => {
    navigate("/mentor/clients");
  };

  const handleViewConsultationNotes = (consultation) => {
    setSelectedConsultation(consultation);
    setNotesModalVisible(true);
  };

  const getCravingColor = (intensity) => {
    if (intensity <= 3) return "#52c41a";
    if (intensity <= 6) return "#faad14";
    return "#ff4d4f";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#52c41a";
      case "at-risk":
        return "#ff4d4f";
      case "completed":
        return "#1890ff";
      case "inactive":
        return "#d9d9d9";
      default:
        return "#1890ff";
    }
  };

  const saveCoachNotes = async () => {
    if (!latestConsultationId || !coachNotes.trim()) {
      Modal.warning({
        title: "Cannot Save Notes",
        content:
          "No consultation found or notes are empty. Please ensure there is at least one consultation for this client.",
      });
      return;
    }

    setSavingNotes(true);
    try {
      await coachService.addConsultationNote(latestConsultationId, coachNotes);

      // Cập nhật local state
      setClientData((prev) => ({
        ...prev,
        detailedInfo: {
          ...prev.detailedInfo,
          notes: coachNotes,
        },
      }));

      Modal.success({
        title: "Notes Saved",
        content: "Your notes have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save notes:", error);
      Modal.error({
        title: "Save Failed",
        content: "Failed to save notes. Please try again.",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <>
      {/* Header with Back Button */}
      <div className={styles.headerSection}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToList}
          className={styles.backButton}
        >
          Back to Clients
        </Button>
        <div className={styles.breadcrumb}>
          <Text type="secondary">Pages</Text>
          <Text type="secondary" className={styles.separator}>
            /
          </Text>
          <Text type="secondary">Clients</Text>
          <Text type="secondary" className={styles.separator}>
            /
          </Text>
          <Text strong>{clientData.name}</Text>
        </div>
      </div>

      {/* Client Header */}
      <Card className={styles.clientHeaderCard} style={{ marginBottom: 24 }}>
        <Row gutter={32} align="middle">
          <Col span={3}>
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={120}
                src={clientData.avatar}
                className={styles.clientAvatar}
                style={{
                  border: "4px solid #f0f0f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {clientData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
            </div>
          </Col>
          <Col span={21}>
            <div style={{ paddingLeft: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Title
                  level={1}
                  className={styles.clientName}
                  style={{
                    marginBottom: 0,
                    fontSize: 32,
                    fontWeight: 600,
                    color: "#1f1f1f",
                  }}
                >
                  {clientData.name}
                </Title>
                {clientData.profileName && (
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#8c8c8c",
                      fontStyle: "italic",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    @{clientData.profileName}
                  </Text>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 16,
                    color: "#666",
                  }}
                >
                  {clientData.email}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <Tag
                  color={getStatusColor(clientData.status)}
                  style={{
                    fontSize: 13,
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {clientData.status}
                </Tag>

                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {clientData.gender && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginRight: 6,
                        }}
                      >
                        Gender:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#595959",
                        }}
                      >
                        {clientData.gender.charAt(0).toUpperCase() +
                          clientData.gender.slice(1)}
                      </Text>
                    </div>
                  )}

                  {clientData.birthDate && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginRight: 6,
                        }}
                      >
                        Birth:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#595959",
                        }}
                      >
                        {new Date(clientData.birthDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </Text>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginRight: 6,
                      }}
                    >
                      Joined:
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#595959",
                      }}
                    >
                      {new Date(clientData.joinDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card className={styles.tabsCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Overview" key="overview">
            <Row gutter={24}>
              <Col span={12}>
                <Card
                  className={styles.statCard}
                  hoverable={false}
                  style={{ backgroundColor: "#F5F8FA" }}
                >
                  <Statistic
                    title="Total Consultations"
                    value={clientData.detailedInfo.consultationsAttended}
                    prefix={
                      <VideoCameraOutlined
                        className={styles.consultationIcon}
                      />
                    }
                    valueStyle={{ color: "#722ed1" }}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setActiveTab("history")}
                    style={{
                      marginTop: 8,
                      padding: 0,
                      height: "auto",
                      color: "#722ed1",
                    }}
                  >
                    View Consultation History →
                  </Button>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  className={styles.statCard}
                  hoverable={false}
                  style={{ backgroundColor: "#F5F8FA" }}
                >
                  <Statistic
                    title="Total Achievements"
                    value={userBadges.length}
                    prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                    valueStyle={{ color: "#faad14" }}
                  />
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    Badges earned during journey
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* Achievements & Badges Section - Full Width Row */}
            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card
                  className={styles.statCard}
                  style={{ minHeight: 250, backgroundColor: "#F5F8FA" }}
                  hoverable={false}
                >
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <TrophyOutlined
                      style={{
                        fontSize: 32,
                        color: "#faad14",
                        marginBottom: 12,
                      }}
                    />
                    <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                      Achievements & Badges
                    </Title>
                    <Text
                      type="secondary"
                      style={{ fontSize: 14, display: "block", marginTop: 8 }}
                    >
                      Client's earned achievements and milestones
                    </Text>
                  </div>

                  <div
                    style={{
                      maxHeight: 320,
                      overflowY: "auto",
                      overflowX: "auto",
                      padding: "0 16px",
                    }}
                  >
                    {userBadges.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          paddingBottom: 16,
                          justifyContent:
                            userBadges.length <= 4 ? "center" : "flex-start",
                          minWidth: "100%",
                        }}
                      >
                        {userBadges.map((badge, index) => (
                          <div
                            key={index}
                            style={{
                              minWidth: 200,
                              flexShrink: 0,
                              textAlign: "center",
                              padding: 20,
                              backgroundColor: "white",
                              border: "2px solid #f0f0f0",
                              borderRadius: 20,
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 8px 20px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 8px rgba(0,0,0,0.05)";
                            }}
                          >
                            <div style={{ marginBottom: 16 }}>
                              {badge.badgeImageUrl ? (
                                <img
                                  alt={badge.badgeName}
                                  src={badge.badgeImageUrl}
                                  style={{
                                    width: 120,
                                    height: 120,
                                    objectFit: "contain",
                                    borderRadius: 12,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 120,
                                    height: 120,
                                    backgroundColor: "#458FF6",
                                    borderRadius: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                  }}
                                >
                                  <TrophyOutlined
                                    style={{
                                      fontSize: 50,
                                      color: "white",
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <Text
                                strong
                                style={{
                                  fontSize: 18,
                                  color: "#458FF6",
                                  display: "block",
                                  marginBottom: 8,
                                  lineHeight: 1.3,
                                  fontWeight: 600,
                                }}
                              >
                                {badge.badgeName || badge.name || "Achievement"}
                              </Text>

                              {badge.earnedDate && (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#8c8c8c",
                                    display: "block",
                                  }}
                                >
                                  Earned:{" "}
                                  {new Date(
                                    badge.earnedDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </Text>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "60px 0",
                          color: "#8c8c8c",
                        }}
                      >
                        <TrophyOutlined
                          style={{
                            fontSize: 64,
                            color: "#d9d9d9",
                            marginBottom: 16,
                            display: "block",
                          }}
                        />
                        <Title
                          level={4}
                          style={{ color: "#8c8c8c", marginBottom: 8 }}
                        >
                          No Achievements Yet
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          Keep supporting your client to help them earn their
                          first achievement!
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Plan & Notes" key="plan">
            <Row gutter={24}>
              <Col span={24}>
                {/* Reasons Section */}
                <Card
                  title="Quit Smoking Reasons"
                  className={styles.motivationCard}
                  style={{ marginBottom: 16 }}
                >
                  <div className={styles.reasonsSection}>
                    {userReasons.length > 0 ? (
                      <ul className={styles.reasonsList}>
                        {userReasons.map((reason, index) => (
                          <li key={index} className={styles.reasonItem}>
                            {reason.reasonText}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Text type="secondary">No reasons provided yet.</Text>
                    )}
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                {/* Triggers Section */}
                <Card
                  title="Smoking Triggers"
                  className={styles.motivationCard}
                  style={{ marginBottom: 16 }}
                >
                  <div className={styles.triggersSection}>
                    {userTriggers.length > 0 &&
                    userTriggers[0]?.triggerCategories ? (
                      userTriggers[0].triggerCategories.map((category) => (
                        <div
                          key={category.categoryId}
                          style={{ marginBottom: 16 }}
                        >
                          <Title
                            level={5}
                            style={{ color: "#ff4d4f", marginBottom: 8 }}
                          >
                            {category.name}
                          </Title>
                          <ul className={styles.triggersList}>
                            {category.triggers.map((trigger) => (
                              <li
                                key={trigger.triggerId}
                                className={styles.triggerItem}
                              >
                                {trigger.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">No triggers identified yet.</Text>
                    )}
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                {/* Strategies Section */}
                <Card
                  title="Strategies"
                  className={styles.motivationCard}
                  style={{ marginBottom: 16 }}
                >
                  <div className={styles.strategiesSection}>
                    {userStrategies.length > 0 &&
                    userStrategies[0]?.strategyCategories ? (
                      userStrategies[0].strategyCategories.map((category) => (
                        <div
                          key={category.categoryId}
                          style={{ marginBottom: 16 }}
                        >
                          <Title
                            level={5}
                            style={{ color: "#52c41a", marginBottom: 8 }}
                          >
                            {category.name}
                          </Title>
                          <ul className={styles.strategiesList}>
                            {category.strategies.map((strategy) => (
                              <li
                                key={strategy.strategyId}
                                className={styles.strategyItem}
                              >
                                {strategy.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">No strategies planned yet.</Text>
                    )}
                  </div>
                </Card>
              </Col>

              <Col span={24}>
                {/* Coach Notes */}
                <Card
                  title="Coach's Private Notes"
                  className={styles.notesCard}
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={saveCoachNotes}
                      loading={savingNotes}
                      disabled={!coachNotes.trim() || !latestConsultationId}
                      className={styles.saveNotesButton}
                    >
                      Save Notes
                    </Button>
                  }
                >
                  <TextArea
                    rows={6}
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    placeholder="Add your private notes about this client..."
                    className={styles.notesTextArea}
                  />
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Consultation History" key="history">
            <List
              itemLayout="horizontal"
              dataSource={clientData.detailedInfo.consultationHistory.filter(
                (consultation) => consultation.status === "completed"
              )}
              className={styles.consultationList}
              locale={{
                emptyText: "No completed consultations yet",
              }}
              renderItem={(consultation) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewConsultationNotes(consultation)}
                      className={styles.viewNotesButton}
                    >
                      Consultation Details
                    </Button>,
                  ]}
                  className={styles.consultationItem}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<VideoCameraOutlined />}
                        className={styles.consultationAvatar}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{consultation.type}</Text>
                        <Badge status="success" text="Completed" />
                        {consultation.rating > 0 && (
                          <Text type="secondary">
                            ({consultation.rating}/5 stars)
                          </Text>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {new Date(consultation.date).toLocaleDateString(
                            "en-GB"
                          )}{" "}
                          at {consultation.time}
                        </Text>
                        {consultation.feedback && (
                          <Text italic style={{ color: "#52c41a" }}>
                            "{consultation.feedback}"
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          {/* Smoking Progress Tab - hiển thị nếu có dữ liệu */}
          {smokingProgress && (
            <Tabs.TabPane tab="Smoking Progress" key="progress">
              {/* Overview Statistics */}
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card
                    className={styles.statCard}
                    hoverable={false}
                    style={{ backgroundColor: "#F5F8FA" }}
                  >
                    <Statistic
                      title="Days Since Start"
                      value={smokingProgress.daysSinceStart}
                      prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Started:{" "}
                      {new Date(smokingProgress.startDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card
                    className={styles.statCard}
                    hoverable={false}
                    style={{ backgroundColor: "#F5F8FA" }}
                  >
                    <Statistic
                      title="Money Saved"
                      value={smokingProgress.moneySaved}
                      prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Pack cost:{" "}
                      {smokingProgress.cigarettePackCost?.toLocaleString()}
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card
                    className={styles.statCard}
                    hoverable={false}
                    style={{ backgroundColor: "#F5F8FA" }}
                  >
                    <Statistic
                      title="Cigarettes Avoided"
                      value={smokingProgress.cigarettesAvoided}
                      prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Target: {smokingProgress.cigarettesPerDay || 0} per day
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card
                    className={styles.statCard}
                    hoverable={false}
                    style={{ backgroundColor: "#F5F8FA" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14, color: "#8c8c8c" }}>
                          Average Craving Level
                        </Text>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 24,
                            fontWeight: "bold",
                            color: getCravingColor(
                              smokingProgress.averageCravingLevel
                            ),
                          }}
                        >
                          {smokingProgress.averageCravingLevel}/10
                        </Text>
                      </div>
                      <Progress
                        percent={
                          (smokingProgress.averageCravingLevel / 10) * 100
                        }
                        showInfo={false}
                        strokeColor={getCravingColor(
                          smokingProgress.averageCravingLevel
                        )}
                        trailColor="#f0f0f0"
                        size="small"
                      />
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Status and Plan Information */}
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Card
                    title="Progress Status"
                    className={styles.motivationCard}
                    hoverable={false}
                  >
                    <div style={{ padding: "16px 0" }}>
                      <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text strong>Current Status:</Text>
                          <Tag
                            color={
                              smokingProgress.status === "active"
                                ? "green"
                                : "default"
                            }
                            style={{
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >
                            {smokingProgress.status}
                          </Tag>
                        </div>

                        {smokingProgress.targetDays && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text strong>Target Days:</Text>
                            <Text>{smokingProgress.targetDays} days</Text>
                          </div>
                        )}

                        {smokingProgress.endDate && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text strong>End Date:</Text>
                            <Text>
                              {new Date(
                                smokingProgress.endDate
                              ).toLocaleDateString("en-GB")}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </div>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card
                    title="Smoking Habits"
                    className={styles.motivationCard}
                    hoverable={false}
                  >
                    <div style={{ padding: "16px 0" }}>
                      <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <FireOutlined
                              style={{ color: "#ff4d4f", fontSize: 20 }}
                            />
                            <Text strong style={{ fontSize: 16 }}>
                              Cigarettes per Day
                            </Text>
                          </div>
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "bold",
                              color: "#ff4d4f",
                            }}
                          >
                            {smokingProgress.cigarettesPerDay}
                          </Text>
                        </div>

                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <Text strong style={{ fontSize: 14 }}>
                              Cigarettes per Pack
                            </Text>
                          </div>
                          <Text style={{ fontSize: 18, color: "#8c8c8c" }}>
                            {smokingProgress.cigarettesPerPack}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Recent Smoking History */}
              {smokingProgress.smokingHistoryByDate &&
                Object.keys(smokingProgress.smokingHistoryByDate).length >
                  0 && (
                  <Card
                    title="Recent Smoking History"
                    className={styles.smokingHistoryCard}
                    hoverable={false}
                  >
                    {Object.entries(smokingProgress.smokingHistoryByDate)
                      .sort(
                        ([dateA], [dateB]) => new Date(dateB) - new Date(dateA)
                      ) // Sort by date descending
                      .slice(0, 7) // Show last 7 days
                      .map(([date, events]) => (
                        <div key={date} style={{ marginBottom: 24 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 16,
                              paddingBottom: 8,
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <CalendarOutlined
                              style={{ color: "#1890ff", marginRight: 8 }}
                            />
                            <Title level={5} style={{ margin: 0 }}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </Title>
                          </div>

                          <List
                            size="small"
                            dataSource={events}
                            renderItem={(event) => (
                              <List.Item
                                style={{
                                  padding: "12px 16px",
                                  margin: "8px 0",
                                  backgroundColor: "#fafafa",
                                  borderRadius: 8,
                                  border: "1px solid #f0f0f0",
                                }}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size={40}
                                      src={event.user?.avatarUrl}
                                      style={{ backgroundColor: "#ff4d4f" }}
                                    >
                                      {event.user?.fullName?.charAt(0) || "U"}
                                    </Avatar>
                                  }
                                  title={
                                    <Space>
                                      <Text strong>
                                        {event.cigarettesSmoked} cigarettes
                                        smoked
                                      </Text>
                                      <Tag
                                        color={getCravingColor(
                                          event.cravingLevel
                                        )}
                                        style={{ fontWeight: 500 }}
                                      >
                                        Craving: {event.cravingLevel}/10
                                      </Tag>
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size="small">
                                      <Text type="secondary">
                                        <CalendarOutlined
                                          style={{ marginRight: 4 }}
                                        />
                                        {new Date(
                                          event.eventTime
                                        ).toLocaleString("en-GB")}
                                      </Text>
                                      {event.notes && (
                                        <Text
                                          italic
                                          style={{ color: "#595959" }}
                                        >
                                          "{event.notes}"
                                        </Text>
                                      )}
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                      ))}

                    {Object.keys(smokingProgress.smokingHistoryByDate)
                      .length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 0",
                          color: "#8c8c8c",
                        }}
                      >
                        <CalendarOutlined
                          style={{
                            fontSize: 48,
                            marginBottom: 16,
                            color: "#d9d9d9",
                          }}
                        />
                        <Title
                          level={4}
                          style={{ color: "#8c8c8c", marginBottom: 8 }}
                        >
                          No Smoking History Yet
                        </Title>
                        <Text type="secondary">
                          Smoking events will appear here as they are recorded.
                        </Text>
                      </div>
                    )}
                  </Card>
                )}
            </Tabs.TabPane>
          )}
        </Tabs>
      </Card>

      {/* Consultation Notes Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: "16px" }}>
              Consultation Details
            </Text>
          </div>
        }
        open={notesModalVisible}
        onCancel={() => setNotesModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNotesModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
        className={styles.consultationModal}
      >
        {selectedConsultation && (
          <div>
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
                      {new Date(selectedConsultation.date).toLocaleDateString(
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
                      TIME
                    </Text>
                    <Text strong>{selectedConsultation.time}</Text>
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
                      TYPE
                    </Text>
                    <Text strong>{selectedConsultation.type}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Rating and Feedback Card */}
            {(selectedConsultation.rating > 0 ||
              selectedConsultation.feedback) && (
              <Card style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <StarOutlined style={{ marginRight: 8, color: "#faad14" }} />
                  <Title level={5} style={{ margin: 0 }}>
                    Rating & Feedback
                  </Title>
                </div>
                {selectedConsultation.rating > 0 && (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: "4px",
                    }}
                  >
                    <Text strong style={{ marginRight: 12 }}>
                      Rating:
                    </Text>
                    <Rate disabled defaultValue={selectedConsultation.rating} />
                    <Text style={{ marginLeft: 8, color: "#faad14" }}>
                      ({selectedConsultation.rating}/5)
                    </Text>
                  </div>
                )}
                {selectedConsultation.feedback && (
                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: "4px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#8c8c8c",
                        fontSize: "12px",
                      }}
                    >
                      FEEDBACK
                    </Text>
                    <Text>"{selectedConsultation.feedback}"</Text>
                  </div>
                )}
              </Card>
            )}

            {/* Notes Card */}
            <Card style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <EditOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <Title level={5} style={{ margin: 0 }}>
                  Consultation Notes
                </Title>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#fafafa",
                  borderRadius: "4px",
                  minHeight: "100px",
                }}
              >
                <Text>{selectedConsultation.notes}</Text>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </>
  );
};

export default MentorClientDetails;
