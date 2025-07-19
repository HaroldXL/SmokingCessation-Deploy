import { Affix, Card, Spin, message, Empty } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../config/axios";
import "./otherBadges.css";
import Header from "../../../../components/header/header";
import OthersAccountNav from "../../../../components/othersAccount-nav/othersAccount-nav";
import Footer from "../../../../components/footer/footer";

function OtherBadges() {
  const { profileName } = useParams();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/profile/by-name/${profileName}`);
        setUser(response.data);

        // Fetch user badges
        const badgesResponse = await api.get(
          `/achievements/badges/${response.data.userId}`
        );
        setBadges(badgesResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Failed to fetch user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (profileName) {
      fetchUserData();
    }
  }, [profileName]);

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
          <p>{user?.profileName || profileName}'s Account</p>
        </div>
        <div className="wrapper__profile">
          <OthersAccountNav />
          <div className="wrapper__profile-badges">
            <h1 className="wrapper__profile-details-title">Badges</h1>
            <h3 className="wrapper__profile-badges-description">
              {user?.profileName || profileName}'s earned badges.
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
                  <Empty
                    description={`${
                      user?.profileName || profileName
                    } hasn't earned any badges yet.`}
                  />
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

export default OtherBadges;
