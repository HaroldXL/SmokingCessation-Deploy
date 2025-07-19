import "./userPosts.css";
import {
  Affix,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Upload,
  Empty,
  message,
} from "antd";
import Footer from "../../../../components/footer/footer";
import Header from "../../../../components/header/header";
import MyAccountNav from "../../../../components/myAccount-nav/myAccount-nav";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import uploadFile from "../../../../store/utils/file";
import TextArea from "antd/es/input/TextArea";
import api from "../../../../config/axios";
import FormItem from "antd/es/form/FormItem";

function UserPosts() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    form.resetFields();
    setFileList([]);
  };

  const handleFinishFailed = () => {
    setLoading(false);
  };

  const fetchUserPost = async () => {
    try {
      const response = await api.get("/post/my");
      const approvedPosts = response.data.filter(
        (post) => post.isApproved === true
      );
      setUserPosts(approvedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      message.error("Failed to fetch user posts. Please try again later.");
    }
  };

  useEffect(() => {
    fetchUserPost();
  }, []);

  const handleSubmitPost = async (values) => {
    try {
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const uploadedImageUrl = await uploadFile(fileList[0].originFileObj);
          values.imageUrl = uploadedImageUrl;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          message.error("Failed to upload image. Please try again.");
          return;
        }
      }

      const response = await api.post("/post", values);

      if (response.status === 200 || response.status === 201) {
        message.success("Your post has been sent for approval!");
        handleCloseModal();

        await fetchUserPost();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    if (!isLt5M) {
      message.error("Image must smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
          <div className="wrapper__community-posts">
            <h1 className="wrapper__community-posts-title">Posts</h1>
            <Button
              color="default"
              variant="filled"
              className="new-post-btn"
              onClick={handleOpenModal}
            >
              <PlusOutlined />
              New Post
            </Button>

            <Modal
              className="wrapper__community-posts-modal"
              open={openModal}
              onCancel={handleCloseModal}
              footer={[
                <Button key="cancel" onClick={handleCloseModal}>
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    form.submit();
                  }}
                >
                  Create Post
                </Button>,
              ]}
            >
              <h1 className="wrapper__community-posts-create">
                Create New Post
              </h1>
              <Form
                onFinish={handleSubmitPost}
                onFinishFailed={handleFinishFailed}
                form={form}
              >
                <p className="wrapper__community-posts-create-label">Title</p>
                <FormItem
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the title of post.",
                    },
                  ]}
                >
                  <Input
                    variant="filled"
                    className="wrapper__community-posts-create-input"
                    placeholder="Enter the post's title"
                  />
                </FormItem>

                <p className="wrapper__community-posts-create-label">
                  Category
                </p>
                <FormItem
                  name="postType"
                  rules={[
                    {
                      required: true,
                      message: "Please select the type of post.",
                    },
                  ]}
                >
                  <Select
                    className="wrapper__community-posts-create-category"
                    variant="filled"
                    allowClear
                    options={[
                      {
                        value: "tips",
                        label: "TIPS",
                      },
                      {
                        value: "stories",
                        label: "STORIES",
                      },
                      {
                        value: "other",
                        label: "OTHER",
                      },
                    ]}
                    placeholder="Select the post's category"
                  />
                </FormItem>

                <p className="wrapper__community-posts-create-label">Content</p>
                <FormItem
                  name="content"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the content of post.",
                    },
                  ]}
                >
                  <TextArea
                    className="wrapper__community-posts-create-textarea"
                    variant="filled"
                    placeholder="Enter the post's content"
                    autoSize={{ minRows: 10, maxRows: 15 }}
                  />
                </FormItem>

                <p className="wrapper__community-posts-create-label">
                  Add Image
                </p>
                <FormItem name="imageUrl">
                  <Upload
                    listType="picture"
                    maxCount={1}
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={beforeUpload}
                  >
                    <Button
                      color="default"
                      variant="filled"
                      icon={<UploadOutlined />}
                    >
                      Upload (Max 1)
                    </Button>
                  </Upload>
                </FormItem>
              </Form>
            </Modal>

            {userPosts.length === 0 ? (
              <Empty
                className="empty-posts"
                description="You haven't posted anything yet"
              />
            ) : (
              <div className="wrapper__community-posts-container">
                {userPosts.map((post) => (
                  <div
                    key={post.postId}
                    className="wrapper__community-posts-card"
                  >
                    {post.imageUrl && (
                      <img
                        alt="post"
                        className="wrapper__community-posts-card-img"
                        src={post.imageUrl}
                        onClick={() => navigate(`/community/${post.postId}`)}
                      />
                    )}
                    <div className="wrapper__community-posts-card-content">
                      <h3>{post.postType.toUpperCase()}</h3>
                      <h2 onClick={() => navigate(`/community/${post.postId}`)}>
                        {post.title}
                      </h2>
                      <p onClick={() => navigate(`/community/${post.postId}`)}>
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserPosts;
