import { Form, Input, Button, message, notification } from "antd";
import FormItem from "antd/es/form/FormItem";
import AuthenTemplate from "../../../components/authen-template/authen-template";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { useState } from "react";

function ForgotPass() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleForgotPass = async (values) => {
    try {
      const response = await api.post(
        `auth/forgot-password?email=${encodeURIComponent(values.email)}`
      );
      console.log(response.data);
      message.success("Reset code sent to your email!");
      navigate(
        `/forgot-password-code?email=${encodeURIComponent(values.email)}`
      );
    } catch (err) {
      console.log(err.response?.data);
      notification.error({
        message: "Failed to send reset code",
        description: "Please check your email address.",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishFailed = () => {
    setLoading(false);
  };

  return (
    <>
      <AuthenTemplate>
        <Form
          labelCol={{
            span: 24,
          }}
          onFinish={handleForgotPass}
          onFinishFailed={handleFinishFailed}
        >
          <h1>Reset Password</h1>
          <p className="description">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
          <FormItem
            label="Email Address"
            className="input-box custom-label"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address." },
            ]}
          >
            <Input
              variant="filled"
              className="input"
              type="text"
              placeholder="Enter your email address"
            />
          </FormItem>

          <Button
            type="primary"
            htmlType="submit"
            className="register-login__btn reset"
            loading={loading}
            onClick={() => setLoading(true)}
          >
            Send Reset Code
          </Button>

          <div className="register-login__link">
            <Link to="/login">
              <ArrowLeftOutlined /> Back to login
            </Link>
          </div>
        </Form>
      </AuthenTemplate>
    </>
  );
}

export default ForgotPass;
