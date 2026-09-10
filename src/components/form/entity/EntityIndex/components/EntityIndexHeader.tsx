import { getEntityLabel } from '@/utils/EntityForm'
import { AddCircle, FilterAlt, FilterAltOff } from '@mui/icons-material'
import { Button, IconButton, Tooltip, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const EntityIndexHeader: React.FC<{ entity: string, isMobile: boolean, expandFilter: boolean, pathName: string, toggleFilter: () => {} }> = ({ entity, isMobile, expandFilter, pathName, toggleFilter}) => {
  return (
    <div className="entity-index__header">
      <Typography sx={{ fontWeight: '600' }} variant="h5" gutterBottom>
        لیست {getEntityLabel(entity, 'plural')}
      </Typography>
      
        { isMobile ? (
          <div className="entity-index__header__action">
            <IconButton aria-label="فیلتر" color="info" onClick={toggleFilter}>
              <Tooltip title="فیلتر" arrow placement="top">
                { expandFilter ? <FilterAltOff /> : <FilterAlt />}
              </Tooltip>
            </IconButton>
            <IconButton aria-label="ساخت" color="info" component={Link} to={`${pathName}/create`}>
              <Tooltip title={`ساخت ${getEntityLabel(entity, 'singular')} جدید`} arrow placement="top">
                <AddCircle />
              </Tooltip>
            </IconButton>
          </div>
        ): (
          <div className="entity-index__header__action">
            <IconButton aria-label="فیلتر" color="info" onClick={toggleFilter}>
              <Tooltip title="فیلتر" arrow placement="top">
                { expandFilter ? <FilterAltOff /> : <FilterAlt />}
              </Tooltip>
            </IconButton>
            <Button variant="contained" color="info" component={Link} to={`${pathName}/create`}>
              ساخت {getEntityLabel(entity, 'singular')} جدید
            </Button>
          </div>
          )
        }
      
    </div>
  )
}

export default EntityIndexHeader