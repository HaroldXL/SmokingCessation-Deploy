import Header from "../../components/header/header";
import Poster from "../../components/poster/poster";
import Footer from "../../components/footer/footer";
import "./home.css";
import { Affix, Button, Card, message, Spin, Collapse } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../config/axios";
import UserFeedback from "../../config/userFeedback";
import UserProgress from "../../components/progress/progress";

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [randomPosts, setRandomPosts] = useState([]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/user-smoking-profile/my");
      if (response.data && response.data.length > 0) {
        setUserProfile(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const response = await api.get("/post/all?approved=true");
      const allPosts = response.data;

      // Lấy ngẫu nhiên 6 bài post
      const shuffled = [...allPosts].sort(() => 0.5 - Math.random());
      const selectedPosts = shuffled.slice(0, 6);

      setRandomPosts(selectedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to fetch posts. Please try again later.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUserProfile(), fetchAllPosts()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "450px",
            backgroundColor: "#f0eeee",
          }}
        >
          <Spin size="large" />
        </div>
      ) : userProfile?.status === "active" ? (
        <UserProgress />
      ) : (
        <Poster />
      )}

      <div className="wrapper">
        <div className="wrapper__title">
          <p>Explore Our Features</p>
        </div>
        <div className="wrapper__card">
          {userProfile?.status === "active" ? (
            <Card
              hoverable
              className="wrapper__card-card"
              onClick={() => navigate("/plan-detail")}
            >
              <img
                alt="example"
                className="wrapper__card-img"
                src="/images/card-asset1.png"
              />
              <h2 className="wrapper__card-title">View my Quit Plan</h2>
              <p className="wrapper__card-des">
                Track your progress, see upcoming goals, and stay motivated with
                your personalized quit plan.
              </p>
            </Card>
          ) : (
            <Card
              hoverable
              className="wrapper__card-card"
              onClick={() => navigate("/make-plan")}
            >
              <img
                alt="example"
                className="wrapper__card-img"
                src="/images/card-asset1.png"
              />
              <h2 className="wrapper__card-title">I want to Quit</h2>
              <p className="wrapper__card-des">
                Quitting smoking is one of the best decisions for your health
                and future
              </p>
            </Card>
          )}
          <Card
            hoverable
            className="wrapper__card-card"
            onClick={() => navigate("/community")}
          >
            <img
              alt="example"
              className="wrapper__card-img"
              src="/images/card-asset2.png"
            />
            <h2 className="wrapper__card-title">Community</h2>
            <p className="wrapper__card-des">
              Connect with others on the same journey and share your stories,
              tips, and support in our community.
            </p>
          </Card>
          <Card
            hoverable
            className="wrapper__card-card"
            onClick={() => navigate("/user-coach")}
          >
            <img
              alt="example"
              className="wrapper__card-img"
              src="/images/card-asset3.png"
            />
            <h2 className="wrapper__card-title">Consulation</h2>
            <p className="wrapper__card-des">
              Free consultation with our trusted doctors and get the best
              recomendations.
            </p>
          </Card>
        </div>
        <div className="custom-divider" />

        <div className="wrapper__title">
          <p>Our Community</p>
        </div>
        <div className="wrapper__card">
          {randomPosts.map((post) => (
            <Card
              key={post.postId}
              hoverable
              className="wrapper__card-coumminity"
              onClick={() => navigate(`/community/${post.postId}`)}
            >
              {post.imageUrl && (
                <img
                  alt="community post"
                  className="wrapper__card-community-img"
                  src={post.imageUrl}
                />
              )}
              <div className="wrapper__card-post-type">
                <p>{post.postType?.toUpperCase()}</p>
              </div>
              <h2 className="wrapper__card-title">{post.title}</h2>
              <p className="wrapper__card-post-des">{post.content}</p>
            </Card>
          ))}
        </div>
        <div className="wrapper__view-more">
          <Button
            className="wrapper__view-more-btn"
            type="primary"
            onClick={() => navigate("/community")}
          >
            View More
          </Button>
        </div>

        <div className="custom-divider" />
        <div className="wrapper__title">
          <p>What other users say about Quitlt</p>
        </div>
        <div className="wrapper__card">
          {UserFeedback.map((userFeedback) => (
            <Card
              key={userFeedback.id}
              hoverable
              className="wrapper__card-card"
            >
              <h3 className="wrapper__card-des">"{userFeedback.text}"</h3>
              <div className="wrapper__card-user">
                <img
                  alt="user"
                  className="wrapper__card-user-img"
                  src={userFeedback.avatar}
                />
                <div className="wrapper__card-user-info">
                  <h3 className="wrapper__card-user-name">
                    {userFeedback.name}
                  </h3>
                  <p className="wrapper__card-user-role">{userFeedback.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="custom-divider" />
        <div className="wrapper__title">
          <p>Frequently Asked Questions</p>
        </div>
        <p className="wrapper__faq-description">
          Here are some frequently asked questions about quitting smoking and
          our services.
        </p>
        <div className="wrapper__faq">
          <Collapse
            size="large"
            items={[
              {
                key: "1",
                label: "How long does it take to quit smoking successfully?",
                children: (
                  <p>
                    The timeline varies for each person. Physical withdrawal
                    symptoms typically peak within the first 3 days and can last
                    up to 2-4 weeks. However, breaking the psychological habit
                    can take longer. Our personalized quit plans help you stay
                    on track throughout your journey.
                  </p>
                ),
              },
              {
                key: "2",
                label: "What are the benefits of using Quitlt?",
                children: (
                  <p>
                    Quitlt provides personalized quit plans, progress tracking,
                    community support, and professional consultation. You can
                    monitor your health improvements, calculate money saved,
                    connect with others on similar journeys, and get guidance
                    from certified mentors.
                  </p>
                ),
              },
              {
                key: "3",
                label: "Is the consultation service free?",
                children: (
                  <p>
                    We offer free consultation sessions with our certified
                    mentors and healthcare professionals. However, some premium
                    features and extended consultation sessions may require a
                    PRO membership upgrade.
                  </p>
                ),
              },
              {
                key: "4",
                label: "How does the community feature work?",
                children: (
                  <p>
                    Our community is a safe space where you can share your
                    experiences, ask questions, offer support to others, and
                    celebrate milestones together. You can post updates,
                    participate in discussions, and find motivation from people
                    who understand your journey.
                  </p>
                ),
              },
              {
                key: "5",
                label: "What happens if I have a relapse?",
                children: (
                  <p>
                    Relapses are common and part of the journey for many people.
                    Quitlt allows you to record smoking events, track triggers,
                    and adjust your quit plan accordingly. Our mentors can help
                    you learn from setbacks and develop better strategies moving
                    forward.
                  </p>
                ),
              },
              {
                key: "6",
                label: "How accurate is the money-saving calculator?",
                children: (
                  <p>
                    Our calculator uses the smoking habits and costs you provide
                    in your profile to estimate savings. It calculates daily,
                    weekly, monthly, and yearly projections based on your
                    previous spending patterns. The calculations are updated in
                    real-time as you progress.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
