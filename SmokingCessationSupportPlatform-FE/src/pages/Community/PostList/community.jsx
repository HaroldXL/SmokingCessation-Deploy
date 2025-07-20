import Footer from "../../../components/footer/footer";
import Header from "../../../components/header/header";
import "./community.css";
import { Affix, Card, Divider, Empty, message, Spin } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";

function Community() {
  const [selectedCategory, setSelectedCategory] = useState("tips");
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/post/all?approved=true");
      setAllPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to fetch posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  // Filter posts theo category được chọn
  const filteredPosts = allPosts.filter(
    (post) => post.postType?.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title">
          <p>Community</p>
        </div>
        <Divider className="divider" />
        <div className="wrapper__community">
          <h2>Categories</h2>
          <div className="wrapper__community-categories">
            <Card
              hoverable
              className={`wrapper__community-categories-card ${
                selectedCategory === "tips" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("tips")}
            >
              <img
                alt="asset"
                className="wrapper__community-categories-card-img"
                src="/images/communityAsset1.png"
              />
              <h3>Tips</h3>
              <p>Share and discover tips for quitting smoking.</p>
            </Card>
            <Card
              hoverable
              className={`wrapper__community-categories-card ${
                selectedCategory === "stories" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("stories")}
            >
              <img
                alt="asset"
                className="wrapper__community-categories-card-img"
                src="/images/communityAsset2.png"
              />
              <h3>Stories</h3>
              <p>Read inspiring stories from those who have quit.</p>
            </Card>
            <Card
              hoverable
              className={`wrapper__community-categories-card ${
                selectedCategory === "other" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("other")}
            >
              <img
                alt="asset"
                className="wrapper__community-categories-card-img"
                src="/images/communityAsset3.png"
              />
              <h3>Other</h3>
              <p>
                Other post categories shared by people that might be helpful.
              </p>
            </Card>
          </div>
          <Divider className="divider" />

          <Spin spinning={loading} size="large">
            <div
              className={`wrapper__community-posts ${
                loading ? "community-spinner" : ""
              }`}
            >
              {filteredPosts.map((post) => (
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

            {filteredPosts.length === 0 && !loading && (
              <div className="no-posts-message">
                <Empty description="No posts found for this Category." />
              </div>
            )}
          </Spin>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Community;
