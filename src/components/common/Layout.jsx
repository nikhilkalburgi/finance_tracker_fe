// src/components/common/Layout.jsx
import { useState } from 'react';
import { Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

// Sidebar width when expanded
const DRAWER_WIDTH = 240;

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // Create theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Include the Sidebar component */}
        <Sidebar />
        
        {/* Include the Header component */}
        <Header toggleTheme={toggleTheme} darkMode={darkMode} />
        
        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            mt: '64px', // Height of the AppBar
            minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
            backgroundColor: theme.palette.background.default,
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;