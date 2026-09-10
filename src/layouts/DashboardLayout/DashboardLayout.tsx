import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import MainHeader from 'components/template/MainHeader/MainHeader';
import MainSidebar from 'components/template/MainSidebar/MainSidebar';
import MainOverlay from 'components/template/MainOverlay/MainOverlay';

import './DashboardLayout.scss';

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <Box dir="rtl" className="layout">
      <MainHeader mobileMode={isMobile} onMenuClick={toggleSidebar} />

      <Grid container className="layout__container" >
        {/* Main content first in markup due to RTL */}
        <Grid size={{ xs: 0, md: 2.25 }}>
          <MainSidebar
            open={sidebarOpen || !isMobile}
            mobileMode={isMobile}
            onClose={() => setSidebarOpen(false)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9.75 }} className="layout__main">
          <Outlet />
        </Grid>

      </Grid>

      {isMobile && sidebarOpen && <MainOverlay onClick={() => setSidebarOpen(false)} />}
    </Box>
  );
};

export default DashboardLayout;
