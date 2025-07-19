import "./ChangePass.css";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import { Affix, Button, Input, message, notification } from "antd";
import Header from "../../../../components/header/header";
import Footer from "../../../../components/footer/footer";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../../config/axios";
import { useState } from "react";

function ChangePass() {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const [loading, setLoading] = useState(false);

  const handleChangePass = async () => {
    try {
      const response = await api.post(
        `auth/reset-password?email=${encodeURIComponent(user.email)}`
      );
      console.log(response.data);
      message.success("Reset code sent to your email!");
      navigate(`/change-password-code?email=${encodeURIComponent(user.email)}`);
    } catch (err) {
      console.log(err.response?.data);
      notification.error({
        message: "Failed to send reset code!",
        description: "Please check your email address..",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title1">
          <p>My Account</p>
        </div>
        <div className="wrapper__profile">
          <MyAccountNav />
          <div className="wrapper__profile-details">
            <h1 className="wrapper__profile-details-title">
              Change Your Password
            </h1>
            <h3>
              Confirm your email address and we'll send you instructions to
              reset your password.
            </h3>
            <div className="wrapper__profile-detail-info-label">
              Email Address
            </div>
            <Input
              disabled
              variant="filled"
              className="wrapper__profile-detail-info-form-input"
              defaultValue={user.email}
            />
            <Button
              className="send-reset-code"
              type="primary"
              loading={loading}
              onClick={() => {
                setLoading(true);
                handleChangePass();
              }}
            >
              Send Reset Code
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ChangePass;
