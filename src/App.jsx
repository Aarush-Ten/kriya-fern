import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import AuthPage from './pages/AuthPage';
<<<<<<< HEAD
import AppAdmin from './Admin UI/AppAdmin';
=======
import AppAdmin from './admin/AppAdmin';
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
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
<<<<<<< HEAD
        console.log('User authenticated:', firebaseUser.email);
        // Check 'admins' collection first
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) {
          console.log('User is admin');
=======
        // Check 'admins' collection first
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) {
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
          setRole('admin');
        } else {
          // Check 'users' collection
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
<<<<<<< HEAD
            console.log('User is regular user');
            setRole('user');
          } else {
            console.log('User not found in any collection');
=======
            setRole('user');
          } else {
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
            setRole(null);
          }
        }
      } else {
<<<<<<< HEAD
        console.log('No user authenticated');
=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
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

<<<<<<< HEAD
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
=======
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
  );
};

export default App;
