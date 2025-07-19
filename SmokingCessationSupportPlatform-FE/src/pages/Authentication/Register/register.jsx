import AuthenTemplate from "../../../components/authen-template/authen-template";
import { Button, Divider, Form, Input, message, notification } from "antd";
import FormItem from "antd/es/form/FormItem";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    try {
      const response = await api.post("auth/register", values);
      console.log(response.data);
      message.success("Create account successfully!");
      navigate(`/verify-code?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      console.log(err.response.data);
      if (err.response.data.message === "Email already exists") {
        notification.error({
          message: "Create account failed!",
          description: "Email already exists! Please use a different email.",
          duration: 2,
        });
      } else
        notification.error({
          message: "Create account failed!",
          description: "Please try again later.",
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
          onFinish={handleRegister}
          onFinishFailed={handleFinishFailed}
        >
          <h1>Create Account</h1>
          <FormItem
            label="Full Name"
            className="input-box custom-label"
            name="fullName"
            rules={[
              {
                required: true,
                message: "Please enter your full name.",
              },
            ]}
          >
            <Input
              variant="filled"
              className="input"
              type="text"
              placeholder="Enter your full name"
            />
          </FormItem>

          <FormItem
            label="Username"
            className="input-box custom-label"
            name="profileName"
            rules={[
              {
                required: true,
                message: "Please enter your username.",
              },
            ]}
          >
            <Input
              variant="filled"
              className="input"
              type="text"
              placeholder="Enter your username"
            />
          </FormItem>

          <FormItem
            label="Email Address"
            className="input-box custom-label"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email address.",
              },
            ]}
          >
            <Input
              variant="filled"
              className="input"
              type="text"
              placeholder="Enter your email address"
            />
          </FormItem>

          <FormItem
            label="Password"
            className="input-box custom-label"
            name="password"
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
                  if (!value || getFieldValue("password") === value) {
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
            loading={loading}
            onClick={() => setLoading(true)}
          >
            Sign Up
          </Button>

          {/* <Divider plain style={{ borderColor: "#ccc" }} className="divider">
            or
          </Divider> */}

          {/* <Button className="google-login_btn" color="default" variant="filled">
            <img
              className="google-logo"
              src="/images/google-logo.png"
              alt="google-logo"
            />
            <p>
              Continue with <span className="gg">Google</span>
            </p>
          </Button> */}

          <div className="register-login__link">
            <p>
              Already have an account?
              <Link to="/login" className="link">
                Sign In
              </Link>
            </p>
          </div>
        </Form>
      </AuthenTemplate>
    </>
  );
}

export default Register;
