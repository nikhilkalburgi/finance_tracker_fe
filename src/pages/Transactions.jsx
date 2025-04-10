/* eslint-disable no-unused-vars */
// src/pages/TransactionsPage.jsx
import { useState, useEffect } from 'react';
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Button,
  Collapse,
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
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
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
import { useTransactions, useCategories, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../api/services';

const TransactionsPage = () => {
  const theme = useTheme();
  
  // State for filters
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    category: '',
    transactionType: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    ordering: '-date' // Default sort by date descending
  });
  
  // State for filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // State for transaction CRUD operations
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    transaction_type: 'expense',
    category: '',
    notes: ''
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
   const createTransaction = useCreateTransaction();
   const updateTransaction = useUpdateTransaction();
   const deleteTransaction = useDeleteTransaction();
   
   // Handle opening the transaction dialog for create
   const handleOpenCreateDialog = () => {
     setDialogMode('create');
     setTransactionForm({
       description: '',
       amount: '',
       date: format(new Date(), 'yyyy-MM-dd'),
       transaction_type: 'expense',
       category: '',
       notes: ''
     });
     setOpenTransactionDialog(true);
   };
   
   // Handle opening the transaction dialog for edit
   const handleOpenEditDialog = (transaction) => {
     setDialogMode('edit');
     setSelectedTransaction(transaction);
     setTransactionForm({
       description: transaction.description,
       amount: transaction.amount,
       date: format(new Date(transaction.date), 'yyyy-MM-dd'),
       transaction_type: transaction.transaction_type,
       category: transaction.category ? transaction.category.id : '',
       notes: transaction.notes || ''
     });
     setOpenTransactionDialog(true);
     setActionMenuAnchorEl(null);
   };
   
   // Handle closing the transaction dialog
   const handleCloseTransactionDialog = () => {
     setOpenTransactionDialog(false);
   };
   
   // Handle form input changes
   const handleFormChange = (event) => {
     const { name, value } = event.target;
     setTransactionForm({
       ...transactionForm,
       [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
     });
   };
   
   // Handle form submission
   const handleSubmitTransaction = async () => {
     try {
       if (dialogMode === 'create') {
         await createTransaction.mutateAsync(transactionForm);
         setAlert({
           open: true,
           message: 'Transaction created successfully',
           severity: 'success'
         });
       } else {
         await updateTransaction.mutateAsync({
           id: selectedTransaction.id,
           data: transactionForm
         });
         setAlert({
           open: true,
           message: 'Transaction updated successfully',
           severity: 'success'
         });
       }
       handleCloseTransactionDialog();
     } catch (error) {
       setAlert({
         open: true,
         message: `Failed to ${dialogMode} transaction: ${error.message}`,
         severity: 'error'
       });
     }
   };
   
   // Handle opening the action menu
   const handleOpenActionMenu = (event, transactionId) => {
     event.stopPropagation();
     setActionMenuAnchorEl(event.currentTarget);
     setSelectedRowId(transactionId);
   };
   
   // Handle closing the action menu
   const handleCloseActionMenu = () => {
     setActionMenuAnchorEl(null);
   };
   
   // Handle edit from action menu
   const handleEditFromMenu = () => {
     const transaction = transactionsData.results.find(t => t.id === selectedRowId);
     if (transaction) {
       handleOpenEditDialog(transaction);
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
       await deleteTransaction.mutateAsync(selectedRowId);
       setAlert({
         open: true,
         message: 'Transaction deleted successfully',
         severity: 'success'
       });
     } catch (error) {
       setAlert({
         open: true,
         message: `Failed to delete transaction: ${error.message}`,
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
   const handleRowClick = (transaction) => {
     handleOpenEditDialog(transaction);
   };

  // Fetch transactions with current filters
  const { 
    data: transactionsData, 
    isLoading: isTransactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions
  } = useTransactions(filters);
  
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
      transactionType: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>
      
      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search transactions..."
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
            <FormControl fullWidth size="small" style={{width: '200px'}}>
              <InputLabel>Transaction Type</InputLabel>
              <Select fullWidth
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
                input={<OutlinedInput label="Transaction Type" />}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
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
              value !== '' && value !== 1 && value !== 10 && value !== '-date'
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
                <FormControl fullWidth size="small"  style={{width: '150px'}}>
                  <InputLabel>Category</InputLabel>
                  <Select fullWidth
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
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min Amount"
                  name="minAmount"
                  type="number"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Max Amount"
                  name="maxAmount"
                  type="number"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* Transactions Table */}
      <Paper elevation={2}>
        {isTransactionsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : transactionsError ? (
          <Box p={3} textAlign="center">
            <Typography color="error">
              Error loading transactions. Please try again.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => refetchTransactions()}
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
                        active={getSortDirection('date') !== false}
                        direction={getSortDirection('date') || 'desc'}
                        onClick={() => handleSort('date')}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={getSortDirection('description') !== false}
                        direction={getSortDirection('description') || 'asc'}
                        onClick={() => handleSort('description')}
                      >
                        Description
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={getSortDirection('transaction_type') !== false}
                        direction={getSortDirection('transaction_type') || 'asc'}
                        onClick={() => handleSort('transaction_type')}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={getSortDirection('amount') !== false}
                        direction={getSortDirection('amount') || 'desc'}
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionsData?.results.length > 0 ? (
                    transactionsData.results.map((transaction) => (
                        <TableRow 
                        key={transaction.id}
                        hover
                        onClick={() => handleRowClick(transaction)}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover,
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <TableCell>
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.category ? (
                            <Chip 
                              label={transaction.category_name} 
                              size="small" 
                              sx={{ 
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.08)'
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Uncategorized
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={transaction.transaction_type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                            label={transaction.transaction_type === 'income' ? 'Income' : 'Expense'}
                            size="small"
                            color={transaction.transaction_type === 'income' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <Typography
                              sx={{
                                color: transaction.transaction_type === 'income' 
                                  ? theme.palette.success.main 
                                  : theme.palette.error.main,
                                fontWeight: 'bold',
                                mr: 1
                              }}
                            >
                              {transaction.transaction_type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleOpenActionMenu(e, transaction.id)}
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
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No transactions found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {transactionsData && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={transactionsData.count || 0}
                rowsPerPage={filters.pageSize}
                page={filters.page - 1} // Convert 1-based to 0-based for MUI
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            )}
          </>
        )}
      </Paper>

      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={handleOpenCreateDialog}
      >
        <AddIcon />
      </Fab>
      
      {/* Transaction Dialog */}
      <Dialog 
        open={openTransactionDialog} 
        onClose={handleCloseTransactionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Transaction' : 'Edit Transaction'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={transactionForm.description}
                onChange={handleFormChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={transactionForm.amount}
                onChange={handleFormChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={transactionForm.date}
                onChange={handleFormChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Transaction Type</InputLabel>
                <Select style={{width: '160px'}}
                  name="transaction_type"
                  value={transactionForm.transaction_type}
                  onChange={handleFormChange}
                  label="Transaction Type"
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select style={{width: '160px'}}
                  name="category"
                  value={transactionForm.category}
                  onChange={handleFormChange}
                  label="Category"
                >
                  <MenuItem value="">Uncategorized</MenuItem>
                  {categoriesData?.results?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

          </Grid>
            
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={transactionForm.notes}
                onChange={handleFormChange}
                multiline
                rows={3}
                margin="normal"
              />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitTransaction} 
            variant="contained"
            disabled={!transactionForm.description || !transactionForm.amount || !transactionForm.date}
          >
            {dialogMode === 'create' 
              ? (createTransaction.isLoading ? 'Creating...' : 'Create') 
              : (updateTransaction.isLoading ? 'Updating...' : 'Update')}
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
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteTransaction.isLoading}
          >
            {deleteTransaction.isLoading ? 'Deleting...' : 'Delete'}
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

export default TransactionsPage;