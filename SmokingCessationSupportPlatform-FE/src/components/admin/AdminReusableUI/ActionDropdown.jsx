import { Dropdown, Menu, Button } from 'antd';

const ActionDropdown = ({ actions }) => {
  const menu = (
    <Menu>
      {actions.map((action) => (
        <Menu.Item
          key={action.key}
          onClick={action.onClick}
          danger={action.danger}
          style={action.style}
        >
          {action.label}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={["hover"]} placement="bottomLeft">
      <Button>Actions</Button>
    </Dropdown>
  );
};

export default ActionDropdown; 