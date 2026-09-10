import App from './App';
import React from 'react';
import theme from 'theme/theme';
import rtlCache from 'theme/rtlCache';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import { store, persistor } from 'store/store';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { injectMuiTheme } from 'theme/injectMuiTheme';
import { PersistGate } from 'redux-persist/integration/react';

import './styles/global.scss';

injectMuiTheme(theme);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </CacheProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);