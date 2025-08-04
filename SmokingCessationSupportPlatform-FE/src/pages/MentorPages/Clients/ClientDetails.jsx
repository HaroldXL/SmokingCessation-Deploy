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
  Form,
  DatePicker,
  InputNumber,
  message,
  Dropdown,
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
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  BellOutlined,
  DeleteOutlined,
  MoreOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { coachService } from "../../../services/coachService";
import styles from "./ClientDetails.module.css";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TIME_RANGES = {
  1: "7:00 AM - 9:30 AM",
  2: "9:30 AM - 12:00 PM",
  3: "13:00 PM - 15:30 PM",
  4: "15:30 PM - 18:00 PM",
};

const STATUS_COLOR_MAP = {
  active: "#52c41a",
  "at-risk": "#ff4d4f",
  completed: "#1890ff",
  inactive: "#d9d9d9",
};

const slotNumberToTime = (slotNumber) =>
  TIME_RANGES[slotNumber] || "Time not available";

const mapConsultationStatusToClientStatus = (status) => {
  const statusMap = {
    completed: "completed",
    scheduled: "active",
    cancelled: "inactive",
  };
  return statusMap[status] || "active";
};

const getAddictionColor = (dependencyLevel) => {
  switch (dependencyLevel?.toLowerCase()) {
    case "very_low":
      return "#52c41a";
    case "low":
      return "#52c41a";
    case "medium":
      return "#faad14";
    case "high":
      return "#ff4d4f";
    case "very_high":
      return "#ff4d4f";
    default:
      return "#d9d9d9";
  }
};

const getCravingColor = (intensity) => {
  if (intensity <= 3) return "#52c41a";
  if (intensity <= 6) return "#faad14";
  return "#ff4d4f";
};

const getStatusColor = (status) => {
  return STATUS_COLOR_MAP[status] || "#1890ff";
};

const DATE_FORMAT = "YYYY-MM-DD";

