import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="dashboard-header">
      <nav className="dashboard-breadcrumb">
        <span className="dashboard-breadcrumb__section">Dashboards</span>
        <span className="dashboard-breadcrumb__divider">/</span>
        <span className="dashboard-breadcrumb__current">Overview</span>
      </nav>
    </header>
  );
};

export default Header;