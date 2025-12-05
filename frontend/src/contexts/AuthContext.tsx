import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'agent' | 'supervisor' | 'admin' | 'system';
  ecoScore: number;
  civicScore: number;
  carbonCredits: number;
  issuesReported: number;
  tasksCompleted: number;
  badge: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateScore: (ecoScore: number, civicScore: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('vasundhara_user');
      const accessToken = localStorage.getItem('vasundhara_access_token');

      if (storedUser && accessToken) {
        try {
          // First, restore the user from localStorage for immediate UI
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Then validate the token by fetching fresh profile data
          try {
            const profileResponse = await apiClient.get('/auth/profile/');
            const userProfile = profileResponse.data;

            // Update user with fresh data from server
            const updatedUser: User = {
              id: userProfile.user || parsedUser.email,
              name: userProfile.name || parsedUser.name,
              email: parsedUser.email,
              role: userProfile.role || 'citizen',
              ecoScore: userProfile.eco_score || 0,
              civicScore: userProfile.civic_score || 0,
              carbonCredits: userProfile.carbon_credits || 0,
              issuesReported: userProfile.issues_reported || 0,
              tasksCompleted: userProfile.tasks_completed || 0,
              badge: userProfile.badge || 'Bronze'
            };

            setUser(updatedUser);
            localStorage.setItem('vasundhara_user', JSON.stringify(updatedUser));
          } catch (apiError) {
            // Token might be invalid/expired - the interceptor will handle refresh
            // If refresh also fails, interceptor will clear storage and redirect
            console.warn('Token validation failed, interceptor will handle refresh');
          }
        } catch (parseError) {
          console.error('Failed to parse stored user:', parseError);
          localStorage.removeItem('vasundhara_user');
          localStorage.removeItem('vasundhara_access_token');
          localStorage.removeItem('vasundhara_refresh_token');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login/', {
        username: email,
        password: password
      });

      // Store tokens
      localStorage.setItem('vasundhara_access_token', response.data.access);
      localStorage.setItem('vasundhara_refresh_token', response.data.refresh);

      // Fetch user profile
      const profileResponse = await apiClient.get('/auth/profile/');
      const userProfile = profileResponse.data;

      const userData: User = {
        id: userProfile.user || email,
        name: userProfile.name || email,
        email: email,
        role: userProfile.role || 'citizen',
        ecoScore: userProfile.eco_score || 0,
        civicScore: userProfile.civic_score || 0,
        carbonCredits: userProfile.carbon_credits || 0,
        issuesReported: userProfile.issues_reported || 0,
        tasksCompleted: userProfile.tasks_completed || 0,
        badge: userProfile.badge || 'Bronze'
      };

      setUser(userData);
      localStorage.setItem('vasundhara_user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signup = async (username: string, email: string, password: string, role: string = 'citizen') => {
    try {
      await apiClient.post('/auth/signup/', {
        username: username,
        email: email,
        password: password,
        role: role
      });

      // Auto-login after signup
      await login(email, password);
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vasundhara_user');
    localStorage.removeItem('vasundhara_access_token');
    localStorage.removeItem('vasundhara_refresh_token');
  };

  const updateScore = (ecoScore: number, civicScore: number) => {
    if (user) {
      const updatedUser = { ...user, ecoScore, civicScore };
      setUser(updatedUser);
      localStorage.setItem('vasundhara_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateScore
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

