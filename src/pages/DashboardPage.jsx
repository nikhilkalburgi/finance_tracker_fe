/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/DashboardPage.jsx
import { useEffect, useRef } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  useTheme,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp as IncomeIcon, 
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import { format } from 'date-fns';
import { useDashboardData, useTransactions, useBudgetSummary, useCurrentMonthBudget } from '../api/services';

const DashboardPage = () => {
  const theme = useTheme();
  const chartRef = useRef(null);
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboardData();
  
  // Fetch recent transactions (limit to 5)
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions({
    page: 1,
    pageSize: 5,
    ordering: '-date'
  });

  // Effect to create/update the spending chart when data changes
  useEffect(() => {
    if (dashboardData && chartRef.current) {
      createSpendingChart();
    }
  }, [dashboardData, theme.palette.mode]);

  // Function to create the D3.js spending chart
  const createSpendingChart = () => {
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Chart dimensions
    const width = chartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for chart
    const chartData = dashboardData.monthly_summary.slice(-6); // Last 6 months

    // Create scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => {
        // Pad the month and return mm/yyyy string
        const m = d.month < 10 ? '0' + d.month : d.month;
        return `${m}/${d.year}`;
      }))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.expenses) * 1.1]) // Add 10% padding
      .range([innerHeight, 0]);

    // Create and add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('fill', theme.palette.text.secondary);

    // Create and add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `$${d}`))
      .selectAll('text')
      .style('fill', theme.palette.text.secondary);

    // Add y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('fill', theme.palette.text.primary)
      .text('Spending ($)');

    // Add bars
    g.selectAll('.bar')
    .data(chartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => {
    const month = d.month < 10 ? '0' + d.month : d.month;
    // Use the formatted key (mm/yyyy) to find the corresponding x position
    return xScale(`${month}/${d.year}`);
    })
    .attr('y', d => yScale(d.expenses))
    .attr('width', xScale.bandwidth())
    .attr('height', d => innerHeight - yScale(d.expenses))
    .attr('fill', theme.palette.primary.main)
    .attr('rx', 4) // Rounded corners
    .attr('ry', 4);

    // Add value labels on top of bars
    g.selectAll('.label')
    .data(chartData)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => {
    const month = d.month < 10 ? '0' + d.month : d.month;
    return xScale(`${month}/${d.year}`) + xScale.bandwidth() / 2;
    })
    .attr('y', d => yScale(d.expenses) - 5)
    .attr('text-anchor', 'middle')
    .style('fill', theme.palette.text.primary)
    .style('font-size', '12px')
    .text(d => `$${d.expenses}`);

    // Add chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', theme.palette.text.primary)
      .text('Monthly Spending Trend');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get transaction type icon and color
  const getTransactionTypeInfo = (type) => {
    if (type === 'income') {
      return {
        icon: <IncomeIcon />,
        color: theme.palette.success.main,
        bgcolor: theme.palette.success.light
      };
    } else {
      return {
        icon: <ExpenseIcon />,
        color: theme.palette.error.main,
        bgcolor: theme.palette.error.light
      };
    }
  };

    // Get current month and year
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Fetch budget data
    const { 
      data: currentMonthBudget, 
      isLoading: isBudgetLoading 
    } = useCurrentMonthBudget();
    
    const { 
      data: budgetSummary, 
      isLoading: isBudgetSummaryLoading 
    } = useBudgetSummary(currentMonth, currentYear);

  // Loading state
  if (isDashboardLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Paper sx={{ p: 3, bgcolor: theme.palette.error.light }}>
          <Typography color="error">
            Error loading dashboard data. Please try again later.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>
      
      {/* Financial Summary KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
              aspectRatio: 1,
              marginInline: 2
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  <BalanceIcon />
                </Avatar>
                <Typography variant="h6" color="textSecondary">
                  Current Balance
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', marginTop: '45px', textAlign: 'center' }}>
                {dashboardData ? formatCurrency(dashboardData.net_balance) : '$0.00'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                As of {format(new Date(), 'MMM d, yyyy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.success.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
              aspectRatio: 1,
              marginInline: 2
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: theme.palette.success.light, mr: 2 }}>
                  <IncomeIcon />
                </Avatar>
                <Typography variant="h6" color="textSecondary">
                  Total Income
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', marginTop: '45px', textAlign: 'center' }}>
                {dashboardData ? formatCurrency(dashboardData.total_income) : '$0.00'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                All time income
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.error.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
              aspectRatio: 1,
              marginInline: 2
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: theme.palette.error.light, mr: 2 }}>
                  <ExpenseIcon />
                </Avatar>
                <Typography variant="h6" color="textSecondary">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', marginTop: '45px', textAlign: 'center' }}>
                {dashboardData ? formatCurrency(dashboardData.total_expenses) : '$0.00'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                All time expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {/* Budget Information Section */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Budget Overview - {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
              </Typography>
            </Box>
            
            {isBudgetLoading || isBudgetSummaryLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                <CircularProgress size={30} />
              </Box>
            ) : budgetSummary[0]  ? (
              <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {budgetSummary[0].category_name}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="body2" color="textSecondary">
                            Budget: {formatCurrency(budgetSummary[0].amount)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={budgetSummary[0].percentage_used > 90 ? "error" : "textSecondary"}
                          >
                            Used: {formatCurrency(budgetSummary[0].spent)}
                          </Typography>
                        </Box>
                        
                        <Box mt={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(budgetSummary[0].percentage_used, 100)}
                            color={
                              budgetSummary[0].percentage_used > 90 ? "error" : 
                              budgetSummary[0].percentage_used > 75 ? "warning" : "primary"
                            }
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="body2">
                            {budgetSummary[0].percentage_used}% used
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={budgetSummary[0].remaining < 0 ? "error" : "success.main"}
                          >
                            {formatCurrency(budgetSummary[0].remaining)} remaining
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
            ) : (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                py={4}
                bgcolor={theme.palette.background.default}
                borderRadius={1}
              >
                <Typography variant="body1" color="textSecondary">
                  No budgets set for this month.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
      </Grid>

      
      {/* Spending Chart */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          height: '100%',
          minHeight: 350,
          display: 'flex',
          flexDirection: 'column',
          marginBlock: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Spending Chart
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
      </Paper>
      
      {/* Recent Transactions */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2,
          height: '100%',
          minHeight: 300
        }}
      >
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {isTransactionsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress size={30} />
          </Box>
        ) : transactionsData && transactionsData.results.length > 0 ? (
          <List>
            {transactionsData.results.map((transaction) => {
              const typeInfo = getTransactionTypeInfo(transaction.transaction_type);
              return (
                <ListItem 
                  key={transaction.id}
                  sx={{ 
                    mb: 1, 
                    bgcolor: theme.palette.background.default,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: typeInfo.bgcolor, color: typeInfo.color }}>
                      {typeInfo.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={transaction.description}
                    secondary={
                      <>
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                        {transaction.category && (
                          <Chip 
                            label={transaction.category.name} 
                            size="small" 
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </>
                    }
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: transaction.transaction_type === 'income' 
                        ? theme.palette.success.main 
                        : theme.palette.error.main
                    }}
                  >
                    {transaction.transaction_type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 5 }}>
            No recent transactions found.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;