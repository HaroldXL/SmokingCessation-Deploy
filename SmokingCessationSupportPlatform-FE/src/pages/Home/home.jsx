import Header from "../../components/header/header";
import Poster from "../../components/poster/poster";
import Footer from "../../components/footer/footer";
import "./home.css";
import { Affix, Button, Card, message, Spin } from "antd";
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
          <p>Explore</p>
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
          <p>Community</p>
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
      </div>
      <Footer />
    </>
  );
}

export default Home;
