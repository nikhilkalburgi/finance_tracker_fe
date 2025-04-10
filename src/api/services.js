import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Base API configuration
const API_URL = "https://finance-tracker-be-1-87a42fd39153.herokuapp.com/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication Services
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/token/", credentials);
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post("/auth/token/refresh/", { refresh: refreshToken });
  return response.data;
};

export const logoutUser = async (refreshToken) => {
  return await api.post("/auth/logout/", { refresh: refreshToken });
};

// User Profile Services
export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/auth/me/");
      return response.data;
    },
    staleTime: 300000, // 5 minutes
  });
}

// Transaction Services
export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async ({ queryKey }) => {
      const [, filters] = queryKey;
      const { 
        page = 1, 
        pageSize = 10, 
        search = "", 
        category = "", 
        transactionType = "", 
        startDate = "", 
        endDate = "", 
        minAmount = "", 
        maxAmount = "", 
        ordering = "-date" 
      } = filters;

      // Build query string
      let queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page);
      if (pageSize) queryParams.append("page_size", pageSize);
      if (search) queryParams.append("search", search);
      if (category) queryParams.append("category", category);
      if (transactionType) queryParams.append("transaction_type", transactionType);
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      if (minAmount) queryParams.append("min_amount", minAmount);
      if (maxAmount) queryParams.append("max_amount", maxAmount);
      if (ordering) queryParams.append("ordering", ordering);

      const response = await api.get(`/transactions/?${queryParams.toString()}`);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 60000, // 1 minute
  });
}

export function useTransaction(id) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/transactions/${id}/`);
      return response.data;
    },
    enabled: !!id, // Only run if id exists
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData) => {
      const response = await api.post("/transactions/", transactionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/transactions/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", data.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Category Services
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/transactions/categories/");
      return response.data;
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await api.post("/transactions/categories/", categoryData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/transactions/categories/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/categories/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Budget Services
export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await api.get("/budgets/");
      return response.data;
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useCurrentMonthBudget() {
  return useQuery({
    queryKey: ["currentMonthBudget"],
    queryFn: async () => {
      const response = await api.get("/budgets/current_month/");
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useBudgetSummary(month, year) {
  return useQuery({
    queryKey: ["budgetSummary", month, year],
    queryFn: async () => {
      let url = "/budgets/summary/";
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budgetData) => {
      const response = await api.post("/budgets/", budgetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["currentMonthBudget"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/budgets/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["currentMonthBudget"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/budgets/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["currentMonthBudget"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
    },
  });
}

// Dashboard Services
export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get("/transactions/dashboard/");
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}