// src/pages/BudgetPage.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  Grid,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Button,
  Collapse,
  LinearProgress,
  useTheme,
  Snackbar,
  Alert,
  Slide,
  Divider,
  ListItemText,
  DialogActions,
  Menu,
  DialogTitle,
  DialogContent,
  Dialog,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  List as ListItemIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useBudgets, useCategories, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../api/services';

const BudgetPage = () => {
  const theme = useTheme();
  
  // State for filters
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    category: '',
    month: '',
    year: '',
    ordering: '-year,-month' // Default sort by date descending
  });
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // State for budget CRUD operations
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  // State for action menu
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  // State for alerts
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Mutations
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  
  // Handle opening the budget dialog for create
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setBudgetForm({
      category: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setOpenBudgetDialog(true);
  };
  
  // Handle opening the budget dialog for edit
  const handleOpenEditDialog = (budget) => {
    setDialogMode('edit');
    setSelectedBudget(budget);
    setBudgetForm({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year
    });
    setOpenBudgetDialog(true);
    setActionMenuAnchorEl(null);
  };
  
  // Handle closing the budget dialog
  const handleCloseBudgetDialog = () => {
    setOpenBudgetDialog(false);
  };
  
  // Handle form input changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setBudgetForm({
      ...budgetForm,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };
  
  // Handle form submission
  const handleSubmitBudget = async () => {
    try {
      if (dialogMode === 'create') {
        await createBudget.mutateAsync(budgetForm);
        setAlert({
          open: true,
          message: 'Budget created successfully',
          severity: 'success'
        });
      } else {
        await updateBudget.mutateAsync({
          id: selectedBudget.id,
          data: budgetForm
        });
        setAlert({
          open: true,
          message: 'Budget updated successfully',
          severity: 'success'
        });
      }
      handleCloseBudgetDialog();
    } catch (error) {
      setAlert({
        open: true,
        message: `Failed to ${dialogMode} budget: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  // Handle opening the action menu
  const handleOpenActionMenu = (event, budgetId) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedRowId(budgetId);
  };
  
  // Handle closing the action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };
  
  // Handle edit from action menu
  const handleEditFromMenu = () => {
    const budget = filteredBudgets.find(b => b.id === selectedRowId);
    if (budget) {
      handleOpenEditDialog(budget);
    }
  };
  
  // Handle delete from action menu
  const handleDeleteFromMenu = () => {
    setDeleteConfirmOpen(true);
    setActionMenuAnchorEl(null);
  };
  
  // Handle confirming delete
  const handleConfirmDelete = async () => {
    try {
      await deleteBudget.mutateAsync(selectedRowId);
      setAlert({
        open: true,
        message: 'Budget deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        open: true,
        message: `Failed to delete budget: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };
  
  // Handle closing the alert
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };
  
  // Handle row click to open edit dialog
  const handleRowClick = (budget) => {
    handleOpenEditDialog(budget);
  };
  
  // Fetch budgets with current filters
  const { 
    data: budgetsData, 
    isLoading: isBudgetsLoading, 
    error: budgetsError,
    refetch: refetchBudgets
  } = useBudgets();

  console.log('Budgets: ', budgetsData);
  
  // Fetch categories for filter dropdown
  const { data: categoriesData } = useCategories();
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      search: event.target.value,
      page: 1 // Reset to first page on new search
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page on filter change
    });
  };
  
  // Handle page change
  const handlePageChange = (event, newPage) => {
    setFilters({
      ...filters,
      page: newPage + 1 // API uses 1-based indexing
    });
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setFilters({
      ...filters,
      pageSize: parseInt(event.target.value, 10),
      page: 1 // Reset to first page when changing rows per page
    });
  };
  
  // Handle sorting
  const handleSort = (property) => {
    const isAsc = filters.ordering === property;
    setFilters({
      ...filters,
      ordering: isAsc ? `-${property}` : property,
      page: 1 // Reset to first page on sort change
    });
  };
  
  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      ...filters,
      search: '',
      category: '',
      month: '',
      year: '',
      page: 1
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get current sort direction
  const getSortDirection = (property) => {
    if (filters.ordering.startsWith('-') && filters.ordering.substring(1) === property) {
      return 'desc';
    }
    if (filters.ordering === property) {
      return 'asc';
    }
    return false;
  };
  
  // Filter budgets based on search and filters
  const filteredBudgets = budgetsData ? budgetsData.filter(budget => {
    // Search filter
    if (filters.search && !budget.category_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && budget.category !== parseInt(filters.category)) {
      return false;
    }
    
    // Month filter
    if (filters.month && budget.month !== parseInt(filters.month)) {
      return false;
    }
    
    // Year filter
    if (filters.year && budget.year !== parseInt(filters.year)) {
      return false;
    }
    
    return true;
  }) : [];
  
  // Sort budgets
  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    const orderBy = filters.ordering.startsWith('-') 
      ? filters.ordering.substring(1) 
      : filters.ordering;
    
    const isDesc = filters.ordering.startsWith('-');
    
    let comparison = 0;
    
    if (orderBy === 'year') {
      comparison = a.year - b.year;
    } else if (orderBy === 'month') {
      comparison = a.month - b.month;
    } else if (orderBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (orderBy === 'category_name') {
      comparison = a.category_name.localeCompare(b.category_name);
    } else if (orderBy === 'percentage_used') {
      comparison = a.percentage_used - b.percentage_used;
    }
    
    return isDesc ? -comparison : comparison;
  });
  
  // Paginate budgets
  const paginatedBudgets = sortedBudgets.slice(
    (filters.page - 1) * filters.pageSize,
    filters.page * filters.pageSize
  );
  
  // Get month name
  const getMonthName = (monthNumber) => {
    return format(new Date(2023, monthNumber - 1, 1), 'MMMM');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Budgets
      </Typography>
      
      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by category..."
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange({ target: { name: 'search', value: '' } })}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small" style={{width: '150px'}}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                input={<OutlinedInput label="Category" />}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoriesData?.results?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={toggleFilters}
              sx={{ mr: 1 }}
            >
              Filters
            </Button>
            
            {Object.values(filters).some(value => 
              value !== '' && value !== 1 && value !== 10 && value !== '-year,-month'
            ) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </Grid>
        </Grid>
        
        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select style={{width: '150px'}}
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    input={<OutlinedInput label="Month" />}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select style={{width: '150px'}}
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    input={<OutlinedInput label="Year" />}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* Budgets Table */}
      <Paper elevation={2}>
        {isBudgetsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : budgetsError ? (
          <Box p={3} textAlign="center">
            <Typography color="error">
              Error loading budgets. Please try again.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => refetchBudgets()}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={getSortDirection('category_name') !== false}
                        direction={getSortDirection('category_name') || 'asc'}
                        onClick={() => handleSort('category_name')}
                      >
                        Category
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={getSortDirection('year') !== false || getSortDirection('month') !== false}
                        direction={getSortDirection('year') || getSortDirection('month') || 'desc'}
                        onClick={() => handleSort('year')}
                      >
                        Period
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={getSortDirection('amount') !== false}
                        direction={getSortDirection('amount') || 'desc'}
                        onClick={() => handleSort('amount')}
                      >
                        Budget
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Spent</TableCell>
                    <TableCell align="right">Remaining</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={getSortDirection('percentage_used') !== false}
                        direction={getSortDirection('percentage_used') || 'desc'}
                        onClick={() => handleSort('percentage_used')}
                      >
                        Progress
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBudgets.length > 0 ? (
                    paginatedBudgets.map((budget) => (
                        <TableRow 
                        key={budget.id}
                        hover
                        onClick={() => handleRowClick(budget)}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover,
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={budget.category_name} 
                            size="small" 
                            sx={{ 
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.08)'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {getMonthName(budget.month)} {budget.year}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(budget.amount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(budget.spent)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: budget.remaining < 0 
                                ? theme.palette.error.main 
                                : theme.palette.success.main,
                              fontWeight: 'medium'
                            }}
                          >
                            {formatCurrency(budget.remaining)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(budget.percentage_used, 100)}
                                color={
                                  budget.percentage_used > 90 ? "error" : 
                                  budget.percentage_used > 75 ? "warning" : "primary"
                                }
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {budget.percentage_used}%
                              </Typography>
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleOpenActionMenu(e, budget.id)}
                              sx={{ ml: 1 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No budgets found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredBudgets.length}
              rowsPerPage={filters.pageSize}
              page={filters.page - 1} // Convert 1-based to 0-based for MUI
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </Paper>

      {/* Add Budget FAB */}
      <Fab
        color="primary"
        aria-label="add budget"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={handleOpenCreateDialog}
      >
        <AddIcon />
      </Fab>
      
      {/* Budget Dialog */}
      <Dialog 
        open={openBudgetDialog} 
        onClose={handleCloseBudgetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Budget' : 'Edit Budget'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select style={{width: '160px'}}
                  name="category"
                  value={budgetForm.category}
                  onChange={handleFormChange}
                  label="Category"
                  required
                >
                  <MenuItem value="">Select a category</MenuItem>
                  {categoriesData?.results?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Amount"
                name="amount"
                type="number"
                value={budgetForm.amount}
                onChange={handleFormChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Month</InputLabel>
                <Select
                  name="month"
                  value={budgetForm.month}
                  onChange={handleFormChange}
                  label="Month"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Year</InputLabel>
                <Select
                  name="year"
                  value={budgetForm.year}
                  onChange={handleFormChange}
                  label="Year"
                  required
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBudgetDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitBudget} 
            variant="contained"
            disabled={!budgetForm.category || !budgetForm.amount || !budgetForm.month || !budgetForm.year}
          >
            {dialogMode === 'create' 
              ? (createBudget.isLoading ? 'Creating...' : 'Create') 
              : (updateBudget.isLoading ? 'Updating...' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this budget? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteBudget.isLoading}
          >
            {deleteBudget.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={handleEditFromMenu}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteFromMenu}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetPage;