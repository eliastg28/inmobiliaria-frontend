// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// Interfaz para la información del usuario
interface User {
  username: string;
  roles: string[];
}

// Interfaz para el tipo de datos que el contexto proveerá
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean; // Nuevo estado para indicar que la verificación ha terminado
  // 'login' ahora acepta un objeto con token, username y roles
  login: (data: { token: string; username: string; roles: string[] }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false); // Nuevo estado

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        logout();
      }
    }
    setIsAuthReady(true); // Se marca como listo después de la verificación inicial
  }, []);

  const login = (data: { token: string; username: string; roles: string[] }) => {
    localStorage.setItem('token', data.token);
    // Guarda el objeto completo del usuario, incluyendo los roles
    localStorage.setItem('user', JSON.stringify({ username: data.username, roles: data.roles }));
    
    // Actualiza el estado del contexto
    setUser({ username: data.username, roles: data.roles });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
