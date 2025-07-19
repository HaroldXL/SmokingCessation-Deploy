import React from "react";
import AuthenTemplate from "../../../components/authen-template/authen-template";
import { Form, Input, Button, message, notification } from "antd";
import FormItem from "antd/es/form/FormItem";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../config/axios";

function NewPass() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleChangePass = async (values) => {
    try {
      const response = await api.post(
        `auth/change-password?token=${token}&newPassword=${values.newPassword}`
      );
      console.log(response.data);
      message.success("Change password successfully!");
      navigate(`/login`);
    } catch (err) {
      console.log(err.response?.data);
      notification.error({
        message: "Error changing password!",
        description: "Please try again later.",
        duration: 2,
      });
    }
  };
  return (
    <>
      <AuthenTemplate>
        <Form
          labelCol={{
            span: 24,
          }}
          onFinish={handleChangePass}
        >
          <h1>Enter Your New Password</h1>

          <FormItem
            label="New Password"
            className="input-box custom-label"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Please enter your password.",
              },
            ]}
          >
            <Input.Password
              variant="filled"
              type="password"
              placeholder="Enter your password"
            />
          </FormItem>

          <FormItem
            label="Confirm Password"
            className="input-box custom-label"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password.",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              variant="filled"
              type="password"
              placeholder="Enter your password"
            />
          </FormItem>

          <Button
            type="primary"
            htmlType="submit"
            className="register-login__btn"
          >
            Confirm
          </Button>
        </Form>
      </AuthenTemplate>
    </>
  );
}

export default NewPass;
