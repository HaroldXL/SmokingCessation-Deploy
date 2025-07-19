import "./planDetail.css";
import {
  Affix,
  Button,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  message,
  Modal,
  Slider,
  Card,
  Rate,
} from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
const { confirm } = Modal;
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";
import {
  CalendarTwoTone,
  DollarOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, Heart, Wind } from "lucide-react";
import TextArea from "antd/es/input/TextArea";

function PlanDetail() {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dateFormat = "DD/MM/YYYY";
  const [userProfile, setUserProfile] = useState(null);
  const [savingData, setSavingData] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [userReasons, setUserReasons] = useState([]);
  const [userTriggers, setUserTriggers] = useState([]);
  const [userStrategies, setUserStrategies] = useState([]);
  const [smokingEvents, setSmokingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSmokeModal, setShowSmokeModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/user-smoking-profile/my");
        if (response.data && response.data.length > 0) {
          setUserProfile(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
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

    const fetchUserReasons = async () => {
      try {
        const response = await api.get(`/reasons/user/${user.userId}`);
        setUserReasons(response.data);
      } catch (error) {
        console.error("Error fetching user reasons:", error);
      }
    };

    const fetchUserTriggers = async () => {
      try {
        const response = await api.get("/user-triggers/my");
        if (response.data && response.data.length > 0) {
          setUserTriggers(response.data[0].triggerCategories);
        }
      } catch (error) {
        console.error("Error fetching user triggers:", error);
      }
    };

    const fetchUserStrategies = async () => {
      try {
        const response = await api.get("/user-strategies/my");
        if (response.data && response.data.length > 0) {
          setUserStrategies(response.data[0].strategyCategories);
        }
      } catch (error) {
        console.error("Error fetching user strategies:", error);
      }
    };

    const fetchSmokingEvents = async () => {
      try {
        const response = await api.get("/smoking-events/my");
        setSmokingEvents(response.data);
      } catch (error) {
        console.error("Error fetching smoking events:", error);
      }
    };

    fetchUserProfile();
    fetchSavingData();
    fetchHealthMetrics();
    fetchUserReasons();
    fetchUserTriggers();
    fetchUserStrategies();
    fetchSmokingEvents();
  }, [user.userId]);

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

  const handleShowSmokeModal = () => {
    setShowSmokeModal(true);
  };

  const handleCloseSmokeModal = () => {
    setShowSmokeModal(false);
    form.resetFields();
  };

  const handleShowEventsModal = () => {
    setShowEventsModal(true);
  };

  const handleCloseEventsModal = () => {
    setShowEventsModal(false);
  };

  const showDeleteConfirm = () => {
    confirm({
      title: "Are you sure you want to Delete your quit plan?",
      icon: <ExclamationCircleFilled />,
      content: "Deleting your quit plan is permanent and cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeletePlan();
      },
      onCancel() {
        console.log("Delete cancelled");
      },
    });
  };

  const handleDeletePlan = async () => {
    try {
      // Delete all related data
      const deletePromises = [
        api.delete(`/user-smoking-profile/${userProfile.profileId}`),
        api.delete(`/reasons/delete/${user.userId}`),
        api.delete(`/user-triggers/delete/${user.userId}`),
        api.delete(`/user-strategies/delete/${user.userId}`),
      ];

      await Promise.all(deletePromises);

      message.success("Your quit plan has been deleted successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error deleting quit plan:", error);
      message.error("Failed to delete quit plan. Please try again.");
    }
  };

  const formatEventTime = (eventTime) => {
    const date = new Date(eventTime);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleFinishFailed = () => {
    setSubmitting(false);
  };

  const handleSubmitSmokeEvent = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        cigarettesSmoked: values.cigarettesSmoked,
        cravingLevel: values.cravingLevel,
        notes: values.notes || "",
      };

      await api.post("/smoking-events", payload);
      message.success("Smoking event recorded successfully!");
      handleCloseSmokeModal();
      await fetchSavingData();
      await fetchHealthMetrics();

      const response = await api.get("/smoking-events/my");
      setSmokingEvents(response.data);
    } catch (error) {
      console.error("Error recording smoking event:", error);
      message.error("Failed to record smoking event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title">
          <p>My Quit Plan</p>
        </div>
        <Divider className="divider" />
        <div className="wrapper__content">
          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">My Quit Day</h2>
            <p className="wrapper__content-detail-des">
              Use this time before your quit day to review your quit plan and
              take steps to get ready. Quitting can be easier when you are ready
              to face any challenges that come your way.
            </p>
            <DatePicker
              size="large"
              disabled
              variant="filled"
              className="wrapper__content-detail-date"
              format={dateFormat}
              value={userProfile?.quitDate ? dayjs(userProfile.quitDate) : null}
              loading={loading}
            />
          </div>

          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">My Saving</h2>
            <p className="wrapper__content-detail-des">
              We calculated what you'll save by quitting. Take a moment to think
              about the specific things you'll do with the extra money.
            </p>
            <div className="wrapper__content-detail-saving-container">
              <div className="wrapper__content-detail-saving-item">
                <p>
                  <CalendarTwoTone className="wrapper__content-detail-saving-title-icon" />
                  <span className="wrapper__content-detail-saving-period">
                    1 week smoke-free
                  </span>
                  <span className="wrapper__content-detail-saving-value">
                    ${savingData?.perWeek?.toFixed(2) || "0.00"}
                  </span>
                </p>
              </div>
              <div className="wrapper__content-detail-saving-item">
                <p>
                  <CalendarTwoTone className="wrapper__content-detail-saving-title-icon" />
                  <span className="wrapper__content-detail-saving-period">
                    1 month smoke-free
                  </span>
                  <span className="wrapper__content-detail-saving-value">
                    ${savingData?.perMonth?.toFixed(2) || "0.00"}
                  </span>
                </p>
              </div>
              <div className="wrapper__content-detail-saving-item">
                <p>
                  <CalendarTwoTone className="wrapper__content-detail-saving-title-icon" />
                  <span className="wrapper__content-detail-saving-period">
                    1 year smoke-free
                  </span>
                  <span className="wrapper__content-detail-saving-value">
                    ${savingData?.perYear?.toFixed(2) || "0.00"}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">Overall Progress</h2>
            <p className="wrapper__content-detail-des">
              This is a summary of your progress so far. It shows how far you've
              come and what you still need to do to stay on track.
            </p>
            <div className="wrapper__content-detail-progress">
              <div className="wrapper__content-detail-progress-container">
                <div className="wrapper__content-detail-progress-item">
                  <p>
                    <FireOutlined className="wrapper__content-detail-progress-item-fire" />
                    <span className="wrapper__content-detail-progress-item-number">
                      {savingData?.cigarettesAvoided || 0}
                    </span>
                    cigarettes avoided
                  </p>
                </div>
                <div className="wrapper__content-detail-progress-item">
                  <p>
                    <DollarOutlined className="wrapper__content-detail-progress-item-money" />
                    <span className="wrapper__content-detail-progress-item-number">
                      {savingData?.actualSaving || 0}
                    </span>
                    money saved
                  </p>
                </div>
              </div>
              <div className="wrapper__content-detail-progress-btn-container">
                {smokingEvents && smokingEvents.length > 0 && (
                  <Button
                    color="primary"
                    variant="filled"
                    className="wrapper__content-detail-progress-btn"
                    onClick={handleShowEventsModal}
                  >
                    View My Smoking Event
                  </Button>
                )}
                <Button
                  color="danger"
                  variant="filled"
                  className="wrapper__content-detail-progress-btn"
                  onClick={handleShowSmokeModal}
                >
                  I Have Smoked Today!
                </Button>
              </div>
            </div>
          </div>

          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">Health Metrics</h2>
            <p className="wrapper__content-detail-des">
              Your health is improving as you continue your smoke-free journey.
              These metrics show the positive impact on your body.
            </p>
            <div className="wrapper__content-detail-health">
              <div className="wrapper__content-detail-health-row">
                <div className="wrapper__content-detail-progress-item1">
                  <div className="wrapper__content-detail-progress-item1-title">
                    <Heart className="wrapper__content-detail-progress-item1-blood" />
                    Blood Pressure
                    <div className="wrapper__content-detail-progress-item1-number">
                      <h2>
                        {healthMetrics?.bpSystolic || 0}/
                        {healthMetrics?.bpDiastolic || 0}
                      </h2>
                      <h3>mmHg</h3>
                    </div>
                  </div>
                </div>
                <div className="wrapper__content-detail-progress-item1">
                  <div className="wrapper__content-detail-progress-item1-title">
                    <Activity className="wrapper__content-detail-progress-item1-heart" />
                    Heart Rate
                    <div className="wrapper__content-detail-progress-item1-number">
                      <h2>{healthMetrics?.heartRate || 0}</h2>
                      <h3>bpm</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="wrapper__content-detail-health-row">
                <div className="wrapper__content-detail-progress-item1">
                  <div className="wrapper__content-detail-progress-item1-title">
                    <Wind className="wrapper__content-detail-progress-item1-oxy" />
                    Oxygen Saturation
                    <div className="wrapper__content-detail-progress-item1-number">
                      <h2>{healthMetrics?.spo2 || 0}%</h2>
                      <h3>SpO2</h3>
                    </div>
                  </div>
                </div>
                <div className="wrapper__content-detail-progress-item1">
                  <div className="wrapper__content-detail-progress-item1-title">
                    <AlertTriangle className="wrapper__content-detail-progress-item1-co" />
                    CO Level
                    <div className="wrapper__content-detail-progress-item1-number">
                      <h2>{healthMetrics?.cohb || 0}%</h2>
                      <h3>COHb</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">
              Remind Yourself Why You Want To Quit
            </h2>
            <p className="wrapper__content-detail-des">
              When quitting feels tough, think back on these reasons why
              quitting smoking is important to you.
            </p>
            <h3>My reasons :</h3>
            <ul className="wrapper__content-detail-reasons">
              {userReasons.map((reason) => (
                <li key={reason.reasonId}>- {reason.reasonText}</li>
              ))}
            </ul>
          </div>

          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">
              Understand Your Triggers
            </h2>
            <p className="wrapper__content-detail-des">
              Over time, you've built up patterns and routines around smoking -
              especially if you smoke during many different activities or
              frequently throughout the day. Knowing your smoking behaviors -
              like when and where you typically smoke - may help you prepare for
              situations that make you want to smoke and avoid them.
            </p>
            <h3>My triggers :</h3>
            {userTriggers.map((category) => (
              <div
                key={category.categoryId}
                className="wrapper__content-detail-triggers"
              >
                <h3 className="wrapper__content-detail-triggers-title">
                  {category.name}
                </h3>
                <ul className="wrapper__content-detail-triggers-list">
                  {category.triggers.map((trigger) => (
                    <li key={trigger.triggerId}>- {trigger.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">
              Plan for Your Cravings
            </h2>
            <p className="wrapper__content-detail-des">
              Cravings are temporary and will fade over time the longer you stay
              quit. When a craving hits, find something else to do instead of
              smoking. It will pass. The important thing is to keep trying
              different things until you find what works for you
            </p>
            <h3>My craving strategies :</h3>
            {userStrategies.map((category) => (
              <div
                key={category.categoryId}
                className="wrapper__content-detail-triggers"
              >
                <h3 className="wrapper__content-detail-triggers-title">
                  {category.name}
                </h3>
                <ul className="wrapper__content-detail-triggers-list">
                  {category.strategies.map((strategy) => (
                    <li key={strategy.strategyId}>- {strategy.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="completed-wrapper">
          <Button
            className="completed-wrapper-btn"
            color="danger"
            variant="solid"
            onClick={showDeleteConfirm}
          >
            Delete My Quit Plan
          </Button>
        </div>
      </div>

      <Modal
        className="wrapper__content-smoke-modal"
        title="Record Smoking Event"
        open={showSmokeModal}
        onCancel={handleCloseSmokeModal}
        footer={[
          <Button key="cancel" onClick={handleCloseSmokeModal}>
            Cancel
          </Button>,
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            danger
            onClick={() => {
              setSubmitting(true);
              form.submit();
            }}
          >
            Record Event
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitSmokeEvent}
          onFinishFailed={handleFinishFailed}
        >
          <Form.Item
            label="Number of Cigarettes Smoked"
            name="cigarettesSmoked"
            rules={[
              {
                required: true,
                message: "Please enter the number of cigarettes",
              },
              {
                type: "number",
                min: 1,
                max: 100,
                message: "Please enter a valid number (1-100)",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={100}
              className="wrapper__content-smoke-modal-input"
              placeholder="Enter number of cigarettes"
            />
          </Form.Item>

          <Form.Item
            label="Craving Level (1-10)"
            name="cravingLevel"
            rules={[
              { required: true, message: "Please choose your craving level" },
            ]}
          >
            <Slider min={1} max={10} />
          </Form.Item>

          <Form.Item label="Notes (Optional)" name="notes">
            <TextArea
              rows={4}
              placeholder="Any additional notes about this smoking event..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="My Smoking Events"
        open={showEventsModal}
        onCancel={handleCloseEventsModal}
        footer={[
          <Button key="close" onClick={handleCloseEventsModal}>
            Close
          </Button>,
        ]}
        width={800}
        className="smoking-events-modal"
      >
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {smokingEvents
            .sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
            .map((event) => (
              <div key={event.eventId} className="smoking-event-card">
                <div className="smoking-event-time">
                  {formatEventTime(event.eventTime)}
                </div>
                <div className="smoking-event-detail">
                  <strong>Cigarettes Smoked:</strong> {event.cigarettesSmoked}
                </div>
                <div
                  className="smoking-event-detail"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <strong>Craving Level:</strong>
                  <Rate
                    disabled
                    value={event.cravingLevel}
                    count={10}
                    style={{ fontSize: "14px" }}
                  />
                  <span>({event.cravingLevel}/10)</span>
                </div>
                {event.notes && (
                  <div className="smoking-event-notes">
                    <strong>Notes:</strong> {event.notes}
                  </div>
                )}
              </div>
            ))}
        </div>
      </Modal>

      <Footer />
    </>
  );
}

export default PlanDetail;
