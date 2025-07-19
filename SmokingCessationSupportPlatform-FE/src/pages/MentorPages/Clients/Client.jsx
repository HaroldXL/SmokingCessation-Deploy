import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Input,
  Tag,
  Spin,
  Alert,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  SearchOutlined,
  EyeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { coachService } from "../../../services/coachService";
import styles from "./Client.module.css";

const { Title, Text } = Typography;

export default function ClientsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const slotNumberToTime = (slotNumber) => {
    const times = ["09:00", "10:00", "11:00", "14:00"];
    return times[slotNumber] || "00:00";
  };

  const mapConsultationStatusToClientStatus = (consultationStatus) => {
    switch (consultationStatus) {
      case "completed":
        return "completed";
      case "scheduled":
        return "active";
      case "cancelled":
        return "inactive";
      default:
        return "active";
    }
  };

  useEffect(() => {
    const extractClientsFromConsultations = (consultations) => {
      const clientMap = {};

      consultations.forEach((consultation) => {
        const { user, createdAt, status, slot } = consultation;
        const userId = user.userId;

        // Nếu client chưa tồn tại trong map, thêm client mới
        if (!clientMap[userId]) {
          clientMap[userId] = {
            id: userId,
            name: user.fullName || user.profileName || "Unknown Client",
            profileName: user.profileName || null,
            avatar: user.avatarUrl || "",
            joinDate: new Date(createdAt).toISOString(),
            status: mapConsultationStatusToClientStatus(status),
            email: user.email || "N/A",
            consultations: [],
            currentProgress: {
              nextSession: null,
            },
          };
        }

        clientMap[userId].consultations.push({
          consultationId: consultation.consultationId,
          date: slot.slotDate,
          time: slotNumberToTime(slot.slotNumber),
          status: status,
          rating: consultation.rating,
          feedback: consultation.feedback,
        });

        // Cập nhật nextSession nếu đây là phiên sắp tới
        const sessionDate = new Date(slot.slotDate);
        const today = new Date();
        if (
          sessionDate >= today &&
          (!clientMap[userId].currentProgress.nextSession ||
            sessionDate <
              new Date(clientMap[userId].currentProgress.nextSession))
        ) {
          clientMap[userId].currentProgress.nextSession = slot.slotDate;
        }
      });

      // Chuyển object map thành array clients
      return Object.values(clientMap);
    };

    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const consultations = await coachService.getMentorConsultations();
        const clientData = extractClientsFromConsultations(consultations);
        setClients(clientData);
      } catch (err) {
        setError("Failed to load clients");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();

    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.profileName &&
        client.profileName.toLowerCase().includes(searchLower)) ||
      client.status.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm(""); // Reset về rỗng
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { color: "#52c41a", bg: "#f6ffed", text: "active" },
      "at-risk": { color: "#ff4d4f", bg: "#fff2f0", text: "at-risk" },
      completed: { color: "#1890ff", bg: "#e6f7ff", text: "completed" },
      inactive: { color: "#d9d9d9", bg: "#f5f5f5", text: "inactive" },
    };
    return configs[status] || configs.active;
  };

  const handleViewDetails = (clientId) => {
    navigate(`/mentor/clients/${clientId}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div>
            <Title level={1} className={styles.pageTitle}>
              Client Management
            </Title>
            <Text className={styles.pageDescription}>
              Track progress and manage your smoking cessation clients
            </Text>

            {/* Hiển thị số lượng kết quả tìm kiếm */}
            {searchTerm && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Found {filteredClients.length} client(s) matching "
                  {searchTerm}"
                  {filteredClients.length === 0 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={handleClearSearch}
                      style={{ padding: 0, marginLeft: 8 }}
                    >
                      Clear search
                    </Button>
                  )}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Card với chức năng tìm kiếm */}
      <Card className={styles.searchCard}>
        <Input
          prefix={<SearchOutlined className={styles.searchIcon} />}
          placeholder="Search by name, profile, email, or status..."
          value={searchTerm}
          onChange={handleSearchChange} // Gọi hàm xử lý khi có thay đổi
          className={styles.searchInput}
          size="large"
          allowClear // Cho phép clear nội dung
          onClear={handleClearSearch} // Xử lý khi clear
        />
      </Card>

      {/* Clients Grid - Hiển thị kết quả đã được filter */}
      <Row gutter={[24, 24]}>
        {filteredClients.length > 0 ? (
          // Nếu có kết quả, hiển thị danh sách clients đã filter
          filteredClients.map((client) => {
            const statusConfig = getStatusConfig(client.status);

            return (
              <Col key={client.id} xs={24} sm={12} lg={8}>
                <Card className={styles.clientCard}>
                  {/* Client Header */}
                  <div
                    className={styles.clientHeader}
                    style={{ marginBottom: "12px" }}
                  >
                    <div
                      className={styles.clientInfo}
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        minHeight: "80px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: "12px",
                        }}
                      >
                        <Avatar
                          size={80}
                          src={client.avatar}
                          className={styles.clientAvatar}
                        >
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                      </div>

                      <div
                        className={styles.clientNameSection}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          minHeight: "80px",
                        }}
                      >
                        <Title
                          level={3}
                          className={styles.clientName}
                          style={{ marginBottom: "4px" }}
                        >
                          {client.name}
                        </Title>
                        {client.profileName && (
                          <Text
                            style={{
                              fontSize: "13px",
                              color: "#8c8c8c",
                              fontStyle: "italic",
                              marginBottom: "4px",
                            }}
                          >
                            @{client.profileName}
                          </Text>
                        )}
                        <Text
                          className={styles.joinDate}
                          style={{ fontSize: "14px" }}
                        >
                          <UserAddOutlined
                            style={{ marginRight: 6, color: "#1890ff" }}
                          />
                          Joined{" "}
                          {new Date(client.joinDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }
                          )}
                        </Text>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          paddingTop: "4px",
                        }}
                      >
                        <Tag
                          className={styles.statusTag}
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            border: "none",
                          }}
                        >
                          {statusConfig.text}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <MailOutlined className={styles.contactIcon} />
                      <Text className={styles.contactText}>{client.email}</Text>
                    </div>
                  </div>

                  {/* Next Session */}
                  <div className={styles.nextSession}>
                    <CalendarOutlined className={styles.sessionIcon} />
                    <Text className={styles.sessionText}>
                      Next Session:{" "}
                      {client.currentProgress.nextSession
                        ? new Date(
                            client.currentProgress.nextSession
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })
                        : "No upcoming sessions"}
                    </Text>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actionButtons}>
                    <Button
                      type="primary"
                      className={styles.viewDetailsButton}
                      onClick={() => handleViewDetails(client.id)} // Pass client.id for routing
                      style={{ width: "100%" }}
                    >
                      <EyeOutlined />
                      View Details
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })
        ) : (
          // Nếu không có kết quả tìm kiếm, hiển thị thông báo
          <Col span={24}>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <SearchOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "#999" }}>
                No clients found
              </Title>
              <Text type="secondary">
                Try adjusting your search criteria or
                <Button
                  type="link"
                  onClick={handleClearSearch}
                  style={{ padding: 0, marginLeft: 4 }}
                >
                  clear the search
                </Button>
              </Text>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}
