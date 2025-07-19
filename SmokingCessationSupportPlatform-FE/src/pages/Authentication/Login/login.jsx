import {
  Form,
  Input,
  Button,
  Checkbox,
  Divider,
  notification,
  message,
} from "antd";
import FormItem from "antd/es/form/FormItem";
import AuthenTemplate from "../../../components/authen-template/authen-template";
import api from "../../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/redux/features/userSlice";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      const response = await api.post("auth/login", values);
      message.success("Login successfully!");
      console.log(response.data);
      dispatch(login(response.data));
      const { role, token } = response.data;
      localStorage.setItem("token", token);
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "mentor") {
        navigate("/mentor");
      } else {
        navigate("/");
      }
    } catch (err) {
      notification.error({
        message: "Login failed!",
        description: "Email or password is incorrect. Please try again.",
        placement: "topRight",
        duration: 2,
      });
      console.log(err);
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
          form={form}
          labelCol={{
            span: 24,
          }}
          onFinish={handleLogin}
          onFinishFailed={handleFinishFailed}
        >
          <h1>Sign In</h1>
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
          <FormItem
            label="Password"
            className="input-box custom-label"
            name="password"
            rules={[{ required: true, message: "Please enter your password." }]}
          >
            <Input.Password
              className="input"
              variant="filled"
              type="password"
              placeholder="Enter your password"
            />
          </FormItem>

          <div className="remember-forgot">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            className="register-login__btn"
            loading={loading}
            onClick={() => setLoading(true)}
          >
            Sign in
          </Button>

          {/* <Divider plain style={{ borderColor: "#ccc" }} className="divider">
            or
          </Divider> */}

          {/* <Button
            htmlType="submit"
            className="google-login_btn"
            color="default"
            variant="filled"
          >
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
              Don't have an account?
              <Link to="/register" className="link">
                Sign Up
              </Link>
            </p>
          </div>
        </Form>
      </AuthenTemplate>
    </>
  );
}

export default Login;
