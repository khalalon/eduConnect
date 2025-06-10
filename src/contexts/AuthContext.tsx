import React, { createContext, useReducer } from 'react';

// Define the shape of the auth state
type AuthState = {
  isAuthenticated: boolean;
  userType: 'student' | 'professor' | null;
  user: any | null;
};

// Define the shape of the auth context
type AuthContextType = {
  state: AuthState;
  login: (userData: any, userType: 'student' | 'professor') => void;
  logout: () => void;
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  userType: null,
  user: null,
};

// Create the context
export const AuthContext = createContext<AuthContextType>({
  state: initialState,
  login: () => {},
  logout: () => {},
});

// Define action types
type AuthAction =
  | { type: 'LOGIN'; payload: { user: any; userType: 'student' | 'professor' } }
  | { type: 'LOGOUT' };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        userType: action.payload.userType,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        userType: null,
        user: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = (userData: any, userType: 'student' | 'professor') => {
    dispatch({
      type: 'LOGIN',
      payload: { user: userData, userType },
    });
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
