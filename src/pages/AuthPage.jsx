// src/Component/AuthPage.jsx (FINAL - Saves User Data to Firestore on Registration)
import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
// *** IMPORTANT: Add Firestore imports here ***
import { doc, setDoc, serverTimestamp, getDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase'; // *** IMPORTANT: Make sure db is imported ***
import '../index.css';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

<<<<<<< HEAD
// Simplified AuthPage component that works with the main app's authentication flow
const AuthPage = () => {
=======
// Accept both onAuthActionStart and onAuthActionComplete props
const AuthPage = ({ onLoginSuccess, onAuthActionStart, onAuthActionComplete, onGuestLoginSuccess }) => {
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Local loading for form disable
  const [loginRole, setLoginRole] = useState('user');
  const [guestInputName, setGuestInputName] = useState('');
  const { role, user } = useAuth ? useAuth() : { role: null, user: null };
  const navigate = useNavigate();

<<<<<<< HEAD
  // The main app will handle redirects based on authentication state
=======
  // Redirect to dashboard after login based on role
  useEffect(() => {
    if (user && role) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'user') {
        navigate('/user', { replace: true });
      }
    }
  }, [user, role, navigate]);
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Disable form button

<<<<<<< HEAD
    // Authentication action started
=======
    // Inform App.jsx that an auth action has started
    if (onAuthActionStart) {
      onAuthActionStart(); // This will make App.jsx show the global loading screen
    }
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

    try {
      if (isLogin) {
        // --- Login Logic ---
        await signInWithEmailAndPassword(auth, email, password);
<<<<<<< HEAD
        
        // Check user's actual registered role
        console.log('User attempting login as:', loginRole);
        
        // Check if user exists in admins collection
        const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        let actualRole = null;
        if (adminDoc.exists()) {
          actualRole = 'admin';
          console.log('User is registered as admin');
        } else if (userDoc.exists()) {
          actualRole = 'user';
          console.log('User is registered as user');
        } else {
          console.log('User not found in any collection');
          await signOut(auth);
          setError('User account not found. Please register first.');
          setLoading(false);
          return;
        }
        
        // Check if login role matches actual role
        if (loginRole !== actualRole) {
          console.log('Role mismatch. User trying to login as', loginRole, 'but registered as', actualRole);
          await signOut(auth);
          setError(`You are registered as a ${actualRole}. Please login as ${actualRole}.`);
          setLoading(false);
          return;
        }
        
        console.log(`User logged in as ${loginRole} successfully!`);
        // The main app's onAuthStateChanged will handle the redirect automatically
=======
        console.log(`User logged in as ${loginRole} successfully!`);
        onLoginSuccess(); // This will trigger App.jsx's onAuthStateChanged
        // App.jsx's onAuthStateChanged will then set isAuthTransitioning to false,
        // so no need to call onAuthActionComplete here directly for successful login.
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
      } else {
        // --- Registration Logic ---
        if (password !== confirmPassword) {
          setError('The passwords you entered do not match. Please try again.');
          setLoading(false);
<<<<<<< HEAD
=======
          if (onAuthActionComplete) onAuthActionComplete(); // Dismiss global loading on local validation fail
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
          return;
        }

        if (mobileNumber && !/^\d{10,15}$/.test(mobileNumber)) {
          setError('Please enter a valid mobile number (10 to 15 digits, numbers only).');
          setLoading(false);
<<<<<<< HEAD
=======
          if (onAuthActionComplete) onAuthActionComplete(); // Dismiss global loading on local validation fail
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (fullName) {
          await updateProfile(user, {
            displayName: fullName,
          });
          console.log('User display name updated:', fullName);
        }

        // **** CRUCIAL ADDITION: Save user's role and profile data to Firestore ****
<<<<<<< HEAD
        // This creates a document in the appropriate collection based on selected role
        if (loginRole === 'admin') {
          // Create admin user in admins collection
          await setDoc(doc(db, "admins", user.uid), {
            email: user.email,
            fullName: fullName,
            mobileNumber: mobileNumber,
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          console.log('Admin user saved to Firestore.');
        } else {
          // Create regular user in users collection
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            fullName: fullName,
            mobileNumber: mobileNumber,
            role: 'user',
            createdAt: serverTimestamp(),
          });
          console.log('User profile saved to Firestore with role "user".');
        }
=======
        // This creates a document in the 'users' collection with the user's UID as its ID.
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          fullName: fullName,
          mobileNumber: mobileNumber,
          role: 'user', // Default role for self-registered users
          createdAt: serverTimestamp(), // Use Firestore's server timestamp
        });
        console.log('User profile saved to Firestore with role "user".');
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

        console.log('User registered successfully!', user);

        // Immediately sign out after registration to ensure App.jsx detects no active user.
        await signOut(auth);

        // After signOut, Firebase's onAuthStateChanged in App.jsx will be triggered for null user.
        // App.jsx's listener will then handle setting isAuthTransitioning to false.
        // So, we only need to update AuthPage's local state for the next render.
        setIsLogin(true); // Switch AuthPage to Login view
        setEmail('');
        setPassword('');
        setFullName('');
        setMobileNumber('');
        setConfirmPassword('');
        setError('Registration successful! Please log in with your new account.'); // Inform user

        setLoading(false); // Local loading can be stopped now
        // No explicit onAuthActionComplete needed here as onAuthStateChanged in App.jsx handles it after signOut
      }
    } catch (err) {
      console.error('Authentication error:', err.message);
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid. Please check the format.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Your account has been disabled. Please contact support.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email. Please register or check your email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'The password you entered is incorrect. Please try again.';
            break;
          case 'auth/invalid-credential':
             errorMessage = 'Invalid email or password. Please double-check your credentials.';
             break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please login or use a different email.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please choose a stronger password (at least 6 characters).';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = `Error: ${err.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false); // Ensure local form loading is always turned off
<<<<<<< HEAD
      // Error handling completed
=======
      // If an error occurred, explicitly signal completion to App.jsx.
      // App.jsx's onAuthStateChanged won't necessarily fire on an error if no state change happens.
      if (error && onAuthActionComplete) {
          onAuthActionComplete(); // This will dismiss the global loading screen
      }
      // If it's a successful login, onAuthStateChanged in App.jsx handles setting isAuthTransitioning to false.
      // If it's a successful registration, onAuthStateChanged also handles it after the signOut.
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(prev => !prev);
    setError(''); // Clear errors when switching modes
    setEmail(''); // Clear form fields when switching
    setPassword('');
    setFullName('');
    setMobileNumber('');
    setConfirmPassword('');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
<<<<<<< HEAD
=======
    if (onAuthActionStart) onAuthActionStart();
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
<<<<<<< HEAD
      
      // Check if user exists in any collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!adminDoc.exists() && !userDoc.exists()) {
        // New user, create user doc based on selected role
        console.log('Creating new Google user with role:', loginRole);
        if (loginRole === 'admin') {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            fullName: user.displayName || '',
            mobileNumber: '',
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          console.log('Google admin user created');
        } else {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            fullName: user.displayName || '',
            mobileNumber: '',
            role: 'user',
            createdAt: serverTimestamp(),
          });
          console.log('Google user created');
        }
      } else {
        // Existing user, check role match
        console.log('Google login - User attempting login as:', loginRole);
        
        let actualRole = null;
        if (adminDoc.exists()) {
          actualRole = 'admin';
          console.log('Google user is registered as admin');
        } else if (userDoc.exists()) {
          actualRole = 'user';
          console.log('Google user is registered as user');
        }
        
        // Check if login role matches actual role
        if (loginRole !== actualRole) {
          console.log('Google login role mismatch. User trying to login as', loginRole, 'but registered as', actualRole);
          await signOut(auth);
          setError(`You are registered as a ${actualRole}. Please login as ${actualRole}.`);
          setLoading(false);
          return;
        }
      }
      
      // Google login successful - main app will handle redirect
