import theme from 'theme/theme';
import React, { useState } from 'react';
import { useDialogs } from '@toolpad/core';
import { Link, useResolvedPath } from 'react-router-dom';
import { convertToPersianDigits } from '@/utils/numbers';
import EntityIndexHeader from './components/EntityIndexHeader';
import { entityFormFields, getEntityLabel } from 'utils/EntityForm';
import { getField, getFieldTitle } from './components/TableCellBuilder';
import { useGetEntitiesQuery, useDeleteEntityMutation } from 'features/api/entityApi';
import { NotificationUnreadLines, PenNewSquare, TrashBinMinimalistic } from 'solar-icon-set';
// import TablePaginationActions from '@/components/theme/TablePaginationActions';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Paper,
  TablePagination,
  ButtonGroup,
  IconButton,
  Tooltip,
  useMediaQuery,
  Checkbox,
} from '@mui/material';

import './EntityIndex.scss';

const EntityIndex: React.FC<{ entity: string }> = ({ entity }) => {
  const dialogs = useDialogs()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [deleteEntity] = useDeleteEntityMutation();
  const [expandFilter, setExpandFilter] = useState(false)

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { data, isLoading, isError } = useGetEntitiesQuery({
    entity,
    page: page + 1, // backend expects 1-based
    limit: rowsPerPage,
  });
  const items = data?.items || data || [];
  const totalCount = data?.total || data?.length || 0;

  const [selectedItems, setSelectedItems] = useState<any[]>([]) 
  const isItemSelected = (id: any) => {
    return selectedItems.includes(id)
  }
  const [isAllSelected, setIsAllSelected] = useState(false)
  
  const resolvedPath = useResolvedPath('');
  const pathName = resolvedPath.pathname.split('/').slice(0, -1).join('/');

  const columns =  Object.keys(Object.fromEntries(Object.entries(entityFormFields[entity]).filter(([_, value]) => value.visibility === true)) || {})

  const toggleFilter = () => {
    setExpandFilter(!expandFilter)
  }

  const handleSelection = (id: any) => {
    if (isItemSelected(id)) {
      const newSelected = selectedItems.filter(item => item !== id)
      setSelectedItems(l => l.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }     
  }

  const handelAllSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = items.map((n: any) => n.id);
      setSelectedItems(newSelected);
      return;
    }
    setSelectedItems([]);
  }

  const handleDelete = async (id: string) => {
    const confirm = await dialogs.confirm('آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟', {
      title: `حذف ${getEntityLabel(entity, 'singular') + ' با شناسه ' + convertToPersianDigits(id)}`,
      okText: 'حذف',
      cancelText: 'لغو',
      severity: 'error'
    });
    if (confirm) {
      await deleteEntity({ entity, id });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>گرفتن اطلاعات با مشکل مواجه شد</div>;
  return (
    <div className="entity-index">
      <EntityIndexHeader entity={entity} isMobile={isMobile} expandFilter={expandFilter} pathName={pathName} toggleFilter={toggleFilter} />
      <div className={'entity-index__filter' + (expandFilter ? ' entity-index__filter--expand' : ' entity-index__filter--collapsed') }>
        filter goes here
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{
              background: '#F4F4F5'
            }}>
              <TableCell >
                <Checkbox
                  color='primary'
                  indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                  checked={items.length > 0 && selectedItems.length === items.length}
                  onChange={handelAllSelection}
                />
              </TableCell>
              {columns.map((key) => (
                key === 'id' ? 
                <TableCell sx={{ whiteSpace: 'nowrap' }} key={key}>
                  # شناسه
                </TableCell>
                   : 
                <TableCell sx={{ whiteSpace: 'nowrap' , color: '#11181C' }} key={key}>
                   <strong>{entityFormFields[entity][key]?.label}</strong>
                 </TableCell>
              ))}
              <TableCell sx={{ color: '#11181C' }} align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item: any) => (
              
              <TableRow key={item.id} selected={isItemSelected(item.id)} sx={{
                background: isItemSelected(item.id) ? '#E9EEFE' : '#ffffff'
              }}>
                <TableCell >
                <Checkbox
                  color="primary"
                  checked={isItemSelected(item.id)}
                  onClick={() => handleSelection(item.id)}
                />
                </TableCell>
                {columns.map((key) => (
                  <TableCell
                  key={key}
                  sx={{
                    maxWidth: 150,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <Tooltip title={getFieldTitle(item,key, entity)} arrow placement="top">
                    {getField(item, key, entity)}
                  </Tooltip>
                </TableCell>
                ))}
                <TableCell align="center">
                  <ButtonGroup size="small" aria-label="Small button group">
                    <IconButton color='primary' aria-label="مشاهده" component={Link} to={`${pathName}/${item.id}`}>
                      <Tooltip title={'مشاهده'} arrow placement="top">
                        <NotificationUnreadLines size={18}/>
                      </Tooltip>
                    </IconButton>
                    <IconButton color='error' aria-label="حذف" onClick={() => handleDelete(item.id)}>
                      <Tooltip title={'حذف'} arrow placement="top">
                        <TrashBinMinimalistic  size={18}/>
                      </Tooltip>
                    </IconButton>
                    <IconButton color='primary' aria-label="ویرایش" component={Link} to={`${pathName}/${item.id}/edit`}>
                      <Tooltip title={'ویرایش'} arrow placement="top">
                        <PenNewSquare size={18}/>
                      </Tooltip>
                    </IconButton>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage={null}
      />
    </div>
  );
};

export default EntityIndex;