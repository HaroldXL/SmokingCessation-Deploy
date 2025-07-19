import { useState, useEffect } from "react";
import "./PerformanceIndex.css";
import { userService } from "../../../services/userService";

const PerformanceIndex = () => {
  const [performanceData, setPerformanceData] = useState({
    successRate: 56,
    uptime: 99.98,
    errorRate: 0.05,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);

        // Fetch users data to calculate success rate
        const usersResponse = await userService.fetchAdminUsers();

        // Calculate success rate based on user quit smoking status
        const totalUsersWithQuitStatus = usersResponse.filter(
          (user) =>
            user.smokingStatus !== undefined && user.smokingStatus !== null
        ).length;

        const successfulQuits = usersResponse.filter(
          (user) =>
            user.smokingStatus === "quit" || user.smokingStatus === "success"
        ).length;

        const calculatedSuccessRate =
          totalUsersWithQuitStatus > 0
            ? Math.round((successfulQuits / totalUsersWithQuitStatus) * 100)
            : 56; // Default value if no data

        // Mock API call for system stats (replace with actual API when available)
        // const systemStatsResponse = await api.get('/admin/system-stats');
        // const { uptime, errorRate } = systemStatsResponse.data;

        // For now using mock values
        const uptime = 99.98;
        const errorRate = 0.05;

        setPerformanceData({
          successRate: calculatedSuccessRate,
          uptime,
          errorRate,
        });
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  // Calculate the stroke-dashoffset for the progress circle
  const calculateDashOffset = (percentage) => {
    const circumference = 2 * Math.PI * 50; // 2πr where r=50
    return circumference - (circumference * percentage) / 100;
  };

  return (
    <div className="performance-index">
      <div className="performance-cards">
        <div className="performance-card">
          <h3 className="card-title">Success rate of quitting smoking</h3>
          <div className="progress-circle">
            <div className="circle-container">
              <svg width="120" height="120" className="progress-svg">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e3e8f7"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#4285f4"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset={
                    loading
                      ? "138"
                      : calculateDashOffset(performanceData.successRate)
                  }
                  className="progress-circle-bar"
                />
              </svg>
              <div className="percentage">
                {loading ? "..." : `${performanceData.successRate}%`}
              </div>
            </div>
          </div>
          <p className="card-description">
            Percentage of users who reported successfully quitting smoking after
            using the platform.
          </p>
        </div>

        <div className="performance-card">
          <h3 className="card-title">System stability index</h3>
          <div className="stability-metrics">
            <div className="metric-item">
              <span className="metric-label">Uptime</span>
              <span className="metric-value uptime">
                {loading ? "Loading..." : `${performanceData.uptime} %`}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Error Rate</span>
              <span className="metric-value error-rate">
                {loading ? "Loading..." : `${performanceData.errorRate} %`}
              </span>
            </div>
          </div>
          <p className="card-description">Tracked in the last 7 days.</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceIndex;
