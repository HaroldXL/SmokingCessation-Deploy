import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Select,
  Avatar,
  Tag,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Table,
  Dropdown,
  message,
  Tooltip,
  Modal,
  Rate,
  Empty,
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MoreOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../../components/layout/AdminLayout";
import api from "../../../config/axios.js";
import "./ScheduleManagement.css";

const { Title, Text } = Typography;

const TIME_SLOTS = [
  { id: 1, label: "Slot 1", time: "07:00 - 09:30", period: "Morning" },
  { id: 2, label: "Slot 2", time: "09:30 - 12:00", period: "Morning" },
  { id: 3, label: "Slot 3", time: "13:00 - 15:30", period: "Afternoon" },
  { id: 4, label: "Slot 4", time: "15:30 - 18:00", period: "Afternoon" },
];

const SLOT_STATUS_CONFIG = {
  available: {
    color: "success",
    text: "Available",
    className: "slot-available",
  },
  booked: { color: "processing", text: "Booked", className: "slot-booked" },
  cancelled: { color: "error", text: "Cancelled", className: "slot-cancelled" },
  "not-booked": {
    color: "warning",
    text: "Not Booked",
    className: "slot-not-booked",
  },
  "not-added": {
    color: "default",
    text: "Not Added",
    className: "slot-not-added",
  },
  default: { color: "default", text: "Empty", className: "slot-empty" },
};

const generateWeekDays = (currentDate) => {
  const startOfWeek = currentDate.startOf("week");
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, "day");
    days.push({
      day: date.format("ddd").toUpperCase(),
      fullDate: date.format("MMM DD"),
      key: date.format("MM-DD"),
      fullDateObj: date,
    });
  }
  return days;
};

const getSlotStatusConfig = (status) =>
  SLOT_STATUS_CONFIG[status] || SLOT_STATUS_CONFIG.default;

