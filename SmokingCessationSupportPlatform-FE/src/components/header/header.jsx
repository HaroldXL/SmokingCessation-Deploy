import { Button, Avatar, Badge, Tooltip } from "antd";
import "./header.css";
import {
  BellOutlined,
  BellTwoTone,
  ContainerTwoTone,
  CrownOutlined,
  ProfileTwoTone,
  ScheduleTwoTone,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import api from "../../config/axios";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = useSelector((store) => store.user);

  const isActivePage = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.includes(path);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchUnreadCount();
    }
  }, [user?.userId]);

  return (
    <>
      <header className="header">
        <div className="header__container">
          <div className="header__inner">
            <Link to="/">
              <img
                className="header__inner-logo"
                src="/images/Quitlt-logo.png"
                alt="Quitlt Logo"
              />
            </Link>
            <nav className="header__nav">
              <Link to="/" className={isActivePage("/") ? "active" : ""}>
                Home
              </Link>

              <Link
                to="/user-coach"
                className={isActivePage("/user-coach") ? "active" : ""}
              >
                Coach
              </Link>

              <Link
                to="/community"
                className={isActivePage("/community") ? "active" : ""}
              >
                Community
              </Link>
              <Link
                to="/about-us"
                className={isActivePage("/about-us") ? "active" : ""}
              >
                About Us
              </Link>
            </nav>
          </div>
          <div className="header__login-register">
            {/* <SearchOutlined className="search" /> */}

            {user ? (
              <div className="user-info">
                <Tooltip title="Bookings">
                  <ScheduleTwoTone
                    className="noti"
                    onClick={() => navigate("/user-profile/bookings")}
                  />
                </Tooltip>

                <Tooltip title="Pro Tasks">
                  <ContainerTwoTone
                    className="noti"
                    onClick={() => navigate("/user-profile/pro-task")}
                  />
                </Tooltip>

                <Tooltip title="Free Tasks">
                  <ProfileTwoTone
                    className="noti"
                    onClick={() => navigate("/user-profile/free-task")}
                  />
                </Tooltip>

                <Badge className="noti" count={unreadCount} size="small">
                  <Tooltip title="Notifications">
                    <BellTwoTone onClick={() => navigate("/notifications")} />
                  </Tooltip>
                </Badge>

                {user.avatarUrl ? (
                  <Avatar
                    onClick={() => navigate("/user-profile")}
                    className="user-avatar"
                    size="large"
                    src={user.avatarUrl}
                  />
                ) : (
                  <Avatar
                    onClick={() => navigate("/user-profile")}
                    className="user-avatar"
                    size="large"
                    icon={<UserOutlined />}
                  />
                )}
                <Button
                  type="link"
                  onClick={() => navigate("/user-profile")}
                  className="user-name"
                >
                  {user.profileName}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                  className="login-btn"
                >
                  Login
                </Button>
                <Button
                  color="primary"
                  variant="filled"
                  onClick={() => navigate("/register")}
                  className="register-btn"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