=======
      // Check if user doc exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // New user, create user doc
        await setDoc(userDocRef, {
          email: user.email,
          fullName: user.displayName || '',
          mobileNumber: '',
          role: 'user',
          createdAt: serverTimestamp(),
        });
      }
      if (onLoginSuccess) onLoginSuccess();
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
    } catch (err) {
      setError('Google login failed. ' + err.message);
    } finally {
      setLoading(false);
<<<<<<< HEAD
=======
      if (onAuthActionComplete) onAuthActionComplete();
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
    }
  };

  // Guest login handler
  const handleGuestLogin = async (guestName) => {
    setError("");
    setLoading(true);
    try {
      // Generate a random ID for the guest
      const guestId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      await setDoc(doc(collection(db, 'guests'), guestId), {
        name: guestName,
        createdAt: serverTimestamp(),
      });
<<<<<<< HEAD
      // Guest login successful
=======
      if (onGuestLoginSuccess) onGuestLoginSuccess(guestId, guestName);
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
    } catch (err) {
      setError('Failed to login as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-form-card ${loginRole === 'admin' ? 'admin-mode' : ''}`}>
        <h2 className="auth-title">{isLogin ? 'Login' : 'Register'}</h2>

        {/* User/Admin Role Switcher */}
<<<<<<< HEAD
        <div className="login-role-switch">
            <button
                type="button"
                className={`role-button ${loginRole === 'user' ? 'active' : ''}`}
                onClick={() => setLoginRole('user')}
            >
                User
            </button>
            <button
                type="button"
                className={`role-button ${loginRole === 'admin' ? 'active' : ''}`}
                onClick={() => setLoginRole('admin')}
            >
                Admin
            </button>
        </div>
        
        {/* Role Selection Info */}
        <div className="role-info">
            <p>Selected Role: <strong>{loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}</strong></p>
            {!isLogin && (
              <p className="role-description">
                {loginRole === 'admin' 
                  ? 'You will be registered as an administrator with full access to the admin dashboard.'
                  : 'You will be registered as a regular user with access to your personal dashboard.'
                }
              </p>
            )}
        </div>
=======
        {isLogin && ( // Only show role switch on login page
            <div className="login-role-switch">
                <button
                    type="button"
                    className={`role-button ${loginRole === 'user' ? 'active' : ''}`}
                    onClick={() => setLoginRole('user')}
                >
                    User
                </button>
                <button
                    type="button"
                    className={`role-button ${loginRole === 'admin' ? 'active' : ''}`}
                    onClick={() => setLoginRole('admin')}
                >
                    Admin
                </button>
            </div>
        )}
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

        {/* Google Login Button (only for login) */}
        {isLogin && (
          <button type="button" className="google-login-btn" onClick={handleGoogleLogin} disabled={loading}>
            Continue with Google
          </button>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name field (only for registration) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                className="auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                placeholder="Your Name"
              />
            </div>
          )}

          {/* Email field (for both login and registration) */}
          <div className="form-group">
            <label htmlFor="email">Email ID</label>
            <input
              type="email"
              id="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />
          </div>

          {/* Mobile No field (only for registration) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="mobileNo">Mobile No.</label>
              <input
                type="tel"
                id="mobileNo"
                className="auth-input"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required={!isLogin}
                placeholder="e.g., +1234567890 (optional)"
              />
            </div>
          )}

          {/* Password field (for both login and registration) */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 6 characters"
            />
          </div>

          {error && <p className="auth-error-message">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {/* Guest Login (only show if not admin) */}
        {loginRole !== 'admin' && (
          <div className="guest-login">
            <h3>Continue as Guest</h3>
            <input
              type="text"
              placeholder="Enter your name"
              value={guestInputName}
              onChange={(e) => setGuestInputName(e.target.value)}
              className="auth-input"
            />
            <button
              onClick={() => {
                if (guestInputName.trim().length < 2) {
                  setError('Name must be at least 2 characters');
                  return;
                }
                handleGuestLogin(guestInputName.trim());
              }}
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Enter as Guest'}
            </button>
          </div>
        )}

        {/* Confirm Password field (only for registration) */}
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={!isLogin}
              placeholder="Re-enter password"
            />
          </div>
        )}

        <div className="auth-switch-link">
          {isLogin ? (
            <p>Don't have an account? <span onClick={handleSwitchMode}>Register here.</span></p>
          ) : (
            <p>Already have an account? <span onClick={handleSwitchMode}>Login here.</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
