import Sidebar from "../../components/admin/Sidebar/Sidebar.jsx";
import { Layout, Breadcrumb, Affix } from "antd";
import styles from "./AdminLayout.module.css";

const { Sider, Content } = Layout;

const AdminLayout = ({ title, children, showBreadcrumb = false }) => {
  return (
    <Layout style={{ minHeight: "100vh" }} className={styles["admin-layout-root"]}>
      {/* Fixed Sidebar */}
      <Affix>
        <Sider width={240} className={styles["admin-sider"]}>
          <Sidebar />
        </Sider>
      </Affix>

      {/* Main Content Area */}
      <Layout className={styles["admin-main"]}>
        <Content className={styles["admin-content"]}>
          {/* Optional Breadcrumb */}
          {showBreadcrumb && (
            <Breadcrumb style={{ margin: "16px 0" }} className={styles["admin-breadcrumb"]}>
              <Breadcrumb.Item>Dashboards</Breadcrumb.Item>
              <Breadcrumb.Item>{title}</Breadcrumb.Item>
            </Breadcrumb>
          )}

          {/* Page Content */}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
