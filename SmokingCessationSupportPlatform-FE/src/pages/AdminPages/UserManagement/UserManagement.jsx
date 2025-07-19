import styles from "./UserManagement.module.css";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import ReusableTable from "../../../components/admin/ReusableTable/ReusableTable.jsx";
import {
  Modal,
  Tabs,
  Form,
  Select,
  Tag,
  List,
  Descriptions,
  Button,
  Input,
  message,
  Card,
  Space,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { userService } from "../../../services/userService.js";
import ModalForDetailsButton from "./ModalForDetailsButton.jsx";
import ModalForEditUser from "./ModalForEditUser.jsx";
import ModalForAddUser from "./ModalForAddUser.jsx";

const { confirm } = Modal;

const membershipOptions = [
  { value: "", label: "Filter membership" },
  { value: "Premium Plan", label: "Premium Plan " },
  { value: "Free Plan", label: "Free Plan" },
];
const statusOptions = [
  { value: "", label: "All account status" },
  { value: "active", label: "Active" },
  { value: "locked", label: "Locked" },
];
const roleOptions = [
  { value: "", label: "All roles" },
  { value: "user", label: "Customer" },
  { value: "admin", label: "Admin" },
  { value: "guest", label: "Guest" },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    membership: "",
    status: "",
    role: "",
  });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // Thêm state cho Add User modal
  const [editingUserId, setEditingUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users khi component mount
  useEffect(() => {
    const getUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await userService.fetchAdminUsers();
        const transformedUsers = data.map((u) => {
          // Chuẩn hóa membership
          let membership = "Free Plan";
          if (u.hasActive === true) {
            membership = "Premium Plan";
          }
          return {
            id: u.userId,
            name: u.fullName,
            email: u.email,
            profile: u.profileName,
            avatarUrl: u.avatarUrl || "",
            role: u.role,
            membership: membership,
            joinDate: u.createdAt,
            lastActivity: u.lastLogin,
            status: u.isBlock ? "locked" : "active",
          };
        });
        setUsers(transformedUsers);
      } catch (err) {
        console.error("Failed to fetch users", err);
        message.error("Failed to fetch users. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    };
    getUsers();
  }, []); //chỉ chạy một lần khi component mount

  // Filter users khi filters hoặc users thay đổi
  useEffect(() => {
    const filterUsers = () => {
      let result = users.filter((user) => {
        const search = filters.search.toLowerCase();
        const matchSearch =
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.profile.toLowerCase().includes(search);

        const matchMembership = filters.membership
          ? user.membership === filters.membership
          : true;

        const matchStatus = filters.status
          ? user.status === filters.status
          : true;

        const matchRole = filters.role ? user.role === filters.role : true;

        return matchSearch && matchMembership && matchStatus && matchRole;
      });

      setFilteredUsers(result);
      setSelectedRowKeys([]); // Reset selection khi filter
    };

    filterUsers();
  }, [filters, users]);

  // Delete single user
  const handleDeleteUser = async (userId, userName) => {
    confirm({
      title: "Delete User",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await userService.deleteUser(userId);
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          message.success("User deleted successfully");
        } catch (error) {
          console.error("Failed to delete user:", error);
          message.error("Failed to delete user. Please try again.");
        }
      },
      onCancel() {
        // User cancelled, do nothing
      },
    });
  };

  // Bulk delete users
  const handleBulkDelete = async () => {
    confirm({
      title: "Delete Multiple Users",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected users? This action cannot be undone.`,
      okText: "Yes, Delete All",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((userId) => userService.deleteUser(userId))
          );
          setUsers((prev) =>
            prev.filter((u) => !selectedRowKeys.includes(u.id))
          );
          setSelectedRowKeys([]);
          message.success(
            `${selectedRowKeys.length} users deleted successfully`
          );
        } catch (error) {
          console.error("Failed to delete users:", error);
          message.error("Failed to delete some users. Please try again.");
        }
      },
      onCancel() {
        // User cancelled, do nothing
      },
    });
  };

  // Đảm bảo function được định nghĩa đúng cách
  const handleViewDetails = async (user) => {
    try {
      setSelectedUser(user);
      setIsModalVisible(true);
      setLoadingDetail(true);

      console.log("Selected user:", user);

      if (user.role === "Customer" || user.role === "user") {
        try {
          const data = await userService.getSmokingProgressId(user.id);
          console.log("Smoking progress data:", data);

          // Data trả về là array, lấy phần tử đầu tiên
          if (data && data.length > 0) {
            const progressData = data[0];

            // Format data cho modal
            const formattedData = {
              ...user,
              // Smoking progress information
              daysSinceStart: progressData.daysSinceStart || 0,
              cigarettesAvoided: progressData.cigarettesAvoided || 0,
              moneySaved: progressData.moneySaved || 0,
              targetDays: progressData.targetDays || "Not set",
              cigarettesPerDay: progressData.cigarettesPerDay || "N/A",
              cigarettePackCost: progressData.cigarettePackCost || 0,
              status: progressData.status || "Unknown",
              startDate: progressData.startDate,
              endDate: progressData.endDate,
              smokingHistoryByDate: progressData.smokingHistoryByDate || {},
            };

            setUserDetail(formattedData);
          } else {
            // Không có smoking progress data
            setUserDetail({
              ...user,
              daysSinceStart: 0,
              cigarettesAvoided: 0,
              moneySaved: 0,
              targetDays: "Not set",
              cigarettesPerDay: "N/A",
              cigarettePackCost: 0,
              status: "No data",
            });
          }
        } catch (progressError) {
          console.warn("Failed to get smoking progress:", progressError);
          setUserDetail(user);
          message.warning(
            "Failed to load smoking progress data. Showing basic user information."
          );
        }
      } else if (user.role === "Admin" || user.role === "Coach") {
        const data = await userService.getUserById(user.id);
        setUserDetail(data);
      } else {
        setUserDetail(user);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setUserDetail(user);
      message.error("Failed to load user details");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setIsEditModalVisible(true);
  };

  // Handle add user
  const handleAddUser = () => {
    setIsAddModalVisible(true);
  };

  // Handle user updated
  const handleUserUpdated = async () => {
    // Refresh users list after update
    try {
      setLoadingUsers(true);
      const data = await userService.fetchAdminUsers();
      const transformedUsers = data.map((u) => {
        // Chuẩn hóa membership
        let membership = "Free Plan";
        if (u.hasActive === true) {
          membership = "Premium Plan";
        }
        return {
          id: u.userId,
          name: u.fullName,
          email: u.email,
          profile: u.profileName,
          role: u.role,
          membership: membership, // dùng giá trị đã chuẩn hóa
          joinDate: u.createdAt,
          lastActivity: u.lastLogin,
          status: u.isBlock ? "locked" : "active",
        };
      });
      setUsers(transformedUsers);
    } catch (err) {
      console.error("Failed to refresh users", err);
      message.error("Failed to refresh users list");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle user added
  const handleUserAdded = async () => {
    // Refresh users list after adding new user
    await handleUserUpdated();
    setIsAddModalVisible(false);
  };

  const handleSelectAll = (checked) => {
    setSelectedRowKeys(checked ? filteredUsers.map((u) => u.id) : []);
  };

  const handleSelectRow = (id, checked) => {
    setSelectedRowKeys((prev) =>
      checked ? [...prev, id] : prev.filter((key) => key !== id)
    );
  };

  const columns = [
    { title: "User ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Profile name", dataIndex: "profile" },
    {
      title: "Role",
      dataIndex: "role",
      render: (value) => (
        <span
          className={
            value === "Coach" ? styles["role-coach"] : styles["role-customer"]
          }
        >
          {value}
        </span>
      ),
    },
    {
      title: "Membership package",
      dataIndex: "membership",
      render: (value) =>
        value === "Premium Plan" ? (
          <Tag color="gold">Premium Plan</Tag>
        ) : (
          <Tag color="blue">Free Plan</Tag>
        ),
    },
    {
      title: "Joining date",
      dataIndex: "joinDate",
      render: (value) =>
        dayjs(value, ["D/M/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format(
          "DD/MM/YYYY"
        ),
    },
    {
      title: "Last activity",
      dataIndex: "lastActivity",
      render: (value) =>
        dayjs(value, ["D/M/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format(
          "DD/MM/YYYY"
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (value, row) => {
        // Không hiển thị action nếu role là admin
        if (row.role === "admin" || row.role === "Admin") {
          return <span style={{ color: "#999", fontStyle: "italic" }}> </span>;
        }

        return (
          <Space size="small">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditUser(row)}
            >
              Edit
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(row)}
            >
              Details
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteUser(row.id, row.name)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <AdminLayout title="User Management">
      <div className={styles["user-management-page"]}>
        <h2>User Management</h2>
        <div className={styles["search-filter-row"]}>
          <Input.Search
            placeholder="Search by name, email, profile name..."
            allowClear
            size="large"
            style={{ minWidth: 260 }}
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
          <Select
            showSearch
            allowClear
            placeholder="Filter membership"
            size="large"
            style={{ minWidth: 220 }}
            onChange={(value) =>
              setFilters((f) => ({ ...f, membership: value || "" }))
            }
            value={filters.membership || undefined}
            options={membershipOptions}
          />
          <Select
            showSearch
            allowClear
            placeholder="Filter account status"
            size="large"
            style={{ minWidth: 220 }}
            onChange={(value) =>
              setFilters((f) => ({ ...f, status: value || "" }))
            }
            value={filters.status || undefined}
            options={statusOptions}
          />
          <Select
            showSearch
            allowClear
            placeholder="Filter roles"
            size="large"
            style={{ minWidth: 220 }}
            onChange={(value) =>
              setFilters((f) => ({ ...f, role: value || "" }))
            }
            value={filters.role || undefined}
            options={roleOptions}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAddUser}
            style={{
              marginLeft: 16,
              borderRadius: "6px",
              fontWeight: 500,
            }}
          >
            Add User
          </Button>
        </div>
        {selectedRowKeys.length > 0 && (
          <div className={styles["bulk-actions"]}>
            <span>{selectedRowKeys.length} users selected</span>
            <Select
              placeholder="Bulk Actions"
              className={styles["bulk-actions-select"]}
              onChange={(action) => {
                if (action === "delete") handleBulkDelete();
              }}
              options={[{ value: "delete", label: "Delete" }]}
            />
          </div>
        )}
        <div className={styles["user-table-wrapper"]}>
          <ReusableTable
            columns={columns}
            data={filteredUsers}
            selectedRowKeys={selectedRowKeys}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            loading={loadingUsers}
          />
        </div>

        {/* Modal for User Details */}
        <ModalForDetailsButton
          open={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setUserDetail(null);
            setLoadingDetail(false);
          }}
          selectedUser={selectedUser}
          userDetail={userDetail}
          loadingDetail={loadingDetail}
        />

        {/* Modal for Edit User */}
        <ModalForEditUser
          open={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setEditingUserId(null);
          }}
          userId={editingUserId}
          onUserUpdated={handleUserUpdated}
        />

        {/* Modal for Add User */}
        <ModalForAddUser
          open={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false);
          }}
          onUserAdded={handleUserAdded}
        />
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
