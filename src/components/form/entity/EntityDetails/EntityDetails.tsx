import React from 'react';
import { useDialogs } from '@toolpad/core';
import { Delete, Edit, Undo } from '@mui/icons-material';
import { entityFormFields, getEntityLabel } from 'utils/EntityForm';
import { Typography, Card, CardContent, Grid, IconButton } from '@mui/material';
import { useParams, Link, useResolvedPath, useNavigate } from 'react-router-dom';
import { useDeleteEntityMutation, useGetEntityQuery } from 'features/api/entityApi';

import './EntityDetails.scss';

const EntityDetails: React.FC<{ entity: string }> = ({ entity }) => {
  const { id } = useParams();
  const { data: item, isLoading, isError } = useGetEntityQuery({ entity, id });
  const navigate = useNavigate();
  const resolvedPath = useResolvedPath('');
  const basePath = resolvedPath.pathname.split('/').slice(0, -1).join('/');
  const [deleteEntity] = useDeleteEntityMutation();
  const dialogs = useDialogs()

  const handleDelete = async (id: string) => {
    const confirm = await dialogs.confirm('آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟', {
      title: `حذف ${getEntityLabel(entity, 'singular')}`,
      okText: 'حذف',
      cancelText: 'لغو',
      severity: 'error'
    });
    if (confirm) {
      await deleteEntity({ entity, id });
      navigate(basePath);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>گرفتن اطلاعات با مشکل مواجه شد</div>;

  return (
    <div className="entity-details">
      <div className="entity-details__header">
        <div className="entity-details__header__title">
          <Typography variant="h5">
            اطلاعات {getEntityLabel(entity, 'singular')}
          </Typography>
        </div>
        <div className="entity-details__actions">
          <IconButton sx={{ color: 'white' }} aria-label="ویرایش" component={Link} to={`${basePath}/${id}/edit`}>
            <Edit />
          </IconButton>
          <IconButton sx={{ color: 'white' }} aria-label="حذف" onClick={() => handleDelete(id!)}>
            <Delete />
          </IconButton>
          <IconButton sx={{ color: 'white' }} aria-label="بازگشت"  onClick={() => navigate(basePath)}>
            <Undo />
          </IconButton>
        </div>
      </div>
      <Card className="entity-details__card">
        <CardContent>
          <Grid container spacing={2}>
            {Object.entries(item).map(([key, value]) => (
              key === 'id' ? null :
              <Grid size={{xs:12, sm:6}} key={key}>
                <Typography className="entity-details__field">
                  <strong>{entityFormFields[entity][key]?.label}:</strong>  {String(value)}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntityDetails;