function ScheduleManagement() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [allMentors, setAllMentors] = useState([]);
  const [realSlots, setRealSlots] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [mentorFeedbacks, setMentorFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Memoized computed values
  const weekDays = useMemo(() => generateWeekDays(currentDate), [currentDate]);
  const currentWeekDisplay = useMemo(() => {
    const startOfWeek = currentDate.startOf("week");
    const endOfWeek = currentDate.endOf("week");
    return `${startOfWeek.format("MMM DD")} - ${endOfWeek.format(
      "MMM DD, YYYY"
    )}`;
  }, [currentDate]);

  const currentMentor = useMemo(() => {
    if (!selectedMentor || allMentors.length === 0) {
      return {
        userId: null,
        fullName: "All Mentors",
        profileName: "all",
        avatarUrl: "",
        email: "",
        note: "View all mentors' schedules",
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
      };
    }

    const mentor = allMentors.find(
      (m) => m.userId.toString() === selectedMentor
    );
    if (!mentor) return allMentors[0];

    const totalSlots = realSlots.length;
    const availableSlots = realSlots.filter((slot) => !slot.booked).length;
    const bookedSlots = realSlots.filter((slot) => slot.booked).length;

    return { ...mentor, totalSlots, availableSlots, bookedSlots };
  }, [selectedMentor, allMentors, realSlots]);

  const mentorSlots = useMemo(() => {
    if (!selectedMentor) return {};

    const slots = {};
    const today = dayjs().format("YYYY-MM-DD");

    weekDays.forEach((day) => {
      const dateKey = day.key;
      const fullDate = day.fullDateObj.format("YYYY-MM-DD");
      const isPastDate = dayjs(fullDate).isBefore(today);

      slots[dateKey] = {};

      for (let slotNum = 1; slotNum <= 4; slotNum++) {
        const realSlot = realSlots.find(
          (slot) =>
            slot.slotDate === fullDate &&
            slot.slotNumber === slotNum &&
            slot.mentor.userId.toString() === selectedMentor
        );

        if (realSlot) {
          slots[dateKey][slotNum] = realSlot.booked
            ? "booked"
            : isPastDate
            ? "not-booked"
            : "available";
        } else {
          slots[dateKey][slotNum] = isPastDate ? "not-added" : null;
        }
      }
    });

    return slots;
  }, [selectedMentor, realSlots, weekDays]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedMentor) {
        setRealSlots([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/admin/mentor/${selectedMentor}/slots/all`
        );
        setRealSlots(response.data || []);
      } catch (error) {
        console.error("Error fetching mentor slots:", error);
        message.error("Failed to load mentor slots");
        setRealSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedMentor, currentDate]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get("/admin/mentors");
        const mentors = res.data || [];
        setAllMentors(mentors);
        if (mentors.length > 0) {
          setSelectedMentor(mentors[0].userId.toString());
        }
      } catch (error) {
        console.error("Error fetching mentors:", error);
        message.error("Failed to load mentors");
      }
    };
    fetchMentors();
  }, []);

  // Navigation handlers
  const handlePreviousWeek = () => {
    setLoading(true);
    setCurrentDate((prev) => prev.subtract(1, "week"));
    setTimeout(() => setLoading(false), 300);
  };

  const handleNextWeek = () => {
    setLoading(true);
    setCurrentDate((prev) => prev.add(1, "week"));
    setTimeout(() => setLoading(false), 300);
  };

  const handleToday = () => {
    setLoading(true);
    setCurrentDate(dayjs());
    setTimeout(() => setLoading(false), 300);
  };

  // Slot action handlers
  const handleSlotAction = (action, dayKey, slotId) => {
    if (action === "add") {
      const mentorEmail = allMentors.find(
        (m) => m.userId.toString() === selectedMentor
      )?.email;
      const selectedDay = weekDays.find((day) => day.key === dayKey);

      if (!mentorEmail) {
        message.error("Please select a mentor first");
        return;
      }
      if (!selectedDay) {
        message.error("Invalid date selected");
        return;
      }

      const slotData = {
        mentorEmail,
        slotNumber: slotId,
        slotDate: selectedDay.fullDateObj.format("YYYY-MM-DD"),
      };
      handleBatchCreateSlots([slotData]);
    } else if (action === "delete") {
      const selectedDay = weekDays.find((day) => day.key === dayKey);
      if (!selectedDay) {
        message.error("Invalid date selected");
        return;
      }

      const slotDate = selectedDay.fullDateObj.format("YYYY-MM-DD");
      const slotToDelete = realSlots.find(
        (slot) =>
          slot.slotDate === slotDate &&
          slot.slotNumber === slotId &&
          slot.mentor.userId.toString() === selectedMentor
      );

      if (!slotToDelete) {
        message.error("Slot not found");
        return;
      }
      handleDeleteSlot(slotToDelete.slotId);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/consultation-slots/${slotId}`);
      message.success("Slot deleted successfully");

      // Refresh slots
      if (selectedMentor) {
        const response = await api.get(
          `/admin/mentor/${selectedMentor}/slots/all`
        );
        setRealSlots(response.data || []);
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      message.error("Failed to delete slot");
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleViewFeedback = async () => {
    if (!selectedMentor) {
      message.error("Please select a mentor first");
      return;
    }

    try {
      setLoadingFeedback(true);
      setFeedbackModal(true);
      const response = await api.get(
        `/admin/mentors/${selectedMentor}/feedback`
      );
      setMentorFeedbacks(response.data || []);
    } catch (error) {
      console.error("Error fetching mentor feedback:", error);
      message.error("Failed to load mentor feedback");
      setMentorFeedbacks([]);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal(false);
    setMentorFeedbacks([]);
  };

  const handleMentorChange = (value) => setSelectedMentor(value);

  // Batch slot creation handler
  const handleBatchCreateSlots = async (slots) => {
    try {
      setLoading(true);
      const createdSlots = [];
      let hasError = false;
      let errorMessage = "";

      for (const slotData of slots) {
        try {
          const response = await api.post(
            `admin/consultation-slots?mentorEmail=${encodeURIComponent(
              slotData.mentorEmail
            )}&slotNumber=${slotData.slotNumber}&slotDate=${slotData.slotDate}`
          );
          createdSlots.push({ data: response.data, slotData });
        } catch (error) {
          hasError = true;
          errorMessage =
            error.response?.status === 500
              ? "Slot already exists for this coach"
              : `Failed to create slot: ${error.message}`;
          break;
        }
      }

      if (hasError) {
        message.error(errorMessage);
        return;
      }

      if (createdSlots.length > 0) {
        message.success(`Successfully created ${createdSlots.length} slot(s)`);

        // Refresh slots
        if (selectedMentor) {
          const response = await api.get(
            `/admin/mentor/${selectedMentor}/slots/all`
          );
          setRealSlots(response.data || []);
        }
      }
    } catch (error) {
      message.error("Failed to create consultation slots");
      console.error("Error creating slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotActionItems = (day, slotId) => [
    {
      key: "delete",
      label: "Delete Slot",
      danger: true,
      onClick: () => handleSlotAction("delete", day, slotId),
    },
  ];

  // Table configuration
  const timeSlotColumn = {
    title: "Time Slots",
    dataIndex: "timeSlot",
    key: "timeSlot",
    width: 200,
    className: "time-slot-column",
    render: (_, record) => (
      <div className="time-slot-info">
        <div className="slot-label">{record.label}</div>
        <div className="slot-time">{record.time}</div>
        <div className="slot-period">{record.period}</div>
      </div>
    ),
  };

  const dayColumns = weekDays.map((day) => ({
    title: (
      <div className="day-header">
        <div className="day-name">{day.day}</div>
        <div className="day-date">{day.fullDate}</div>
      </div>
    ),
    dataIndex: day.key,
    key: day.key,
    width: 140,
    className: "day-column",
    render: (_, record) => {
      const slotStatus = mentorSlots[day.key]?.[record.id];
      const isEmpty = slotStatus === null;
      const statusConfig = getSlotStatusConfig(slotStatus);

      const today = dayjs().format("YYYY-MM-DD");
      const slotDate = day.fullDateObj.format("YYYY-MM-DD");
      const isPastDate = dayjs(slotDate).isBefore(today);

      const additionalClass =
        slotStatus === "booked" && isPastDate ? "past-slot" : "";
      const fullClassName =
        `slot-status ${statusConfig.className} ${additionalClass}`.trim();

      return (
        <div className="slot-cell">
          {isEmpty ? (
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              className="add-slot-btn"
              onClick={() => handleSlotAction("add", day.key, record.id)}
            >
              Add Slot
            </Button>
          ) : (
            <div className={fullClassName}>
              <Tag color={statusConfig.color} className="slot-tag">
                {statusConfig.text}
              </Tag>
              {["available", "booked", "not-booked"].includes(slotStatus) && (
                <Dropdown
                  menu={{ items: getSlotActionItems(day.key, record.id) }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    className="slot-action"
                  />
                </Dropdown>
              )}
            </div>
          )}
        </div>
      );
    },
  }));

  const columns = [timeSlotColumn, ...dayColumns];

  const tableData = TIME_SLOTS.map((slot) => ({
    key: slot.id,
    id: slot.id,
    label: slot.label,
    time: slot.time,
    period: slot.period,
  }));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            handlePreviousWeek();
            break;
          case "ArrowRight":
            event.preventDefault();
            handleNextWeek();
            break;
          case "Home":
            event.preventDefault();
            handleToday();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AdminLayout title="Schedule Management">
      <div className="schedule-management">
        <h2>Schedule Management</h2>

        <div className="schedule-content">
          {/* Controls */}
          <Card className="controls-card">
            <Row gutter={[24, 16]} align="middle">
              <Col flex="1">
                {/* Navigation */}
                <Space className="schedule-navigation">
                  <Tooltip title="Previous Week (Ctrl/Cmd + ←)">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={handlePreviousWeek}
                      loading={loading}
                    />
                  </Tooltip>
                  <Text strong className="current-period">
                    {currentWeekDisplay}
                  </Text>
                  <Tooltip title="Next Week (Ctrl/Cmd + →)">
                    <Button
                      icon={<RightOutlined />}
                      onClick={handleNextWeek}
                      loading={loading}
                    />
                  </Tooltip>
                  <Tooltip title="Go to Today (Ctrl/Cmd + Home)">
                    <Button
                      onClick={handleToday}
                      type="default"
                      loading={loading}
                    >
                      Today
                    </Button>
                  </Tooltip>
                </Space>
              </Col>

              <Col flex="none">
                <Space align="center">
                  <Text strong style={{ whiteSpace: "nowrap" }}>
                    Filter by Mentor:
                  </Text>
                  <Select
                    value={selectedMentor}
                    onChange={handleMentorChange}
                    style={{ width: 300 }}
                    placeholder="Select a mentor..."
                    showSearch
                    dropdownStyle={{ padding: "8px 0" }}
                    optionHeight={60}
                    filterOption={(input, option) => {
                      const mentor = allMentors.find(
                        (m) => m.userId.toString() === option.value
                      );
                      if (!mentor) return false;
                      const searchText = `${
                        mentor.fullName || mentor.profileName
                      } ${mentor.email}`.toLowerCase();
                      return searchText.includes(input.toLowerCase());
                    }}
                    options={allMentors.map((mentor) => ({
                      key: mentor.userId,
                      value: mentor.userId.toString(),
                      label: mentor.fullName || mentor.profileName,
                      mentor: mentor,
                    }))}
                    optionRender={(option) => (
                      <div
                        className="mentor-select-option"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          minHeight: "60px",
                          width: "100%",
                        }}
                      >
                        <Avatar
                          size={36}
                          src={option.data.mentor.avatarUrl}
                          icon={<UserOutlined />}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="mentor-select-option-text"
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "#262626",
                              lineHeight: "1.4",
                              marginBottom: "2px",
                            }}
                          >
                            {option.data.mentor.fullName ||
                              option.data.mentor.profileName}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#8c8c8c",
                              lineHeight: "1.3",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {option.data.mentor.email}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Mentor Info Card */}
          <Card className={`mentor-card ${!selectedMentor ? "no-mentor" : ""}`}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="large">
                  <Avatar
                    size={64}
                    src={currentMentor.avatarUrl}
                    icon={<UserOutlined />}
                  />
                  <div className="mentor-info">
                    <Title level={3} className="mentor-name">
                      {currentMentor.fullName || currentMentor.profileName}
                    </Title>
                    <Text className="mentor-title">{currentMentor.email}</Text>
                    <br />
                    <Text type="secondary" className="mentor-specialization">
                      {currentMentor.note || "No specialization provided"}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" size="middle">
                  <Row gutter={32}>
                    <Col>
                      <Statistic
                        title="Total Slots"
                        value={currentMentor.totalSlots}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Available"
                        value={currentMentor.availableSlots}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Booked"
                        value={currentMentor.bookedSlots}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                  </Row>
                  {selectedMentor && (
                    <Button
                      type="primary"
                      icon={<CommentOutlined />}
                      onClick={handleViewFeedback}
                      size="middle"
                    >
                      View All Feedback
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Schedule Grid */}
          <Card className="schedule-card">
            <div className="schedule-card-header">
              <Title level={4}>
                <ClockCircleOutlined className="schedule-icon" />
                Weekly Schedule Overview
              </Title>
            </div>
            <div className="schedule-table-container">
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                size="middle"
                className="schedule-table"
                scroll={{ x: 1000 }}
                loading={loading}
              />
            </div>
          </Card>
        </div>

        {/* Feedback Modal */}
        <Modal
          title={`Feedback for ${
            currentMentor.fullName || currentMentor.profileName
          }`}
          open={feedbackModal}
          onCancel={handleCloseFeedbackModal}
          footer={[
            <Button key="close" onClick={handleCloseFeedbackModal}>
              Close
            </Button>,
          ]}
          width={800}
          style={{ top: 20 }}
        >
          {loadingFeedback ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Typography.Text>Loading feedback...</Typography.Text>
            </div>
          ) : mentorFeedbacks.length === 0 ? (
            <Empty description="No feedback available for this mentor" />
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {mentorFeedbacks.map((feedback) => (
                <Card
                  key={feedback.consultationId}
                  size="small"
                  style={{ marginBottom: "16px" }}
                  title={
                    <Space>
                      <Avatar
                        src={feedback.user.avatarUrl}
                        icon={<UserOutlined />}
                        size="small"
                      />
                      <Typography.Text strong>
                        {feedback.user.fullName}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        ({feedback.user.email})
                      </Typography.Text>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Rate disabled value={feedback.rating} />
                      <Typography.Text type="secondary">
                        {dayjs(feedback.slot.slotDate).format("MMM DD, YYYY")} -
                        Slot {feedback.slot.slotNumber}
                      </Typography.Text>
                    </Space>
                  }
                >
                  <Typography.Paragraph style={{ margin: 0 }}>
                    {feedback.feedback}
                  </Typography.Paragraph>
                  <div style={{ marginTop: "8px" }}>
                    <Tag color="blue">
                      Consultation #{feedback.consultationId}
                    </Tag>
                    <Tag
                      color={feedback.status === "booked" ? "green" : "orange"}
                    >
                      {feedback.status.charAt(0).toUpperCase() +
                        feedback.status.slice(1)}
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default ScheduleManagement;
