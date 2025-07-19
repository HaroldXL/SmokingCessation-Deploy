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
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../../components/layout/AdminLayout";
import api from "../../../config/axios.js";

import "./ScheduleManagement.css";

const { Title, Text } = Typography;

const timeSlots = [
  { id: 1, label: "Slot 1", time: "07:00 - 09:30", period: "Morning" },
  { id: 2, label: "Slot 2", time: "09:30 - 12:00", period: "Morning" },
  { id: 3, label: "Slot 3", time: "13:00 - 15:30", period: "Afternoon" },
  { id: 4, label: "Slot 4", time: "15:30 - 18:00", period: "Afternoon" },
];

// Helper function to generate week days based on current date
const generateWeekDays = (currentDate) => {
  const startOfWeek = currentDate.startOf("week"); // Start from Sunday
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, "day");
    days.push({
      day: date.format("ddd").toUpperCase(),
      date: date.format("DD"),
      fullDate: date.format("MMM DD"),
      key: date.format("MM-DD"),
      fullDateObj: date,
    });
  }

  return days;
};

const getSlotStatusConfig = (status) => {
  switch (status) {
    case "available":
      return {
        color: "success",
        text: "Available",
        className: "slot-available",
      };
    case "booked":
      return { color: "processing", text: "Booked", className: "slot-booked" };
    case "completed":
      return {
        color: "default",
        text: "Completed",
        className: "slot-completed",
      };
    case "cancelled":
      return { color: "error", text: "Cancelled", className: "slot-cancelled" };
    case "not-booked":
      return {
        color: "warning",
        text: "Not Booked",
        className: "slot-not-booked",
      };
    case "not-added":
      return {
        color: "default",
        text: "Not Added",
        className: "slot-not-added",
      };
    default:
      return { color: "default", text: "Empty", className: "slot-empty" };
  }
};

