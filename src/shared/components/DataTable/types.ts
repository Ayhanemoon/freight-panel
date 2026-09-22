import { ReactNode } from 'react';

export type DataTableRowId = string | number;

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  truncate?: boolean;
}

export interface DataTableAction<T> {
  key: string;
  label: string | ((row: T) => string);
  icon: ReactNode | ((row: T) => ReactNode);
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}
export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => DataTableRowId;

  loading?: boolean;
  emptyMessage?: string;

  selectable?: boolean;
  selectedRowIds?: DataTableRowId[];
  onSelectionChange?: (selectedRowIds: DataTableRowId[]) => void;

  actions?: DataTableAction<T>[];

  pagination?: DataTablePagination;
}