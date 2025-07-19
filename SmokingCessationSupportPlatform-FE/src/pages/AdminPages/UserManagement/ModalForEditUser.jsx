import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  message,
  DatePicker,
  Row,
  Col,
  Spin,
  Avatar,
  Typography,
  Divider,
  Select,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  CloseOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { userService } from "../../../services/userService.js";
import styles from "./ModalForEditUser.module.css";

const { Title, Text } = Typography;

// --- Sub-components for better maintainability ---

const UserInfoHeader = ({ userData }) => (
  <div className={styles.userHeader}>
    {userData?.avatarUrl ? (
      <Avatar
        size={60}
        src={userData.avatarUrl}
        alt="User Avatar"
        className={styles.avatar}
      />
    ) : (
      <Avatar size={60} icon={<UserOutlined />} className={styles.avatar} />
    )}
    <div className={styles.userInfo}>
      <Title level={4} className={styles.userName}>
        {userData.fullName}
      </Title>
      <div className={styles.userIdContainer}>
        <Text type="secondary">User ID: #{userData.userId}</Text>
        <span
          className={`${styles.statusBadge} ${
            userData.hasActive ? styles.statusActive : styles.statusBlocked
          }`}
        >
          {userData.hasActive ? <CheckCircleOutlined /> : <StopOutlined />}
          {userData.hasActive ? "Pro Member" : "Free Member"}
        </span>
      </div>
    </div>
  </div>
);

const BasicInfoForm = () => (
  <>
    <Title level={5} className={styles.sectionTitle}>
      Basic Information
    </Title>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="Profile Name"
          name="profileName"
          rules={[{ required: true, message: "Please enter profile name" }]}
        >
          <Input placeholder="Enter profile name" />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Avatar URL" name="avatarUrl">
          <Input placeholder="Enter avatar URL" />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="Birth Date" name="birthDate">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select birth date"
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Gender" name="gender">
          <Select placeholder="Select gender">
            {genderOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="Role" name="role">
          <Select placeholder="Select user role">
            {roleOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
  </>
);
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const roleOptions = [
  { value: "guest", label: "Guest" },
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "coach", label: "Coach" },
];

const AccountStatusForm = ({ userData }) => (
  <>
    <Title level={5} className={styles.sectionTitle}>
      Account Status
    </Title>
    <div className={styles.statusSection}>
      <Form.Item
        name="hasActive"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <div className={styles.switchWrapper}>
          <div className={styles.switchInfo}>
            <Text strong>Pro Account</Text>
            <Text type="secondary">Enable Pro features for this user.</Text>
          </div>
          <Switch checked={userData?.hasActive} />
        </div>
      </Form.Item>
      <Form.Item
        name="isVerified"
        valuePropName="checked"
        className={styles.switchItem}
      >
        <div className={styles.switchWrapper}>
          <div className={styles.switchInfo}>
            <Text strong>Email Verified</Text>
            <Text type="secondary">
              Indicates if the user's email is verified.
            </Text>
          </div>
          <Switch checked={userData?.isVerified} />
        </div>
      </Form.Item>
    </div>
  </>
);

const SystemInfo = ({ userData }) => (
  <>
    <Title level={5} className={styles.sectionTitle}>
      System Information
    </Title>
    <Row gutter={16}>
      <Col span={8}>
        <div className={styles.infoItem}>
          <Text type="secondary">Created:</Text>
          <Text strong>
            {userData.createdAt
              ? dayjs(userData.createdAt).format("DD/MM/YYYY")
              : "N/A"}
          </Text>
        </div>
      </Col>
      <Col span={8}>
        <div className={styles.infoItem}>
          <Text type="secondary">Last Updated:</Text>
          <Text strong>
            {userData.updatedAt
              ? dayjs(userData.updatedAt).format("DD/MM/YYYY")
              : "N/A"}
          </Text>
        </div>
      </Col>
      <Col span={8}>
        <div className={styles.infoItem}>
          <Text type="secondary">Last Login:</Text>
          <Text strong>
            {userData.lastLogin
              ? dayjs(userData.lastLogin).format("DD/MM/YYYY")
              : "N/A"}
          </Text>
        </div>
      </Col>
    </Row>
  </>
);

const ModalFooter = ({ onCancel, submitting }) => (
  <div className={styles.footer}>
    <Button icon={<CloseOutlined />} onClick={onCancel} disabled={submitting}>
      Cancel
    </Button>
    <Button
      type="primary"
      htmlType="submit"
      loading={submitting}
      icon={<SaveOutlined />}
    >
      {submitting ? "Saving..." : "Save Changes"}
    </Button>
  </div>
);

// --- Main Component ---

const ModalForEditUser = ({ open, onClose, userId, onUserUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    if (submitting) return;
    form.resetFields();
    setUserData(null);
    onClose();
  }, [form, onClose, submitting]);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await userService.getUserById(userId);
      setUserData(data);
      // Debug logging
      console.log("User data fetched:", data);
      console.log(
        "hasActive value:",
        data.hasActive,
        "type:",
        typeof data.hasActive
      );
      console.log(
        "isVerified value:",
        data.isVerified,
        "type:",
        typeof data.isVerified
      );

      // Set form values with setTimeout to ensure proper timing
      setTimeout(() => {
        form.setFieldsValue({
          fullName: data.fullName || "",
          profileName: data.profileName || "",
          email: data.email || "",
          avatarUrl: data.avatarUrl || "",
          birthDate: data.birthDate ? dayjs(data.birthDate) : null,
          gender: data.gender || undefined,
          role: data.role || "guest",
          hasActive: data.hasActive === true,
          isVerified: data.isVerified === true,
        });

        console.log("Form values set:", {
          hasActive: data.hasActive === true,
          isVerified: data.isVerified === true,
        });

        // Force re-render to ensure switches update
        setUserData({ ...data });
      }, 100);
    } catch (error) {
      message.error(error.message || "Failed to load user data.");
      handleClose();
    } finally {
      setLoading(false);
    }
  }, [userId, form, handleClose]);

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open, fetchUserData]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const updateData = {
        email: values.email,
        profileName: values.profileName,
        fullName: values.fullName,
        avatarUrl: values.avatarUrl || null,
        birthDate: values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null,
        gender: values.gender || "male",
        role: values.role || "guest",
        hasActive: values.hasActive || false,
        isVerified: values.isVerified || false,
      };
      await userService.updateUser(userId, updateData);
      message.success("User updated successfully!");
      if (onUserUpdated) onUserUpdated();
      handleClose();
    } catch (error) {
      message.error(error.message || "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      className={styles.editModal}
    >
      {loading ? (
        <div className={styles.loadingWrapper}>
          <Spin size="large" />
        </div>
      ) : userData ? (
        <div className={styles.modalContent}>
          <Title level={3} className={styles.title}>
            Edit User Information
          </Title>
          <UserInfoHeader userData={userData} />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className={styles.editForm}
          >
            <BasicInfoForm />
            <Divider />
            <AccountStatusForm userData={userData} />
            <Divider />
            <SystemInfo userData={userData} />
            <ModalFooter onCancel={handleClose} submitting={submitting} />
          </Form>
        </div>
      ) : null}
    </Modal>
  );
};

export default ModalForEditUser;
