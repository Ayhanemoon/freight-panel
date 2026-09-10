import { Theme } from '@mui/material/styles';

export const injectMuiTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Add theme palette colors as CSS variables
  Object.entries(theme.palette).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, color]) => {
        root.style.setProperty(`--mui-palette-${key}-${shade}`, color as string);
      });
    } else {
      root.style.setProperty(`--mui-palette-${key}`, value as string);
    }
  });

  // Add spacing values as CSS variables
  for (let i = 0; i <= 10; i++) {
    root.style.setProperty(`--mui-spacing-${i}`, theme.spacing(i).toString());
  }

  // Add typography and other theme properties
  root.style.setProperty('--mui-font-family', theme.typography.fontFamily || 'Roboto, Arial, sans-serif');
};