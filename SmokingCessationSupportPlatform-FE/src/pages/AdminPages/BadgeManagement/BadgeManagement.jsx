import styles from "./BadgeManagement.module.css";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import ReusableTable from "../../../components/admin/ReusableTable/ReusableTable.jsx";
import FilterBar from "../../../components/admin/AdminReusableUI/FilterBar.jsx";
import BulkActionBar from "../../../components/admin/AdminReusableUI/BulkActionBar.jsx";
import { badgeService } from "../../../services/badgeService.js";
import uploadFile from "../../../store/utils/file.js";
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Typography,
  Tag,
  message,
  Avatar,
  Button,
  Tooltip,
  Spin,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  TrophyOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

function BadgeManagement() {
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // Filter states
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch badges from API
  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await badgeService.getBadges();
      setBadges(response);
      setFilteredBadges(response);
    } catch (error) {
      message.error("Failed to fetch badges");
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load badges on component mount
  useEffect(() => {
    fetchBadges();
  }, []);

  // Upload handlers
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    if (!isLt5M) {
      message.error("Image must smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Apply filters whenever search or filterStatus changes
  useEffect(() => {
    let filtered = badges;

    if (search) {
      filtered = filtered.filter(
        (badge) =>
          badge.badgeName.toLowerCase().includes(search.toLowerCase()) ||
          badge.badgeType.toLowerCase().includes(search.toLowerCase()) ||
          badge.badgeDescription.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((badge) => {
        if (filterStatus === "active") return badge.isActive;
        if (filterStatus === "inactive") return !badge.isActive;
        return true;
      });
    }

    setFilteredBadges(filtered);
  }, [search, filterStatus, badges]);

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(filteredBadges.map((badge) => badge.badgeId));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const handleSelectRow = (badgeId, checked) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, badgeId]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((id) => id !== badgeId));
    }
  };

  const showModal = (badge) => {
    if (badge) {
      setEditingBadge(badge);
      form.setFieldsValue({
        badgeType: badge.badgeType,
        badgeName: badge.badgeName,
        badgeDescription: badge.badgeDescription,
        badgeImageUrl: badge.badgeImageUrl,
        isActive: badge.isActive,
      });

      // Set existing image in fileList if available
      if (badge.badgeImageUrl) {
        setFileList([
          {
            uid: "-1",
            name: "current-image",
            status: "done",
            url: badge.badgeImageUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      setEditingBadge(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBadge(null);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await form.validateFields();

      // Handle image upload if there's a new file
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const uploadedImageUrl = await uploadFile(fileList[0].originFileObj);
          values.badgeImageUrl = uploadedImageUrl;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          message.error("Failed to upload image. Please try again.");
          return;
        }
      }

      if (editingBadge) {
        // Update existing badge
        await badgeService.updateBadge(editingBadge.badgeId, values);
        message.success("Badge updated successfully!");
        // Refresh badges list
        await fetchBadges();
      } else {
        // Add new badge
        await badgeService.createBadge(values);
        message.success("Badge created successfully!");
        // Refresh badges list
        await fetchBadges();
      }

      handleCancel();
    } catch (error) {
      console.error("Operation failed:", error);
      message.error(`Failed to ${editingBadge ? "update" : "create"} badge`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "badgeImageUrl",
      key: "image",
      render: (imageUrl) => (
        <img
          src={imageUrl}
          alt="Badge"
          style={{
            width: "140px",
            height: "140px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ),
    },
    {
      title: "Badge Name",
      dataIndex: "badgeName",
      key: "badgeName",
      sortable: true,
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "Type",
      dataIndex: "badgeType",
      key: "badgeType",
      sortable: true,
      render: (text) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "badgeDescription",
      key: "badgeDescription",
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <div
            style={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="default"
          icon={<EditOutlined />}
          size="small"
          onClick={() => showModal(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      placeholder: "Filter by Status",
      value: filterStatus,
      onChange: setFilterStatus,
      options: [
        { value: "", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Activate Selected",
      onClick: async () => {
        try {
          await badgeService.bulkUpdateBadgeStatus(selectedRowKeys, true);
          message.success(`${selectedRowKeys.length} badges activated!`);
          setSelectedRowKeys([]);
          await fetchBadges();
        } catch (error) {
          message.error("Failed to activate badges");
          console.error("Error activating badges:", error);
        }
      },
    },
    {
      label: "Deactivate Selected",
      onClick: async () => {
        try {
          await badgeService.bulkUpdateBadgeStatus(selectedRowKeys, false);
          message.success(`${selectedRowKeys.length} badges deactivated!`);
          setSelectedRowKeys([]);
          await fetchBadges();
        } catch (error) {
          message.error("Failed to deactivate badges");
          console.error("Error deactivating badges:", error);
        }
      },
    },
  ];

  return (
    <AdminLayout title="Badge Management">
      <div className={styles.badgeManagementPage}>
        {/* Header */}
        <h2>Badge Management</h2>

        {/* Add Badge Button */}
        <div style={{ marginBottom: "24px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
            className={styles.addButton}
          >
            Add Badge
          </Button>
        </div>

        {/* Filters */}
        <FilterBar
          searchPlaceholder="Search badges..."
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          filters={filterOptions}
        />

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <BulkActionBar
            selectedCount={selectedRowKeys.length}
            actions={bulkActions}
          />
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div style={{ padding: "50px", textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : (
            <ReusableTable
              columns={columns}
              data={filteredBadges}
              selectedRowKeys={selectedRowKeys}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>

        {/* Modal */}
        <Modal
          title={editingBadge ? "Edit Badge" : "Add New Badge"}
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          width={600}
          okText={editingBadge ? "Update" : "Create"}
          confirmLoading={submitLoading}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ isActive: true }}
          >
            <Form.Item
              name="badgeType"
              label="Badge Type"
              rules={[{ required: true, message: "Please input badge type!" }]}
            >
              <Input placeholder="e.g., 24H_NOSMOKE" />
            </Form.Item>

            <Form.Item
              name="badgeName"
              label="Badge Name"
              rules={[{ required: true, message: "Please input badge name!" }]}
            >
              <Input placeholder="e.g., 24 Hours Smoke-Free" />
            </Form.Item>

            <Form.Item
              name="badgeDescription"
              label="Description"
              rules={[{ required: true, message: "Please input description!" }]}
            >
              <TextArea rows={3} placeholder="Describe the achievement..." />
            </Form.Item>

            <Form.Item
              name="badgeImageUrl"
              label="Badge Image"
              rules={[
                {
                  required: !fileList.length,
                  message: "Please upload badge image!",
                },
              ]}
            >
              <div>
                <Upload
                  listType="picture"
                  maxCount={1}
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                >
                  <Button type="default" icon={<UploadOutlined />}>
                    Upload Image (Max 1)
                  </Button>
                </Upload>
                {!fileList.length && (
                  <div
                    style={{
                      marginTop: "8px",
                      color: "#666",
                      fontSize: "12px",
                    }}
                  >
                    Or enter image URL below:
                  </div>
                )}
                {!fileList.length && (
                  <Input
                    placeholder="/images/badges/example.png"
                    style={{ marginTop: "8px" }}
                    onChange={(e) =>
                      form.setFieldsValue({ badgeImageUrl: e.target.value })
                    }
                  />
                )}
              </div>
            </Form.Item>

            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default BadgeManagement;
