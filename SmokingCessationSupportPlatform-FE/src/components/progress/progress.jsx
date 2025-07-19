import "./progress.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../config/axios";
import { FireOutlined, DollarOutlined, RightOutlined } from "@ant-design/icons";
import { Activity, AlertTriangle, Heart, Wind } from "lucide-react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function UserProgress() {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const [quitDay, setQuitDay] = useState(null);
  const [savingData, setSavingData] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);

  useEffect(() => {
    const fetchQuitDay = async () => {
      try {
        const response = await api.get("/user-smoking-profile/day");
        setQuitDay(response.data);
      } catch (error) {
        console.error("Error fetching quit day:", error);
      }
    };

    const fetchSavingData = async () => {
      try {
        const response = await api.get("/user-smoking-profile/calculate");
        setSavingData(response.data);
      } catch (error) {
        console.error("Error fetching saving data:", error);
      }
    };

    const fetchHealthMetrics = async () => {
      try {
        const response = await api.get(`/health/metrics/${user.userId}`);
        setHealthMetrics(response.data);
      } catch (error) {
        console.error("Error fetching health metrics:", error);
      }
    };

    fetchQuitDay();
    fetchSavingData();
    fetchHealthMetrics();
  }, [user.userId]);

  return (
    <>
      <div className="progress">
        <div className="progress__content">
          <div className="progress__content-inner">
            <p className="progress__content-inner-title">
              You have Quit Smoking for
            </p>
            <div className="progress__content-inner-circle">
              <p className="progress__content-inner-circle-day-num">
                {quitDay}
              </p>
              <p className="progress__content-inner-circle-day-text">DAY(S)</p>
            </div>
          </div>

          <div className="progress__content-cards">
            <div className="progress__content-card">
              <h2 className="progress__content-card-title">Overall Progress</h2>
              <div className="progress__content-card-items">
                <div className="progress__content-card-item">
                  <FireOutlined className="progress__content-card-item-fire" />
                  <span className="progress__content-card-item-number">
                    {savingData?.cigarettesAvoided || 0}
                  </span>
                  <span className="progress__content-card-item-text">
                    cigarettes avoided
                  </span>
                </div>
                <div className="progress__content-card-item">
                  <DollarOutlined className="progress__content-card-item-money" />
                  <span className="progress__content-card-item-number">
                    {savingData?.actualSaving || 0}
                  </span>
                  <span className="progress__content-card-item-text">
                    money saved
                  </span>
                </div>
              </div>
            </div>

            <div className="progress__content-card">
              <h2 className="progress__content-card-title">
                Health Improvement
              </h2>
              <div className="progress__content-health-items">
                <div className="progress__content-health-row">
                  <div className="progress__content-health-item">
                    <div className="progress__content-health-item-content">
                      <div className="progress__content-health-header">
                        <Heart className="progress__content-health-icon-blood" />
                        <span className="progress__content-health-title">
                          Blood Pressure
                        </span>
                      </div>
                      <div className="progress__content-health-value">
                        <h2>
                          {healthMetrics?.bpSystolic || 0}/
                          {healthMetrics?.bpDiastolic || 0}
                        </h2>
                        <h3>mmHg</h3>
                      </div>
                    </div>
                  </div>
                  <div className="progress__content-health-item">
                    <div className="progress__content-health-item-content">
                      <div className="progress__content-health-header">
                        <Activity className="progress__content-health-icon-heart" />
                        <span className="progress__content-health-title">
                          Heart Rate
                        </span>
                      </div>
                      <div className="progress__content-health-value">
                        <h2>{healthMetrics?.heartRate || 0}</h2>
                        <h3>bpm</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="progress__content-health-row">
                  <div className="progress__content-health-item">
                    <div className="progress__content-health-item-content">
                      <div className="progress__content-health-header">
                        <Wind className="progress__content-health-icon-oxy" />
                        <span className="progress__content-health-title">
                          Oxygen Saturation
                        </span>
                      </div>
                      <div className="progress__content-health-value">
                        <h2>{healthMetrics?.spo2 || 0}%</h2>
                        <h3>SpO2</h3>
                      </div>
                    </div>
                  </div>
                  <div className="progress__content-health-item">
                    <div className="progress__content-health-item-content">
                      <div className="progress__content-health-header">
                        <AlertTriangle className="progress__content-health-icon-co" />
                        <span className="progress__content-health-title">
                          CO Level
                        </span>
                      </div>
                      <div className="progress__content-health-value">
                        <h2>{healthMetrics?.cohb || 0}%</h2>
                        <h3>COHb</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="progress__content-button">
            <Button
              type="primary"
              className="progress__content-button-view"
              onClick={() => navigate("/plan-detail")}
            >
              View My Quit Plan <RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProgress;
