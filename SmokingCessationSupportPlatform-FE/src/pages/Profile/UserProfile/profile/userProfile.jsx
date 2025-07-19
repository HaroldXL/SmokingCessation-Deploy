import {
  Affix,
  Avatar,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
} from "antd";
import Header from "../../../../components/header/header";
import Footer from "../../../../components/footer/footer";
import "./userProfile.css";
import {
  CameraOutlined,
  ExclamationCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import FormItem from "antd/es/form/FormItem";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import { useState, useEffect, useRef } from "react";
import api from "../../../../config/axios";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../../store/redux/features/userSlice";
import uploadFile from "../../../../store/utils/file";

function UserProfile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const dateFormat = "DD/MM/YYYY";

  const { confirm } = Modal;

  // Ref cho input file ẩn
  const fileInputRef = useRef(null);

  // State để quản lý trạng thái enable/disable của từng field
  const [fieldStates, setFieldStates] = useState({
    fullName: true,
    profileName: true,
    birthDate: true,
    gender: true,
  });

  // State để lưu giá trị gốc khi bắt đầu edit
  const [originalValues, setOriginalValues] = useState({});

  // State để track những field đã được edit
  const [editedFields, setEditedFields] = useState(new Set());

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/profile/my");

      const profileData = response.data;

      const formValues = {
        fullName: profileData.fullName,
        profileName: profileData.profileName,
        email: profileData.email,
        birthDate: profileData.birthDate
          ? dayjs(profileData.birthDate, "YYYY-MM-DD")
          : null,
        gender: profileData.gender,
      };

      form.setFieldsValue(formValues);
      setOriginalValues(formValues);
      setUserAvatar(profileData.avatarUrl);
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Failed to fetch profile data");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      message.error("Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error("File size must be less than 5MB");
      return;
    }

    try {
      setAvatarLoading(true);

      const avatarUrl = await uploadFile(file);

      const response = await api.post("/profile/my", { avatarUrl });

      if (response.status === 200 || response.status === 201) {
        setUserAvatar(avatarUrl);

        const updatedUser = {
          ...user,
          avatarUrl: avatarUrl,
        };
        dispatch(login(updatedUser));

        message.success("Avatar updated successfully");
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      message.error("Failed to update avatar");
    } finally {
      setAvatarLoading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleUpdateClick = (fieldName) => {
    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: false,
    }));

    // Add field to edited fields set
    setEditedFields((prev) => new Set([...prev, fieldName]));
  };

  const handleCancel = () => {
    // Reset form về giá trị gốc
    form.setFieldsValue(originalValues);

    // Reset tất cả field về trạng thái disabled
    setFieldStates({
      fullName: true,
      profileName: true,
      birthDate: true,
      gender: true,
    });

    // Clear edited fields
    setEditedFields(new Set());
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Chỉ gửi những field đã được edit
      const updatedData = {};

      editedFields.forEach((fieldName) => {
        if (fieldName === "birthDate" && values[fieldName]) {
          updatedData[fieldName] = values[fieldName].format("YYYY-MM-DD");
        } else if (
          values[fieldName] !== undefined &&
          values[fieldName] !== null
        ) {
          updatedData[fieldName] = values[fieldName];
        }
      });

      const response = await api.post("/profile/my", updatedData);

      if (response.status === 200 || response.status === 201) {
        message.success("Profile updated successfully");

        if (updatedData.profileName) {
          const updatedUser = {
            ...user,
            profileName: updatedData.profileName,
          };
          dispatch(login(updatedUser));
        }

        setFieldStates({
          fullName: true,
          profileName: true,
          birthDate: true,
          gender: true,
        });

        setEditedFields(new Set());

        setOriginalValues(form.getFieldsValue());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveEdits = Object.values(fieldStates).some(
    (disabled) => !disabled
  );

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);

      const response = await api.delete("/profile/me");

      if (response.status === 200 || response.status === 204) {
        message.success("Your account has been deleted successfully.");
        console.log("Your account has been deleted successfully.");

        dispatch(login(null));

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      message.error("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: "Are you sure delete your Account?",
      icon: <ExclamationCircleFilled />,
      content:
        "Deleting your account is permanent and cannot be undone. All your data will be lost.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteAccount();
      },
      onCancel() {
        console.log("Cancel");
      },
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
          <div className="wrapper__profile-details">
            <div className="wrapper__profile-details-avatar">
              {userAvatar ? (
                <Avatar
                  className="wrapper__profile-details-avatar-img"
                  src={userAvatar}
                  alt="User Avatar"
                />
              ) : (
                <Avatar
                  className="wrapper__profile-details-avatar-img"
                  icon={
                    <UserOutlined className="wrapper__profile-details-avatar-img-UserOutlined" />
                  }
                />
              )}
              <div className="wrapper__profile-details-avatar-info">
                <h1>Personal Information</h1>
                <Button
                  color="default"
                  variant="filled"
                  className="wrapper__profile-details-avatar-btn"
                  onClick={handleChangeAvatar}
                  loading={avatarLoading}
                >
                  <CameraOutlined />
                  {avatarLoading ? "Uploading..." : "Change Avatar"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <div className="wrapper__profile-detail-info">
              <Form
                form={form}
                labelCol={{
                  span: 24,
                }}
                onFinish={handleSubmit}
              >
                <div className="wrapper__profile-detail-info-label">
                  Full Name
                </div>
                <div className="wrapper__profile-detail-info-form">
                  <FormItem
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your full name to update.",
                      },
                    ]}
                  >
                    <Input
                      disabled={fieldStates.fullName}
                      variant="filled"
                      className="wrapper__profile-detail-info-form-input"
                      placeholder="Full Name"
                    />
                  </FormItem>
                  <Button
                    color="default"
                    variant="filled"
                    className="update-button"
                    disabled={!fieldStates.fullName}
                    onClick={() => handleUpdateClick("fullName")}
                  >
                    Update
                  </Button>
                </div>

                <div className="wrapper__profile-detail-info-label">
                  Profile Name
                </div>
                <div className="wrapper__profile-detail-info-form">
                  <FormItem
                    name="profileName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your profile name to update.",
                      },
                    ]}
                  >
                    <Input
                      disabled={fieldStates.profileName}
                      variant="filled"
                      className="wrapper__profile-detail-info-form-input"
                      placeholder="Profile Name"
                    />
                  </FormItem>
                  <Button
                    color="default"
                    variant="filled"
                    className="update-button"
                    disabled={!fieldStates.profileName}
                    onClick={() => handleUpdateClick("profileName")}
                  >
                    Update
                  </Button>
                </div>

                <div className="wrapper__profile-detail-info-label">Email</div>
                <div className="wrapper__profile-detail-info-form">
                  <FormItem name="email">
                    <Input
                      disabled
                      variant="filled"
                      className="wrapper__profile-detail-info-form-input"
                      placeholder="Email"
                    />
                  </FormItem>
                </div>

                <div className="wrapper__profile-detail-info-label">
                  Date Of Birth
                </div>
                <div className="wrapper__profile-detail-info-form">
                  <FormItem name="birthDate">
                    <DatePicker
                      disabled={fieldStates.birthDate}
                      variant="filled"
                      className="date-picker-form"
                      format={dateFormat}
                    />
                  </FormItem>
                  <Button
                    color="default"
                    variant="filled"
                    className="update-button"
                    disabled={!fieldStates.birthDate}
                    onClick={() => handleUpdateClick("birthDate")}
                  >
                    Update
                  </Button>
                </div>

                <div className="wrapper__profile-detail-info-label">Gender</div>
                <div className="wrapper__profile-detail-info-form">
                  <FormItem name="gender">
                    <Select
                      disabled={fieldStates.gender}
                      variant="filled"
                      style={{ height: 40, width: 130 }}
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </FormItem>
                  <Button
                    color="default"
                    variant="filled"
                    className="update-button"
                    disabled={!fieldStates.gender}
                    onClick={() => handleUpdateClick("gender")}
                  >
                    Update
                  </Button>
                </div>
                <Button
                  htmlType="submit"
                  disabled={!hasActiveEdits}
                  className="save-change-btn"
                  type="primary"
                  loading={loading}
                >
                  Save Changes
                </Button>
                <Button
                  disabled={!hasActiveEdits}
                  className="save-change-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Form>
            </div>
            <Divider className="divider" />
            <div className="delete-account">
              <h2 className="delete-account-title">Delete My Account !</h2>
              <p className="delete-account-description">
                If you no longer wish to use our services, you can permanently
                delete your account.
              </p>
              <Space wrap>
                <Button
                  color="danger"
                  variant="solid"
                  className="delete-account-btn"
                  onClick={showDeleteConfirm}
                >
                  Delete Account
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserProfile;
