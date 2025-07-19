import {
  Affix,
  Avatar,
  Button,
  Card,
  message,
  Rate,
  Spin,
  Empty,
  Divider,
  Space,
  Modal,
  Result,
  Input,
  Form,
} from "antd";
import "./bookings.css";
import Header from "../../../../components/header/header";
import Footer from "../../../../components/footer/footer";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import {
  CalendarTwoTone,
  ClockCircleTwoTone,
  ExclamationCircleFilled,
  MailTwoTone,
  LinkOutlined,
} from "@ant-design/icons";
import api from "../../../../config/axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function UserBookings() {
  const user = useSelector((store) => store.user);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("scheduled");
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [viewFeedbackModal, setViewFeedbackModal] = useState(false);
  const [editFeedbackModal, setEditFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedbackForm] = Form.useForm();
  const [editFeedbackForm] = Form.useForm();
  const [bookingFeedbackStatus, setBookingFeedbackStatus] = useState({});
  const navigate = useNavigate();
  const { confirm } = Modal;

  const getSlotTimeRange = (slotNumber) => {
    const timeRanges = {
      1: "7:00 AM - 9:30 AM",
      2: "9:30 AM - 12:00 PM",
      3: "13:00 PM - 15:30 PM",
      4: "15:30 PM - 18:00 PM",
    };
    return timeRanges[slotNumber] || "";
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Function to filter bookings by status
  const filterBookings = (status) => {
    setActiveFilter(status);
    const filtered = bookings.filter((booking) => booking.status === status);
    setFilteredBookings(filtered);
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/consultations/user");

      // Fetch detailed consultation info for all bookings to get meeting links
      const bookingsWithDetails = [];
      for (const booking of response.data) {
        const consultationDetails = await checkConsultationDetails(
          booking.consultationId
        );
        bookingsWithDetails.push({
          ...booking,
          meetingLink: consultationDetails?.meetingLink || null,
        });
      }

      setBookings(bookingsWithDetails);

      // Check feedback status for completed bookings
      const feedbackStatus = {};
      for (const booking of bookingsWithDetails) {
        if (booking.status === "completed") {
          const consultationDetails = await checkConsultationDetails(
            booking.consultationId
          );
          const hasFeedback =
            consultationDetails &&
            consultationDetails.feedback &&
            consultationDetails.rating;
          feedbackStatus[booking.consultationId] = hasFeedback;
        }
      }
      setBookingFeedbackStatus(feedbackStatus);

      // Default filter to scheduled
      const scheduledBookings = bookingsWithDetails.filter(
        (booking) => booking.status === "scheduled"
      );
      setFilteredBookings(scheduledBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancelAppointment = async (consultationId) => {
    try {
      await api.post(`/consultations/${consultationId}/cancel`);
      message.success("Appointment cancelled successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      message.error("Failed to cancel appointment. Please try again.");
    }
  };

  const showCancelConfirm = (consultationId) => {
    confirm({
      title: "Cancel this Appointment?",
      icon: <ExclamationCircleFilled />,
      content:
        "Are you sure you want to cancel this appointment? This action cannot be undone.",
      onOk() {
        handleCancelAppointment(consultationId);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleViewCoach = (profileName) => {
    navigate(`/user-coach/${profileName}`);
  };

  const checkConsultationDetails = async (consultationId) => {
    try {
      const response = await api.get(`/consultations/user/${consultationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching consultation details:", error);
      return null;
    }
  };

  const handleAddFeedback = (booking) => {
    setSelectedBooking(booking);
    setFeedbackModal(true);
    feedbackForm.resetFields();
  };

  const handleViewFeedback = async (booking) => {
    const consultationDetails = await checkConsultationDetails(
      booking.consultationId
    );
    if (consultationDetails) {
      setSelectedBooking({
        ...booking,
        feedback: consultationDetails.feedback,
        rating: consultationDetails.rating,
      });
      setViewFeedbackModal(true);
    }
  };

  const handleEditFeedback = async (booking) => {
    const consultationDetails = await checkConsultationDetails(
      booking.consultationId
    );
    if (consultationDetails) {
      setSelectedBooking({
        ...booking,
        feedback: consultationDetails.feedback,
        rating: consultationDetails.rating,
      });

      // Pre-fill the edit form with existing feedback
      editFeedbackForm.setFieldsValue({
        rating: consultationDetails.rating,
        feedback: consultationDetails.feedback,
      });

      setEditFeedbackModal(true);
    }
  };

  const handleSubmitFeedback = async (values) => {
    try {
      const rating = Math.round(values.rating);

      if (!rating || rating < 1 || rating > 5) {
        message.error("Please provide a valid rating between 1 and 5");
        return;
      }

      if (!values.feedback || values.feedback.trim() === "") {
        message.error("Please provide feedback text");
        return;
      }

      const params = new URLSearchParams();
      params.append("rating", rating.toString());
      params.append("feedback", values.feedback.trim());

      await api.post(
        `/consultations/${
          selectedBooking.consultationId
        }/feedback?${params.toString()}`
      );
      message.success("Feedback submitted successfully!");
      setFeedbackModal(false);
      feedbackForm.resetFields();
      fetchBookings();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error("Failed to submit feedback. Please try again.");
    }
  };

  const handleUpdateFeedback = async (values) => {
    try {
      const rating = Math.round(values.rating);

      if (!rating || rating < 1 || rating > 5) {
        message.error("Please provide a valid rating between 1 and 5");
        return;
      }

      if (!values.feedback || values.feedback.trim() === "") {
        message.error("Please provide feedback text");
        return;
      }

      const params = new URLSearchParams();
      params.append("rating", rating.toString());
      params.append("feedback", values.feedback.trim());

      await api.put(
        `/consultations/${
          selectedBooking.consultationId
        }/feedback?${params.toString()}`
      );
      message.success("Feedback updated successfully!");
      setEditFeedbackModal(false);
      editFeedbackForm.resetFields();
      fetchBookings();
    } catch (error) {
      console.error("Error updating feedback:", error);
      message.error("Failed to update feedback. Please try again.");
    }
  };

  useEffect(() => {
    if (user.hasActive) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user.hasActive, fetchBookings]);

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
          <div className="wrapper__profile-bookings">
            <h1 className="wrapper__community-posts-title">Bookings</h1>

            {!user.hasActive ? (
              <Result
                title="Upgrade to PRO to unlock Booking a Consultation"
                extra={
                  <Button
                    type="primary"
                    key="console"
                    className="wrapper__profile-bookings-upgrade-btn"
                    onClick={() => navigate("/user-profile/membership")}
                  >
                    See Membership Plans
                  </Button>
                }
              />
            ) : (
              <>
                <div className="wrapper__profile-bookings-categor">
                  <Card
                    hoverable
                    className={`wrapper__profile-bookings-categor-card ${
                      activeFilter === "scheduled" ? "active" : ""
                    }`}
                    onClick={() => filterBookings("scheduled")}
                  >
                    Scheduled
                  </Card>
                  <Card
                    hoverable
                    className={`wrapper__profile-bookings-categor-card ${
                      activeFilter === "completed" ? "active" : ""
                    }`}
                    onClick={() => filterBookings("completed")}
                  >
                    Completed
                  </Card>
                  <Card
                    hoverable
                    className={`wrapper__profile-bookings-categor-card ${
                      activeFilter === "cancelled" ? "active" : ""
                    }`}
                    onClick={() => filterBookings("cancelled")}
                  >
                    Cancelled
                  </Card>
                </div>
                <Divider className="divider" />
                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <Spin size="large" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <Empty
                    description={`No ${activeFilter} appointments found!`}
                    style={{ margin: "20px 0" }}
                  />
                ) : (
                  filteredBookings.map((booking) => (
                    <Card
                      key={booking.consultationId}
                      className="wrapper__profile-bookings-card"
                    >
                      <p className="wrapper__profile-bookings-card-note">
                        Appointment Details
                      </p>
                      <div className="wrapper__profile-bookings-card-date">
                        <p className="wrapper__profile-bookings-card-date-details">
                          <CalendarTwoTone className="wrapper__profile-bookings-card-date-details-icon" />{" "}
                          {formatDate(booking.slot.slotDate)}
                        </p>
                        <p className="wrapper__profile-bookings-card-date-details">
                          <ClockCircleTwoTone className="wrapper__profile-bookings-card-date-details-icon" />{" "}
                          {getSlotTimeRange(booking.slot.slotNumber)}
                        </p>
                      </div>

                      {/* Show meeting link for scheduled bookings only if available */}
                      {booking.status === "scheduled" &&
                        booking.meetingLink && (
                          <div className="wrapper__profile-bookings-card-meeting">
                            <p className="wrapper__profile-bookings-card-meeting-link">
                              <LinkOutlined className="wrapper__profile-bookings-card-date-details-icon" />{" "}
                              <a
                                href={booking.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="wrapper__profile-bookings-card-meeting-link-text"
                              >
                                Join Meeting
                              </a>
                            </p>
                          </div>
                        )}

                      <div className="wrapper__profile-bookings-card-coach">
                        <div className="wrapper__profile-bookings-card-coach-info">
                          <div className="wrapper__profile-bookings-card-coach-info-des">
                            <Avatar
                              src={booking.slot.mentor.avatarUrl}
                              alt="Coach Avatar"
                              className="wrapper__profile-bookings-card-coach-avatar"
                            />
                            <div>
                              <h2 className="wrapper__profile-bookings-card-coach-info-des-name">
                                {booking.slot.mentor.gender === "male"
                                  ? "Mr. "
                                  : "Mrs. "}
                                {booking.slot.mentor.fullName}
                              </h2>
                              <p className="wrapper__profile-bookings-card-coach-info-des-email">
                                <MailTwoTone className="wrapper__profile-bookings-card-coach-info-des-email-icon" />
                                Email: {booking.slot.mentor.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="wrapper__profile-bookings-card-btn">
                        <Space
                          className="wrapper__profile-bookings-card-btn-detail"
                          wrap
                        >
                          {booking.status === "scheduled" ? (
                            <Button
                              color="default"
                              variant="filled"
                              className="cancel-book"
                              onClick={() =>
                                showCancelConfirm(booking.consultationId)
                              }
                            >
                              Cancel Appointment
                            </Button>
                          ) : booking.status === "completed" ? (
                            bookingFeedbackStatus[booking.consultationId] ? (
                              <Button
                                color="primary"
                                variant="filled"
                                className="cancel-book"
                                onClick={() => handleViewFeedback(booking)}
                              >
                                View My Feedback
                              </Button>
                            ) : (
                              <Button
                                color="default"
                                variant="filled"
                                className="cancel-book"
                                onClick={() => handleAddFeedback(booking)}
                              >
                                Add Feedback
                              </Button>
                            )
                          ) : (
                            <Button
                              color="default"
                              variant="filled"
                              className="cancel-book"
                              disabled
                            >
                              Cancelled
                            </Button>
                          )}
                        </Space>

                        <Button
                          color="primary"
                          variant="solid"
                          className="wrapper__profile-bookings-card-btn-detail"
                          onClick={() =>
                            handleViewCoach(booking.slot.mentor.profileName)
                          }
                        >
                          View Coach
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
                <Modal
                  title="Add Feedback"
                  open={feedbackModal}
                  onCancel={() => setFeedbackModal(false)}
                  footer={null}
                >
                  <Form
                    form={feedbackForm}
                    onFinish={handleSubmitFeedback}
                    layout="vertical"
                  >
                    <Form.Item
                      name="rating"
                      label="Rating"
                      rules={[
                        {
                          required: true,
                          message: "Please select a rating",
                        },
                        {
                          validator: (_, value) => {
                            if (value && value > 0) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Rating must be greater than 0")
                            );
                          },
                        },
                      ]}
                    >
                      <Rate allowHalf />
                    </Form.Item>
                    <Form.Item
                      name="feedback"
                      label="Feedback"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your feedback",
                        },
                      ]}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="wrapper__profile-bookings-feedback-submit"
                      >
                        Submit Feedback
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>

                <Modal
                  title="My Feedback"
                  open={viewFeedbackModal}
                  onCancel={() => setViewFeedbackModal(false)}
                  footer={[
                    <Button
                      key="close"
                      onClick={() => setViewFeedbackModal(false)}
                    >
                      Close
                    </Button>,
                    <Button
                      key="edit"
                      type="primary"
                      onClick={() => {
                        setViewFeedbackModal(false);
                        handleEditFeedback(selectedBooking);
                      }}
                    >
                      Edit Feedback
                    </Button>,
                  ]}
                >
                  {selectedBooking && (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <strong>Rating:</strong>
                        <Rate
                          disabled
                          value={selectedBooking.rating}
                          style={{ marginLeft: 8 }}
                        />
                      </div>
                      <div>
                        <strong>Feedback:</strong>
                        <p
                          style={{
                            marginTop: 8,
                            padding: 12,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 6,
                          }}
                        >
                          {selectedBooking.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </Modal>

                <Modal
                  title="Edit Feedback"
                  open={editFeedbackModal}
                  onCancel={() => {
                    setEditFeedbackModal(false);
                    editFeedbackForm.resetFields();
                  }}
                  footer={null}
                >
                  <Form
                    form={editFeedbackForm}
                    onFinish={handleUpdateFeedback}
                    layout="vertical"
                  >
                    <Form.Item
                      name="rating"
                      label="Rating"
                      rules={[
                        {
                          required: true,
                          message: "Please select a rating",
                        },
                        {
                          validator: (_, value) => {
                            if (value && value > 0) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Rating must be greater than 0")
                            );
                          },
                        },
                      ]}
                    >
                      <Rate allowHalf />
                    </Form.Item>
                    <Form.Item
                      name="feedback"
                      label="Feedback"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your feedback",
                        },
                      ]}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="wrapper__profile-bookings-feedback-submit"
                        >
                          Update Feedback
                        </Button>
                        <Button
                          onClick={() => {
                            setEditFeedbackModal(false);
                            editFeedbackForm.resetFields();
                          }}
                        >
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserBookings;
