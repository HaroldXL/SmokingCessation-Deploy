import React, { useState, useEffect } from "react";
import { Modal, Tag, Row, Col, Card, Spin, Avatar, Empty } from "antd";
import { MailTwoTone, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../../config/axios";
import styles from "./ModalForDetailsButton.module.css";

// Utility functions
const calculateAge = (birthDate) => {
  if (!birthDate) return "N/A";
  try {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return "N/A";
  }
};

const getCustomerAge = (smokingHistoryByDate) => {
  if (!smokingHistoryByDate || typeof smokingHistoryByDate !== "object")
    return "N/A";
  const firstKey = Object.keys(smokingHistoryByDate)[0];
  const birthDate = smokingHistoryByDate[firstKey]?.[0]?.user?.birthDate;
  return calculateAge(birthDate);
};

const ModalForDetailsButton = ({
  open,
  onClose,
  selectedUser,
  userDetail,
  loadingDetail,
}) => {
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  const isCustomer =
    selectedUser?.role === "Customer" || selectedUser?.role === "user";
  const isAdminOrCoach =
    selectedUser?.role === "Admin" || selectedUser?.role === "Coach";

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!open || !selectedUser?.id) return;
      try {
        setLoadingBadges(true);
        const response = await api.get(
          `/achievements/badges/${selectedUser.id}`
        );
        setBadges(response.data);
      } catch (error) {
        console.error("Error fetching user badges:", error);
        setBadges([]);
      } finally {
        setLoadingBadges(false);
      }
    };
    fetchUserBadges();
  }, [open, selectedUser?.id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserAge = () => {
    if (isCustomer) {
      return `${getCustomerAge(userDetail?.smokingHistoryByDate)} years old`;
    }
    return `${calculateAge(userDetail?.birthDate)} years old`;
  };

  const getRoleColor = (role) => {
    if (role === "Customer" || role === "user") return "green";
    if (role === "Coach") return "blue";
    return "purple";
  };

  const InfoRow = ({ label, value, isTag = false, tagColor = "default" }) => (
    <div>
      <span className={styles.label}>{label}:</span>
      {isTag ? <Tag color={tagColor}>{value}</Tag> : <b>{value}</b>}
    </div>
  );

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className={styles.modalCustom}
    >
      <div className={styles.modalContent}>
        {loadingDetail ? (
          <div className={styles.loadingWrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Header */}
            <h2 className={styles.title}>User Details</h2>
            <div className={styles.headerRow}>
              <div>
                {selectedUser?.avatarUrl || userDetail?.avatarUrl ? (
                  <Avatar
                    size={80}
                    src={selectedUser?.avatarUrl || userDetail?.avatarUrl}
                    alt="User Avatar"
                  />
                ) : (
                  <Avatar size={80} icon={<UserOutlined />} />
                )}
              </div>
              <div>
                <div className={styles.userName}>
                  {selectedUser?.name || "N/A"}
                </div>
                <div className={styles.userEmail}>
                  <MailTwoTone /> {selectedUser?.email || "N/A"}
                </div>
                <div className={styles.userTags}>
                  <Tag color="blue">{selectedUser?.membership || "Free"}</Tag>
                  <Tag color={getRoleColor(selectedUser?.role)}>
                    {selectedUser?.role || "Customer"}
                  </Tag>
                  <Tag
                    color={selectedUser?.status === "active" ? "green" : "red"}
                  >
                    {selectedUser?.status === "active" ? "Active" : "Locked"}
                  </Tag>
                </div>
              </div>
            </div>
            <hr className={styles.hr} />

            {/* Account Information */}
            <div className={styles.sectionTitle}>
              <span
                className="anticon anticon-calendar"
                style={{ marginRight: 6 }}
              />
              Account Information
            </div>
            <div className={styles.infoBox}>
              <Row gutter={16}>
                <Col span={12}>
                  <InfoRow
                    label="User ID"
                    value={`#${selectedUser?.id || "N/A"}`}
                  />
                  <InfoRow
                    label="Joined Date"
                    value={
                      selectedUser?.joinDate
                        ? dayjs(selectedUser.joinDate).format("DD/MM/YYYY")
                        : "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoRow
                    label="Last Active"
                    value={
                      selectedUser?.lastActivity
                        ? dayjs(selectedUser.lastActivity).format("DD/MM/YYYY")
                        : "N/A"
                    }
                  />
                  <InfoRow
                    label="Role"
                    value={selectedUser?.role || "Customer"}
                    isTag={true}
                    tagColor={getRoleColor(selectedUser?.role)}
                  />
                </Col>
              </Row>
            </div>

            {/* Personal Information */}
            <div className={styles.sectionTitle}>Personal Information</div>
            <div className={styles.infoBox}>
              <Row gutter={16}>
                <Col span={12}>
                  <InfoRow
                    label="Full Name"
                    value={
                      isAdminOrCoach
                        ? userDetail?.fullName
                        : selectedUser?.name || "N/A"
                    }
                  />
                  <InfoRow
                    label="Profile Name"
                    value={
                      isAdminOrCoach
                        ? userDetail?.profileName
                        : selectedUser?.profile || "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoRow label="Age" value={getUserAge()} />
                  <InfoRow
                    label="Gender"
                    value={isAdminOrCoach ? userDetail?.gender || "N/A" : "N/A"}
                  />
                </Col>
              </Row>
            </div>

            {/* Badges Section */}
            <div className={styles.sectionTitle}>
              <span
                className="anticon anticon-trophy"
                style={{ marginRight: 6 }}
              />
              Badges Earned
            </div>
            {loadingBadges ? (
              <div className={styles.badgesLoading}>
                <Spin size="small" />
                <div className={styles.badgesLoadingText}>
                  Loading badges...
                </div>
              </div>
            ) : badges.length > 0 ? (
              <div className={styles.badgesContainer}>
                {badges.map((badge) => (
                  <div key={badge.badgeId} className={styles.badgeItem}>
                    <img
                      src={badge.badgeImageUrl}
                      alt={badge.badgeName}
                      className={styles.badgeImage}
                    />
                    <div className={styles.badgeName}>{badge.badgeName}</div>
                    <div className={styles.badgeDate}>
                      {formatDate(badge.earnedDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.badgesEmpty}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No badges earned yet"
                  style={{ margin: 0 }}
                />
              </div>
            )}

            {/* Contact Information - For Admin/Coach */}
            {isAdminOrCoach && (
              <>
                <div className={styles.sectionTitle}>Contact Information</div>
                <div className={styles.infoBox}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div>
                        <span className={styles.label}>Email:</span>
                        <b>{userDetail?.email || "N/A"}</b>
                      </div>
                      <div>
                        <span className={styles.label}>Phone:</span>
                        <b>{userDetail?.phone || "Not provided"}</b>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <span className={styles.label}>Email Verified:</span>
                        <Tag color={userDetail?.isVerified ? "green" : "red"}>
                          {userDetail?.isVerified ? "Verified" : "Not Verified"}
                        </Tag>
                      </div>
                      <div>
                        <span className={styles.label}>Account Status:</span>
                        <Tag color={userDetail?.isBlock ? "red" : "green"}>
                          {userDetail?.isBlock ? "Blocked" : "Active"}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* System Information */}
                <div className={styles.sectionTitle}>System Information</div>
                <div className={styles.infoBox}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div>
                        <span className={styles.label}>Login Type:</span>
                        <b>{userDetail?.typeLogin || "Standard"}</b>
                      </div>
                      <div>
                        <span className={styles.label}>Created At:</span>
                        <b>
                          {userDetail?.createdAt
                            ? dayjs(userDetail.createdAt).format(
                                "DD/MM/YYYY HH:mm"
                              )
                            : "N/A"}
                        </b>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <span className={styles.label}>Last Updated:</span>
                        <b>
                          {userDetail?.updatedAt
                            ? dayjs(userDetail.updatedAt).format(
                                "DD/MM/YYYY HH:mm"
                              )
                            : "N/A"}
                        </b>
                      </div>
                      <div>
                        <span className={styles.label}>Has Active:</span>
                        <Tag color={userDetail?.hasActive ? "green" : "red"}>
                          {userDetail?.hasActive ? "Yes" : "No"}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Notes */}
                {userDetail?.note && (
                  <>
                    <div className={styles.sectionTitle}>Notes</div>
                    <div className={styles.infoBox}>
                      <div className={styles.noteContent}>
                        {userDetail.note}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Customer Progress - Only for Customer */}
            {isCustomer && (
              <>
                <div className={styles.sectionTitle}>
                  <span
                    className="anticon anticon-line-chart"
                    style={{ marginRight: 6 }}
                  />
                  Current Progress
                </div>
                <Row gutter={16} className={styles.progressRow}>
                  <Col span={8}>
                    <Card
                      className={styles.progressCard}
                      bodyStyle={{ padding: 12 }}
                    >
                      <div className={styles.progressValueGreen}>
                        {userDetail?.daysSinceStart ?? 0}
                      </div>
                      <div className={styles.progressLabel}>
                        Days Smoke-Free
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      className={styles.progressCardBlue}
                      bodyStyle={{ padding: 12 }}
                    >
                      <div className={styles.progressValueBlue}>
                        {userDetail?.cigarettesAvoided ?? 0}
                      </div>
                      <div className={styles.progressLabel}>
                        Cigarettes Avoided
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      className={styles.progressCard}
                      bodyStyle={{ padding: 12 }}
                    >
                      <div className={styles.progressValueMoney}>
                        ${userDetail?.moneySaved ?? 0}
                      </div>
                      <div className={styles.progressLabel}>Money Saved</div>
                    </Card>
                  </Col>
                </Row>

                {/* Smoking History */}
                <div className={styles.sectionTitle}>Smoking History</div>
                <div className={styles.infoBox}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div>
                        <span className={styles.label}>Target Days:</span>
                        <b>{userDetail?.targetDays ?? "Not set"}</b>
                      </div>
                      <div>
                        <span className={styles.label}>
                          Cigarettes per Day:
                        </span>
                        <b>{userDetail?.cigarettesPerDay ?? "N/A"}</b>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <span className={styles.label}>Pack Cost:</span>
                        <b>${userDetail?.cigarettePackCost ?? "0.00"}</b>
                      </div>
                      <div>
                        <span className={styles.label}>Program Status:</span>
                        <Tag
                          color={
                            userDetail?.status === "active" ? "blue" : "orange"
                          }
                        >
                          {userDetail?.status ?? "Unknown"}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            )}

            {/* For other roles */}
            {!isCustomer && !isAdminOrCoach && (
              <>
                <div className={styles.sectionTitle}>
                  Additional Information
                </div>
                <div className={styles.infoBox}>
                  <div className={styles.noAdditionalData}>
                    <p>Limited information available for this user role.</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default ModalForDetailsButton;
