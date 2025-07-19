import { Button, Popconfirm } from "antd";
import "./myAccount-nav.css";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/redux/features/userSlice";

function MyAccountNav() {
  const location = useLocation();
  const dispatch = useDispatch();

  const isActivePage = (path) => {
    if (path === "/user-profile") {
      return location.pathname === "/user-profile";
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="wrapper__profile-nav">
      <Link
        to="/user-profile"
        className={isActivePage("/user-profile") ? "active" : ""}
      >
        Profile
      </Link>
      <Link
        to="/user-profile/change-pass"
        className={isActivePage("/user-profile/change-pass") ? "active" : ""}
      >
        Change Password
      </Link>
      <Link
        to="/user-profile/posts"
        className={isActivePage("/user-profile/posts") ? "active" : ""}
      >
        Posts
      </Link>
      <Link
        to="/user-profile/bookings"
        className={isActivePage("/user-profile/bookings") ? "active" : ""}
      >
        Bookings
      </Link>
      <Link
        to="/user-profile/membership"
        className={isActivePage("/user-profile/membership") ? "active" : ""}
      >
        Membership
      </Link>

      <Link
        to="/user-profile/badges"
        className={isActivePage("/user-profile/badges") ? "active" : ""}
      >
        Badges
      </Link>

      <Popconfirm
        onConfirm={() => dispatch(logout())}
        title="Do you want to Log Out ?"
        okText="Yes"
        cancelText="No"
      >
        <Button className="logout-btn" type="primary" danger>
          Log out
        </Button>
      </Popconfirm>
    </div>
  );
}

export default MyAccountNav;
