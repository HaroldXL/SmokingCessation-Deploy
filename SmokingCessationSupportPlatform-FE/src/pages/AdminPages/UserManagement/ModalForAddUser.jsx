import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, Button, message, Row, Col } from 'antd';
import { userService } from '../../../services/userService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ModalForAddUser = ({ open, onClose, onUserAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('Form values received:', values); // Debug log
      
      // Đơn giản hóa data - chỉ gửi các field cần thiết
      const userData = {
        email: values.email,
        phone: values.phone || "",
        profileName: values.profileName,
        passwordHash: values.password, // Server sẽ hash
        fullName: values.fullName,
        avatarUrl: values.avatarUrl || "",
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        gender: values.gender,
        role: values.role,
        note: values.note || "",
        hasActive: values.hasActive || false,
        typeLogin: values.typeLogin || "LOCAL",
        isVerified: values.isVerified || false,
        isBlock: values.isBlock || false
        // Bỏ các field auto-generated: userId, isDelete, createdAt, updatedAt, lastLogin
      };

      console.log('Sending data to API:', userData); // Debug log

      await userService.createUserByAdmin(userData);
      message.success('User created successfully!');
      form.resetFields();
      onUserAdded();
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error details:', error.response?.data); // Chi tiết lỗi
      
      // Hiển thị lỗi chi tiết hơn
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create user. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
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
          gender: 'male',
          role: 'guest',
          typeLogin: 'LOCAL',
          hasActive: false,
          isVerified: false,
          isBlock: false
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please enter a valid email!' }
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
                { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number!' }
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
              rules={[{ required: true, message: 'Please input full name!' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="profileName"
              label="Profile Name"
              rules={[{ required: true, message: 'Please input profile name!' }]}
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
                { required: true, message: 'Please input password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="birthDate"
              label="Birth Date"
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Select birth date"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender!' }]}
            >
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select role!' }]}
            >
              <Select placeholder="Select role">
                <Option value="guest">Guest</Option>
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
                <Option value="mentor">Mentor</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="typeLogin"
              label="Login Type"
            >
              <Select placeholder="Select login type">
                <Option value="LOCAL">Local</Option>
                <Option value="GOOGLE">Google</Option>
                <Option value="FACEBOOK">Facebook</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="avatarUrl"
          label="Avatar URL"
        >
          <Input placeholder="Enter avatar URL (optional)" />
        </Form.Item>

        <Form.Item
          name="note"
          label="Note"
        >
          <TextArea 
            rows={3} 
            placeholder="Enter additional notes (optional)"
            maxLength={500}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="hasActive"
              label="Premium Membership"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Premium" 
                unCheckedChildren="Free"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item
              name="isBlock"
              label="Account Status"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Blocked" 
                unCheckedChildren="Active"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
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