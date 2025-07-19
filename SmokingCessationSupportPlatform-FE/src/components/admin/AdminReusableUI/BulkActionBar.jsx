import { Select } from 'antd';

const BulkActionBar = ({ selectedCount, onAction, actions, style = {} }) => (
  <div style={{
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: '#f9fbff',
    borderRadius: 12,
    padding: '12px 20px',
    boxShadow: '0 1px 4px rgba(99,102,241,0.06)',
    ...style
  }}>
    <span style={{ fontWeight: 500 }}>{selectedCount} selected</span>
    <Select
      placeholder='Bulk Actions'
      style={{ minWidth: 160 }}
      onChange={onAction}
      options={actions}
    />
  </div>
);

export default BulkActionBar; 