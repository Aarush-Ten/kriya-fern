import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import AuthPage from './pages/AuthPage';
import AppAdmin from './Admin UI/AppAdmin';
import UserDashboard from './user/UserDashboard';

// Auth Context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Force sign out on mount to require login every reload
  useEffect(() => {
    signOut(auth);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        console.log('User authenticated:', firebaseUser.email);
        // Check 'admins' collection first
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) {
          console.log('User is admin');
          setRole('admin');
        } else {
          // Check 'users' collection
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            console.log('User is regular user');
            setRole('user');
          } else {
            console.log('User not found in any collection');
            setRole(null);
          }
        }
      } else {
        console.log('No user authenticated');
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role !== 'admin') return <Navigate to="/user" />;
  return children;
};

// Protected Route for User
const UserRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role !== 'user') return <Navigate to="/admin" />;
  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  // Handle automatic redirects based on authentication state
  useEffect(() => {
    if (!loading) {
      if (user && role) {
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'user') {
          navigate('/user', { replace: true });
        }
      } else if (!user) {
        navigate('/login', { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/admin" element={
        <AdminRoute>
          <AppAdmin />
        </AdminRoute>
      } />
      <Route path="/user" element={
        <UserRoute>
          <UserDashboard />
        </UserRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Theme Context
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
