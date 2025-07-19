import React, { useState, useEffect } from "react";
import styles from "./EditPostModal.module.css";

const EditPostModal = ({ post, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: false,
    author: "",
  });

  const [loading, setLoading] = useState(false);

  // Update form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        status: post.status || false,
        author: post.author || "",
      });
    }
  }, [post]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "select-one" && name === "status" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      // Call the onSave callback with updated data
      await onSave({
        ...post,
        ...formData,
        updated: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      alert("Failed to save post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        status: post.status || false,
        author: post.author || "",
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <h2>Edit Post</h2>
          <button
            className={styles["close-btn"]}
            onClick={handleCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles["edit-form"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
              required
              disabled={loading}
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="author">Author</label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter author name"
              disabled={loading}
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Enter post content"
              rows="6"
              disabled={loading}
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status.toString()}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="false">Not Published</option>
              <option value="true">Published</option>
            </select>
          </div>

          <div className={styles["modal-actions"]}>
            <button
              type="submit"
              className={styles["save-btn"]}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className={styles["cancel-btn"]}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
