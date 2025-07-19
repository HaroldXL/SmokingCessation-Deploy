import { Button, Avatar } from "antd";
import "./header.css";
import { BellOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((store) => store.user);

  const isActivePage = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.includes(path);
  };

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
            <BellOutlined className="noti" />
            {user ? (
              <div className="user-info">
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
