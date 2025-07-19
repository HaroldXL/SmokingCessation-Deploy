import React from 'react'
import './ReusableTable.css'

const getSortIcon = (order) => {
  if (!order) return <span className="sort-icon">⇅</span>;
  if (order === 'asc') return <span className="sort-icon">↑</span>;
  return <span className="sort-icon">↓</span>;
};

const ReusableTable = ({ columns, data, pagination, onPageChange, onSort, sortConfig, selectedRowKeys = [], onSelectAll, onSelectRow }) => (
  <div className="reusable-table-wrapper">
    <table className="reusable-table">
      <colgroup>
        <col className="col-checkbox" />
        {columns.map((col) => (
          <col key={col.key || col.dataIndex} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="th-checkbox">
            <input
              type="checkbox"
              checked={data.length > 0 && selectedRowKeys.length === data.length}
              ref={el => {
                if (el) el.indeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length;
              }}
              onChange={e => onSelectAll && onSelectAll(e.target.checked)}
            />
          </th>
          {columns.map((col, idx) => (
            <th
              key={col.key || col.dataIndex}
              className={
                (idx === 0 ? 'th-first ' : '') +
                (idx === columns.length - 1 ? 'th-last ' : '') +
                (col.sortable ? 'th-sortable ' : '') +
                (sortConfig && sortConfig.key === (col.key || col.dataIndex) ? 'th-sorted' : '')
              }
              onClick={col.sortable ? () => onSort(col.key || col.dataIndex) : undefined}
              style={{ cursor: col.sortable ? 'pointer' : 'default' }}
            >
              {col.title}
              {col.sortable && getSortIcon(sortConfig && sortConfig.key === (col.key || col.dataIndex) ? sortConfig.order : null)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={row.id || rowIdx} className="reusable-table-row">
            <td className="td-checkbox">
              <input
                type="checkbox"
                checked={selectedRowKeys.includes(row.id)}
                onChange={e => onSelectRow && onSelectRow(row.id, e.target.checked)}
              />
            </td>
            {columns.map((col, colIdx) => (
              <td
                key={col.key || col.dataIndex}
                className={
                  colIdx === 0 ? 'td-first' : colIdx === columns.length - 1 ? 'td-last' : ''
                }
              >
                {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {pagination && (
      <div className="reusable-table-pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          disabled={pagination.page === 1}
        >
          Prev
        </button>
        <span className="pagination-info">
          Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.page + 1))}
          disabled={pagination.page === Math.ceil(pagination.total / pagination.pageSize)}
        >
          Next
        </button>
      </div>
    )}
  </div>
)

export default ReusableTable