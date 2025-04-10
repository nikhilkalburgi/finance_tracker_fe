// src/components/common/Sidebar.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as TransactionsIcon,
  AccountBalance as BudgetIcon,
  Category as CategoryIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Sidebar width when expanded
const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State to control drawer open/close on mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
    { text: 'Budget', icon: <BudgetIcon />, path: '/budget' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  ];

  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
        }}
      >
        <Typography variant="h6" noWrap component="div">
          Finance Tracker
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed', 
            top: theme.spacing(1), 
            left: theme.spacing(1),
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              boxShadow: theme.shadows[5],
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Desktop permanent drawer
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;