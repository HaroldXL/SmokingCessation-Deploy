import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserFriends,
  FaChalkboardTeacher,
  FaDollarSign,
  FaChartBar,
} from "react-icons/fa";
import "./OverviewStats.css";
import { userService } from "../../../services/userService";
import { membershipService } from "../../../services/membershipService";
import { scheduleData } from "../../../services/scheduleDataOverviewCoach";

// Default stats object
const defaultStats = {
  totalUsers: 0,
  premiumUsers: 0,
  activeCoaches: 0,
  monthlyRevenue: "$0",
  todayConsultations: 0,
  newUsersThisWeek: 0,
  userGrowth: "0%",
  premiumGrowth: "0%",
  coachGrowth: "0%",
  revenueGrowth: "0%",
  consultationsGrowth: "0%",
  newUsersGrowth: "0%",
};

const OverviewStats = () => {
  const [statsData, setStatsData] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  // Function to fetch and process revenue data
  const fetchRevenueData = async () => {
    try {
      const paymentsResponse = await membershipService.getPayments({
        period: "month",
        status: "completed",
      });

      return paymentsResponse.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );
    } catch (error) {
      console.error("Error fetching payment data:", error);
      return 2340; // Fallback value
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users from User Management page
        const usersResponse = await userService.fetchAdminUsers();

        if (usersResponse && Array.isArray(usersResponse)) {
          // Normalize data for consistent processing
          const users = normalizeUserData(usersResponse);

          // Calculate statistics using helper functions
          const totalUsers = countTotalUsers(users);
          const premiumUsers = countPremiumUsers(users);
          const activeCoaches = countActiveCoaches(users);
          const newUsersThisWeek = countNewUsers(users);

          // Get revenue data
          const monthlyRevenue = await fetchRevenueData();

          // Get consultation count
          const todayConsultations = getConsultationCount();

          // Calculate growth percentages
          const previousTotalUsers = totalUsers - newUsersThisWeek;
          const userGrowth = calculateGrowth(
            newUsersThisWeek,
            previousTotalUsers
          );

          // Historical data could be fetched from an API in the future
          // For now using calculated or static values where needed

          // Update the stats with real data from User Management
          setStatsData({
            totalUsers,
            premiumUsers,
            activeCoaches,
            monthlyRevenue: `$${monthlyRevenue.toLocaleString()}`,
            todayConsultations,
            newUsersThisWeek,
            userGrowth,
            premiumGrowth: "40%", // To be replaced with calculated values when historical data is available
            coachGrowth: "20%",
            revenueGrowth: "60%",
            consultationsGrowth: "40%",
            newUsersGrowth: "100%",
          });
        } else {
          throw new Error("Invalid user data format");
        }
      } catch (error) {
        console.error("Error in primary data fetch:", error);

        // Try again with fallback approach
        try {
          const userData = await userService.fetchAdminUsers();

          if (userData && Array.isArray(userData)) {
            // Use the same normalization and processing functions for consistency
            const users = normalizeUserData(userData);

            const totalUsers = countTotalUsers(users);
            const premiumUsers = countPremiumUsers(users);
            const activeCoaches = countActiveCoaches(users);
            const newUsersThisWeek = countNewUsers(users);

            const todayConsultations = getConsultationCount();

            setStatsData({
              totalUsers,
              premiumUsers,
              activeCoaches,
              monthlyRevenue: "$2,340", // Fallback value
              todayConsultations,
              newUsersThisWeek,
              userGrowth: calculateGrowth(
                newUsersThisWeek,
                totalUsers - newUsersThisWeek
              ),
              premiumGrowth: "40%",
              coachGrowth: "20%",
              revenueGrowth: "60%",
              consultationsGrowth: "40%",
              newUsersGrowth: "100%",
            });
          } else {
            throw new Error("Invalid user data format in fallback");
          }
        } catch (fallbackError) {
          console.error("Error in fallback data fetch:", fallbackError);
          setStatsData(defaultStats);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Helper functions
  // Normalize user data from API response to consistent format
  const normalizeUserData = (rawData) => {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    return rawData.map((user) => ({
      id: user.userId,
      role: user.role || "",
      membership: user.typeLogin || user.membership || "",
      createdAt: user.createdAt || user.joinDate,
      email: user.email,
    }));
  };

  // Count total unique users
  const countTotalUsers = (users) => {
    const userIds = new Set();
    users.forEach((user) => {
      if (user && user.id) {
        userIds.add(user.id);
      }
    });
    return userIds.size;
  };

  // Count premium users
  const countPremiumUsers = (users) => {
    return users.filter(
      (user) => user.membership === "PREMIUM" || user.membership === "Premium"
    ).length;
  };

  // Count active coaches
  const countActiveCoaches = (users) => {
    return users.filter(
      (user) =>
        user.role === "mentor" ||
        user.role === "MENTOR" ||
        user.role === "coach" ||
        user.role === "COACH"
    ).length;
  };

  // Calculate new users in the last week
  const countNewUsers = (users, days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return users.filter((user) => {
      if (!user.createdAt) return false;
      const createdAt = new Date(user.createdAt);
      return createdAt >= cutoffDate;
    }).length;
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (previous <= 0) return "0%";
    const growth = Math.round((current / previous - 1) * 100);
    return `${growth > 0 ? "+" : ""}${growth}%`;
  };

  // Get consultation count for today
  const getConsultationCount = () => {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const todaySchedule = scheduleData.find(
      (schedule) => schedule.date === today || schedule.date.includes(today)
    );

    return todaySchedule
      ? todaySchedule.timeSlots.filter((slot) => !slot.isAvailable).length
      : 0;
  };

  const stats = [
    {
      title: "Total Users",
      value: loading ? "Loading..." : statsData.totalUsers.toString(),
      icon: <FaUsers />,
      note: `Increased by ${statsData.userGrowth}`,
    },
    {
      title: "Premium Users",
      value: loading ? "Loading..." : statsData.premiumUsers.toString(),
      icon: <FaUserFriends />,
      note: `Decreased by ${statsData.premiumGrowth}`,
    },
    {
      title: "Active Coaches",
      value: loading ? "Loading..." : statsData.activeCoaches.toString(),
      icon: <FaChalkboardTeacher />,
      note: `Increased by ${statsData.coachGrowth}`,
    },
    {
      title: "Monthly Revenue",
      value: loading ? "Loading..." : statsData.monthlyRevenue,
      icon: <FaDollarSign />,
      note: `Increased by ${statsData.revenueGrowth}`,
    },
    {
      title: "Today's Consultations",
      value: loading ? "Loading..." : statsData.todayConsultations.toString(),
      icon: <FaChartBar />,
      note: `Increased by ${statsData.consultationsGrowth}`,
    },
    {
      title: "New Users (This Week)",
      value: loading ? "Loading..." : statsData.newUsersThisWeek.toString(),
      icon: <FaChartBar />,
      note: `Increased by ${statsData.newUsersGrowth}`,
    },
  ];

  return (
    <div className="overview-stats">
      <h2 className="overview-stats__title">User Overview</h2>
      <div className="overview-stats-grid">
        {stats.map((item, idx) => (
          <div className="overview-stats__card" key={idx}>
            <div className="overview-stats__card-title">{item.title}</div>
            <div className="overview-stats__card-content">
              <span className="overview-stats__icon">{item.icon}</span>
              <span className="overview-stats__value">{item.value}</span>
            </div>
            {/* <div className="overview-stats__note">{item.note}</div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewStats;
