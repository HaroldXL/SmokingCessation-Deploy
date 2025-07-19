import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";
import "./makePlan.css";
import {
  Affix,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Radio,
  Row,
  Skeleton,
  message,
  notification,
} from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ClipboardPlus } from "lucide-react";

function MakePlan() {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedRadio, setSelectedRadio] = useState(1);
  const [triggerCategories, setTriggerCategories] = useState([]);
  const [strategyCategories, setStrategyCategories] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategiesLoading, setStrategiesLoading] = useState(true);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const currentDateTime = dayjs();

  const handleRadioChange = (e) => {
    setSelectedRadio(e.target.value);
    if (e.target.value === 1) {
      form.setFieldsValue({ quitDate: currentDateTime });
    }
  };

  const handleCreatePlan = async () => {
    if (!user) {
      notification.warning({
        message: "Login or Register to make your plan!",
        description:
          "Please register or login with your account to make your own quitting plan.",
        placement: "top",
        duration: 3,
      });
      return;
    }

    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      const smokingProfileData = {
        cigarettesPerDay: values.cigarettesPerDay,
        cigarettesPerPack: values.cigarettesPerPack,
        cigarettePackCost: values.pricePerPack,
        quitDate: values.quitDate.format("YYYY-MM-DD"),
      };

      await Promise.all([
        api.post("/user-smoking-profile/my", smokingProfileData),
        api.post("/user-triggers/bulk", values.selectedTriggers || []),
        api.post("/user-strategies/bulk", values.selectedStrategies || []),
        api.post("/reasons/user-reasons", values.selectedReasons || []),
      ]);

      message.success("Quit plan created successfully!");

      form.resetFields();
      navigate("/plan-detail");
    } catch (errorInfo) {
      console.log("Validation or API failed:", errorInfo);

      if (errorInfo.errorFields) {
        const errorFields = errorInfo.errorFields;
        if (errorFields && errorFields.length > 0) {
          message.error("Please fill in all required fields");
        }
      } else {
        console.error("API Error:", errorInfo);
        message.error("Failed to create plan. Please try again.");
      }
    }
  };

  useEffect(() => {
    const fetchStrategyCategories = async () => {
      try {
        setStrategiesLoading(true);
        const response = await api.get("strategies/categories");
        setStrategyCategories(response.data);
      } catch (error) {
        console.error("Error fetching strategy categories:", error);
      } finally {
        setStrategiesLoading(false);
      }
    };

    const fetchReasons = async () => {
      try {
        setReasonsLoading(true);
        const response = await api.get("reasons");
        const activeReasons = response.data.filter((reason) => reason.isActive);
        setReasons(activeReasons);
      } catch (error) {
        console.error("Error fetching reasons:", error);
      } finally {
        setReasonsLoading(false);
      }
    };

    const fetchTriggerCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("triggers/categories");
        setTriggerCategories(response.data);
      } catch (error) {
        console.error("Error fetching trigger categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyCategories();
    fetchReasons();
    fetchTriggerCategories();
  }, []);

  // Set initial form values
  useEffect(() => {
    form.setFieldsValue({
      quitDate: currentDateTime,
    });
  }, [form, currentDateTime]);

  return (
    <>
      <Affix offsetTop={0}>
        <Header />
      </Affix>
      <div className="wrapper">
        <div className="wrapper__title">
          <p>Make Your Quit Plan</p>
        </div>
        <Divider className="divider" />
        <div className="wrapper__content">
          <div className="wrapper__content-des">
            <h2>Introduction</h2>
            <p>
              Quitting all tobacco products is the best thing you can do for
              your health. Whether you smoke cigarettes, vape, or do both,
              creating a personalized quit plan makes it easier to stay on
              track, get through hard times, and quit for good.
            </p>
          </div>
          <Divider className="divider" />
          <Form
            form={form}
            validateTrigger={[]} // Disable automatic validation
            initialValues={{
              quitDate: currentDateTime,
            }}
          >
            <div className="wrapper__content-step">
              <h1>Step 1</h1>
              <h2 className="wrapper__content-step-title">
                Set Your Quit Date
              </h2>
              <p>
                Choose a date within the next two weeks to quit smoking. This
                gives you enough time to prepare but is close enough to keep you
                motivated.
              </p>
              <Radio.Group
                name="radiogroup"
                value={selectedRadio}
                onChange={handleRadioChange}
                options={[
                  { value: 1, label: "Today" },
                  { value: 2, label: "Choose date" },
                ]}
              />
              <div className="wrapper__content-step-datetimepicker">
                <Form.Item
                  name="quitDate"
                  rules={[{ required: true, message: "Quit date" }]}
                >
                  <DatePicker
                    size="large"
                    variant="filled"
                    format="DD-MM-YYYY"
                    className="wrapper__content-step-date"
                    needConfirm
                    disabled={selectedRadio === 1}
                    disabledDate={(current) => {
                      // Disable dates before today
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="wrapper__content-step">
              <h1>Step 2</h1>
              <h2 className="wrapper__content-step-title">
                What Is Smoking Costing You ?
              </h2>
              <p>
                Enter how many cigarettes you smoke and how much a pack of
                cigarettes costs. You'll find out how much money you can save by
                quitting.
              </p>
              <div className="wrapper__content-step-cost">
                <div className="wrapper__content-step-cost-item">
                  <h3>I smoke about</h3>
                  <Form.Item
                    className="wrapper__content-step-cost-input-item"
                    name="cigarettesPerDay"
                    rules={[{ required: true, message: "Cigarettes per day" }]}
                  >
                    <InputNumber
                      min={0}
                      variant="filled"
                      className="wrapper__content-step-cost-input"
                    />
                  </Form.Item>
                  <h3>cigarettes each day</h3>
                </div>
                <div className="wrapper__content-step-cost-item">
                  <h3>I spend about</h3>
                  <Form.Item
                    className="wrapper__content-step-cost-input-item"
                    name="pricePerPack"
                    rules={[{ required: true, message: "Price per pack" }]}
                  >
                    <InputNumber
                      className="wrapper__content-step-cost-input"
                      min={0}
                      variant="filled"
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value === null || value === void 0
                          ? void 0
                          : value.replace(/\$\s?|(,*)/g, "")
                      }
                    />
                  </Form.Item>
                  <h3>per pack of cigarettes</h3>
                </div>
                <div className="wrapper__content-step-cost-item">
                  <h3>A pack contains</h3>
                  <Form.Item
                    className="wrapper__content-step-cost-input-item"
                    name="cigarettesPerPack"
                    rules={[{ required: true, message: "Cigarettes per pack" }]}
                  >
                    <InputNumber
                      min={0}
                      variant="filled"
                      className="wrapper__content-step-cost-input"
                    />
                  </Form.Item>
                  <h3>cigarettes</h3>
                </div>
              </div>
            </div>
            <div className="wrapper__content-step">
              <h1>Step 3</h1>
              <h2 className="wrapper__content-step-title">
                Why Are You Quitting ?
              </h2>
              <p>
                Knowing your reasons for why you want to quit smoking can help
                you stay motivated and on track, especially in difficult
                moments.
              </p>
              {reasonsLoading ? (
                <Skeleton active />
              ) : (
                <Form.Item
                  name="selectedReasons"
                  rules={[{ required: true, message: "Reason for quitting" }]}
                >
                  <Checkbox.Group className="wrapper__content-step-reason">
                    <Row>
                      {reasons.map((reason) => (
                        <Col span={12} key={reason.reasonId}>
                          <Checkbox
                            className="wrapper__content-step-reason-checkbox"
                            value={reason.reasonId}
                          >
                            {reason.reasonText}
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              )}
            </div>

            <div className="wrapper__content-step">
              <h1>Step 4</h1>
              <h2 className="wrapper__content-step-title">
                Know Your Triggers
              </h2>
              <p>
                After you stop smoking, certain places, situations, and feelings
                can make it hard to stay smokefree. Use this list to find what
                makes you want to smoke. We'll give you strategies that will
                help you stay in control.
              </p>
              <div className="wrapper__content-step-triggers">
                {loading ? (
                  <Skeleton active />
                ) : (
                  <Form.Item
                    name="selectedTriggers"
                    rules={[{ required: true, message: "Smoking triggers" }]}
                  >
                    <Checkbox.Group>
                      {triggerCategories
                        .filter((category) => category.triggers.length > 0)
                        .map((category) => (
                          <Card
                            key={category.categoryId}
                            size="small"
                            className="wrapper__content-step-triggers-card"
                          >
                            <h2>{category.name}</h2>
                            <div className="wrapper__content-step-triggers-card-content">
                              {category.triggers.map((trigger) => (
                                <Checkbox
                                  key={trigger.triggerId}
                                  className="wrapper__content-step-reason-checkbox"
                                  value={trigger.triggerId}
                                >
                                  {trigger.name}
                                </Checkbox>
                              ))}
                            </div>
                          </Card>
                        ))}
                    </Checkbox.Group>
                  </Form.Item>
                )}
              </div>
            </div>

            <div className="wrapper__content-step">
              <h1>Step 5</h1>
              <h2 className="wrapper__content-step-title">
                Set Yourself Up for Success
              </h2>
              <p>
                Choose strategies and tools to help you quit. When preparing to
                quit, set yourself up for success by thinking about who in your
                life you will reach out to for support, how you will get expert
                help, and how you will distract yourself when you have the urge
                to smoke. This will keep you on track and boost your chances of
                quitting for good.
              </p>
              <div className="wrapper__content-step-triggers">
                {strategiesLoading ? (
                  <Skeleton active />
                ) : (
                  <Form.Item
                    name="selectedStrategies"
                    rules={[{ required: true, message: "Success strategies" }]}
                  >
                    <Checkbox.Group>
                      {strategyCategories
                        .filter((category) => category.strategies.length > 0)
                        .map((category) => (
                          <Card
                            key={category.categoryId}
                            size="small"
                            className="wrapper__content-step-triggers-card"
                          >
                            <h2>{category.name}</h2>
                            <div className="wrapper__content-step-triggers-card-content">
                              {category.strategies.map((strategy) => (
                                <Checkbox
                                  key={strategy.strategyId}
                                  className="wrapper__content-step-reason-checkbox"
                                  value={strategy.strategyId}
                                >
                                  {strategy.name}
                                </Checkbox>
                              ))}
                            </div>
                          </Card>
                        ))}
                    </Checkbox.Group>
                  </Form.Item>
                )}
              </div>
            </div>
            <div className="wrapper__create-btn-container">
              <Button
                type="primary"
                className="wrapper__create-btn"
                onClick={handleCreatePlan}
              >
                <ClipboardPlus /> Create Plan
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MakePlan;
