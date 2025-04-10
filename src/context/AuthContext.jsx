// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, refreshToken } from '../api/services';
import {jwtDecode} from 'jwt-decode'; // You'll need to install this: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Function to check if token is expired or about to expire
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Check if token will expire in the next 5 minutes (300 seconds)
      return decoded.exp < (Date.now() / 1000) + 300;
    } catch (error) {
      return true; // If there's an error decoding, consider the token expired
    }
  };
  
  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      setUser(null);
      return false;
    }
    
    try {
      const data = await refreshToken(refreshTokenValue);
      localStorage.setItem('access_token', data.access);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      return false;
    }
  }, []);
  
  // Setup token refresh interval
  useEffect(() => {
    const setupTokenRefresh = () => {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      
      try {
        const decoded = jwtDecode(token);
        const expiresIn = decoded.exp * 1000 - Date.now(); // Convert to milliseconds
        
        // If token is already expired or about to expire, refresh immediately
        if (expiresIn < 300000) { // Less than 5 minutes
          refreshAccessToken();
          return null;
        }
        
        // Set up interval to refresh token 5 minutes before it expires
        const timeToRefresh = expiresIn - 300000; // 5 minutes before expiry
        const refreshInterval = setTimeout(() => {
          refreshAccessToken();
        }, timeToRefresh);
        
        return refreshInterval;
      } catch (error) {
        console.error('Error setting up token refresh:', error);
        return null;
      }
    };
    
    const refreshInterval = setupTokenRefresh();
    
    // Clean up interval on unmount
    return () => {
      if (refreshInterval) clearTimeout(refreshInterval);
    };
  }, [user, refreshAccessToken]);
  
  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        if (isTokenExpired(token)) {
          // Token is expired or about to expire, try to refresh
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            setUser({ isAuthenticated: true });
          }
        } else {
          // Token is valid
          setUser({ isAuthenticated: true });
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [refreshAccessToken]);
  
  // Add token refresh to axios interceptor
  useEffect(() => {
    // This effect sets up an axios interceptor to handle 401 errors
    // by attempting to refresh the token and retrying the request
    const setupAxiosInterceptor = async () => {
      const { default: axios } = await import('axios');
      
      // Response interceptor for handling 401 Unauthorized errors
      const responseInterceptor = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          
          // If error is 401 and we haven't tried to refresh the token yet
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // Try to refresh the token
              const refreshed = await refreshAccessToken();
              
              if (refreshed) {
                // Update the authorization header with the new token
                const token = localStorage.getItem('access_token');
                originalRequest.headers.Authorization = `Bearer ${token}`;
                
                // Retry the original request
                return axios(originalRequest);
              }
            } catch (refreshError) {
              // If refresh fails, redirect to login
              navigate('/login');
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
      
      // Clean up interceptor on unmount
      return () => {
        axios.interceptors.response.eject(responseInterceptor);
      };
    };
    
    setupAxiosInterceptor();
  }, [navigate, refreshAccessToken]);
  
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setUser({ isAuthenticated: true });
      navigate('/dashboard');
      return true;
    } catch (error) {
      setError(
        error.response?.data?.detail || 
        'Login failed. Please check your credentials.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);