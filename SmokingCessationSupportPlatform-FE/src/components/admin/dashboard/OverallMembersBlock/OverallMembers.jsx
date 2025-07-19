import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Typography, Spin } from "antd";
import { dashboardService } from "../../../../services/dashboardService.js";

const { Text } = Typography;

// Color constants matching the image
const FREE_MEMBERS_COLOR = "#FF7A00";    // Orange for Free Members
const PREMIUM_MEMBERS_COLOR = "#00D084"; // Green for Premium Members

const OverallMembers = () => {
  const [memberData, setMemberData] = useState([]);
  const [stats, setStats] = useState({ total: 0, premiumPercentage: 0, freeCount: 0, premiumCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch member distribution data
  useEffect(() => {
    const fetchMemberData = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getMemberDistribution();
        
        // Calculate stats based on fetched data
        const freeMembersCount = data.find(item => item.name === "Free Members")?.value || 0;
        const premiumMembersCount = data.find(item => item.name === "Premium Members")?.value || 0;
        const total = freeMembersCount + premiumMembersCount;
        const premiumPercentage = total > 0 ? Math.round((premiumMembersCount / total) * 100) : 0;

        setStats({ total, premiumPercentage, freeCount: freeMembersCount, premiumCount: premiumMembersCount });

        // Add colors for the chart
        const chartData = data.map(item => ({
          ...item,
          fill: item.name === "Premium Members" ? PREMIUM_MEMBERS_COLOR : FREE_MEMBERS_COLOR
        }));

        // If total is 0, create a dummy entry to show a full gray circle
        if (total === 0) {
          setMemberData([{ name: 'No Members', value: 1, fill: '#f0f0f0' }]);
        } else {
          setMemberData(chartData);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load member distribution data');
        console.error('Member distribution fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: 'flex',
      flexDirection: 'column', // Sắp xếp theo chiều dọc
      justifyContent: 'center',
      alignItems: 'center',
      padding: "20px"
    }}>
      <div style={{ position: "relative", width: 280, height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={memberData}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={130}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {memberData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text - Display total and premium percentage */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none"
        }}>
          <div style={{ 
            fontSize: 48,
            fontWeight: "700",
            color: "#6B7280",
            lineHeight: 1,
            marginBottom: 8
          }}>
            {stats.total}
          </div>
          <div style={{ 
            fontSize: 16,
            color: "#9CA3AF",
            fontWeight: "500"
          }}>
            Total Users
          </div>
        </div>
      </div>

      {/* Legend Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        gap: 24,
        marginTop: 20 // Khoảng cách với biểu đồ
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ 
            backgroundColor: PREMIUM_MEMBERS_COLOR,
            width: 14,
            height: 14,
            borderRadius: "50%",
            display: "inline-block"
          }}></span>
          <Text style={{ fontWeight: "500", fontSize: 14 }}>
            Premium: {stats.premiumCount}
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ 
            backgroundColor: FREE_MEMBERS_COLOR,
            width: 14,
            height: 14,
            borderRadius: "50%",
            display: "inline-block"
          }}></span>
          <Text style={{ fontWeight: "500", fontSize: 14 }}>
            Free: {stats.freeCount}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default OverallMembers;
