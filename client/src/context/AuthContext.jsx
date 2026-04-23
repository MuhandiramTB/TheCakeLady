import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      return { user: action.payload.user, token: action.payload.token, isLoading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { user: null, token: null, isLoading: false };
    case 'LOADED':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');

  useEffect(() => {
    if (state.token) {
      api('/auth/me')
        .then((res) => dispatch({ type: 'SET_USER', payload: res.data }))
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'LOADED' });
        });
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  // Listen for session expiry from api.js
  useEffect(() => {
    const handler = () => {
      dispatch({ type: 'LOGOUT' });
      setSessionExpiredMsg('Your session expired. Please sign in again.');
      setTimeout(() => setSessionExpiredMsg(''), 5000);
    };
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  const login = (user, token) => {
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
      {sessionExpiredMsg && (
        <div
          role="alert"
          className="fixed top-4 right-4 left-4 sm:left-auto sm:min-w-[320px] bg-amber-500 text-white px-5 py-3.5 rounded-xl shadow-xl z-[60] animate-toast-enter"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[15px] font-medium flex-1">{sessionExpiredMsg}</span>
            <button
              onClick={() => setSessionExpiredMsg('')}
              className="text-white/70 hover:text-white text-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
