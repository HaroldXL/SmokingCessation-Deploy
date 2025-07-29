import { useState, useEffect, useCallback, useRef } from "react";
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
  CameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { userService } from "../../../services/userService.js";
import uploadFile from "../../../store/utils/file";
import styles from "./ModalForEditUser.module.css";

const { Title, Text } = Typography;

const BasicInfoForm = ({
  userAvatar,
  handleChangeAvatar,
  avatarLoading,
  fileInputRef,
  handleAvatarChange,
}) => (
  <>
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {userAvatar ? (
              <Avatar size={64} src={userAvatar} alt="User Avatar" />
            ) : (
              <Avatar size={64} icon={<UserOutlined />} />
            )}
            <Button
              icon={<CameraOutlined />}
              onClick={handleChangeAvatar}
              loading={avatarLoading}
            >
              {avatarLoading ? "Uploading..." : "Upload Avatar"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/jpg,image/png,image/gif"
              style={{ display: "none" }}
            />
          </div>
        </Form.Item>
      </Col>
    </Row>
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
        <Form.Item label="Birth Date" name="birthDate">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select birth date"
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Note" name="note">
          <Input.TextArea rows={3} placeholder="Enter note (optional)" />
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
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "mentor", label: "Mentor" },
];

const AccountStatusForm = () => (
  <>
    <Title level={5} className={styles.sectionTitle}>
      Account Status
    </Title>
    <div className={styles.statusSection}>
      <div className={styles.switchItem}>
        <div className={styles.switchWrapper}>
          <div className={styles.switchInfo}>
            <Text strong>Pro Account</Text>
            <Text type="secondary">Enable Pro features for this user.</Text>
          </div>
          <Form.Item
            name="hasActive"
            valuePropName="checked"
            style={{ margin: 0 }}
          >
            <Switch />
          </Form.Item>
        </div>
      </div>
      <div className={styles.switchItem}>
        <div className={styles.switchWrapper}>
          <div className={styles.switchInfo}>
            <Text strong>Email Verified</Text>
            <Text type="secondary">
              Indicates if the user's email is verified.
            </Text>
          </div>
          <Form.Item
            name="isVerified"
            valuePropName="checked"
            style={{ margin: 0 }}
          >
            <Switch />
          </Form.Item>
        </div>
      </div>
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
  const [formKey, setFormKey] = useState(0);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const handleClose = useCallback(() => {
    if (submitting) return;
    form.resetFields();
    setUserData(null);
    setUserAvatar(null);
    setFormKey(0);
    onClose();
  }, [form, onClose, submitting]);

  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      message.error("Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error("File size must be less than 5MB");
      return;
    }

    try {
      setAvatarLoading(true);
      const avatarUrl = await uploadFile(file);
      setUserAvatar(avatarUrl);
      message.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Failed to upload avatar");
    } finally {
      setAvatarLoading(false);
      event.target.value = "";
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await userService.getUserById(userId);
      setUserData(data);
      setUserAvatar(data.avatarUrl || null);

      form.setFieldsValue({
        fullName: data.fullName || "",
        profileName: data.profileName || "",
        email: data.email || "",
        note: data.note || "",
        avatarUrl: data.avatarUrl || "",
        birthDate: data.birthDate ? dayjs(data.birthDate) : null,
        gender: data.gender || undefined,
        role: data.role || "user",
        hasActive: Boolean(data.hasActive),
        isVerified: Boolean(data.isVerified),
      });

      setFormKey((prev) => prev + 1);
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
        note: values.note || "",
        avatarUrl: userAvatar || null,
        birthDate: values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null,
        gender: values.gender || "male",
        role: values.role || "user",
        hasActive: Boolean(values.hasActive),
        isVerified: Boolean(values.isVerified),
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

          <Form
            key={formKey}
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className={styles.editForm}
            initialValues={{
              fullName: userData?.fullName || "",
              profileName: userData?.profileName || "",
              email: userData?.email || "",
              note: userData?.note || "",
              avatarUrl: userData?.avatarUrl || "",
              birthDate: userData?.birthDate ? dayjs(userData.birthDate) : null,
              gender: userData?.gender || undefined,
              role: userData?.role || "user",
              hasActive: Boolean(userData?.hasActive),
              isVerified: Boolean(userData?.isVerified),
            }}
          >
            <BasicInfoForm
              userAvatar={userAvatar}
              handleChangeAvatar={handleChangeAvatar}
              avatarLoading={avatarLoading}
              fileInputRef={fileInputRef}
              handleAvatarChange={handleAvatarChange}
            />
            <Divider />
            <AccountStatusForm />
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
