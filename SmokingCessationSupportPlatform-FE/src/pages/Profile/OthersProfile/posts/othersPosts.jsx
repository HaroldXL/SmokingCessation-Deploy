import { Affix, Empty, message, Skeleton } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../../../../components/footer/footer";
import Header from "../../../../components/header/header";
import OthersAccountNav from "../../../../components/othersAccount-nav/othersAccount-nav";
import api from "../../../../config/axios";
import "./othersPosts.css";

function OthersPosts() {
  const { profileName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/profile/by-name/${profileName}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Failed to fetch user profile. Please try again later.");
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.get(
        `/post/${profileName}?profileName=${profileName}`
      );
      const approvedPosts = response.data.filter(
        (post) => post.isApproved === true
      );
      setUserPosts(approvedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      message.error("Failed to fetch user posts. Please try again later.");
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUserData(), fetchUserPosts()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileName) {
      fetchAllData();
    }
  }, [profileName]);

  if (loading) {
    return (
      <>
        <Affix offsetTop={0}>
          <Header />
        </Affix>
        <div className="wrapper">
          <div className="wrapper__title1">
            <p>Account</p>
          </div>
          <div className="wrapper__profile">
            <OthersAccountNav />
            <Skeleton active />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Affix offsetTop={0}>
          <Header />
        </Affix>
        <div className="wrapper">
          <Empty className="empty-user" description="User Not Found" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title1">
          <p>{user.profileName}'s Account</p>
        </div>
        <div className="wrapper__profile">
          <OthersAccountNav />
          <div className="wrapper__community-posts">
            <h1 className="wrapper__community-posts-title">Posts</h1>
            {userPosts.length === 0 ? (
              <Empty
                className="empty-posts"
                description={`${user.profileName} hasn't posted anything approved yet`}
              />
            ) : (
              <div className="wrapper__community-posts-container">
                {userPosts.map((post) => (
                  <div
                    key={post.postId}
                    className="wrapper__community-posts-card"
                  >
                    {post.imageUrl && (
                      <img
                        alt="post"
                        className="wrapper__community-posts-card-img"
                        src={post.imageUrl}
                        onClick={() => navigate(`/community/${post.postId}`)}
                      />
                    )}
                    <div className="wrapper__community-posts-card-content">
                      <h3>{post.postType?.toUpperCase()}</h3>
                      <h2 onClick={() => navigate(`/community/${post.postId}`)}>
                        {post.title}
                      </h2>
                      <p onClick={() => navigate(`/community/${post.postId}`)}>
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OthersPosts;
