// src/components/common/Header.jsx
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Sidebar width when expanded
const DRAWER_WIDTH = 240;

const Header = ({ toggleTheme, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout } = useAuth();
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // State for notifications menu
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  
  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle notifications menu open
  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  // Handle notifications menu close
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        boxShadow: 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {/* App Title - Only show on mobile as sidebar has the title on desktop */}
        {isMobile && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Finance Tracker
          </Typography>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Theme Toggle */}
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{ ml: 1 }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            onClick={handleNotificationOpen}
            sx={{ ml: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={notificationOpen}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">Budget limit reached for "Groceries"</Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">New feature: Export transactions</Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">Monthly summary is ready</Typography>
          </MenuItem>
        </Menu>
        
        {/* User Profile */}
        <Box sx={{ ml: 1 }}>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Avatar /> My account
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Avatar /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;