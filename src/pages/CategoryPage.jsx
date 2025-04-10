// src/pages/CategoryPage.jsx
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
  IconButton,
  CircularProgress,
  Button,
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
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  List as ListItemIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../api/services';

const CategoryPage = () => {
  const theme = useTheme();
  
  // State for filters
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    ordering: 'name' // Default sort by name ascending
  });

  // State for category CRUD operations
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
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
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  // Handle opening the category dialog for create
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setCategoryForm({
      name: '',
      description: ''
    });
    setFormErrors({});
    setOpenCategoryDialog(true);
  };
  
  // Handle opening the category dialog for edit
  const handleOpenEditDialog = (category) => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setFormErrors({});
    setOpenCategoryDialog(true);
    setActionMenuAnchorEl(null);
  };
  
  // Handle closing the category dialog
  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };
  
  // Handle form input changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!categoryForm.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    if (!categoryForm.type) {
      errors.type = 'Category type is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmitCategory = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (dialogMode === 'create') {
        await createCategory.mutateAsync(categoryForm);
        setAlert({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        });
      } else {
        await updateCategory.mutateAsync({
          id: selectedCategory.id,
          data: categoryForm
        });
        setAlert({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      }
      handleCloseCategoryDialog();
    } catch (error) {
      setAlert({
        open: true,
        message: `Failed to ${dialogMode} category: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  // Handle opening the action menu
  const handleOpenActionMenu = (event, categoryId) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedRowId(categoryId);
  };
  
  // Handle closing the action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };
  
  // Handle edit from action menu
  const handleEditFromMenu = () => {
    const category = filteredCategories.find(c => c.id === selectedRowId);
    if (category) {
      handleOpenEditDialog(category);
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
      await deleteCategory.mutateAsync(selectedRowId);
      setAlert({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        open: true,
        message: `Failed to delete category: ${error.message}`,
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
  const handleRowClick = (category) => {
    handleOpenEditDialog(category);
  };
  
  // Fetch categories
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories
  } = useCategories();
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      search: event.target.value,
      page: 1 // Reset to first page on new search
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
  
  // Clear search filter
  const clearSearch = () => {
    setFilters({
      ...filters,
      search: '',
      page: 1
    });
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
  
  // Filter categories based on search
  const filteredCategories = categoriesData ? categoriesData.results?.filter(category => {
    // Search filter
    if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  }) : [];
  
  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const orderBy = filters.ordering.startsWith('-') 
      ? filters.ordering.substring(1) 
      : filters.ordering;
    
    const isDesc = filters.ordering.startsWith('-');
    
    let comparison = 0;
    
    if (orderBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (orderBy === 'total_transactions') {
      comparison = (a.total_transactions || 0) - (b.total_transactions || 0);
    }
    
    return isDesc ? -comparison : comparison;
  });
  
  // Paginate categories
  const paginatedCategories = sortedCategories.slice(
    (filters.page - 1) * filters.pageSize,
    filters.page * filters.pageSize
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      
      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search categories..."
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
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Categories Table */}
      <Paper elevation={2}>
        {isCategoriesLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : categoriesError ? (
          <Box p={3} textAlign="center">
            <Typography color="error">
              Error loading categories. Please try again.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => refetchCategories()}
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
                        active={getSortDirection('name') !== false}
                        direction={getSortDirection('name') || 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Category Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={getSortDirection('total_transactions') !== false}
                        direction={getSortDirection('total_transactions') || 'desc'}
                        onClick={() => handleSort('total_transactions')}
                      >
                        Transactions
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((category) => (
                        <TableRow 
                        key={category.id}
                        hover
                        onClick={() => handleRowClick(category)}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover,
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {category.total_transactions || 0}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 300 }}>
                              {category.description || 'No description'}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleOpenActionMenu(e, category.id)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No categories found matching your search.
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
              count={filteredCategories.length}
              rowsPerPage={filters.pageSize}
              page={filters.page - 1} // Convert 1-based to 0-based for MUI
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </Paper>

      {/* Add Category FAB */}
      <Fab
        color="primary"
        aria-label="add category"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={handleOpenCreateDialog}
      >
        <AddIcon />
      </Fab>
      
      {/* Category Dialog */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Category' : 'Edit Category'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                value={categoryForm.name}
                onChange={handleFormChange}
                required
                margin="normal"
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={categoryForm.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitCategory} 
            variant="contained"
            disabled={createCategory.isLoading || updateCategory.isLoading}
          >
            {dialogMode === 'create' 
              ? (createCategory.isLoading ? 'Creating...' : 'Create') 
              : (updateCategory.isLoading ? 'Updating...' : 'Update')}
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
            Are you sure you want to delete this category? This may affect transactions that use this category.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteCategory.isLoading}
          >
            {deleteCategory.isLoading ? 'Deleting...' : 'Delete'}
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

export default CategoryPage;