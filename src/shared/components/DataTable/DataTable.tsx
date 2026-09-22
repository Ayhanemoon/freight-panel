import React from 'react';
import {
  Checkbox,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  DataTableAction,
  DataTableColumn,
  DataTableProps,
  DataTableRowId,
} from './types';

import { convertToPersianDigits } from 'shared/utils/number';

import styles from './DataTable.module.scss';

const DataTable = <T,>({
  rows,
  columns,
  getRowId,
  loading = false,
  emptyMessage = 'رکوردی یافت نشد',
  selectable = false,
  selectedRowIds = [],
  onSelectionChange,
  actions = [],
  pagination,
}: DataTableProps<T>) => {
  const selectableRows = selectable && Boolean(onSelectionChange);

  const visibleRows = rows;

  const rowIds = visibleRows.map(getRowId);

  const selectedSet = new Set(selectedRowIds);

  const selectedVisibleRows = rowIds.filter((id) => selectedSet.has(id));

  const allVisibleSelected =
    rowIds.length > 0 &&
    selectedVisibleRows.length === rowIds.length;

  const someVisibleSelected =
    selectedVisibleRows.length > 0 &&
    selectedVisibleRows.length < rowIds.length;

  const handleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!onSelectionChange) {
      return;
    }

    if (event.target.checked) {
      const nextSelectedIds = Array.from(
        new Set([...selectedRowIds, ...rowIds])
      );

      onSelectionChange(nextSelectedIds);
      return;
    }

    const visibleIdSet = new Set(rowIds);

    onSelectionChange(
      selectedRowIds.filter((id) => !visibleIdSet.has(id))
    );
  };

  const handleSelectRow = (
    rowId: DataTableRowId,
    checked: boolean
  ) => {
    if (!onSelectionChange) {
      return;
    }

    if (checked) {
      if (selectedSet.has(rowId)) {
        return;
      }

      onSelectionChange([...selectedRowIds, rowId]);
      return;
    }

    onSelectionChange(
      selectedRowIds.filter((id) => id !== rowId)
    );
  };

  const renderCellValue = (
    row: T,
    column: DataTableColumn<T>
  ) => {
    if (column.render) {
      return column.render(row);
    }

    const value = row[column.key as keyof T];

    if (value === null || value === undefined) {
      return '—';
    }

    return String(value);
  };

  const renderAction = (
    action: DataTableAction<T>,
    row: T
  ) => {
    if (action.hidden?.(row)) {
      return null;
    }

    const disabled = action.disabled?.(row) ?? false;

    const actionLabel =
      typeof action.label === 'function'
        ? action.label(row)
        : action.label;

    const actionIcon =
      typeof action.icon === 'function'
        ? action.icon(row)
        : action.icon;

    return (
      <Tooltip title={actionLabel}>
        <IconButton
          onClick={() => action.onClick(row)}
          disabled={disabled}
        >
          {actionIcon}
        </IconButton>
      </Tooltip>
    );
  };

  const columnCount =
    columns.length +
    (selectableRows ? 1 : 0) +
    (actions.length > 0 ? 1 : 0);

  return (
    <Paper className={styles.container}>
      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              {selectableRows && (
                <TableCell
                  padding="checkbox"
                  className={styles.checkboxCell}
                >
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    onChange={handleSelectAll}
                    inputProps={{
                      'aria-label': 'انتخاب همه',
                    }}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? 'right'}
                  className={styles.headerCell}
                  style={{
                    width: column.width,
                  }}
                >
                  {column.header}
                </TableCell>
              ))}

              {actions.length > 0 && (
                <TableCell
                  align="center"
                  className={styles.headerCell}
                >
                  عملیات
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className={styles.stateCell}
                >
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className={styles.stateCell}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedSet.has(rowId);

                return (
                  <TableRow
                    key={rowId}
                    hover
                    selected={isSelected}
                  >
                    {selectableRows && (
                      <TableCell
                        padding="checkbox"
                        className={styles.checkboxCell}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={(event) =>
                            handleSelectRow(
                              rowId,
                              event.target.checked
                            )
                          }
                          inputProps={{
                            'aria-label': `انتخاب رکورد ${rowId}`,
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={column.align ?? 'right'}
                        className={
                          column.truncate
                            ? styles.truncatedCell
                            : styles.bodyCell
                        }
                        style={{
                          width: column.width,
                        }}
                      >
                        {renderCellValue(row, column)}
                      </TableCell>
                    ))}

                    {actions.length > 0 && (
                      <TableCell
                        align="center"
                        className={styles.actionsCell}
                      >
                        <div className={styles.actions}>
                          {actions.map((action) =>
                            renderAction(action, row)
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          rowsPerPage={pagination.pageSize}
          onPageChange={(_, page) =>
            pagination.onPageChange(page)
          }
          onRowsPerPageChange={(event) =>
            pagination.onPageSizeChange(
              Number(event.target.value)
            )
          }
          rowsPerPageOptions={(
            pagination.pageSizeOptions ?? [10, 20, 50]
          ).map((pageSize) => ({
            value: pageSize,
            label: convertToPersianDigits(pageSize),
          }))}
          labelDisplayedRows={({ from, to, count }) =>
            `${convertToPersianDigits(from)}–${convertToPersianDigits(to)} از ${convertToPersianDigits(count)}`
          }
          labelRowsPerPage="تعداد در صفحه:"
          className={styles.pagination}
        />
      )}
    </Paper>
  );
};

export default DataTable;