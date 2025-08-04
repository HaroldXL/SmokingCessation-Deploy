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
  questionService,
  supportMeasureService,
} from "../../../services/planService.js";
import "./PlanManagement.css";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

function PlanManagement() {
  const [reasons, setReasons] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [supportMeasures, setSupportMeasures] = useState([]);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isSupportMeasureModalVisible, setIsSupportMeasureModalVisible] =
    useState(false);
  const [currentModalType, setCurrentModalType] = useState("triggers");
  const [loading, setLoading] = useState(false);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [supportMeasuresLoading, setSupportMeasuresLoading] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSupportMeasure, setEditingSupportMeasure] = useState(null);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [supportMeasureForm] = Form.useForm();

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

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const data = await questionService.getAllQuestions();

      // Get answers for each question
      const questionsWithAnswers = await Promise.all(
        data.map(async (question) => {
          try {
            const answers = await questionService.getQuestionAnswers(
              question.questionId
            );
            return {
              id: question.questionId,
              title: question.questionText,
              items: answers.map((answer) => ({
                id: answer.answerId,
                title: answer.answerText,
                points: answer.points,
              })),
            };
          } catch (error) {
            console.error(
              `Failed to fetch answers for question ${question.questionId}:`,
              error
            );
            return {
              id: question.questionId,
              title: question.questionText,
              items: [],
            };
          }
        })
      );

      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      message.error("Failed to fetch questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons();
    fetchTriggers();
    fetchQuestions();
    fetchSupportMeasures();
  }, []);

  const fetchSupportMeasures = async () => {
    try {
      setSupportMeasuresLoading(true);
      const data = await supportMeasureService.getAllSupportMeasures();
      // Map API data to match our component structure
      const mappedSupportMeasures = data.map((measure) => ({
        id: measure.supportMeasuresId,
        title: measure.supportMeasures,
        description: measure.description || "", // Default empty if no description
      }));
      setSupportMeasures(mappedSupportMeasures);
    } catch (error) {
      console.error("Failed to fetch support measures:", error);
      message.error("Failed to fetch support measures");
    } finally {
      setSupportMeasuresLoading(false);
    }
  };

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

  const handleSupportMeasureAction = (action, supportMeasure = null) => {
    if (action === "add") {
      setEditingSupportMeasure(null);
      supportMeasureForm.resetFields();
      setIsSupportMeasureModalVisible(true);
    } else if (action === "edit") {
      setEditingSupportMeasure(supportMeasure);
      supportMeasureForm.setFieldsValue({
        title: supportMeasure.title,
      });
      setIsSupportMeasureModalVisible(true);
    } else if (action === "delete") {
      Modal.confirm({
        title: "Are you sure you want to delete this support measure?",
        content: "This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await supportMeasureService.deleteSupportMeasure(supportMeasure.id);
            message.success("Support measure deleted successfully!");
            fetchSupportMeasures();
          } catch {
            message.error("Failed to delete support measure");
          }
        },
      });
    }
  };

  const handleSupportMeasureSubmit = async () => {
    try {
      const values = await supportMeasureForm.validateFields();

      if (editingSupportMeasure) {
        // Update existing support measure
        await supportMeasureService.updateSupportMeasure(
          editingSupportMeasure.id,
          {
            supportMeasures: values.title,
          }
        );
        message.success("Support measure updated successfully!");
      } else {
        // Create new support measure
        await supportMeasureService.createSupportMeasure({
          supportMeasures: values.title,
        });
        message.success("Support measure added successfully!");
      }

      fetchSupportMeasures();
      setIsSupportMeasureModalVisible(false);
      supportMeasureForm.resetFields();
      setEditingSupportMeasure(null);
    } catch (error) {
      console.error("Failed to save support measure:", error);
      message.error(
        `Failed to ${editingSupportMeasure ? "update" : "add"} support measure`
      );
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
        name: category.name || category.title, // Questions use title, categories use name
      });
      setIsCategoryModalVisible(true);
    } else if (action === "delete") {
      const itemName = type === "triggers" ? "category" : "question";
      Modal.confirm({
        title: `Are you sure you want to delete this ${itemName}?`,
        content:
          type === "triggers"
            ? "This action cannot be undone and will delete all items in this category."
            : "This action cannot be undone and will delete all answers for this question.",
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
              await questionService.deleteQuestion(category.id);
              message.success("Question deleted successfully!");
              fetchQuestions();
            }
          } catch {
            message.error(`Failed to delete ${itemName}`);
          }
        },
      });
    }
  };

  const handleCategorySubmit = async () => {
    try {
      const values = await categoryForm.validateFields();

      if (editingCategory) {
        // Update existing category/question
        if (currentModalType === "triggers") {
          await triggerService.updateTriggerCategory(editingCategory.id, {
            name: values.name,
          });
          message.success("Category updated successfully!");
          fetchTriggers();
        } else {
          await questionService.updateQuestion(editingCategory.id, {
            questionText: values.name,
          });
          message.success("Question updated successfully!");
          fetchQuestions();
        }
      } else {
        // Create new category/question
        if (currentModalType === "triggers") {
          await triggerService.createTriggerCategory({
            name: values.name,
          });
          message.success("Category added successfully!");
          fetchTriggers();
        } else {
          await questionService.createQuestion({
            questionText: values.name,
          });
          message.success("Question added successfully!");
          fetchQuestions();
        }
      }

      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to save category/question:", error);
      const itemType =
        currentModalType === "triggers" ? "category" : "question";
      message.error(
        `Failed to ${editingCategory ? "update" : "add"} ${itemType}`
      );
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
        points: item.points, // For answers only
      });
      setIsItemModalVisible(true);
    } else if (action === "delete") {
      const itemTypeName = type === "triggers" ? "trigger" : "answer";
      Modal.confirm({
        title: `Are you sure you want to delete this ${itemTypeName}?`,
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
              await questionService.deleteAnswer(item.id);
              message.success("Answer deleted successfully!");
              fetchQuestions();
            }
          } catch {
            message.error(`Failed to delete ${itemTypeName}`);
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
          await questionService.updateAnswer(editingItem.id, {
            answerText: values.title,
            points: values.points,
          });
          message.success("Answer updated successfully!");
          fetchQuestions();
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
          await questionService.createAnswer(editingItem.categoryId, {
            answerText: values.title,
            points: values.points,
          });
          message.success("Answer added successfully!");
          fetchQuestions();
        }
      }

      setIsItemModalVisible(false);
      itemForm.resetFields();
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
      const itemType = currentModalType === "triggers" ? "trigger" : "answer";
      message.error(
        `Failed to ${editingItem.id ? "update" : "add"} ${itemType}`
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
        else if (type === "supportMeasure")
          handleSupportMeasureAction("edit", item);
        else if (type === "category") {
          const category =
            itemType === "triggers"
              ? triggers.find((t) => t.id === categoryId)
              : questions.find((q) => q.id === categoryId);
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
        else if (type === "supportMeasure")
          handleSupportMeasureAction("delete", item);
        else if (type === "category") {
          const category =
            itemType === "triggers"
              ? triggers.find((t) => t.id === categoryId)
              : questions.find((q) => q.id === categoryId);
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

  const SupportMeasureCard = ({ supportMeasure }) => (
    <div className="reason-box">
      <div className="reason-header">
        <span className="reason-title">{supportMeasure.title}</span>
        <Dropdown
          menu={{ items: getActionMenuItems("supportMeasure", supportMeasure) }}
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
                      {category.name || category.title}
                    </Title>
                  </div>
                  <Tag className="category-count">
                    {category.items.length}{" "}
                    {type === "questions" ? "answers" : "items"}
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
                      {type === "questions" && item.points !== undefined && (
                        <span className="item-points">
                          Points: {item.points}
                        </span>
                      )}
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
                  Add New {type === "triggers" ? "Trigger" : "Answer"}
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

            <TabPane tab={<span>Questions</span>} key="questions">
              <div className="tab-content">
                <div className="tab-header">
                  <div>
                    <Title level={3}>Addiction Assessment Questions</Title>
                    <Paragraph>
                      Manage addiction assessment questions and their answer
                      options. Questions help evaluate user's dependency level.
                    </Paragraph>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleCategoryAction("add", "questions")}
                  >
                    Add New Question
                  </Button>
                </div>

                <CategorySection
                  type="questions"
                  data={questions}
                  loading={questionsLoading}
                />
              </div>
            </TabPane>

            <TabPane tab={<span>Support Measures</span>} key="supportMeasures">
              <div className="tab-content">
                <div className="tab-header">
                  <div>
                    <Title level={3}>Support Measures</Title>
                    <Paragraph>
                      Manage support measures that help users maintain their
                      quit journey and cope with challenges.
                    </Paragraph>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleSupportMeasureAction("add")}
                  >
                    Add Support Measure
                  </Button>
                </div>

                <Spin spinning={supportMeasuresLoading}>
                  <Row gutter={[16, 16]} className="reasons-grid">
                    {supportMeasures.map((supportMeasure) => (
                      <Col xs={24} md={12} key={supportMeasure.id}>
                        <SupportMeasureCard supportMeasure={supportMeasure} />
                      </Col>
                    ))}
                  </Row>
                </Spin>
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
            currentModalType === "triggers" ? "Trigger Category" : "Question"
          }`}
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
              {editingCategory
                ? `Update ${
                    currentModalType === "triggers" ? "Category" : "Question"
                  }`
                : `Add ${
                    currentModalType === "triggers" ? "Category" : "Question"
                  }`}
            </Button>,
          ]}
        >
          <Form form={categoryForm} layout="vertical">
            <Form.Item
              name="name"
              label={
                currentModalType === "triggers"
                  ? "Category Name"
                  : "Question Text"
              }
              rules={[
                {
                  required: true,
                  message: `Please enter ${
                    currentModalType === "triggers"
                      ? "category name"
                      : "question text"
                  }`,
                },
              ]}
            >
              <Input
                placeholder={`Enter ${
                  currentModalType === "triggers"
                    ? "category name"
                    : "question text"
                }...`}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`${editingItem?.id ? "Edit" : "Add New"} ${
            currentModalType === "triggers" ? "Trigger" : "Answer"
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
              {currentModalType === "triggers" ? "Trigger" : "Answer"}
            </Button>,
          ]}
        >
          <Form form={itemForm} layout="vertical">
            <Form.Item
              name="title"
              label={
                currentModalType === "triggers" ? "Trigger Name" : "Answer Text"
              }
              rules={[
                {
                  required: true,
                  message: `Please enter ${
                    currentModalType === "triggers"
                      ? "trigger name"
                      : "answer text"
                  }`,
                },
              ]}
            >
              <Input
                placeholder={`Enter ${
                  currentModalType === "triggers"
                    ? "trigger name"
                    : "answer text"
                }...`}
              />
            </Form.Item>
            {currentModalType === "questions" && (
              <Form.Item
                name="points"
                label="Points"
                rules={[
                  {
                    required: true,
                    message: "Please enter points for this answer",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Enter points (e.g. 0, 1, 2, 3)..."
                />
              </Form.Item>
            )}
          </Form>
        </Modal>

        <Modal
          title={
            editingSupportMeasure
              ? "Edit Support Measure"
              : "Add New Support Measure"
          }
          open={isSupportMeasureModalVisible}
          onCancel={() => {
            setIsSupportMeasureModalVisible(false);
            setEditingSupportMeasure(null);
            supportMeasureForm.resetFields();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsSupportMeasureModalVisible(false);
                setEditingSupportMeasure(null);
                supportMeasureForm.resetFields();
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleSupportMeasureSubmit}
            >
              {editingSupportMeasure
                ? "Update Support Measure"
                : "Add Support Measure"}
            </Button>,
          ]}
        >
          <Form form={supportMeasureForm} layout="vertical">
            <Form.Item
              name="title"
              label="Support Measure"
              rules={[
                { required: true, message: "Please enter support measure" },
              ]}
            >
              <Input placeholder="Enter support measure..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default PlanManagement;
