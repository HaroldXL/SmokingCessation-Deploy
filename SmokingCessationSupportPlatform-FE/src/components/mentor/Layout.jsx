import { Layout as AntLayout, Avatar, Button, Typography, Space } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom"; // Import Outlet
import {
  LogoutOutlined,
  BookOutlined,
  PieChartOutlined,
  StarOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/redux/features/userSlice";
import { toast } from "react-toastify";
import styles from "./Layout.module.css";

const { Sider, Header, Content } = AntLayout;
const { Text } = Typography;

export const MentorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  const sidebarItems = [
    {
      key: "overview",
      icon: <PieChartOutlined />,
      label: "Overview",
      path: "/mentor/overview", // Use full paths
    },
    {
      key: "appointments",
      icon: <StarOutlined />,
      label: "Appointments",
      path: "/mentor/appointments", // Use full paths
    },
    {
      key: "clients",
      icon: <BookOutlined />,
      label: "Clients",
      path: "/mentor/clients", // Use full paths
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Reports",
      path: "/mentor/reports", // Use full paths
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <AntLayout className={styles.layout}>
      {/* Sidebar */}
      <Sider width={240} className={styles.sider}>
        <div className={styles.siderContent}>
          {/* Profile Section */}
          <div className={styles.profileSection}>
            <Space align="center" className={styles.profileSpace}>
              <Avatar
                size={50}
                src={
                  user?.avatarUrl ||
                  "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
                }
                className={styles.avatar}
              ></Avatar>
              <div>
                <Text strong>{user?.profileName || "Mentor Name"}</Text>
              </div>
            </Space>
            <br />
            <Text type="secondary" className={styles.coachTitle}>
              Smoking Cessation Coach
            </Text>
          </div>

          {/* Navigation */}
          <div className={styles.navigationSection}>
            <Text type="secondary" className={styles.navHeader}>
              DASHBOARDS
            </Text>
            <div className={styles.navItemsContainer}>
              {sidebarItems.map((item) => {
                // Adjust isActive logic for /mentor and /mentor/overview
                const isActive =
                  location.pathname === item.path ||
                  (location.pathname === "/mentor" &&
                    item.path === "/mentor/overview");

                return (
                  <div
                    key={item.key}
                    className={`${styles.navItem} ${
                      isActive ? styles.navItemActive : ""
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <Text
                      className={
                        isActive ? styles.navItemTextActive : styles.navItemText
                      }
                    >
                      {item.label}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logout Button */}
          <div className={styles.logoutContainer}>
            <Button
              danger
              type="primary"
              icon={<LogoutOutlined />}
              block
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </div>
      </Sider>

      <AntLayout className={styles.mainLayout}>
        {/* Main Content */}
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default MentorLayout;
