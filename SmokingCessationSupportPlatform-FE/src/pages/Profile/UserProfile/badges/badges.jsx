import "./badges.css";
import { Affix, Card, Spin, message, Empty } from "antd";
import Header from "../../../../components/header/header";
import Footer from "../../../../components/footer/footer";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import api from "../../../../config/axios";

function UserBadges() {
  const user = useSelector((store) => store.user);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/achievements/badges/${user.userId}`);
        setBadges(response.data);
      } catch (error) {
        console.error("Error fetching badges:", error);
        message.error("Failed to load badges");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchUserBadges();
    }
  }, [user?.userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
          <div className="wrapper__profile-badges">
            <h1 className="wrapper__profile-details-title">Badges</h1>
            <h3 className="wrapper__profile-badges-description">
              Earn badges as you overcome cravings and build a healthier life.
            </h3>
            <div className="wrapper__profile-badges-list">
              {loading ? (
                <div className="wrapper__profile-badges-loading">
                  <Spin size="large" />
                </div>
              ) : badges.length > 0 ? (
                <div className="wrapper__profile-badges-grid">
                  {badges.map((badge) => (
                    <Card
                      key={badge.badgeId}
                      className="wrapper__profile-badge-card"
                      hoverable
                      cover={
                        <div style={{ textAlign: "center" }}>
                          <img
                            className="wrapper__profile-badge-card-image"
                            alt={badge.badgeName}
                            src={badge.badgeImageUrl}
                          />
                        </div>
                      }
                    >
                      <Card.Meta
                        title={badge.badgeName}
                        description={
                          <p className="wrapper__profile-badge-card-description">
                            Earned: {formatDate(badge.earnedDate)}
                          </p>
                        }
                      />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="wrapper__profile-badges-empty">
                  <Empty description="No badges earned yet. Keep going to earn your first badge!" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserBadges;
