import { Form, Input, Button, message, notification } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import FormItem from "antd/es/form/FormItem";
import AuthenTemplate from "../../../components/authen-template/authen-template";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../config/axios";

function ForgotPassCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const handleVerifyCode = async (values) => {
    try {
      const response = await api.post(
        `auth/verify-otp?otpCode=${values.otpCode}&purpose=reset_password`
      );
      console.log(response.data);
      message.success("Verify code successfully!");
      navigate(`/new-pass?token=${encodeURIComponent(response.data)}`);
    } catch (err) {
      console.log(err.response?.data);
      message.error("The verify code is incorrect or has expired!");
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await api.post(
        `auth/resend-otp?email=${email}&purpose=reset_password`
      );
      console.log(response.data);
      message.success("OTP code resent successfully!");
    } catch (err) {
      console.log(err.response?.data);
      notification.error({
        message: "OTP code resend failed!",
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
          onFinish={handleVerifyCode}
        >
          <h1>Enter Your Code</h1>
          <p className="description">
            Enter your code we sent to your email {email}
          </p>
          <FormItem
            className="input-box-otp"
            name="otpCode"
            rules={[{ required: true, message: "Please enter your OTP code." }]}
          >
            <Input.OTP variant="filled" />
          </FormItem>

          <Button
            type="primary"
            htmlType="submit"
            className="register-login__btn reset"
          >
            Submit
          </Button>
          <div className="resend-otp">
            <p className="resend-otp-des">Haven't received your code?</p>
            <a className="resend-otp-link" onClick={handleResendOTP}>
              Resend OTP
            </a>
          </div>
          <div className="register-login__link">
            <ArrowLeftOutlined />
            <Link to="/login"> Back to Login</Link>
          </div>
        </Form>
      </AuthenTemplate>
    </>
  );
}

export default ForgotPassCode;
