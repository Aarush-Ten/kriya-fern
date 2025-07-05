import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Utility function to create an admin user
export const createAdminUser = async (email, fullName, uid) => {
  try {
    await setDoc(doc(db, "admins", uid), {
      email: email,
      fullName: fullName,
      role: 'admin',
      createdAt: serverTimestamp(),
    });
    console.log('Admin user created successfully:', email);
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
};

// Example usage:
// createAdminUser('admin@example.com', 'Admin User', 'user-uid-here'); 