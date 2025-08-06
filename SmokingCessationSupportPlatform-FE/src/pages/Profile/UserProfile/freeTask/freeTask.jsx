import "./freeTask.css";
import {
  Affix,
  Button,
  Card,
  Divider,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Spin,
  Empty,
  Space,
  Checkbox,
  Tag,
  Dropdown,
  Popconfirm,
} from "antd";
import Header from "../../../../components/header/header";
import Footer from "../../../../components/footer/footer";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import {
  PlusOutlined,
  CalendarTwoTone,
  CheckCircleTwoTone,
  ExclamationCircleFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import api from "../../../../config/axios";
import dayjs from "dayjs";

function FreeTask() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [supportMeasures, setSupportMeasures] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [createTaskForm] = Form.useForm();
  const { confirm } = Modal;

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
      const response = await api.get("/tasks/free");
      setTasks(response.data);

      const filtered = response.data.filter(
        (task) => task.status === activeFilter
      );
      setFilteredTasks(filtered);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const fetchSupportMeasures = async () => {
    try {
      const response = await api.get("/tasks/support-measures");
      setSupportMeasures(response.data);
    } catch (error) {
      console.error("Error fetching support measures:", error);
      message.error("Failed to fetch support measures");
    }
  };

  const handleCreateTask = async (values) => {
    try {
      const taskData = {
        taskDay: values.taskDay.format("YYYY-MM-DD"),
        targetCigarettes: values.targetCigarettes,
        status: "pending",
        supportMeasureIds: values.supportMeasureIds,
      };

      await api.post("/tasks/free", taskData);
      message.success("Task created successfully!");
      setCreateTaskModal(false);
      createTaskForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);

      const errorMessage = error.response?.data?.message;
      if (errorMessage === "Bạn đã tạo nhiệm vụ cho ngày này rồi.") {
        message.error("You have already created Task for this day.");
      } else if (
        errorMessage === "Không tìm thấy kế hoạch bỏ thuốc đang hoạt động"
      ) {
        message.warning(
          "Please create a quit plan first before creating tasks!"
        );
      } else {
        message.error("Failed to create task");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/free/${taskId}`);
      message.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
    }
  };

  const showDeleteConfirm = (taskId) => {
    confirm({
      title: "Are you sure you want to delete this task?",
      icon: <ExclamationCircleFilled />,
      content: "This action cannot be undone.",
      centered: true,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDeleteTask(taskId);
      },
    });
  };

  const canCompleteTask = (taskDay) => {
    const today = dayjs().format("YYYY-MM-DD");
    const taskDate = dayjs(taskDay).format("YYYY-MM-DD");
    return taskDate <= today;
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await api.put(`/tasks/task-free/${taskId}/status?status=${newStatus}`);
      message.success(`Task marked as ${newStatus}!`);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getTaskActions = (task) => {
    if (task.status !== "pending" || !canCompleteTask(task.taskDay)) {
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
    return task.status === "pending" && canCompleteTask(task.taskDay);
  };

  useEffect(() => {
    fetchTasks();
    fetchSupportMeasures();
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
            <h1 className="wrapper__profile-details-title">Free Task</h1>
            <Button
              color="default"
              variant="filled"
              className="new-post-btn"
              onClick={() => setCreateTaskModal(true)}
            >
              <PlusOutlined />
              Schedule a Task
            </Button>
            <div className="wrapper__profile-free-task-categor">
              <Card
                hoverable
                className={`wrapper__profile-free-task-categor-card ${
                  activeFilter === "pending" ? "active" : ""
                }`}
                onClick={() => filterTasks("pending")}
              >
                Pending
              </Card>
              <Card
                hoverable
                className={`wrapper__profile-free-task-categor-card ${
                  activeFilter === "completed" ? "active" : ""
                }`}
                onClick={() => filterTasks("completed")}
              >
                Completed
              </Card>
              <Card
                hoverable
                className={`wrapper__profile-free-task-categor-card ${
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
                    <p className="wrapper__profile-bookings-card-note">
                      Task Details
                    </p>
                    <Space>
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
                            Wait for Task Day
                          </Tag>
                        )}
                      <Button
                        color="danger"
                        variant="filled"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="wrapper__profile-free-task-card-delete-btn"
                        onClick={() => showDeleteConfirm(task.taskId)}
                      >
                        Delete
                      </Button>
                    </Space>
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
                        <Space wrap>
                          {task.supportMeasures.map((measure) => (
                            <Tag
                              key={measure.supportMeasuresId}
                              color="blue"
                              className="wrapper__support-measure-tag"
                            >
                              {measure.supportMeasures}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}

            <Modal
              title="Schedule a New Task"
              open={createTaskModal}
              onCancel={() => {
                setCreateTaskModal(false);
                createTaskForm.resetFields();
              }}
              footer={null}
              width={600}
            >
              <Form
                form={createTaskForm}
                onFinish={handleCreateTask}
                layout="vertical"
              >
                <Form.Item
                  name="taskDay"
                  label="Task Date"
                  rules={[
                    {
                      required: true,
                      message: "Please select a task date",
                    },
                  ]}
                >
                  <DatePicker
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="targetCigarettes"
                  label="Target Cigarettes"
                  rules={[
                    {
                      required: true,
                      message: "Please enter target cigarettes",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Target cigarettes must be 0 or greater",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "50%" }}
                    min={0}
                    placeholder="Enter target number of cigarettes"
                  />
                </Form.Item>

                <Form.Item
                  name="supportMeasureIds"
                  label="Support Measures"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one support measure",
                    },
                  ]}
                >
                  <Checkbox.Group style={{ width: "100%" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {supportMeasures.map((measure) => (
                        <Checkbox
                          key={measure.supportMeasuresId}
                          value={measure.supportMeasuresId}
                          className="wrapper__support-measure-checkbox"
                        >
                          {measure.supportMeasures}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button
                      onClick={() => {
                        setCreateTaskModal(false);
                        createTaskForm.resetFields();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      Create Task
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FreeTask;
