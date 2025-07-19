import React, { useState, useEffect } from "react";
import styles from "./CoachManagement.module.css";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import FilterBar from "../../../components/admin/AdminReusableUI/FilterBar";
import BulkActionBar from "../../../components/admin/AdminReusableUI/BulkActionBar";
import ActionDropdown from "../../../components/admin/AdminReusableUI/ActionDropdown";
import ReusableTable from "../../../components/admin/ReusableTable/ReusableTable";
import dayjs from "dayjs";
import api from "../../../config/axios.js";
import { coachService } from "../../../services/coachManagementService.js";

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    activeCoaches: 0,
    todayConsultations: 0,
    avgRating: 0,
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);

  // Fetch coaches data from API
  const fetchCoaches = async () => {
    try {
      setLoading(true);
      console.log("Fetching coaches from coachService...");
      const response = await coachService.getCoaches();
      console.log("coachService response received:", response);

      // Fetch slots for each mentor to calculate today's consultations
      const transformedData = await Promise.all(
        response.map(async (mentor) => {
          let todayConsults = 0;
          let rating = 0;

          try {
            const slots = await coachService.getMentorSlots(mentor.userId);
            const today = dayjs().format('YYYY-MM-DD');
            todayConsults = slots.filter(slot => 
              slot.booked && dayjs(slot.slotDate).format('YYYY-MM-DD') === today
            ).length;
          } catch (error) {
            console.error(`Error fetching slots for mentor ${mentor.userId}:`, error);
            todayConsults = 0;
          }

          try {
            // Tạm thời comment để tránh lỗi 500
            // rating = await coachService.getMentorRating(mentor.userId);
            rating = 0; // Set mặc định là 0
          } catch (error) {
            rating = 0;
          }

          return {
            id: mentor.userId.toString(),
            name: mentor.fullName,
            email: mentor.email,
            rating: rating,
            todayConsults: todayConsults,
            joinDate: mentor.createdAt,
            lastLogin: mentor.lastLogin,
            status: mentor.hasActive ? "ACTIVE" : "INACTIVE",
          };
        })
      );
      
      setCoaches(transformedData);

      // Update statistics based on the fetched data
      const activeCoaches = transformedData.filter(
        (coach) => coach.status === "ACTIVE"
      ).length;
      
      const totalTodayConsults = transformedData.reduce(
        (sum, coach) => sum + coach.todayConsults,
        0
      );
      
      const totalRating = transformedData.reduce(
        (sum, coach) => sum + coach.rating,
        0
      );
      const avgRating = transformedData.length
        ? (totalRating / transformedData.length).toFixed(1)
        : 0;

      setStatistics({
        activeCoaches,
        todayConsultations: totalTodayConsults,
        avgRating: parseFloat(avgRating),
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching coaches:", err);

      // Phân tích chi tiết lỗi để hiển thị thông báo cụ thể hơn
      if (err.response) {
        // Server trả về response với status code nằm ngoài phạm vi 2xx
        console.error("Error response:", err.response.data);
        console.error("Status code:", err.response.status);
        setError(
          `Server error: ${err.response.status}. ${
            err.response.data.message || "Please try again later."
          }`
        );
      } else if (err.request) {
        // Request được gửi nhưng không nhận được response
        console.error("No response received:", err.request);
        if (err.message && err.message.includes("Network Error")) {
          setError(
            "Network error: Unable to connect to the server. Please check your connection or CORS settings."
          );
        } else {
          setError("No response from server. Please try again later.");
        }
      } else {
        // Lỗi khi thiết lập request
        console.error("Request error:", err.message);
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle activating/deactivating a coach
  const handleActivateCoach = async (id) => {
    try {
      // Tìm coach hiện tại để lấy thông tin đầy đủ
      const currentCoach = coaches.find(coach => coach.id == id);
      if (!currentCoach) {
        throw new Error('Coach not found');
      }

      console.log('Current coach data:', currentCoach); // Debug

      // GỬI TOÀN BỘ THÔNG TIN để đảm bảo role không bị thay đổi
      const updateData = {
        email: currentCoach.email,
        profileName: currentCoach.name, 
        fullName: currentCoach.name,
        role: "mentor", // ĐẢM BẢO ROLE VẪN LÀ MENTOR
        hasActive: true, // Chỉ thay đổi field này
      };

      console.log('Sending update data:', updateData); // Debug
      
      await coachService.updateUser(id, updateData);
      fetchCoaches(); // Refresh data after update
    } catch (err) {
      console.error("Error activating coach:", err);
      setError("Failed to activate coach. Please try again.");
    }
  };

  const handleDeactivateCoach = async (id) => {
    try {
      // Tìm coach hiện tại để lấy thông tin đầy đủ
      const currentCoach = coaches.find(coach => coach.id == id);
      if (!currentCoach) {
        throw new Error('Coach not found');
      }

      console.log('Current coach data:', currentCoach); // Debug

      // GỬI TOÀN BỘ THÔNG TIN để đảm bảo role không bị thay đổi
      const updateData = {
        email: currentCoach.email,
        profileName: currentCoach.name,
        fullName: currentCoach.name,
        role: "mentor", // ĐẢM BẢO ROLE VẪN LÀ MENTOR
        hasActive: false, // Chỉ thay đổi field này
      };

      console.log('Sending update data:', updateData); // Debug
      
      await coachService.updateUser(id, updateData);
      fetchCoaches(); // Refresh data after update
    } catch (err) {
      console.error("Error deactivating coach:", err);
      setError("Failed to deactivate coach. Please try again.");
    }
  };
  // Fetch coaches when component mounts
  useEffect(() => {
    fetchCoaches();
  }, []);

  // Handle custom horizontal scrollbar
  useEffect(() => {
    if (!loading) {
      const tableContainer = document.querySelector(
        "." + styles["table-container"] || ".table-container"
      );
      const scrollThumb = document.querySelector(
        "." + styles["table-scrollbar-thumb"] || ".table-scrollbar-thumb"
      );

      if (!tableContainer || !scrollThumb) return;

      // Update scrollbar thumb width based on table width ratio
      const updateScrollThumbWidth = () => {
        const containerWidth = tableContainer.clientWidth;
        const tableWidth =
          tableContainer.querySelector("table")?.clientWidth ||
          tableContainer.scrollWidth;
        const thumbWidth = Math.max(20, (containerWidth / tableWidth) * 100);
        scrollThumb.style.width = thumbWidth + "%";
      };

      // Update scrollbar thumb position when table scrolls
      const handleTableScroll = () => {
        const scrollPercentage =
          tableContainer.scrollLeft /
          (tableContainer.scrollWidth - tableContainer.clientWidth);
        const maxLeft = tableContainer.clientWidth - scrollThumb.clientWidth;
        scrollThumb.style.left = scrollPercentage * maxLeft + "px";
      };

      // Drag functionality for the scrollbar thumb
      let isDragging = false;
      let startX = 0;
      let startLeft = 0;

      const handleThumbMouseDown = (e) => {
        isDragging = true;
        startX = e.clientX;
        startLeft = parseInt(scrollThumb.style.left || "0", 10);
        document.addEventListener("mousemove", handleThumbMouseMove);
        document.addEventListener("mouseup", handleThumbMouseUp);
      };

      const handleThumbMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const maxLeft = tableContainer.clientWidth - scrollThumb.clientWidth;
        const newLeft = Math.max(0, Math.min(maxLeft, startLeft + deltaX));

        scrollThumb.style.left = newLeft + "px";

        // Update table scroll position
        const scrollPercentage = newLeft / maxLeft;
        tableContainer.scrollLeft =
          scrollPercentage *
          (tableContainer.scrollWidth - tableContainer.clientWidth);
      };

      const handleThumbMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", handleThumbMouseMove);
        document.removeEventListener("mouseup", handleThumbMouseUp);
      };

      // Click on scrollbar track
      const handleTrackClick = (e) => {
        if (e.target === scrollThumb) return;

        const trackRect = e.currentTarget.getBoundingClientRect();
        const clickPosition = e.clientX - trackRect.left;
        const thumbWidth = scrollThumb.clientWidth;
        const maxLeft = tableContainer.clientWidth - thumbWidth;
        const newLeft = Math.max(
          0,
          Math.min(maxLeft, clickPosition - thumbWidth / 2)
        );

        scrollThumb.style.left = newLeft + "px";

        // Update table scroll position
        const scrollPercentage = newLeft / maxLeft;
        tableContainer.scrollLeft =
          scrollPercentage *
          (tableContainer.scrollWidth - tableContainer.clientWidth);
      };

      // Initialize
      updateScrollThumbWidth();
      tableContainer.addEventListener("scroll", handleTableScroll);
      scrollThumb.addEventListener("mousedown", handleThumbMouseDown);
      document
        .querySelector("." + styles["table-scrollbar"] || ".table-scrollbar")
        ?.addEventListener("click", handleTrackClick);

      // Handle window resize
      const handleResize = () => {
        updateScrollThumbWidth();
        handleTableScroll();
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        tableContainer.removeEventListener("scroll", handleTableScroll);
        scrollThumb.removeEventListener("mousedown", handleThumbMouseDown);
        document
          .querySelector("." + styles["table-scrollbar"] || ".table-scrollbar")
          ?.removeEventListener("click", handleTrackClick);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("mousemove", handleThumbMouseMove);
        document.removeEventListener("mouseup", handleThumbMouseUp);
      };
    }
  }, [loading, filteredCoaches]);
  useEffect(() => {
    let result = coaches.filter((coach) => {
      const matchSearch =
        coach.name.toLowerCase().includes(search.toLowerCase()) ||
        coach.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus ? coach.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
    setFilteredCoaches(result);
  }, [search, filterStatus, coaches]);

  // Show list expertise as badges
  const renderExpertise = (expertiseArray) => (
    <>
      {expertiseArray.map((exp, i) => (
        <span key={i} className={styles["expertise-badge"]}>
          {exp}
        </span>
      ))}
    </>
  );

  // Render rating as stars
  const renderRating = (rating) => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < rating
              ? `${styles["star"]} ${styles["filled"]}`
              : styles["star"]
          }
        >
          ★
        </span>
      ))}
    </>
  );

  // Render status badge with styles
  const renderStatus = (status) => (
    <span
      className={`${styles["status-badge"]} ${
        status === "ACTIVE"
          ? styles["status-active"]
          : styles["status-inactive"]
      }`}
    >
      {status}
    </span>
  );

  const columns = [
    { title: "User ID", dataIndex: "id" },
    { title: "Coach name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Rating", dataIndex: "rating", render: renderRating },
    { title: "Number of consultations today", dataIndex: "todayConsults" },
    {
      title: "Joining date",
      dataIndex: "joinDate",
      render: (value) =>
        dayjs(value, ["D/M/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format(
          "DD/MM/YYYY"
        ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      render: (value) =>
        value
          ? dayjs(value, ["D/M/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format(
              "DD/MM/YYYY"
            )
          : "Never",
    },
    { title: "Status", dataIndex: "status", render: renderStatus },
    {
      title: "Action",
      dataIndex: "action",
      render: (value, row) => (
        <ActionDropdown
          actions={[
            { key: "edit", label: "Edit", onClick: () => {} },
            { key: "calendar", label: "Calendar", onClick: () => {} },
            row.status === "ACTIVE"
              ? {
                  key: "deactive",
                  label: "Deactivate",
                  onClick: () => handleDeactivateCoach(row.id),
                  danger: true,
                }
              : {
                  key: "active",
                  label: "Activate",
                  onClick: () => handleActivateCoach(row.id),
                },
          ]}
        />
      ),
    },
  ];

  return (
    <AdminLayout title="Coach Management">
      <div className={styles["coach-management-page"]}>
        <h2>Coach Management</h2>
        <div className={styles["summary-cards-row"]}>
          <div className={styles["summary-card"]}>
            <div className={styles["summary-label"]}>Active Coaches</div>
            <div className={styles["summary-value"]}>
              <span className={styles["summary-icon"]}>👥</span>
              {filteredCoaches.filter((coach) => coach.status === "ACTIVE").length}
            </div>
          </div>
          <div className={styles["summary-card"]}>
            <div className={styles["summary-label"]}>Today's Consultations</div>
            <div className={styles["summary-value"]}>
              <span className={styles["summary-icon"]}>🗓️</span>
              {filteredCoaches.reduce((sum, coach) => sum + coach.todayConsults, 0)}
            </div>
          </div>
          <div className={styles["summary-card"]}>
            <div className={styles["summary-label"]}>Avg. Rating</div>
            <div
              className={`${styles["summary-value"]} ${styles["rating-value"]}`}
            >
              {renderRating(
                filteredCoaches.length
                  ? (
                      filteredCoaches.reduce((sum, coach) => sum + coach.rating, 0) /
                      filteredCoaches.length
                    ).toFixed(1)
                  : 0
              )}{" "}
              {filteredCoaches.length
                ? (
                    filteredCoaches.reduce((sum, coach) => sum + coach.rating, 0) /
                    filteredCoaches.length
                  ).toFixed(1)
                : 0}{" "}
              / 5
            </div>
          </div>
        </div>
        <div className={styles["list-title"]}>List of coaches</div>
        <FilterBar
          searchPlaceholder="Search by name, email..."
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          filters={[
            {
              placeholder: "Filter status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "", label: "All status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ],
            },
          ]}
        />
        {selectedRows.length > 0 && (
          <BulkActionBar
            selectedCount={selectedRows.length}
            onAction={() => {}}
            actions={[]}
          />
        )}

        {error && (
          <div
            className={styles["error-message"] || ""}
            style={{ color: "red", margin: "10px 0", padding: "10px" }}
          >
            {error}
          </div>
        )}
        {loading ? (
          <div
            className={styles["loading"] || ""}
            style={{ padding: "20px", textAlign: "center" }}
          >
            Loading coaches...
          </div>
        ) : (
          <div
            className={styles["table-container"] || ""}
            style={{
              overflowX: "auto",
              width: "100%",
              position: "relative",
              paddingBottom: "10px",
            }}
          >
            <ReusableTable
              columns={columns}
              data={filteredCoaches}
              selectedRowKeys={selectedRows}
              onSelectAll={(checked) =>
                setSelectedRows(checked ? filteredCoaches.map((c) => c.id) : [])
              }
              onSelectRow={(id, checked) =>
                setSelectedRows((prev) =>
                  checked ? [...prev, id] : prev.filter((cid) => cid !== id)
                )
              }
            />
            <div
              className={styles["table-scrollbar"] || ""}
              style={{
                height: "8px",
                width: "100%",
                background: "#f0f0f0",
                borderRadius: "4px",
                marginTop: "10px",
                position: "relative",
              }}
            >
              <div
                className={styles["table-scrollbar-thumb"] || ""}
                style={{
                  height: "100%",
                  width: "20%",
                  background: "#888",
                  borderRadius: "4px",
                  cursor: "pointer",
                  position: "absolute",
                  left: "0",
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CoachManagement;
