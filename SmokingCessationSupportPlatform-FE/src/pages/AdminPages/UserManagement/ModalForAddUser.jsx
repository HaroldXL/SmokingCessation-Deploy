import React, { useState, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  message,
  Row,
  Col,
  Upload,
  Avatar,
} from "antd";
import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import { userService } from "../../../services/userService";
import uploadFile from "../../../store/utils/file";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const ModalForAddUser = ({ open, onClose, onUserAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("Form values received:", values);

      const userData = {
        email: values.email,
        phone: values.phone || "",
        profileName: values.profileName,
        passwordHash: values.password,
        fullName: values.fullName,
        avatarUrl: userAvatar || "",
        birthDate: values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null,
        gender: values.gender,
        role: values.role,
        note: values.note || "",
        hasActive: values.hasActive || false,
        isVerified: values.isVerified || false,
      };

      console.log("Sending data to API:", userData);

      await userService.createUserByAdmin(userData);
      message.success("User created successfully!");
      form.resetFields();
      onUserAdded();
    } catch (error) {
      console.error("Error creating user:", error);
      console.error("Error details:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create user. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUserAvatar(null);
    onClose();
  };

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

  return (
    <Modal
      title="Add New User"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gender: "male",
          role: "user",
          hasActive: false,
          isVerified: false,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
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
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                {
                  pattern: /^[0-9+\-\s()]*$/,
                  message: "Please enter a valid phone number!",
                },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Please input full name!" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="profileName"
              label="Profile Name"
              rules={[
                { required: true, message: "Please input profile name!" },
              ]}
            >
              <Input placeholder="Enter profile name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="birthDate" label="Birth Date">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select birth date"
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Please select gender!" }]}
            >
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select role!" }]}
            >
              <Select placeholder="Select role">
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
                <Option value="mentor">Mentor</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note" label="Note">
          <TextArea
            rows={3}
            placeholder="Enter additional notes (optional)"
            maxLength={500}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hasActive"
              label="Premium Membership"
              valuePropName="checked"
            >
              <Switch checkedChildren="Premium" unCheckedChildren="Free" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isVerified"
              label="Email Verified"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Verified"
                unCheckedChildren="Unverified"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create User
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalForAddUser;
