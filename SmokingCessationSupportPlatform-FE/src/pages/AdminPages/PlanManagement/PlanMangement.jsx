import { useState, useEffect } from "react";
import {
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Dropdown,
  Collapse,
  Tag,
  Row,
  Col,
  Typography,
  message,
  Spin,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminLayout from "../../../components/layout/AdminLayout.jsx";
import {
  reasonService,
  triggerService,
  strategyService,
} from "../../../services/planService.js";
import "./PlanManagement.css";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

function PlanManagement() {
  const [reasons, setReasons] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [currentModalType, setCurrentModalType] = useState("triggers");
  const [loading, setLoading] = useState(false);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const data = await reasonService.getAllReasons();
      // Map API data to match our component structure
      const mappedReasons = data.map((reason) => ({
        id: reason.reasonId,
        title: reason.reasonText,
        isActive: reason.isActive,
      }));
      setReasons(mappedReasons);
    } catch (error) {
      console.error("Failed to fetch reasons:", error);
      message.error("Failed to fetch reasons");
    } finally {
      setLoading(false);
    }
  };

  const fetchTriggers = async () => {
    try {
      setTriggersLoading(true);
      const data = await triggerService.getAllTriggerCategories();
      // Map API data to match our component structure
      const mappedTriggers = data.map((category) => ({
        id: category.categoryId,
        name: category.name,
        items: category.triggers.map((trigger) => ({
          id: trigger.triggerId,
          title: trigger.name,
        })),
      }));
      setTriggers(mappedTriggers);
    } catch (error) {
      console.error("Failed to fetch triggers:", error);
      message.error("Failed to fetch triggers");
    } finally {
      setTriggersLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      setStrategiesLoading(true);
      const data = await strategyService.getAllStrategyCategories();
      // Map API data to match our component structure
      const mappedStrategies = data.map((category) => ({
        id: category.categoryId,
        name: category.name,
        items: category.strategies.map((strategy) => ({
          id: strategy.strategyId,
          title: strategy.name,
        })),
      }));
      setStrategies(mappedStrategies);
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
      message.error("Failed to fetch strategies");
    } finally {
      setStrategiesLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons();
    fetchTriggers();
    fetchStrategies();
  }, []);

  const handleReasonAction = (action, reason = null) => {
    if (action === "add") {
      setEditingReason(null);
      form.resetFields();
      setIsReasonModalVisible(true);
    } else if (action === "edit") {
      setEditingReason(reason);
      form.setFieldsValue({
        title: reason.title,
      });
      setIsReasonModalVisible(true);
    } else if (action === "delete") {
      Modal.confirm({
        title: "Are you sure you want to delete this reason?",
        content: "This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await reasonService.deleteReason(reason.id);
            message.success("Reason deleted successfully!");
            fetchReasons(); // Refresh the list
          } catch {
            message.error("Failed to delete reason");
          }
        },
      });
    }
  };

  const handleReasonSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingReason) {
        // Update existing reason
        await reasonService.updateReason(editingReason.id, {
          reasonText: values.title,
          isActive: true,
        });
        message.success("Reason updated successfully!");
      } else {
        // Create new reason
        await reasonService.createReason({
          reasonText: values.title,
        });
        message.success("Reason added successfully!");
      }

      setIsReasonModalVisible(false);
      form.resetFields();
      setEditingReason(null);
      fetchReasons(); // Refresh the list
    } catch (error) {
      console.error("Failed to save reason:", error);
      message.error(`Failed to ${editingReason ? "update" : "add"} reason`);
    }
  };

  const handleCategoryAction = (action, type, category = null) => {
    if (action === "add") {
      setCurrentModalType(type);
      setEditingCategory(null);
      categoryForm.resetFields();
      setIsCategoryModalVisible(true);
    } else if (action === "edit") {
      setCurrentModalType(type);
      setEditingCategory(category);
      categoryForm.setFieldsValue({
        name: category.name,
      });
      setIsCategoryModalVisible(true);
    } else if (action === "delete") {
      Modal.confirm({
        title: "Are you sure you want to delete this category?",
        content:
          "This action cannot be undone and will delete all items in this category.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            if (type === "triggers") {
              await triggerService.deleteTriggerCategory(category.id);
              message.success("Category deleted successfully!");
              fetchTriggers();
            } else {
              await strategyService.deleteStrategyCategory(category.id);
              message.success("Category deleted successfully!");
              fetchStrategies();
            }
          } catch {
            message.error("Failed to delete category");
          }
        },
      });
    }
  };

  const handleCategorySubmit = async () => {
    try {
      const values = await categoryForm.validateFields();

      if (editingCategory) {
        // Update existing category
        if (currentModalType === "triggers") {
          await triggerService.updateTriggerCategory(editingCategory.id, {
            name: values.name,
          });
          message.success("Category updated successfully!");
          fetchTriggers();
        } else {
          await strategyService.updateStrategyCategory(editingCategory.id, {
            name: values.name,
          });
          message.success("Category updated successfully!");
          fetchStrategies();
        }
      } else {
        // Create new category
        if (currentModalType === "triggers") {
          await triggerService.createTriggerCategory({
            name: values.name,
          });
          message.success("Category added successfully!");
          fetchTriggers();
        } else {
          await strategyService.createStrategyCategory({
            name: values.name,
          });
          message.success("Category added successfully!");
          fetchStrategies();
        }
      }

      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to save category:", error);
      message.error(`Failed to ${editingCategory ? "update" : "add"} category`);
    }
  };

  const handleItemAction = (action, type, item = null, categoryId = null) => {
    if (action === "add") {
      setCurrentModalType(type);
      setEditingItem({ categoryId });
      itemForm.resetFields();
      setIsItemModalVisible(true);
    } else if (action === "edit") {
      setCurrentModalType(type);
      setEditingItem({ ...item, categoryId });
      itemForm.setFieldsValue({
        title: item.title,
      });
      setIsItemModalVisible(true);
    } else if (action === "delete") {
      Modal.confirm({
        title: `Are you sure you want to delete this ${
          type === "triggers" ? "trigger" : "strategy"
        }?`,
        content: "This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            if (type === "triggers") {
              await triggerService.deleteTrigger(item.id);
              message.success("Trigger deleted successfully!");
              fetchTriggers();
            } else {
              await strategyService.deleteStrategy(item.id);
              message.success("Strategy deleted successfully!");
              fetchStrategies();
            }
          } catch {
            message.error(
              `Failed to delete ${type === "triggers" ? "trigger" : "strategy"}`
            );
          }
        },
      });
    }
  };

  const handleItemSubmit = async () => {
    try {
      const values = await itemForm.validateFields();

      if (editingItem.id) {
        // Update existing item
        if (currentModalType === "triggers") {
          await triggerService.updateTrigger(editingItem.id, {
            name: values.title,
            categoryId: editingItem.categoryId,
          });
          message.success("Trigger updated successfully!");
          fetchTriggers();
        } else {
          await strategyService.updateStrategy(editingItem.id, {
            name: values.title,
            categoryId: editingItem.categoryId,
          });
          message.success("Strategy updated successfully!");
          fetchStrategies();
        }
      } else {
        // Create new item
        if (currentModalType === "triggers") {
          await triggerService.createTrigger({
            name: values.title,
            categoryId: editingItem.categoryId,
          });
          message.success("Trigger added successfully!");
          fetchTriggers();
        } else {
          await strategyService.createStrategy({
            name: values.title,
            categoryId: editingItem.categoryId,
          });
          message.success("Strategy added successfully!");
          fetchStrategies();
        }
      }

      setIsItemModalVisible(false);
      itemForm.resetFields();
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
      message.error(
        `Failed to ${editingItem.id ? "update" : "add"} ${
          currentModalType === "triggers" ? "trigger" : "strategy"
        }`
      );
    }
  };

  const getActionMenuItems = (
    type,
    item = null,
    categoryId = null,
    itemType = null
  ) => [
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: () => {
        if (type === "reason") handleReasonAction("edit", item);
        else if (type === "category") {
          const category =
            itemType === "triggers"
              ? triggers.find((t) => t.id === categoryId)
              : strategies.find((s) => s.id === categoryId);
          handleCategoryAction("edit", itemType, category);
        } else handleItemAction("edit", itemType, item, categoryId);
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        if (type === "reason") handleReasonAction("delete", item);
        else if (type === "category") {
          const category =
            itemType === "triggers"
              ? triggers.find((t) => t.id === categoryId)
              : strategies.find((s) => s.id === categoryId);
          handleCategoryAction("delete", itemType, category);
        } else handleItemAction("delete", itemType, item, categoryId);
      },
    },
  ];

  const ReasonCard = ({ reason }) => (
    <div className="reason-box">
      <div className="reason-header">
        <span className="reason-title">{reason.title}</span>
        <Dropdown
          menu={{ items: getActionMenuItems("reason", reason) }}
          trigger={["click"]}
        >
          <Button type="text">⋯</Button>
        </Dropdown>
      </div>
    </div>
  );

  const CategorySection = ({ type, data, loading }) => (
    <div className="category-section">
      <Spin spinning={loading}>
        <Collapse className="category-collapse">
          {data.map((category) => (
            <Panel
              key={category.id}
              header={
                <div className="category-header">
                  <div className="category-info">
                    <Title level={4} className="category-title">
                      {category.name}
                    </Title>
                  </div>
                  <Tag className="category-count">
                    {category.items.length} items
                  </Tag>
                </div>
              }
              extra={
                <Dropdown
                  menu={{
                    items: getActionMenuItems(
                      "category",
                      null,
                      category.id,
                      type
                    ),
                  }}
                  trigger={["click"]}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button type="text">⋯</Button>
                </Dropdown>
              }
            >
              <div className="category-items">
                {category.items.map((item) => (
                  <div key={item.id} className="category-item">
                    <div className="item-content">
                      <span className="item-title">{item.title}</span>
                    </div>
                    <Dropdown
                      menu={{
                        items: getActionMenuItems(
                          "item",
                          item,
                          category.id,
                          type
                        ),
                      }}
                      trigger={["click"]}
                    >
                      <Button type="text" className="item-action">
                        ⋯
                      </Button>
                    </Dropdown>
                  </div>
                ))}
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  className="add-item-btn"
                  onClick={() =>
                    handleItemAction("add", type, null, category.id)
                  }
                >
                  Add New {type === "triggers" ? "Trigger" : "Strategy"}
                </Button>
              </div>
            </Panel>
          ))}
        </Collapse>
      </Spin>
    </div>
  );

  return (
    <AdminLayout title="Plan Management">
      <div className="plan-management">
        <h2>Plan Management</h2>

        <div className="plan-content">
          <Tabs defaultActiveKey="reasons" className="plan-tabs">
            <TabPane tab={<span>Reasons</span>} key="reasons">
              <div className="tab-content">
                <div className="tab-header">
                  <div>
                    <Title level={3}>Quit Smoking Reasons</Title>
                    <Paragraph>
                      Motivational reasons to help users stay committed to
                      quitting
                    </Paragraph>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleReasonAction("add")}
                  >
                    Add Reason
                  </Button>
                </div>

                <Spin spinning={loading}>
                  <Row gutter={[16, 16]} className="reasons-grid">
                    {reasons.map((reason) => (
                      <Col xs={24} md={12} key={reason.id}>
                        <ReasonCard reason={reason} />
                      </Col>
                    ))}
                  </Row>
                </Spin>
              </div>
            </TabPane>

            <TabPane tab={<span>Triggers</span>} key="triggers">
              <div className="tab-content">
                <div className="tab-header">
                  <div>
                    <Title level={3}>Smoking Triggers</Title>
                    <Paragraph>
                      Identify and categorize situations that trigger smoking
                      urges
                    </Paragraph>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleCategoryAction("add", "triggers")}
                  >
                    Add New Category
                  </Button>
                </div>

                <CategorySection
                  type="triggers"
                  data={triggers}
                  loading={triggersLoading}
                />
              </div>
            </TabPane>

            <TabPane tab={<span>Strategies</span>} key="strategies">
              <div className="tab-content">
                <div className="tab-header">
                  <div>
                    <Title level={3}>Smoking Strategies</Title>
                    <Paragraph>
                      Effective strategies to overcome smoking urges and
                      maintain quit goals
                    </Paragraph>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleCategoryAction("add", "strategies")}
                  >
                    Add New Category
                  </Button>
                </div>

                <CategorySection
                  type="strategies"
                  data={strategies}
                  loading={strategiesLoading}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>

        {/* Modals */}
        <Modal
          title={editingReason ? "Edit Reason" : "Add New Reason"}
          open={isReasonModalVisible}
          onCancel={() => {
            setIsReasonModalVisible(false);
            setEditingReason(null);
            form.resetFields();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsReasonModalVisible(false);
                setEditingReason(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleReasonSubmit}>
              {editingReason ? "Update Reason" : "Add Reason"}
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter reason title" }]}
            >
              <Input placeholder="Enter reason title..." />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`${editingCategory ? "Edit" : "Add New"} ${
            currentModalType === "triggers" ? "Trigger" : "Strategy"
          } Category`}
          open={isCategoryModalVisible}
          onCancel={() => {
            setIsCategoryModalVisible(false);
            setEditingCategory(null);
            categoryForm.resetFields();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsCategoryModalVisible(false);
                setEditingCategory(null);
                categoryForm.resetFields();
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleCategorySubmit}>
              {editingCategory ? "Update Category" : "Add Category"}
            </Button>,
          ]}
        >
          <Form form={categoryForm} layout="vertical">
            <Form.Item
              name="name"
              label="Category Name"
              rules={[
                { required: true, message: "Please enter category name" },
              ]}
            >
              <Input placeholder="Enter category name..." />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`${editingItem?.id ? "Edit" : "Add New"} ${
            currentModalType === "triggers" ? "Trigger" : "Strategy"
          }`}
          open={isItemModalVisible}
          onCancel={() => {
            setIsItemModalVisible(false);
            setEditingItem(null);
            itemForm.resetFields();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsItemModalVisible(false);
                setEditingItem(null);
                itemForm.resetFields();
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleItemSubmit}>
              {editingItem?.id ? "Update" : "Add"}{" "}
              {currentModalType === "triggers" ? "Trigger" : "Strategy"}
            </Button>,
          ]}
        >
          <Form form={itemForm} layout="vertical">
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Enter title..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default PlanManagement;
