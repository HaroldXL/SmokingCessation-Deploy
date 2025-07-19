import { useState, useEffect } from "react";
import "./QuickNotifications.css";

const QuickNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // This would be replaced with actual API calls when they are available
        // For now, simulating a delay to mimic an API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data - this would be replaced with API calls
        const pendingBlogPosts = 5; // From blog service
        const flaggedCommunityContent = 2; // From community service
        const pendingComments = 10; // From feedback/comment service

        setNotifications([
          {
            title: `Blog Posts Pending Approval (${pendingBlogPosts})`,
            description:
              "There are new posts from coaches or admins that need to be reviewed and approved.",
            action: "See details",
            link: "/admin/blog-management",
          },
          {
            title: `Community content requiring moderation (${flaggedCommunityContent})`,
            description:
              "Some posts or comments in the community have been flagged and need your review.",
            action: "Review Now",
            link: "/admin/community-management",
          },
          {
            title: `New comments pending (${pendingComments})`,
            description:
              "The user has submitted a new feedback or question that needs to be answered.",
            action: "Read feedback",
            link: "/admin/comments",
          },
        ]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Set fallback notifications in case of error
        setNotifications([
          {
            title: "Blog Posts Pending Approval",
            description:
              "There are new posts from coaches or admins that need to be reviewed and approved.",
            action: "See details",
            link: "/admin/blog-management",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="quick-notifications">
      <h2 className="quick-notifications__title">
        Quick Notifications & Moderation
      </h2>
      <div className="quick-notifications__grid">
        {loading ? (
          <div className="quick-notifications__loading">
            Loading notifications...
          </div>
        ) : (
          notifications.map((item, idx) => (
            <div className="quick-notifications__card" key={idx}>
              <div className="quick-notifications__card-title">
                {item.title}
              </div>
              <div className="quick-notifications__card-desc">
                {item.description}
              </div>
              <div className="quick-notifications__card-action">
                <a href={item.link}>{item.action}</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuickNotifications;
