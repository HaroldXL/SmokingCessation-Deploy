import React from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  TeamOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./Sidebar.css";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/redux/features/userSlice";
import { Popconfirm } from "antd";

const Sidebar = () => {
  const dispatch = useDispatch();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__logo">
          <div className="sidebar__admin-name">Admin QuitIt</div>
        </div>
        <nav>
          <div className="sidebar__section-title">Dashboards</div>
          <ul className="sidebar__menu">
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
                end
              >
                <DashboardOutlined className="sidebar__icon" />
                Dashboard
              </NavLink>
            </li>
          </ul>
          <div className="sidebar__section-title sidebar__section-title--pages">
            Pages
          </div>
          <ul className="sidebar__menu">
            <li>
              <NavLink
                to="/admin/user-management"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <UserOutlined className="sidebar__icon" />
                User Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/blog-management"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <ReadOutlined className="sidebar__icon" />
                Blog Management
              </NavLink>
            </li>
            {/* <li>
              <NavLink
                to="/admin/coach-management"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <TeamOutlined className="sidebar__icon" />
                Coach Management
              </NavLink>
            </li> */}
            <li>
              <NavLink
                to="/admin/plan-management"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <BookOutlined className="sidebar__icon" />
                Plan Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/badge-management"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <TrophyOutlined className="sidebar__icon" />
                Badge Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/schedule-management"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <CalendarOutlined className="sidebar__icon" />
                Schedule Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/membership-payment"
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__menu-item sidebar__menu-item--active"
                    : "sidebar__menu-item"
                }
              >
                <CreditCardOutlined className="sidebar__icon" />
                Membership & Payment
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="sidebar__logout">
        <button className="sidebar__logout-btn">
          <Popconfirm
            onConfirm={() => dispatch(logout())}
            title="Do you want to Log Out ?"
            okText="Yes"
            cancelText="No"
          >
            <LogoutOutlined className="sidebar__icon" />
            Log out
          </Popconfirm>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
