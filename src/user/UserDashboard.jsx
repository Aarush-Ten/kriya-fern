import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Checklist from '../components/Checklist';
import Task from '../components/Task';
import Notes from '../components/Notes';
import ProgressBar from '../components/ProgressBar';
import '../components/Comp Css/CustomDropdown.css';
import '../components/Comp Css/Notes.css';
import '../components/Comp Css/ProgressBar.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  if (loading) return <div>Loading your dashboard...</div>;
  if (!userData) return <div>No user data found.</div>;

  return (
    <div className="user-dashboard-container">
      <div className="user-main-box">
        <h2>Welcome, {userData.fullName || user.email}!</h2>
        <div className="dashboard-section">
          {/* Example: Render user's tasks if available */}
          {userData.tasks && userData.tasks.length > 0 ? (
            <Checklist tasks={userData.tasks} />
          ) : (
            <div>No tasks found. Start by adding a new task!</div>
          )}
        </div>
        {/* You can add more sections for Notes, Progress, etc. */}
      </div>
    </div>
  );
};

export default UserDashboard;
