import {
  Affix,
  Divider,
  Card,
  Button,
  Typography,
  Tag,
  Space,
  message,
  Spin,
  Empty,
  Popconfirm,
} from "antd";
import { DeleteOutlined, CheckOutlined, EyeOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../config/axios";
import "./notification.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const { Text, Title } = Typography;

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications/user/${user.userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      message.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      message.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      message.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notif) => notif.notificationId !== notificationId)
      );
      message.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      message.error("Failed to delete notification");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      message.success("All notifications deleted");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      message.error("Failed to delete all notifications");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-EN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title">
          <p>Notifications</p>
        </div>
        <Divider className="divider" />

        {notifications.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <Space>
              <Popconfirm
                title="Mark all notifications as read?"
                onConfirm={markAllAsRead}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  color="primary"
                  variant="filled"
                  icon={<CheckOutlined />}
                >
                  Mark All Read
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Delete all notifications?"
                description="This action cannot be undone."
                onConfirm={deleteAllNotifications}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <Button
                  color="danger"
                  variant="filled"
                  icon={<DeleteOutlined />}
                >
                  Delete All
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}

        <Spin spinning={loading}>
          {notifications.length === 0 ? (
            <Empty description="No notifications available" />
          ) : (
            <div className="wrapper__notification">
              {notifications.map((notification) => (
                <Card
                  key={notification.notificationId}
                  hoverable
                  className={`wrapper__notification-card ${
                    !notification.isRead ? "unread" : ""
                  }`}
                >
                  <div className="wrapper__notification-card-actions">
                    {!notification.isRead && (
                      <Button
                        type="text"
                        size="small"
                        color="primary"
                        variant="filled"
                        icon={<CheckOutlined />}
                        onClick={() => markAsRead(notification.notificationId)}
                        className="wrapper__notification-card-action-btn"
                      />
                    )}
                    <Popconfirm
                      title="Delete this notification?"
                      onConfirm={() =>
                        deleteNotification(notification.notificationId)
                      }
                      okText="Yes"
                      cancelText="No"
                      okType="danger"
                    >
                      <Button
                        type="text"
                        size="small"
                        color="danger"
                        variant="filled"
                        danger
                        icon={<DeleteOutlined />}
                        className="wrapper__notification-card-action-btn"
                      />
                    </Popconfirm>
                  </div>
                  <div className="wrapper__notification-card-info">
                    <div className="wrapper__notification-card-info-content">
                      <h2 className="wrapper__notification-card-info-title">
                        {notification.title}
                        {!notification.isRead && (
                          <Tag
                            color="blue"
                            size="small"
                            style={{ marginLeft: "8px" }}
                          >
                            New
                          </Tag>
                        )}
                      </h2>
                      <Text
                        type="secondary"
                        className="wrapper__notification-card-date"
                      >
                        {formatDate(notification.receivedAt)}
                      </Text>
                      <p className="wrapper__notification-card-message">
                        {notification.message}
                      </p>
                      <div className="wrapper__notification-card-meta">
                        {notification.sender && (
                          <Text className="wrapper__notification-card-sender">
                            From:{" "}
                            {typeof notification.sender === "object"
                              ? notification.sender.fullName ||
                                notification.sender.profileName ||
                                "Unknown Sender"
                              : notification.sender}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Spin>
      </div>
      <Footer />
    </>
  );
}

export default Notification;