function ScheduleManagement() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [allMentors, setAllMentors] = useState([]);
  const [realSlots, setRealSlots] = useState([]);

  // Generate week days based on current date
  const weekDays = useMemo(() => generateWeekDays(currentDate), [currentDate]);

  // Format current week display
  const currentWeekDisplay = useMemo(() => {
    const startOfWeek = currentDate.startOf("week");
    const endOfWeek = currentDate.endOf("week");
    return `${startOfWeek.format("MMM DD")} - ${endOfWeek.format(
      "MMM DD, YYYY"
    )}`;
  }, [currentDate]);

  // Get current selected mentor from API data
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
        completedSlots: 0,
      };
    }

    const mentor = allMentors.find(
      (m) => m.userId.toString() === selectedMentor
    );
    if (!mentor) return allMentors[0];

    // Calculate real statistics from slot data
    const totalSlots = realSlots.length;
    const availableSlots = realSlots.filter((slot) => !slot.booked).length;
    const bookedSlots = realSlots.filter((slot) => slot.booked).length;
    const completedSlots = realSlots.filter((slot) => {
      const slotDate = dayjs(slot.slotDate);
      const today = dayjs();
      return slot.booked && slotDate.isBefore(today, "day");
    }).length;

    return {
      ...mentor,
      totalSlots,
      availableSlots,
      bookedSlots,
      completedSlots,
    };
  }, [selectedMentor, allMentors, realSlots]);

  // Get current mentor's slots with real API data
  const mentorSlots = useMemo(() => {
    if (!selectedMentor) return {};

    const slots = {};
    const today = dayjs().format("YYYY-MM-DD");

    weekDays.forEach((day) => {
      const dateKey = day.key;
      const fullDate = day.fullDateObj.format("YYYY-MM-DD");
      const isPastDate = dayjs(fullDate).isBefore(today);

      slots[dateKey] = {};

      // Process each time slot (1-4)
      for (let slotNum = 1; slotNum <= 4; slotNum++) {
        // Find real slot data for this date and slot number
        const realSlot = realSlots.find(
          (slot) =>
            slot.slotDate === fullDate &&
            slot.slotNumber === slotNum &&
            slot.mentor.userId.toString() === selectedMentor
        );

        if (realSlot) {
          // Real slot exists
          if (isPastDate) {
            // Past dates: booked=true -> "completed", booked=false -> "not-booked"
            slots[dateKey][slotNum] = realSlot.booked
              ? "completed"
              : "not-booked";
          } else {
            // Current/future dates: booked=true -> "booked", booked=false -> "available"
            slots[dateKey][slotNum] = realSlot.booked ? "booked" : "available";
          }
        } else {
          // No slot exists
          if (isPastDate) {
            slots[dateKey][slotNum] = "not-added";
          } else {
            // Current/future dates will show "Add Slot" button (empty status)
            slots[dateKey][slotNum] = null;
          }
        }
      }
    });

    return slots;
  }, [selectedMentor, realSlots, weekDays]);

  // Update slots when week changes or mentor changes
  useEffect(() => {
    const fetchMentorSlots = async () => {
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

    fetchMentorSlots();
  }, [selectedMentor, currentDate]); // Also refresh when currentDate changes

  // Navigation handlers
  const handlePreviousWeek = () => {
    setLoading(true);
    setCurrentDate((prev) => prev.subtract(1, "week"));
    // Loading will be set to false when slots are regenerated
    setTimeout(() => setLoading(false), 300);
  };

  const handleNextWeek = () => {
    setLoading(true);
    setCurrentDate((prev) => prev.add(1, "week"));
    // Loading will be set to false when slots are regenerated
    setTimeout(() => setLoading(false), 300);
  };

  const handleToday = () => {
    setLoading(true);
    setCurrentDate(dayjs());
    // Loading will be set to false when slots are regenerated
    setTimeout(() => setLoading(false), 300);
  };

  // Fetch mentor list from API
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get("/admin/mentors");
        const mentors = res.data || [];

        // Store all mentors for UI display
        setAllMentors(mentors);

        // Auto-select first mentor as default
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

  const handleSlotAction = (action, dayKey, slotId) => {
    if (action === "add") {
      // Get the selected mentor's email
      const mentorEmail = allMentors.find(
        (m) => m.userId.toString() === selectedMentor
      )?.email;

      if (!mentorEmail) {
        message.error("Please select a mentor first");
        return;
      }

      // Get the date for this day
      const selectedDay = weekDays.find((day) => day.key === dayKey);
      if (!selectedDay) {
        message.error("Invalid date selected");
        return;
      }

      const slotDate = selectedDay.fullDateObj.format("YYYY-MM-DD");

      // Create a single slot using the existing batch create logic
      const slotData = {
        mentorEmail,
        slotNumber: slotId,
        slotDate,
      };

      // Call the batch create function with single slot
      handleBatchCreateSlots([slotData]);
    } else if (action === "delete") {
      // Find the slot to delete
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

      // Call delete function
      handleDeleteSlot(slotToDelete.slotId);
    } else {
      console.log(`${action} slot ${slotId} on ${dayKey}`);
    }
  };

  // Handler for deleting a slot
  const handleDeleteSlot = async (slotId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/consultation-slots/${slotId}`);

      message.success("Slot deleted successfully");

      // Refresh slots for the selected mentor
      if (selectedMentor) {
        try {
          const response = await api.get(
            `/admin/mentor/${selectedMentor}/slots/all`
          );
          setRealSlots(response.data || []);
        } catch (error) {
          console.error("Error refreshing slots:", error);
        }
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      message.error("Failed to delete slot");
    } finally {
      setLoading(false);
    }
  };

  // Handle mentor filter change
  const handleMentorChange = (value) => {
    setSelectedMentor(value);
  };

  // Helper function to get slot time based on slot number
  const _getSlotTime = (slotNumber) => {
    const timeSlots = {
      1: "7:00 AM - 9:30 AM",
      2: "9:30 AM - 12:00 PM",
      3: "13:00 PM - 15:30 PM",
      4: "15:30 PM - 18:00 PM",
    };
    return timeSlots[slotNumber] || "";
  };

  // Handler for batch slot creation - NOW WITH REAL API CALLS
  const handleBatchCreateSlots = async (slots) => {
    try {
      setLoading(true);

      // Process slots sequentially to stop on first error
      const createdSlots = [];
      let hasError = false;
      let errorMessage = "";

      for (let i = 0; i < slots.length; i++) {
        const slotData = slots[i];

        try {
          const response = await api.post(
            `admin/consultation-slots?mentorEmail=${encodeURIComponent(
              slotData.mentorEmail
            )}&slotNumber=${slotData.slotNumber}&slotDate=${slotData.slotDate}`
          );

          // If successful, add to created slots
          createdSlots.push({
            data: response.data,
            slotData: slotData,
          });
        } catch (error) {
          if (error.response && error.response.status === 500) {
            hasError = true;
            errorMessage = "Slot already exists for this coach";
            break; // Stop processing remaining slots
          } else {
            hasError = true;
            errorMessage = `Failed to create slot: ${error.message}`;
            break; // Stop processing remaining slots
          }
        }
      }

      // If there's an error, show error message and don't create any slots
      if (hasError) {
        message.error(errorMessage);
        return; // Exit early, don't close modal
      }

      // If all slots created successfully
      if (createdSlots.length > 0) {
        message.success(`Successfully created ${createdSlots.length} slot(s)`);

        // Refresh slots for the selected mentor
        if (selectedMentor) {
          try {
            const response = await api.get(
              `/admin/mentor/${selectedMentor}/slots/all`
            );
            setRealSlots(response.data || []);
          } catch (error) {
            console.error("Error refreshing slots:", error);
          }
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
      key: "edit",
      label: "Edit Slot",
      onClick: () => handleSlotAction("edit", day, slotId),
    },
    {
      key: "delete",
      label: "Delete Slot",
      danger: true,
      onClick: () => handleSlotAction("delete", day, slotId),
    },
  ];

  // Create table columns for the schedule
  const columns = [
    {
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
    },
    ...weekDays.map((day) => ({
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
              <div className={`slot-status ${statusConfig.className}`}>
                <Tag color={statusConfig.color} className="slot-tag">
                  {statusConfig.text}
                </Tag>
                {(slotStatus === "available" ||
                  slotStatus === "booked" ||
                  slotStatus === "not-booked") && (
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
    })),
  ];

  const tableData = timeSlots.map((slot) => ({
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
                  <Col>
                    <Statistic
                      title="Completed"
                      value={currentMentor.completedSlots}
                      valueStyle={{ color: "#8c8c8c" }}
                    />
                  </Col>
                </Row>
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
      </div>
    </AdminLayout>
  );
}

export default ScheduleManagement;
