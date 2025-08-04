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
  Progress,
  Alert,
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
  const [addictionAssessment, setAddictionAssessment] = useState(null);
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

    const fetchSmokingEvents = async () => {
      try {
        const response = await api.get("/smoking-events/my");
        setSmokingEvents(response.data);
      } catch (error) {
        console.error("Error fetching smoking events:", error);
      }
    };

    const fetchAddictionAssessment = async () => {
      try {
        const response = await api.get(
          `/question-answer/scores/${user.userId}`
        );
        setAddictionAssessment(response.data);
      } catch (error) {
        console.error("Error fetching addiction assessment:", error);
      }
    };

    fetchUserProfile();
    fetchSavingData();
    fetchHealthMetrics();
    fetchUserReasons();
    fetchUserTriggers();
    fetchSmokingEvents();
    fetchAddictionAssessment();
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
      const deletePromises = [
        api.delete(`/user-smoking-profile/${userProfile.profileId}`),
        api.delete(`/reasons/delete/${user.userId}`),
        api.delete(`/user-triggers/delete/${user.userId}`),
        api.delete(`/question-answer/responses/all?userId=${user.userId}`),
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

  const getDependencyLevelInfo = (level) => {
    const levelInfo = {
      very_low: {
        text: "Very Low Dependency",
        color: "#52c41a",
        gradient: { from: "#52c41a", to: "#73d13d" },
        description:
          "Based on your responses, you show minimal signs of nicotine dependence.",
      },
      low: {
        text: "Low Dependency",
        color: "#73d13d",
        gradient: { from: "#73d13d", to: "#95de64" },
        description:
          "Your assessment indicates low nicotine dependence with good chances of successful quitting.",
      },
      medium: {
        text: "Medium Dependency",
        color: "#faad14",
        gradient: { from: "#fadb14", to: "#faad14" },
        description:
          "Your responses suggest moderate nicotine dependence. Planning and support will be helpful.",
      },
      high: {
        text: "High Dependency",
        color: "#ff7a45",
        gradient: { from: "#ff7a45", to: "#ff4d4f" },
        description:
          "Your assessment shows high nicotine dependence. Professional support is recommended.",
      },
      very_high: {
        text: "Very High Dependency",
        color: "#ff4d4f",
        gradient: { from: "#ff4d4f", to: "#cf1322" },
        description:
          "Your responses indicate very high nicotine dependence. Medical assistance may be beneficial.",
      },
    };
    return levelInfo[level] || levelInfo.medium;
  };

  const getRecommendation = (dependencyLevel) => {
    if (dependencyLevel === "very_low" || dependencyLevel === "low") {
      return {
        type: "success",
        title: "Excellent Assessment Result!",
        message:
          "Your assessment shows minimal nicotine dependence. This is a great foundation for quitting smoking successfully. Consider starting your quit journey soon!",
      };
    } else if (dependencyLevel === "medium") {
      return {
        type: "info",
        title: "Moderate Dependency Detected",
        message:
          "Your assessment indicates moderate nicotine dependence. With proper planning and support, you can successfully quit smoking. Consider preparing a comprehensive quit plan.",
      };
    } else {
      // high or very_high
      const baseMessage =
        "Your assessment shows significant nicotine dependence. ";
      if (!user.hasActive) {
        return {
          type: "warning",
          title: "Professional Support Highly Recommended",
          message:
            baseMessage +
            "Quitting may be challenging on your own. Consider upgrading to our Pro plan for personalized coaching and medical support to increase your success rate.",
          action: (
            <Button
              type="primary"
              onClick={() => navigate("/user-profile/membership")}
            >
              Upgrade to Pro
            </Button>
          ),
        };
      } else {
        return {
          type: "warning",
          title: "Additional Support May Be Needed",
          message:
            baseMessage +
            "Your current quit plan is good, but you may benefit from additional professional support, nicotine replacement therapy, or counseling sessions.",
          action: (
            <Button type="primary" onClick={() => navigate("/user-coach")}>
              Find a Coach
            </Button>
          ),
        };
      }
    }
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
                    {savingData?.perWeek
                      ? new Intl.NumberFormat("vi-VN").format(
                          savingData.perWeek
                        )
                      : "0"}{" "}
                    VND
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
                    {savingData?.perMonth
                      ? new Intl.NumberFormat("vi-VN").format(
                          savingData.perMonth
                        )
                      : "0"}{" "}
                    VND
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
                    {savingData?.perYear
                      ? new Intl.NumberFormat("vi-VN").format(
                          savingData.perYear
                        )
                      : "0"}{" "}
                    VND
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="wrapper__content-detail">
            <h2 className="wrapper__content-detail-title">
              Addiction Assessment
            </h2>
            <p className="wrapper__content-detail-des">
              Understanding your level of nicotine dependence helps tailor your
              quit plan and provides insights into the support you may need
              during your journey.
            </p>

            {addictionAssessment ? (
              <>
                <div className="wrapper__content-detail-assessment">
                  <div className="wrapper__content-detail-assessment-score">
                    <h3>Your Addiction Score</h3>
                    <div className="wrapper__content-detail-assessment-progress">
                      <Progress
                        percent={(addictionAssessment.totalScore / 10) * 100}
                        strokeColor={{
                          from: getDependencyLevelInfo(
                            addictionAssessment.dependencyLevel
                          ).gradient.from,
                          to: getDependencyLevelInfo(
                            addictionAssessment.dependencyLevel
                          ).gradient.to,
                        }}
                        trailColor="#f0f0f0"
                        strokeWidth={12}
                        format={() => `${addictionAssessment.totalScore}/10`}
                      />
                    </div>
                  </div>

                  <div className="wrapper__content-detail-assessment-level">
                    <div
                      className="wrapper__content-detail-assessment-badge"
                      style={{
                        backgroundColor: getDependencyLevelInfo(
                          addictionAssessment.dependencyLevel
                        ).color,
                      }}
                    >
                      {
                        getDependencyLevelInfo(
                          addictionAssessment.dependencyLevel
                        ).text
                      }
                    </div>
                    <p>
                      {
                        getDependencyLevelInfo(
                          addictionAssessment.dependencyLevel
                        ).description
                      }
                    </p>
                  </div>

                  <Alert
                    className="wrapper__content-detail-assessment-alert"
                    message={
                      getRecommendation(addictionAssessment.dependencyLevel)
                        .title
                    }
                    description={
                      getRecommendation(addictionAssessment.dependencyLevel)
                        .message
                    }
                    type={
                      getRecommendation(addictionAssessment.dependencyLevel)
                        .type
                    }
                    action={
                      getRecommendation(addictionAssessment.dependencyLevel)
                        .action
                    }
                    showIcon
                  />
                </div>
              </>
            ) : (
              <p>Loading addiction assessment...</p>
            )}
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
                      {savingData?.actualSaving
                        ? new Intl.NumberFormat("vi-VN").format(
                            savingData.actualSaving
                          )
                        : "0"}
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
