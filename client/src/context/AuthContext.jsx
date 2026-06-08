import { createContext, useContext, useState } from 'react';

// Create the context
const AuthContext = createContext(null);

// Provider wraps the whole app and shares auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // On page refresh, load user from localStorage
    const saved = localStorage.getItem('dqs_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('dqs_token', token);
    localStorage.setItem('dqs_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('dqs_token');
    localStorage.removeItem('dqs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this anywhere to get user/login/logout
export function useAuth() {
  return useContext(AuthContext);
}