export const MentorClientDetails = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { clientId } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [clientData, setClientData] = useState(null);
  const [smokingProgress, setSmokingProgress] = useState(null);
  const [userReasons, setUserReasons] = useState([]);
  const [userTriggers, setUserTriggers] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [addictionScore, setAddictionScore] = useState(null);

  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [coachNotes, setCoachNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [latestConsultationId, setLatestConsultationId] = useState(null);

  const [userTasks, setUserTasks] = useState([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm] = Form.useForm();
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Notification states
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notificationForm] = Form.useForm();
  const [sendingNotification, setSendingNotification] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    const buildClientData = (consultations, progressData) => {
      const clientConsultations = consultations.filter(
        (consultation) => consultation.user.userId.toString() === clientId
      );

      if (clientConsultations.length === 0) return null;

      const firstConsultation = clientConsultations[0];
      const user = firstConsultation.user;
      const progress = progressData || {};

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
      }));

      const latestConsultation = clientConsultations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      return {
        id: user.userId,
        name: user.fullName || user.profileName || "Unknown Client",
        email: user.email || "N/A",
        avatar: user.avatarUrl || "",
        profileName: user.profileName || null,
        gender: user.gender || null,
        birthDate: user.birthDate || null,
        status: mapConsultationStatusToClientStatus(latestConsultation?.status),
        joinDate: firstConsultation.createdAt,
        currentProgress: {
          daysSmokeFreee: progress.daysSinceStart || 0,
          addictionScore: null, // Will be set separately from addiction API
          nextSession: null,
        },
        detailedInfo: {
          totalSavings: progress.moneySaved || 0,
          consultationsAttended: clientConsultations.filter(
            (c) => c.status === "completed"
          ).length,
          notes: latestConsultation?.notes || "",
          consultationHistory,
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
        const [
          consultations,
          progressData,
          reasons,
          triggers,
          questions,
          badges,
          scoreData,
        ] = await Promise.all([
          coachService.getMentorConsultations(),
          coachService.getUserSmokingProgress(clientId).catch(() => null),
          coachService.getUserReasons(clientId).catch(() => []),
          coachService.getUserTriggers(clientId).catch(() => []),
          coachService.getUserQuestions(clientId).catch(() => []),
          coachService.getUserBadges(clientId).catch(() => []),
          coachService.getUserAddictionScore(clientId).catch(() => null),
        ]);

        const clientInfo = buildClientData(consultations, progressData?.[0]);
        if (!clientInfo) {
          setError("Client not found");
          return;
        }

        // Update client data with addiction score
        if (scoreData) {
          clientInfo.currentProgress.addictionScore = scoreData;
        }

        setClientData(clientInfo);
        setSmokingProgress(progressData?.[0]);
        setUserReasons(reasons || []);
        setUserTriggers(triggers || []);
        setUserQuestions(questions || []);
        setUserBadges(badges || []);
        setAddictionScore(scoreData);
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

  useEffect(() => {
    if (clientId) {
      const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
          const tasks = await coachService.getMentorUserTasks(clientId);
          setUserTasks(tasks || []);
        } catch (error) {
          console.error("Failed to fetch user tasks:", error);
        } finally {
          setLoadingTasks(false);
        }
      };
      fetchTasks();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <div className={styles.loadingText}>Loading client details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert message="Error" description={error} type="error" showIcon />
        <Button
          type="primary"
          onClick={() => navigate("/mentor/clients")}
          className={styles.errorBackButton}
        >
          Back to Clients List
        </Button>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className={styles.notFoundContainer}>
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

  const handleBackToList = () => navigate("/mentor/clients");

  const handleViewConsultationNotes = (consultation) => {
    setSelectedConsultation(consultation);
    setNotesModalVisible(true);
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
      setClientData((prev) => ({
        ...prev,
        detailedInfo: { ...prev.detailedInfo, notes: coachNotes },
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

  const fetchUserTasks = async () => {
    setLoadingTasks(true);
    try {
      const tasks = await coachService.getMentorUserTasks(clientId);
      setUserTasks(tasks || []);
    } catch (error) {
      console.error("Failed to fetch user tasks:", error);
      message.error("Failed to load tasks. Please try again.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    taskForm.resetFields();
    setTaskModalVisible(true);
  };

  const handleEditTask = (task) => {
    if (!task) return;

    setEditingTask(task);
    taskForm.setFieldsValue({
      taskDay: task.taskDay ? dayjs(task.taskDay) : null,
      customSupportMeasures: task.customSupportMeasures,
      targetCigarettes: task.targetCigarettes,
    });
    setTaskModalVisible(true);
  };

  const handleSaveTask = async (values) => {
    try {
      const taskData = {
        taskDay: values.taskDay ? values.taskDay.format(DATE_FORMAT) : "",
        customSupportMeasures: values.customSupportMeasures,
        targetCigarettes: values.targetCigarettes,
      };

      if (editingTask) {
        await coachService.updateTask(editingTask.taskId, taskData);
        message.success("Task updated successfully!");
      } else {
        await coachService.assignTaskToUser({
          userId: parseInt(clientId),
          ...taskData,
        });
        message.success("Task created successfully!");
      }

      setTaskModalVisible(false);
      fetchUserTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
      message.error("Failed to save task. Please try again.");
    }
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    Modal.confirm({
      title: `Mark Task as ${
        newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      }`,
      content: `Are you sure you want to mark this task as ${newStatus}?`,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          setUpdatingTaskId(taskId);
          await coachService.updateTaskStatus(taskId, newStatus);
          message.success(`Task marked as ${newStatus}`);
          fetchUserTasks();
        } catch (error) {
          console.error("Failed to update task status:", error);
          message.error("Failed to update task status. Please try again.");
        } finally {
          setUpdatingTaskId(null);
        }
      },
    });
  };

  const getTaskActions = (task) => {
    if (task.status !== "pending") {
      return [];
    }

    return [
      {
        key: "completed",
        label: (
          <Space>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            Mark as Completed
          </Space>
        ),
        onClick: () => handleUpdateTaskStatus(task.taskId, "completed"),
      },
      {
        key: "failed",
        label: (
          <Space>
            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            Mark as Failed
          </Space>
        ),
        onClick: () => handleUpdateTaskStatus(task.taskId, "failed"),
      },
    ];
  };

  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: "Delete Task",
      content:
        "Are you sure you want to delete this task? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await coachService.deleteTask(taskId);
          message.success("Task deleted successfully!");
          fetchUserTasks();
        } catch (error) {
          console.error("Failed to delete task:", error);
          message.error("Failed to delete task. Please try again.");
        }
      },
    });
  };

  // Notification functions
  const handleOpenNotificationModal = () => {
    setNotificationModalVisible(true);
    notificationForm.resetFields();
  };

  const handleSendNotification = async (values) => {
    setSendingNotification(true);
    try {
      // Get current mentor ID from localStorage or auth context
      const notificationData = {
        mentorId: parseInt(user.userId),
        userId: parseInt(clientId),
        title: values.title,
        message: values.message,
      };

      await coachService.sendNotificationToUser(notificationData);
      message.success("Notification sent successfully!");
      setNotificationModalVisible(false);
      notificationForm.resetFields();
    } catch (error) {
      console.error("Failed to send notification:", error);
      message.error("Failed to send notification. Please try again.");
    } finally {
      setSendingNotification(false);
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
            <div className={styles.clientAvatarContainer}>
              <Avatar
                size={120}
                src={clientData.avatar}
                className={`${styles.clientAvatar} ${styles.clientAvatarImage}`}
              >
                {clientData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
            </div>
          </Col>
          <Col span={21}>
            <div className={styles.clientInfoContainer}>
              <div className={styles.clientInfoSection}>
                <Title
                  level={1}
                  className={`${styles.clientName} ${styles.clientMainTitle}`}
                >
                  {clientData.name}
                </Title>
                {clientData.profileName && (
                  <Text className={styles.clientProfileName}>
                    @{clientData.profileName}
                  </Text>
                )}
              </div>

              <div className={styles.clientInfoSection}>
                <Text type="secondary" className={styles.clientEmailText}>
                  {clientData.email}
                </Text>
              </div>

              <div className={styles.clientMetaContainer}>
                <Tag
                  color={getStatusColor(clientData.status)}
                  className={styles.clientStatusTag}
                >
                  {clientData.status}
                </Tag>

                <div className={styles.clientDetailsRow}>
                  {clientData.gender && (
                    <div className={styles.clientDetailItem}>
                      <Text className={styles.clientDetailLabel}>Gender:</Text>
                      <Text className={styles.clientDetailValue}>
                        {clientData.gender.charAt(0).toUpperCase() +
                          clientData.gender.slice(1)}
                      </Text>
                    </div>
                  )}

                  {clientData.birthDate && (
                    <div className={styles.clientDetailItem}>
                      <Text className={styles.clientDetailLabel}>Birth:</Text>
                      <Text className={styles.clientDetailValue}>
                        {new Date(clientData.birthDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </Text>
                    </div>
                  )}

                  <div className={styles.clientDetailItem}>
                    <Text className={styles.clientDetailLabel}>Joined:</Text>
                    <Text className={styles.clientDetailValue}>
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
                  className={`${styles.statCard} ${styles.overviewStatCard}`}
                  hoverable={false}
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
                    className={styles.consultationHistoryLink}
                  >
                    View Consultation History →
                  </Button>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  className={`${styles.statCard} ${styles.overviewStatCard}`}
                  hoverable={false}
                >
                  <Statistic
                    title="Total Achievements"
                    value={userBadges.length}
                    prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                    valueStyle={{ color: "#faad14" }}
                  />
                  <Text
                    type="secondary"
                    className={styles.badgeStatDescription}
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
                  className={`${styles.statCard} ${styles.achievementsCard}`}
                  hoverable={false}
                >
                  <div className={styles.achievementsHeader}>
                    <TrophyOutlined className={styles.achievementsIcon} />
                    <Title level={3} className={styles.achievementsTitle}>
                      Achievements & Badges
                    </Title>
                    <Text
                      type="secondary"
                      className={styles.achievementsSubtitle}
                    >
                      Client's earned achievements and milestones
                    </Text>
                  </div>

                  <div className={styles.achievementsContainer}>
                    {userBadges.length > 0 ? (
                      <div
                        className={`${styles.achievementsRow} ${
                          userBadges.length <= 4
                            ? styles.achievementsRowCentered
                            : styles.achievementsRowStart
                        }`}
                      >
                        {userBadges.map((badge, index) => (
                          <div key={index} className={styles.achievementCard}>
                            <div className={styles.achievementImageContainer}>
                              {badge.badgeImageUrl ? (
                                <img
                                  alt={badge.badgeName}
                                  src={badge.badgeImageUrl}
                                  className={styles.achievementImage}
                                />
                              ) : (
                                <div
                                  className={styles.achievementImagePlaceholder}
                                >
                                  <TrophyOutlined
                                    className={styles.achievementImageIcon}
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <Text strong className={styles.achievementName}>
                                {badge.badgeName || badge.name || "Achievement"}
                              </Text>

                              {badge.earnedDate && (
                                <Text className={styles.achievementDate}>
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
                      <div className={styles.noAchievements}>
                        <TrophyOutlined className={styles.noAchievementsIcon} />
                        <Title level={4} className={styles.noAchievementsTitle}>
                          No Achievements Yet
                        </Title>
                        <Text
                          type="secondary"
                          className={styles.noAchievementsText}
                        >
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
              <Col span={12}>
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

              <Col span={24}>
                {/* Addiction Assessment Questions Section */}
                <Card
                  title="Addiction Assessment Questions"
                  className={styles.motivationCard}
                  style={{ marginBottom: 16 }}
                >
                  <div className={styles.questionsSection}>
                    {userQuestions.length > 0 ? (
                      <Row gutter={[24, 24]}>
                        {userQuestions.map((question) => (
                          <Col span={12} key={question.questionId}>
                            <div className={styles.questionCard}>
                              <Title level={5} className={styles.questionTitle}>
                                {question.questionText}
                              </Title>
                              <div className={styles.questionAnswersContainer}>
                                {question.answers.map((answer) => (
                                  <div
                                    key={answer.answerId}
                                    className={`${styles.questionAnswer} ${
                                      answer.isSelected
                                        ? styles.questionAnswerSelected
                                        : styles.questionAnswerDefault
                                    }`}
                                  >
                                    {answer.isSelected && (
                                      <div
                                        className={
                                          styles.questionAnswerIndicator
                                        }
                                      />
                                    )}
                                    <Text
                                      className={
                                        answer.isSelected
                                          ? styles.questionAnswerTextSelected
                                          : styles.questionAnswerTextDefault
                                      }
                                    >
                                      {answer.answerText}
                                      {answer.isSelected && (
                                        <Text
                                          className={
                                            styles.questionAnswerPoints
                                          }
                                        >
                                          (Selected - {answer.points} points)
                                        </Text>
                                      )}
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Text type="secondary">
                        No assessment questions completed yet.
                      </Text>
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
                    className={`${styles.statCard} ${styles.progressStatCard}`}
                    hoverable={false}
                  >
                    <Statistic
                      title="Days Since Start"
                      value={smokingProgress.daysSinceStart}
                      prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                    <Text type="secondary" className={styles.progressStatText}>
                      Started:{" "}
                      {new Date(smokingProgress.startDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card
                    className={`${styles.statCard} ${styles.progressStatCard}`}
                    hoverable={false}
                  >
                    <Statistic
                      title="Money Saved"
                      value={smokingProgress.moneySaved}
                      prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                    <Text type="secondary" className={styles.progressStatText}>
                      Pack cost:{" "}
                      {smokingProgress.cigarettePackCost?.toLocaleString()}
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card
                    className={`${styles.statCard} ${styles.progressStatCard}`}
                    hoverable={false}
                  >
                    <Statistic
                      title="Cigarettes Avoided"
                      value={smokingProgress.cigarettesAvoided}
                      prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                    <Text type="secondary" className={styles.progressStatText}>
                      Target: {smokingProgress.cigarettesPerDay || 0} per day
                    </Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card
                    className={`${styles.statCard} ${styles.progressStatCard}`}
                    hoverable={false}
                  >
                    <div className={styles.cravingContainer}>
                      <div className={styles.cravingTitle}>
                        <Text strong>Addiction Score</Text>
                      </div>
                      <div className={styles.cravingValue}>
                        <Text
                          style={{
                            color: getAddictionColor(
                              addictionScore?.dependencyLevel
                            ),
                          }}
                        >
                          {addictionScore?.totalScore || 0}/10
                        </Text>
                      </div>
                      <Progress
                        percent={
                          addictionScore?.totalScore
                            ? (addictionScore.totalScore / 10) * 100
                            : 0
                        }
                        showInfo={false}
                        strokeColor={getAddictionColor(
                          addictionScore?.dependencyLevel
                        )}
                        trailColor="#f0f0f0"
                        size="small"
                      />
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "12px",
                          marginTop: "8px",
                          display: "block",
                        }}
                      >
                        Level:{" "}
                        {addictionScore?.dependencyLevel?.toUpperCase() ||
                          "N/A"}
                      </Text>
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
                    <div className={styles.statusInfoContainer}>
                      <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                      >
                        <div className={styles.statusInfoRow}>
                          <Text strong>Current Status:</Text>
                          <Tag
                            color={
                              smokingProgress.status === "active"
                                ? "green"
                                : "default"
                            }
                            className={styles.statusTag}
                          >
                            {smokingProgress.status}
                          </Tag>
                        </div>

                        {smokingProgress.targetDays && (
                          <div className={styles.statusInfoRow}>
                            <Text strong>Target Days:</Text>
                            <Text>{smokingProgress.targetDays} days</Text>
                          </div>
                        )}

                        {smokingProgress.endDate && (
                          <div className={styles.statusInfoRow}>
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
                    <div className={styles.smokingHabitsContainer}>
                      <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                      >
                        <div className={styles.smokingHabitsItem}>
                          <div className={styles.smokingHabitsHeader}>
                            <FireOutlined
                              className={styles.smokingHabitsIcon}
                            />
                            <Text strong className={styles.smokingHabitsTitle}>
                              Cigarettes per Day
                            </Text>
                          </div>
                          <Text className={styles.smokingHabitsValue}>
                            {smokingProgress.cigarettesPerDay}
                          </Text>
                        </div>

                        <div className={styles.smokingHabitsItem}>
                          <div className={styles.smokingHabitsHeader}>
                            <Text
                              strong
                              className={styles.smokingHabitsSubtitle}
                            >
                              Cigarettes per Pack
                            </Text>
                          </div>
                          <Text className={styles.smokingHabitsSubvalue}>
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
                          <div className={styles.smokingHistoryDateHeader}>
                            <CalendarOutlined
                              className={styles.smokingHistoryDateIcon}
                            />
                            <Title
                              level={5}
                              className={styles.smokingHistoryDateTitle}
                            >
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
                                className={styles.smokingHistoryEventItem}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size={40}
                                      src={event.user?.avatarUrl}
                                      className={
                                        styles.smokingHistoryEventAvatar
                                      }
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
                                        className={
                                          styles.smokingHistoryEventTag
                                        }
                                      >
                                        Craving: {event.cravingLevel}/10
                                      </Tag>
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size="small">
                                      <Text type="secondary">
                                        <CalendarOutlined
                                          className={
                                            styles.smokingHistoryEventTime
                                          }
                                        />
                                        {new Date(
                                          event.eventTime
                                        ).toLocaleString("en-GB")}
                                      </Text>
                                      {event.notes && (
                                        <Text
                                          italic
                                          className={
                                            styles.smokingHistoryEventNote
                                          }
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
                      <div className={styles.noSmokingHistory}>
                        <CalendarOutlined
                          className={styles.noSmokingHistoryIcon}
                        />
                        <Title
                          level={4}
                          className={styles.noSmokingHistoryTitle}
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

          {/* Task Management Tab */}
          <Tabs.TabPane tab="Task Management" key="tasks">
            <div className={styles.taskManagementContainer}>
              <Row gutter={[16, 16]} className={styles.taskManagementHeader}>
                <Col span={24}>
                  <div className={styles.taskManagementHeaderContent}>
                    <Title level={3} style={{ margin: 0 }}>
                      Client Tasks
                    </Title>
                    <Space>
                      <Button
                        color="primary"
                        variant="filled"
                        icon={<BellOutlined />}
                        onClick={handleOpenNotificationModal}
                      >
                        Send Notification
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateTask}
                      >
                        Create New Task
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>

              {loadingTasks ? (
                <div className={styles.taskLoadingContainer}>
                  <Spin size="large" />
                  <div className={styles.taskLoadingText}>Loading tasks...</div>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {userTasks.length > 0 ? (
                    userTasks.map((task) => (
                      <Col xs={24} sm={24} md={12} lg={8} key={task.taskId}>
                        <Card
                          className={styles.taskCard}
                          hoverable
                          actions={[
                            <Button
                              key="edit"
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </Button>,
                            task.status === "pending" ? (
                              <Dropdown
                                key="status"
                                menu={{ items: getTaskActions(task) }}
                                trigger={["click"]}
                                placement="bottomRight"
                              >
                                <Button
                                  type="text"
                                  loading={updatingTaskId === task.taskId}
                                >
                                  Update Status
                                </Button>
                              </Dropdown>
                            ) : (
                              <Button
                                key="completed"
                                type="text"
                                icon={<CheckCircleOutlined />}
                                disabled
                              >
                                {task.status === "completed"
                                  ? "Completed"
                                  : "Failed"}
                              </Button>
                            ),
                            <Button
                              key="delete"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteTask(task.taskId)}
                            >
                              Delete
                            </Button>,
                          ]}
                        >
                          <div className={styles.taskDateHeader}>
                            <Text strong className={styles.taskDateText}>
                              Task Date:{" "}
                              {new Date(task.taskDay).toLocaleDateString()}
                            </Text>
                            <Tag
                              color={
                                task.status === "completed"
                                  ? "green"
                                  : task.status === "failed"
                                  ? "red"
                                  : "blue"
                              }
                            >
                              {task.status === "completed"
                                ? "Completed"
                                : task.status === "failed"
                                ? "Failed"
                                : "Pending"}
                            </Tag>
                          </div>

                          <div className={styles.taskSupportMeasuresWrapper}>
                            <div
                              className={styles.taskSupportMeasuresContainer}
                            >
                              <Text className={styles.taskSupportMeasuresText}>
                                "{task.customSupportMeasures}"
                              </Text>
                            </div>
                          </div>

                          <div className={styles.taskTargetWrapper}>
                            <Text
                              type="secondary"
                              className={styles.taskTargetText}
                            >
                              Target: {task.targetCigarettes} cigarettes
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24}>
                      <div className={styles.noTasksContainer}>
                        <ClockCircleOutlined className={styles.noTasksIcon} />
                        <Title level={4} className={styles.noTasksTitle}>
                          No Tasks Assigned Yet
                        </Title>
                        <Text type="secondary">
                          Create tasks to help guide your client's smoking
                          cessation journey.
                        </Text>
                      </div>
                    </Col>
                  )}
                </Row>
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Consultation Notes Modal */}
      <Modal
        title={
          <div className={styles.modalHeader}>
            <CalendarOutlined className={styles.modalHeaderIcon} />
            <Text strong className={styles.modalHeaderTitle}>
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
            <Card className={styles.consultationInfoCard}>
              <div className={styles.consultationInfoHeader}>
                <CalendarOutlined className={styles.consultationInfoIcon} />
                <Title level={5} className={styles.consultationInfoTitle}>
                  Consultation Information
                </Title>
              </div>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div className={styles.consultationInfoItem}>
                    <Text className={styles.consultationInfoLabel}>DATE</Text>
                    <Text strong>
                      {new Date(selectedConsultation.date).toLocaleDateString(
                        "en-GB"
                      )}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.consultationInfoItem}>
                    <Text className={styles.consultationInfoLabel}>TIME</Text>
                    <Text strong>{selectedConsultation.time}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.consultationInfoItem}>
                    <Text className={styles.consultationInfoLabel}>STATUS</Text>
                    <Text strong style={{ textTransform: "capitalize" }}>
                      {selectedConsultation.status}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.consultationInfoItem}>
                    <Text className={styles.consultationInfoLabel}>TYPE</Text>
                    <Text strong>{selectedConsultation.type}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Rating and Feedback Card */}
            {(selectedConsultation.rating > 0 ||
              selectedConsultation.feedback) && (
              <Card className={styles.ratingFeedbackCard}>
                <div className={styles.ratingFeedbackHeader}>
                  <StarOutlined className={styles.ratingFeedbackIcon} />
                  <Title level={5} className={styles.ratingFeedbackTitle}>
                    Rating & Feedback
                  </Title>
                </div>
                {selectedConsultation.rating > 0 && (
                  <div className={styles.ratingContainer}>
                    <Text strong style={{ marginRight: 12 }}>
                      Rating:
                    </Text>
                    <Rate disabled defaultValue={selectedConsultation.rating} />
                    <Text className={styles.ratingValue}>
                      ({selectedConsultation.rating}/5)
                    </Text>
                  </div>
                )}
                {selectedConsultation.feedback && (
                  <div className={styles.feedbackContainer}>
                    <Text strong className={styles.feedbackLabel}>
                      FEEDBACK
                    </Text>
                    <Text>"{selectedConsultation.feedback}"</Text>
                  </div>
                )}
              </Card>
            )}

            {/* Notes Card */}
            <Card className={styles.notesCard}>
              <div className={styles.notesHeader}>
                <EditOutlined className={styles.notesIcon} />
                <Title level={5} className={styles.notesTitle}>
                  Consultation Notes
                </Title>
              </div>
              <div className={styles.notesContent}>
                <Text>{selectedConsultation.notes}</Text>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Task Management Modal */}
      <Modal
        title={editingTask ? "Edit Task" : "Create New Task"}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleSaveTask}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="taskDay"
            label="Task Date"
            rules={[{ required: true, message: "Please select a task date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="customSupportMeasures"
            label="Support Measures"
            rules={[
              { required: true, message: "Please enter support measures" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter custom support measures for the client..."
            />
          </Form.Item>

          <Form.Item
            name="targetCigarettes"
            label="Target Cigarettes"
            rules={[
              { required: true, message: "Please enter target cigarettes" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter target number of cigarettes"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setTaskModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Notification Modal */}
      <Modal
        title="Send Notification to User"
        open={notificationModalVisible}
        onCancel={() => setNotificationModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={handleSendNotification}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter notification title" },
            ]}
          >
            <Input placeholder="Enter notification title..." />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[
              { required: true, message: "Please enter notification message" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter notification message for the user..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setNotificationModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={sendingNotification}
                icon={<BellOutlined />}
              >
                Send Notification
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MentorClientDetails;
