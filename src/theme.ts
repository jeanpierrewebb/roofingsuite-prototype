import { createTheme } from '@mui/material/styles';

// Approximated from the real RoofingSuite app (fe/src/theme.ts):
// classic MUI blue primary, black AppBar, light-grey app background.
export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      '"Roboto","Helvetica","Arial",sans-serif',
    h6: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: { backgroundColor: '#000000' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 8 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, whiteSpace: 'nowrap' },
      },
    },
  },
});
