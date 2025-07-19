import { Input, Select } from 'antd';

const FilterBar = ({
  searchPlaceholder = '',
  searchValue = '',
  onSearchChange = () => {},
  filters = [],
  style = {}
}) => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, ...style }}>
    {searchPlaceholder && (
      <Input.Search
        placeholder={searchPlaceholder}
        allowClear
        style={{ minWidth: 260, borderRadius: 12, boxShadow: '0 1px 4px rgba(99,102,241,0.08)' }}
        value={searchValue}
        onChange={onSearchChange}
      />
    )}
    {filters.map((filter, idx) => (
      <Select
        key={idx}
        showSearch
        allowClear
        placeholder={filter.placeholder}
        style={{ minWidth: 220, borderRadius: 12, boxShadow: '0 1px 4px rgba(99,102,241,0.08)' }}
        value={filter.value || undefined}
        onChange={filter.onChange}
        options={filter.options}
      />
    ))}
  </div>
);

export default FilterBar; 