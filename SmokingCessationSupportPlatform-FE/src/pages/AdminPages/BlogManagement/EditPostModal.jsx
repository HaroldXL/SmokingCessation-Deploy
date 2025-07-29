import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { blogService } from "../../../services/blogService";
import uploadFile from "../../../store/utils/file";

const { TextArea } = Input;

const EditPostModal = ({ post, isOpen, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Update form when post changes
  useEffect(() => {
    if (post && isOpen) {
      form.setFieldsValue({
        title: post.title || "",
        content: post.content || "",
        postType: post.postType || "other",
        status: post.status || false,
      });

      // Set existing image in fileList if available
      if (post.imageUrl) {
        setFileList([
          {
            uid: "-1",
            name: "current-image",
            status: "done",
            url: post.imageUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [post, isOpen, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Handle image upload if there's a new file
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const uploadedImageUrl = await uploadFile(fileList[0].originFileObj);
          values.imageUrl = uploadedImageUrl;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          message.error("Failed to upload image. Please try again.");
          return;
        }
      } else if (fileList.length > 0 && fileList[0].url) {
        // Keep existing image
        values.imageUrl = fileList[0].url;
      }

      // Call API to update post
      await blogService.updatePost(post.id, values);
      message.success("Post updated successfully!");

      // Call onSave callback to refresh data
      if (onSave) onSave();
      handleClose();
    } catch (error) {
      console.error("Error updating post:", error);
      message.error("Failed to update post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
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
    <Modal
      title="Edit Post"
      open={isOpen}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Update Post
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: "",
          content: "",
          postType: "other",
          status: false,
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: "Please enter the title of post.",
            },
          ]}
        >
          <Input placeholder="Enter the post's title" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="postType"
          rules={[
            {
              required: true,
              message: "Please select the type of post.",
            },
          ]}
        >
          <Select
            allowClear
            placeholder="Select the post's category"
            options={[
              { value: "tips", label: "TIPS" },
              { value: "stories", label: "STORIES" },
              { value: "other", label: "OTHER" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Content"
          name="content"
          rules={[
            {
              required: true,
              message: "Please enter the content of post.",
            },
          ]}
        >
          <TextArea
            placeholder="Enter the post's content"
            autoSize={{ minRows: 6, maxRows: 10 }}
          />
        </Form.Item>

        <Form.Item label="Image" name="imageUrl">
          <Upload
            listType="picture"
            maxCount={1}
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
          >
            <Button icon={<UploadOutlined />}>Upload Image (Max 1)</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Status" name="status" valuePropName="checked">
          <Select
            placeholder="Select status"
            options={[
              { value: false, label: "Not Published" },
              { value: true, label: "Published" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPostModal;
