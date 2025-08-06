import "./proTask.css";
import {
  Affix,
  Card,
  Divider,
  message,
  Spin,
  Empty,
  Space,
  Tag,
  Button,
  Dropdown,
  Popconfirm,
  Result,
} from "antd";
import Header from "../../../../components/header/header";
import Footer from "../../../../components/footer/footer";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import {
  CalendarTwoTone,
  CheckCircleTwoTone,
  IdcardTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../../config/axios";

function ProTask() {
  const user = useSelector((store) => store.user);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [mentors, setMentors] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const filterTasks = (status) => {
    setActiveFilter(status);
    const filtered = tasks.filter((task) => task.status === status);
    setFilteredTasks(filtered);
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/plan-tasks-pro/my-tasks");
      let tasksData = response.data;

      // const today = new Date();
      // today.setHours(0, 0, 0, 0);

      // const overdueTasksToUpdate = tasksData.filter((task) => {
      //   if (task.status !== "pending") return false;

      //   const taskDate = new Date(task.taskDay);
      //   taskDate.setHours(0, 0, 0, 0);

      //   return taskDate.getTime() < today.getTime();
      // });

      // for (const task of overdueTasksToUpdate) {
      //   try {
      //     await api.put(
      //       `/plan-tasks-pro/user/${task.taskId}/status`,
      //       "failed",
      //       {
      //         headers: {
      //           "Content-Type": "text/plain",
      //         },
      //       }
      //     );
      //     // Update the task status in local data
      //     task.status = "failed";
      //   } catch (error) {
      //     console.error(
      //       `Failed to auto-update task ${task.taskId} to failed:`,
      //       error
      //     );
      //   }
      // }

      setTasks(tasksData);

      const filtered = tasksData.filter((task) => task.status === activeFilter);
      setFilteredTasks(filtered);

      // if (overdueTasksToUpdate.length > 0) {
      //   message.warning(
      //     `${overdueTasksToUpdate.length} overdue task(s) were automatically marked as failed.`
      //   );
      // }
    } catch (error) {
      console.error("Error fetching pro tasks:", error);
      message.error("Failed to fetch pro tasks");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const fetchMentors = async () => {
    try {
      const response = await api.get("/profile/mentors");
      setMentors(response.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      message.error("Failed to fetch mentors");
    }
  };

  const getMentorDetails = (mentorId) => {
    const mentorData = mentors.find((item) => item.mentor.userId === mentorId);
    return mentorData ? mentorData.mentor : null;
  };

  const handleMentorClick = (mentorId) => {
    const mentor = getMentorDetails(mentorId);
    if (mentor && mentor.profileName) {
      navigate(`/user-coach/${mentor.profileName}`);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await api.put(`/plan-tasks-pro/user/${taskId}/status`, newStatus, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      message.success(`Task marked as ${newStatus}`);

      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getTaskActions = (task) => {
    if (task.status !== "pending") {
      return [];
    }

    // Check if task is on the correct date
    const taskDate = new Date(task.taskDay);
    const today = new Date();

    // Set both dates to start of day for accurate comparison
    taskDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Only allow updates on the task date
    if (taskDate.getTime() !== today.getTime()) {
      return [];
    }

    return [
      {
        key: "completed",
        label: (
          <Popconfirm
            title="Mark task as Completed"
            description="Are you sure you want to mark this task as Completed?"
            onConfirm={() => updateTaskStatus(task.taskId, "completed")}
            okText="Yes"
            cancelText="No"
          >
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              Mark as Completed
            </Space>
          </Popconfirm>
        ),
      },
      {
        key: "failed",
        label: (
          <Popconfirm
            title="Mark task as Failed"
            description="Are you sure you want to mark this task as Failed?"
            onConfirm={() => updateTaskStatus(task.taskId, "failed")}
            okText="Yes"
            cancelText="No"
          >
            <Space>
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              Mark as Failed
            </Space>
          </Popconfirm>
        ),
      },
    ];
  };

  const isTaskUpdateAllowed = (task) => {
    if (task.status !== "pending") {
      return false;
    }

    const taskDate = new Date(task.taskDay);
    const today = new Date();

    // Set both dates to start of day for accurate comparison
    taskDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return taskDate.getTime() === today.getTime();
  };

  useEffect(() => {
    fetchTasks();
    fetchMentors();
  }, [fetchTasks]);

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title1">
          <p>My Account</p>
        </div>
        <div className="wrapper__profile">
          <MyAccountNav />
          <div className="wrapper__profile-bookings">
            <h1 className="wrapper__profile-details-title">Pro Task</h1>
            <h3 className="wrapper__profile-badges-description">
              Receive support measure tasks from your Coach to enhance your
              smoking cessation journey, ensuring you stay on track and
              motivated.
            </h3>

            {!user.hasActive ? (
              <Result
                title="Upgrade to PRO to unlock Pro Tasks"
                extra={
                  <Button
                    type="primary"
                    key="console"
                    className="wrapper__profile-bookings-upgrade-btn"
                    onClick={() => navigate("/user-profile/membership")}
                  >
                    See Membership Plans
                  </Button>
                }
              />
            ) : (
              <>
                <div className="wrapper__profile-free-task-categor">
                  <Card
                    hoverable
                    className={`wrapper__profile-pro-task-categor-card ${
                      activeFilter === "pending" ? "active" : ""
                    }`}
                    onClick={() => filterTasks("pending")}
                  >
                    Pending
                  </Card>
                  <Card
                    hoverable
                    className={`wrapper__profile-pro-task-categor-card ${
                      activeFilter === "completed" ? "active" : ""
                    }`}
                    onClick={() => filterTasks("completed")}
                  >
                    Completed
                  </Card>
                  <Card
                    hoverable
                    className={`wrapper__profile-pro-task-categor-card ${
                      activeFilter === "failed" ? "active" : ""
                    }`}
                    onClick={() => filterTasks("failed")}
                  >
                    Failed
                  </Card>
                </div>
                <Divider className="divider" />

                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <Spin size="large" />
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <Empty
                    description={`No ${activeFilter} tasks found!`}
                    style={{ margin: "20px 0" }}
                  />
                ) : (
                  filteredTasks.map((task) => (
                    <Card
                      key={task.taskId}
                      className="wrapper__profile-bookings-card"
                    >
                      <div className="wrapper__profile-free-task-header">
                        <p className="wrapper__profile-bookings-card-date-details mentor-fullname">
                          <IdcardTwoTone className="wrapper__profile-bookings-card-date-details-icon" />{" "}
                          Mentor:{" "}
                          <Button
                            type="link"
                            className="wrapper__profile-bookings-card-date-details-mentor"
                            onClick={() => handleMentorClick(task.mentorId)}
                          >
                            {getMentorDetails(task.mentorId)?.fullName ||
                              `Mentor ${task.mentorId}`}
                          </Button>
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Tag
                            color={
                              task.status === "completed"
                                ? "green"
                                : task.status === "failed"
                                ? "red"
                                : "blue"
                            }
                            style={{ fontSize: "12px", fontWeight: "500" }}
                          >
                            {task.status.charAt(0).toUpperCase() +
                              task.status.slice(1)}
                          </Tag>
                          {task.status === "pending" &&
                            isTaskUpdateAllowed(task) && (
                              <Dropdown
                                menu={{ items: getTaskActions(task) }}
                                trigger={["click"]}
                                placement="bottomRight"
                              >
                                <Button
                                  type="text"
                                  icon={<DownOutlined />}
                                  loading={updatingTaskId === task.taskId}
                                  color="primary"
                                  variant="filled"
                                >
                                  Update Status
                                </Button>
                              </Dropdown>
                            )}
                          {task.status === "pending" &&
                            !isTaskUpdateAllowed(task) && (
                              <Tag color="orange" style={{ fontSize: "12px" }}>
                                {new Date(task.taskDay) > new Date()
                                  ? "Not Yet Available"
                                  : "Overdue"}
                              </Tag>
                            )}
                        </div>
                      </div>

                      <div className="wrapper__profile-bookings-card-date">
                        <p className="wrapper__profile-bookings-card-date-details">
                          <CalendarTwoTone className="wrapper__profile-bookings-card-date-details-icon" />{" "}
                          {formatDate(task.taskDay)}
                        </p>
                        <p className="wrapper__profile-bookings-card-date-details">
                          <CheckCircleTwoTone className="wrapper__profile-bookings-card-date-details-icon" />{" "}
                          Target: {task.targetCigarettes} cigarettes
                        </p>
                      </div>

                      <div className="wrapper__profile-bookings-card-coach">
                        <div className="wrapper__profile-bookings-card-coach-info">
                          <div>
                            <div className="wrapper__profile-bookings-card-coach-info-support">
                              <p>"{task.customSupportMeasures}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProTask;
