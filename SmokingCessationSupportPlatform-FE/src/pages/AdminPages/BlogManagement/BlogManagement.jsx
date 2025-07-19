import { useState, useEffect } from "react";
import styles from "./BlogManagement.module.css";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import EditPostModal from "./EditPostModal.jsx";
import FilterBar from "../../../components/admin/AdminReusableUI/FilterBar";
import BulkActionBar from "../../../components/admin/AdminReusableUI/BulkActionBar";
import ReusableTable from "../../../components/admin/ReusableTable/ReusableTable";
import dayjs from "dayjs";
import {
  Image,
  message,
  Spin,
  Modal,
  Empty,
  Typography,
  Tag,
  Button,
  Space,
} from "antd";
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { blogService } from "../../../services/blogService";

const { confirm } = Modal;
const { Title, Text, Paragraph } = Typography;

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [loadingPostDetail, setLoadingPostDetail] = useState(false);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await blogService.getPosts();
        // Map API response to match component structure
        const postsData = Array.isArray(response)
          ? response
          : response.data || [];

        // Transform API data to match component expectations
        const transformedPosts = postsData.map((post) => ({
          id: post.postId,
          title: post.title,
          author: post.user?.fullName || post.user?.profileName || "Unknown",
          content: post.content,
          imageUrl: post.imageUrl,
          postType: post.postType,
          updated: post.updatedAt,
          status: post.isApproved,
          user: post.user,
        }));

        setPosts(transformedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        message.error("Failed to load posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = posts.filter((post) => {
      const matchSearch =
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.author?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus !== "" ? post.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
    setFilteredPosts(result);
  }, [search, filterStatus, posts]);

  // Hàm render badge status
  const renderStatus = (status) => {
    if (status === true)
      return <span className={styles["status-published"]}>PUBLISHED</span>;
    return <span className={styles["status-rejected"]}>NOT PUBLISHED</span>;
  };

  // Hàm render image
  const renderImage = (imageUrl) => {
    if (!imageUrl) {
      return (
        <span style={{ color: "#999", fontStyle: "italic" }}>No image</span>
      );
    }
    return (
      <Image
        src={imageUrl}
        alt="PostImage"
        style={{
          width: "100px",
          height: "70px",
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid #ddd",
        }}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "inline";
        }}
      />
    );
  };

  // Hàm xử lý delete với Ant Design Modal confirm
  const handleDelete = (id, postTitle) => {
    confirm({
      title: "Delete Post",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await blogService.deletePost(id);
          setPosts(posts.filter((post) => post.id !== id));
          message.success("Post deleted successfully");
        } catch (error) {
          console.error("Error deleting post:", error);
          message.error("Failed to delete post");
        }
      },
      onCancel() {
        // User cancelled, do nothing
      },
    });
  };

  // Functions để handle edit modal
  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSavePost = async (updatedPost) => {
    try {
      await blogService.updatePost(updatedPost.id, updatedPost);

      // Cập nhật post trong state
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        )
      );

      // Đóng modal
      setShowEditModal(false);
      setEditingPost(null);
      message.success("Post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      message.error("Failed to save post");
      throw error;
    }
  };

  const handleApprove = async (row) => {
    try {
      await blogService.approvePost(row.id);

      setPosts(
        posts.map((post) =>
          post.id === row.id
            ? { ...post, status: true, updated: new Date().toISOString() }
            : post
        )
      );
      message.success(`Approved post: ${row.title}`);
    } catch (error) {
      console.error("Error approving post:", error);
      message.error("Failed to approve post");
    }
  };

  // Handler for viewing post details
  const handleView = async (row) => {
    try {
      setLoadingPostDetail(true);
      setShowViewModal(true);

      // Fetch detailed post data from API
      const postDetail = await blogService.getPostById(row.id);
      setViewingPost(postDetail);
    } catch (error) {
      console.error("Error fetching post details:", error);
      message.error("Failed to load post details");
      setShowViewModal(false);
    } finally {
      setLoadingPostDetail(false);
    }
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingPost(null);
  };

  const columns = [
    { title: "Post ID", dataIndex: "id" },
    {
      title: "Image",
      dataIndex: "imageUrl",
      render: renderImage,
    },
    { title: "Title", dataIndex: "title" },
    { title: "Author", dataIndex: "author" },
    { title: "Post Type", dataIndex: "postType" },
    {
      title: "Last updated",
      dataIndex: "updated",
      render: (value) => {
        if (!value) return "N/A";
        return dayjs(value).format("DD/MM/YYYY");
      },
    },
    { title: "Status", dataIndex: "status", render: renderStatus },
    {
      title: "Action",
      dataIndex: "action",
      render: (value, row) => {
        if (row.status === true) {
          // Published posts actions
          return (
            <Space size="small">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(row)}
              >
                Detail
              </Button>
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(row.id, row.title)}
              >
                Delete
              </Button>
            </Space>
          );
        } else {
          // Not published posts actions
          return (
            <Space size="small">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(row)}
              >
                View
              </Button>
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleApprove(row)}
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(row.id, row.title)}
              >
                Delete
              </Button>
            </Space>
          );
        }
      },
    },
  ];

  // Filter posts by status
  const publishedPosts = filteredPosts.filter((p) => p.status === true);
  const notPublishedPosts = filteredPosts.filter((p) => p.status === false);

  // Section-specific selected posts
  const publishedSelected = selectedPosts.filter((id) =>
    publishedPosts.some((p) => p.id === id)
  );
  const notPublishedSelected = selectedPosts.filter((id) =>
    notPublishedPosts.some((p) => p.id === id)
  );

  // Section-specific bulk action handler
  const handleBulkActionSection = (section) => async (action) => {
    let ids = [];
    if (section === "published") ids = publishedSelected;
    if (section === "notPublished") ids = notPublishedSelected;

    // Handle bulk delete
    if (action === "delete") {
      confirm({
        title: "Delete Multiple Posts",
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to delete ${ids.length} selected posts? This action cannot be undone.`,
        okText: "Yes, Delete All",
        okType: "danger",
        cancelText: "Cancel",
        centered: true,
        onOk: async () => {
          try {
            // Delete multiple posts
            await Promise.all(ids.map((id) => blogService.deletePost(id)));
            setPosts(posts.filter((post) => !ids.includes(post.id)));
            setSelectedPosts(selectedPosts.filter((id) => !ids.includes(id)));
            message.success(`Successfully deleted ${ids.length} posts`);
          } catch (error) {
            console.error("Error deleting posts:", error);
            message.error("Failed to delete selected posts");
          }
        },
      });
    }
    // Handle bulk approve
    else if (action === "approve") {
      try {
        // Approve multiple posts
        await Promise.all(ids.map((id) => blogService.approvePost(id)));
        setPosts(
          posts.map((post) =>
            ids.includes(post.id)
              ? { ...post, status: true, updated: new Date().toISOString() }
              : post
          )
        );
        setSelectedPosts(selectedPosts.filter((id) => !ids.includes(id)));
        message.success(`Successfully approved ${ids.length} posts`);
      } catch (error) {
        console.error("Error approving posts:", error);
        message.error("Failed to approve selected posts");
      }
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <AdminLayout title="Blog Management">
        <div className={styles["blog-management-page"]}>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p>Loading posts...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Blog Management">
      <div className={styles["blog-management-page"]}>
        <h2>Blog Management</h2>
        <FilterBar
          searchPlaceholder="Search by title, author..."
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          filters={[
            {
              placeholder: "Filter status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "", label: "All status" },
                { value: true, label: "Published" },
                { value: false, label: "Not Published" },
              ],
            },
          ]}
        />

        {/* Published Section */}
        <h3>Published</h3>
        {publishedSelected.length > 0 && (
          <BulkActionBar
            selectedCount={publishedSelected.length}
            onAction={handleBulkActionSection("published")}
            actions={[{ value: "delete", label: "Delete" }]}
          />
        )}
        {publishedPosts.length === 0 ? (
          <Empty
            description="No published posts"
            style={{ margin: "20px 0" }}
          />
        ) : (
          <ReusableTable
            columns={columns}
            data={publishedPosts}
            selectedRowKeys={publishedSelected}
            onSelectAll={(checked) => {
              const ids = publishedPosts.map((p) => p.id);
              setSelectedPosts(
                checked
                  ? Array.from(new Set([...selectedPosts, ...ids]))
                  : selectedPosts.filter((id) => !ids.includes(id))
              );
            }}
            onSelectRow={(id, checked) =>
              setSelectedPosts((prev) =>
                checked ? [...prev, id] : prev.filter((pid) => pid !== id)
              )
            }
          />
        )}

        {/* Not Published Section */}
        <h3>Not Published</h3>
        {notPublishedSelected.length > 0 && (
          <BulkActionBar
            selectedCount={notPublishedSelected.length}
            onAction={handleBulkActionSection("notPublished")}
            actions={[
              { value: "approve", label: "Approve" },
              { value: "delete", label: "Delete" },
            ]}
          />
        )}
        {notPublishedPosts.length === 0 ? (
          <Empty
            description="No not published posts"
            style={{ margin: "20px 0" }}
          />
        ) : (
          <ReusableTable
            columns={columns}
            data={notPublishedPosts}
            selectedRowKeys={notPublishedSelected}
            onSelectAll={(checked) => {
              const ids = notPublishedPosts.map((p) => p.id);
              setSelectedPosts(
                checked
                  ? Array.from(new Set([...selectedPosts, ...ids]))
                  : selectedPosts.filter((id) => !ids.includes(id))
              );
            }}
            onSelectRow={(id, checked) =>
              setSelectedPosts((prev) =>
                checked ? [...prev, id] : prev.filter((pid) => pid !== id)
              )
            }
          />
        )}

        {/* Edit Post Modal */}
        <EditPostModal
          post={editingPost}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePost}
        />

        {/* View Post Modal */}
        <Modal
          open={showViewModal}
          onCancel={handleCloseViewModal}
          footer={[
            <Button key="close" onClick={handleCloseViewModal}>
              Close
            </Button>,
          ]}
          width={900}
          centered
          title={
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#18181b",
                borderBottom: "2px solid #e3e8f7",
                paddingBottom: "12px",
                marginBottom: "20px",
              }}
            >
              Post Details
            </div>
          }
        >
          {loadingPostDetail ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              <Spin size="large" />
              <p
                style={{
                  marginTop: "16px",
                  color: "#6b7280",
                  fontSize: "16px",
                }}
              >
                Loading post details...
              </p>
            </div>
          ) : viewingPost ? (
            <div
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "4px",
              }}
            >
              {/* Header Info Section */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Post ID
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#343a40",
                      }}
                    >
                      #{viewingPost.postId}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Author
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#343a40",
                      }}
                    >
                      {viewingPost.user?.profileName || "Unknown"}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Post Type
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        background: "#e9ecef",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#495057",
                        textTransform: "capitalize",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      {viewingPost.postType}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6c757d",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Last Updated
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#343a40",
                      }}
                    >
                      {dayjs(viewingPost.updatedAt).format("DD/MM/YYYY")}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#6c757d",
                        marginTop: "2px",
                      }}
                    >
                      {dayjs(viewingPost.updatedAt).format("HH:mm")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "1px solid #e3e8f7",
                }}
              >
                <Text
                  strong
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Title
                </Text>
                <Title
                  level={3}
                  style={{
                    margin: "0",
                    color: "#1f2937",
                    fontSize: "24px",
                    fontWeight: "600",
                    lineHeight: "1.4",
                  }}
                >
                  {viewingPost.title}
                </Title>
              </div>

              {/* Image Section */}
              {viewingPost.imageUrl && (
                <div
                  style={{
                    background: "#ffffff",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    border: "1px solid #e3e8f7",
                  }}
                >
                  <Text
                    strong
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Image
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <Image
                      src={viewingPost.imageUrl}
                      alt="Post Image"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e3e8f7",
                }}
              >
                <Text
                  strong
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Content
                </Text>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Paragraph
                    style={{
                      margin: "0",
                      whiteSpace: "pre-wrap",
                      color: "#1f2937",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    {viewingPost.content}
                  </Paragraph>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              <Empty
                description="No post data available"
                style={{ color: "#6b7280" }}
              />
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default BlogManagement;
