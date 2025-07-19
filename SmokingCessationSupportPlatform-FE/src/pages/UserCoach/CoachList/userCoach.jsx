import "./userCoach.css";
import Footer from "../../../components/footer/footer";
import Header from "../../../components/header/header";
import {
  Affix,
  Avatar,
  Button,
  Card,
  Divider,
  Empty,
  message,
  Rate,
  Spin,
} from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import api from "../../../config/axios";
import { useNavigate } from "react-router-dom";

function UserCoach() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await api.get("profile/mentors");
        setMentors(response.data);
      } catch (error) {
        message.error("Failed to fetch mentors. Please try again later.");
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title">
          <p>Coach Consultation</p>
        </div>
        <Divider className="divider" />
        <div className="wrapper__content">
          <div className="wrapper__content-des">
            <h2>Get Help From Experts</h2>
            <p>
              Getting quit support from an expert, like a health care
              professional or trained quit counselor, can increase your chances
              of success. Ask how they might be able to help you quit.
            </p>
          </div>
          <Divider className="divider" />

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : mentors.length === 0 ? (
            <Empty description="No Mentors Available" />
          ) : (
            mentors.map((coach) => (
              <div className="wrapper__content-coach" key={coach.mentor.userId}>
                <Card
                  hoverable
                  className="wrapper__content-coach-card"
                  onClick={() =>
                    navigate(`/user-coach/${coach.mentor.profileName}`)
                  }
                >
                  <div className="wrapper__content-coach-card-info">
                    <Avatar
                      src={coach.mentor.avatarUrl}
                      alt="Coach Avatar"
                      className="wrapper__content-coach-card-info-avatar"
                    />
                    <div>
                      <h2 className="wrapper__content-coach-card-info-name">
                        {coach.mentor.gender === "male" ? "Mr. " : "Mrs. "}
                        {coach.mentor.fullName}
                      </h2>
                      <Rate
                        disabled
                        allowHalf
                        defaultValue={coach.averageRating}
                      />
                    </div>
                  </div>
                  <p className="wrapper__content-coach-card-note">
                    {coach.mentor.note}
                  </p>
                  <Button
                    type="link"
                    className="wrapper__content-coach-card-button"
                  >
                    View Schedules and Booking
                    <RightOutlined />
                  </Button>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserCoach;
