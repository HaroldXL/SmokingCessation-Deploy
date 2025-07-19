import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../store/redux/features/userSlice";
import { FaCheckCircle, FaTimesCircle, FaHome } from "react-icons/fa";
import "./paymentResult.css";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transactionId = params.get("transaction_id");
    const responseCode = params.get("vnp_ResponseCode");

    if (!transactionId || !responseCode) {
      setResult("fail");
      setLoading(false);
      return;
    }

    api
      .get("/subscription/payment/return", {
        params: {
          transaction_id: transactionId,
          vnp_ResponseCode: responseCode,
        },
      })
      .then(async (res) => {
        if (responseCode === "00") {
          setResult("success");

          try {
            const userRes = await api.get("/profile/my");
            dispatch(login(userRes.data));
            localStorage.setItem("user", JSON.stringify(userRes.data));
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            if (res.data) {
              dispatch(login(res.data));
              localStorage.setItem("user", JSON.stringify(res.data));
            }
          }
        } else {
          setResult("fail");
        }
      })
      .catch(() => {
        setResult("fail");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location, dispatch]);

  const handleGoHome = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        dispatch(login(user));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    navigate("/");
  };

  if (loading) {
    return (
      <div className="payment-result-background">
        <div className="payment-result-card">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Processing Payment</h2>
          <p className="loading-message">
            Please wait while we verify your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-background">
      <div className="payment-result-card">
        {result === "success" ? (
          <>
            <div className="icon-success">
              <FaCheckCircle size={64} />
            </div>
            <h1 className="result-title success">Payment Successful!</h1>
            <p className="result-message">
              Thank you for your payment. Your Premium membership has been
              activated successfully. You can now enjoy all premium features.
            </p>
            <div className="success-details">
              <div className="benefit-item">
                <FaCheckCircle className="benefit-icon" />
                <span>1-on-1 Coach Consultation</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle className="benefit-icon" />
                <span>Unlimited Community Posts</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle className="benefit-icon" />
                <span>Priority Support</span>
              </div>
            </div>
            <button className="btn-home" onClick={handleGoHome}>
              <FaHome className="home-icon" />
              Back to Home
            </button>
          </>
        ) : (
          <>
            <div className="icon-fail">
              <FaTimesCircle size={64} />
            </div>
            <h1 className="result-title fail">Payment Failed</h1>
            <p className="result-message">
              We couldn't process your payment. Please try again or contact our
              support team for assistance.
            </p>
            <div className="action-buttons">
              <button
                className="btn-retry"
                onClick={() => window.history.back()}
              >
                Try Again
              </button>
              <button className="btn-home" onClick={handleGoHome}>
                <FaHome className="home-icon" />
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
