import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckSquare, List, CalendarDays, User, Flag, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme, useAuth } from '../App';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
Chart.register(ArcElement, Tooltip, Legend);

// Components
import Task from './Component/Task';
import TodoList from './Component/TodoList';
import CustomDropdown from './Component/CustomDropDown';
import { GrainOverlay, GrainContainer } from './GrainOverlay01';
import AnalyticsDashboard from './Component/AnalyticsDashboard';

// CSS
import './App.css';

// Firebase
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const App = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('task');
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('mid');
  const [searchText, setSearchText] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState('11:59 PM');
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTaskInfo, setEditingTaskInfo] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showHiddenUsers, setShowHiddenUsers] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Move loadUsersFromFirestore outside of useEffect so it is accessible everywhere in the component.
  const loadUsersFromFirestore = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        // Show users based on visibility setting
        if (showHiddenUsers || userData.visible !== false) {
          usersData.push({
            id: userData.id || Math.random(),
            name: userData.fullName || userData.email || doc.id,
            tasks: userData.tasks || [],
            lists: userData.lists || [],
            completed: userData.completed || false,
            visible: userData.visible !== false, // Respect the visible flag from Firebase
            email: userData.email,
            uid: doc.id
          });
        }
      });

      // Also load admin users if they have tasks
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      adminsSnapshot.forEach((doc) => {
        const adminData = doc.data();
        // Show admins based on visibility setting and if they have tasks
        if ((showHiddenUsers || adminData.visible !== false) && (adminData.tasks && adminData.tasks.length > 0 || adminData.lists && adminData.lists.length > 0)) {
          usersData.push({
            id: adminData.id || Math.random(),
            name: adminData.fullName || adminData.email || doc.id,
            tasks: adminData.tasks || [],
            lists: adminData.lists || [],
            completed: adminData.completed || false,
            visible: adminData.visible !== false, // Respect the visible flag from Firebase
            email: adminData.email,
            uid: doc.id,
            isAdmin: true
          });
        }
      });

      setLists(usersData);
      console.log('Loaded users from Firestore:', usersData);
    } catch (error) {
      console.error('Error loading users from Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const convertTo12Hour = (time24h) => {
    if (!time24h) return '11:59 PM';
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generate 12-hour time options for dropdown
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const minuteStr = minute.toString().padStart(2, '0');
        const amTime = `${hour}:${minuteStr} AM`;
        const pmTime = `${hour}:${minuteStr} PM`;

        times.push({
          value: amTime,
          label: amTime,
          icon: <Clock size={16} />
        });

        if (hour !== 12 || minute !== 45) { // Don't duplicate 12:45 PM
          times.push({
            value: pmTime,
            label: pmTime,
            icon: <Clock size={16} />
          });
        }
      }
    }
    return times.sort((a, b) => {
      const timeA = convertTo24Hour(a.value);
      const timeB = convertTo24Hour(b.value);
      return timeA.localeCompare(timeB);
    });
  };

  const timeOptions = generateTimeOptions();

  const toggleCalendar = () => setShowCalendar(prev => !prev);

  const combineDateTime = (date, time) => {
    if (!date) return null;
    const time24h = convertTo24Hour(time);
    const [hours, minutes] = time24h.split(':');
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combinedDate;
  };

  const handleEditTask = (listId, task, sublistId = null) => {
    setEditingTaskInfo({ listId, taskId: task.id, sublistId });
    setEditingText(task.text);
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim()) return;

    const updatedLists = lists.map((list) => {
      if (list.id !== editingTaskInfo.listId) return list;

      // If editing a sublist task
      if (editingTaskInfo.sublistId) {
        return {
          ...list,
          lists: list.lists.map((sublist) =>
            sublist.id === editingTaskInfo.sublistId
              ? {
                ...sublist,
                task: sublist.task.map((task) =>
                  task.id === editingTaskInfo.taskId
                    ? { ...task, text: editingText }
                    : task
                ),
              }
              : sublist
          ),
        };
      }

      // If editing a main list task
      return {
        ...list,
        tasks: list.tasks.map((task) =>
          task.id === editingTaskInfo.taskId
            ? { ...task, text: editingText }
            : task
        ),
      };
    });

    setLists(updatedLists);

    const updatedUser = updatedLists.find(user => user.uid === selectedUser);
    if (updatedUser) {
      try {
        const collectionName = updatedUser.isAdmin ? "admins" : "users";
        const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, {
          id: updatedUser.id,
          name: updatedUser.name,
          fullName: updatedUser.name,
          email: updatedUser.email,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        }, { merge: true });
        console.log("Task updated successfully in Firebase");
      } catch (error) {
        console.error("Error updating task in Firebase:", error);
      }
    }

    setEditingTaskInfo(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingTaskInfo(null);
    setEditingText('');
  };

  const filteredLists = useMemo(() => {
    return lists.filter(list => {
      const hasTasks = list.tasks?.length > 0;
      const hasSublists = list.lists?.length > 0;

      const matchesSearch =
        list.name.toLowerCase().includes(searchText.toLowerCase()) ||
        list.tasks.some(task => task.text.toLowerCase().includes(searchText.toLowerCase())) ||
        list.lists?.some(subList =>
          subList.name.toLowerCase().includes(searchText.toLowerCase()) ||
          subList.task?.some(task => task.text.toLowerCase().includes(searchText.toLowerCase()))
        );

      return (hasTasks || hasSublists) && list.visible !== false && matchesSearch;
    });
  }, [lists, searchText]);

  const completeList = async (id) => {
    const updatedLists = lists.map(list =>
      list.id === id ? { ...list, completed: !list.completed } : list
    );
    setLists(updatedLists); // Update local state first

    // Find the user whose list was completed
    const updatedUser = updatedLists.find(user => user.id === id);
    if (updatedUser) {
      try {
        const collectionName = updatedUser.isAdmin ? "admins" : "users";
        const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          fullName: updatedUser.name,
          email: updatedUser.email,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        }, { merge: true });
        console.log("List completion updated successfully in Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error updating list completion in Firebase:", error);
      }
    }
  };

  const restoreUser = async (id) => {
    const targetList = lists.find(list => list.id === id);
    if (targetList) {
      try {
        const collectionName = targetList.isAdmin ? "admins" : "users";
        const documentId = targetList.isAdmin ? (targetList.uid || targetList.name) : targetList.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, {
          id: targetList.id,
          name: targetList.name,
          fullName: targetList.name,
          email: targetList.email,
          tasks: targetList.tasks,
          lists: targetList.lists,
          completed: targetList.completed,
          notes: targetList.notes || '',
          visible: true, // Mark as visible in Firebase
        }, { merge: true });
        console.log("User restored successfully in Firebase:", targetList.name);
        
        // Reload the data to reflect the change
        await loadUsersFromFirestore();
      } catch (error) {
        console.error("Error restoring user in Firebase:", error);
      }
    }
  };

  const deleteList = async (id) => {
    const targetList = lists.find(list => list.id === id);
    if (confirm(`Do you want to hide the "${targetList?.name}" user from the admin panel? This will hide all their tasks but keep the data in Firebase.`)) {
      const updatedLists = lists.map(list =>
        list.id === id ? { ...list, visible: false } : list // Only hide the user, don't clear data
      );
      setLists(updatedLists); // Update local state first

      // Update the user document in Firebase to mark as hidden
      if (targetList) {
        try {
          const collectionName = targetList.isAdmin ? "admins" : "users";
          const documentId = targetList.isAdmin ? (targetList.uid || targetList.name) : targetList.uid;
          
          const userRef = doc(db, collectionName, documentId);
          await deleteDoc(userRef);
          console.log("User hidden successfully in Firebase:", targetList.name);
        } catch (error) {
          console.error("Error hiding user in Firebase:", error);
        }
      }
    }
  };

  const completeTaskInList = async (listId, taskId) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? {
          ...list,
          tasks: list.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }
        : list
    );
    setLists(updatedLists); // Update local state first

    // Find the user whose task was completed
    const updatedUser = updatedLists.find(user => user.id === listId);
    if (updatedUser) {
      try {
        const collectionName = updatedUser.isAdmin ? "admins" : "users";
        const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          fullName: updatedUser.name,
          email: updatedUser.email,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        }, { merge: true });
        console.log("Main task completion updated successfully in Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error updating main task completion in Firebase:", error);
      }
    }
  };

  const deleteTaskFromList = async (listId, taskId, doNotAskTaskDelete) => {
    const targetList = lists.find(list => list.id === listId);
    const targetTask = targetList?.tasks.find(task => task.id === taskId); // Use optional chaining

    if (doNotAskTaskDelete || window.confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
      const updatedTasks = targetList.tasks.filter(task => task.id !== taskId);
      const updatedLists = lists.map(list =>
        list.id === listId ? { ...list, tasks: updatedTasks } : list
      );
      setLists(updatedLists); // Update local state first

      // Find the user whose task was deleted
      const updatedUser = updatedLists.find(user => user.id === listId);
      if (updatedUser) {
        try {
          const collectionName = updatedUser.isAdmin ? "admins" : "users";
          const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
          
          const userRef = doc(db, collectionName, documentId);
          await setDoc(userRef, { // Overwrite the entire user document with updated data
            id: updatedUser.id,
            name: updatedUser.name,
            fullName: updatedUser.name,
            email: updatedUser.email,
            tasks: updatedUser.tasks,
            lists: updatedUser.lists,
            completed: updatedUser.completed,
            notes: updatedUser.notes || '',
          }, { merge: true });
          console.log("Main task deleted successfully from Firebase for user:", updatedUser.name);
        } catch (error) {
          console.error("Error deleting main task from Firebase:", error);
        }
      }
    }
  };

  const completeSublistTask = async (userId, sublistId, taskId) => {
    const updatedLists = lists.map(user => {
      if (user.id !== userId) return user;

      const updatedSublists = user.lists.map(sublist => {
        if (sublist.id !== sublistId) return sublist;

        return {
          ...sublist,
          task: sublist.task.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      });

      return {
        ...user,
        lists: updatedSublists
      };
    });

    setLists(updatedLists); // Update local state first

    // Find the user whose sublist task was completed
    const updatedUser = updatedLists.find(user => user.id === userId);
    if (updatedUser) {
      try {
        const collectionName = updatedUser.isAdmin ? "admins" : "users";
        const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          fullName: updatedUser.name,
          email: updatedUser.email,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        }, { merge: true });
        console.log("Sublist task completion updated successfully in Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error updating sublist task completion in Firebase:", error);
      }
    }
  };

  const deleteSublistTask = async (userId, sublistId, taskId, doNotAskTaskDelete) => {
    const targetUser = lists.find(user => user.id === userId);
    const targetSublist = targetUser?.lists?.find(sublist => sublist.id === sublistId);
    const targetTask = targetSublist?.task?.find(task => task.id === taskId);

    if (doNotAskTaskDelete || window.confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
      const updatedLists = lists.map(user => {
        if (user.id !== userId) return user;

        const updatedSublists = user.lists.map(sublist => {
          if (sublist.id !== sublistId) return sublist;

          return {
            ...sublist,
            task: sublist.task.filter(task => task.id !== taskId)
          };
        });

        return {
          ...user,
          lists: updatedSublists
        };
      });

      setLists(updatedLists); // Update local state first

      // Find the user whose sublist task was deleted
      const updatedUser = updatedLists.find(user => user.id === userId);
      if (updatedUser) {
        try {
          const collectionName = updatedUser.isAdmin ? "admins" : "users";
          const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
          
          const userRef = doc(db, collectionName, documentId);
          await setDoc(userRef, { // Overwrite the entire user document with updated data
            id: updatedUser.id,
            name: updatedUser.name,
            fullName: updatedUser.name,
            email: updatedUser.email,
            tasks: updatedUser.tasks,
            lists: updatedUser.lists,
            completed: updatedUser.completed,
            notes: updatedUser.notes || '',
          }, { merge: true });
          console.log("Sublist task deleted successfully from Firebase for user:", updatedUser.name);
        } catch (error) {
          console.error("Error deleting sublist task from Firebase:", error);
        }
      }
    }
  };

  const handleAddTaskToSublist = async (userId, sublistId, taskText, taskDeadline, taskTime, taskPriority) => {
    const updatedLists = lists.map(user => {
      if (user.id !== userId) return user;

      const updatedSublists = user.lists.map(sublist => {
        if (sublist.id !== sublistId) return sublist;

        const combinedDeadline = combineDateTime(taskDeadline || today, taskTime || '11:59 PM');

        const newTask = {
          id: Date.now(), // Generate a unique ID for the new task
          text: taskText,
          deadline: combinedDeadline || today,
          deadlineTime: taskTime || '11:59 PM',
          completed: false,
          priority: taskPriority,
          notes: ''
        };

        return {
          ...sublist,
          task: [...(sublist.task || []), newTask] // Ensure sublist.task is an array
        };
      });

      return {
        ...user,
        lists: updatedSublists
      };
    });

    setLists(updatedLists);

    // Find the user to update in Firebase
    const updatedUser = updatedLists.find(user => user.id === userId);
    if (updatedUser) {
      try {
        const collectionName = updatedUser.isAdmin ? "admins" : "users";
        const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          fullName: updatedUser.name,
          email: updatedUser.email,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists, // Crucially, include the updated sublists
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        }, { merge: true });
        console.log("Sublist task added successfully to Firebase for user:", updatedUser.name);
        await loadUsersFromFirestore(); // Refresh lists after adding
      } catch (error) {
        console.error("Error adding sublist task to Firebase:", error);
      }
    }
  };

  const handleAdd = () => {
    if (!selectedUser) return; // No user selected
    if (!inputValue.trim()) return;

    const combinedDeadline = combineDateTime(deadline || new Date(formattedDate), deadlineTime);

    const updatedLists = lists.map(user => {
      if (user.uid !== selectedUser) return user;

      if (selectedType === 'task') {
        const newTask = {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
          deadline: combinedDeadline || new Date(formattedDate),
          deadlineTime: deadlineTime,
          priority: selectedPriority,
          notes: ''
        };
        return {
          ...user,
          visible: true,
          tasks: [...user.tasks, newTask]
        };
      }

      if (selectedType === 'list') {
        const newList = {
          id: Date.now(),
          name: inputValue.trim(),
          task: [],
          completed: false,
        };
        return {
          ...user,
          visible: true,
          lists: [...user.lists, newList]
        };
      }

      return user;
    });

    setLists(updatedLists);

    const updatedUser = updatedLists.find(user => user.uid === selectedUser);
    if (!updatedUser) return; // No matching user found

    const uploadToFirebase = async () => {
      try {
        // Determine the correct collection and document ID
        const collectionName = updatedUser.isAdmin ? "admins" : "users";
        const documentId = updatedUser.isAdmin ? (updatedUser.uid || updatedUser.name) : updatedUser.uid;
        
        const userRef = doc(db, collectionName, documentId);
        await setDoc(userRef, {
          id: updatedUser.id,
          name: updatedUser.name,
          fullName: updatedUser.name,
          email: updatedUser.email,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        }, { merge: true }); // Use merge to preserve existing data
        console.log("Document written with ID: ", userRef.id);
        await loadUsersFromFirestore(); // Refresh lists after adding
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };

    uploadToFirebase();
    setInputValue('');
    setDeadline(null);
    setDeadlineTime('11:59 PM');
    setSelectedPriority('mid');
  };

  const userOptions = lists.map(user => ({
    value: user.uid,
    label: user.name,
    icon: <User size={16} />,
  }));

  const priorityOptions = [
    { value: 'high', label: 'High Priority', icon: <Flag size={16} color="#ff4444" /> },
    { value: 'mid', label: 'Medium Priority', icon: <Flag size={16} color="#ffaa44" /> },
    { value: 'low', label: 'Low Priority', icon: <Flag size={16} color="#44ff44" /> }
  ];

  const typesOptions = [
    { value: 'task', label: 'Task' },
    { value: 'list', label: 'List' },
  ];

  // Avatar and greeting logic
  const currentUser = lists.find(u => u.uid === selectedUser) || lists[0];
  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    if (email) return email[0].toUpperCase();
    return '?';
  };

  const getAnalytics = () => {
    const userStats = lists.map(user => {
      const total = (user.tasks || []).length;
      const completed = (user.tasks || []).filter(t => t.completed).length;
      const overdue = (user.tasks || []).filter(t => t.deadline && new Date(t.deadline) < new Date() && !t.completed).length;
      return { name: user.name, total, completed, overdue };
    });
    const mostActive = [...userStats].sort((a,b) => b.completed - a.completed)[0];
    const leaderboard = [...userStats].sort((a,b) => b.completed - a.completed).slice(0,5);
    const overdueTotal = userStats.reduce((acc, u) => acc + u.overdue, 0);
    const totalTasks = userStats.reduce((acc, u) => acc + u.total, 0);
    const completedTasks = userStats.reduce((acc, u) => acc + u.completed, 0);
    return { userStats, mostActive, leaderboard, overdueTotal, totalTasks, completedTasks };
  };

  const analytics = getAnalytics();
  const pieData = {
    labels: ['Completed', 'Incomplete'],
    datasets: [
      {
        data: [analytics.completedTasks, analytics.totalTasks - analytics.completedTasks],
        backgroundColor: ['#44ff44', '#ff4444'],
        borderWidth: 1,
      },
    ],
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    loadUsersFromFirestore();
  }, [showHiddenUsers]);

  return (
    <div className={`app theme-${theme}`}>
      <div className="app-header">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1.5rem',flexWrap:'wrap'}}>
          <h1 className="app-title">Todo App</h1>
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <button onClick={()=>setShowAnalytics(true)} className="nav-btn" style={{fontWeight:showAnalytics?700:400,background:showAnalytics?'#444':'#222',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5em 1.2em'}}>Dashboard</button>
            <button onClick={()=>setShowAnalytics(false)} className="nav-btn" style={{fontWeight:showAnalytics?400:700,background:showAnalytics?'#222':'#444',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5em 1.2em'}}>Tasks</button>
            <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button onClick={handleLogout} className="logout-btn" style={{marginLeft:'0.5em',background:'#222',color:'#fff',border:'1.5px solid #fff',borderRadius:'8px',padding:'0.5em 1.2em',fontWeight:600}}>Logout</button>
            {user && (
              <div className="admin-avatar-greeting" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <div className="avatar-circle" style={{width:36,height:36,borderRadius:'50%',background:'#333',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.1rem'}}>
                  {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : (user.email ? user.email[0].toUpperCase() : '?')}
                </div>
                <span style={{fontWeight:500,fontSize:'1rem'}}>Hi, {user.displayName ? user.displayName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'User')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="header-controls">
          { !showAnalytics && (
            <div className="search-container">
              <input
                type="text"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                placeholder="Search..."
                className="search-input"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading user data...</p>
        </div>
      ) : (
        <>
          {showAnalytics ? (
            <AnalyticsDashboard lists={lists} />
          ) : (
            <>
              <div className="add-form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Add a new task or list..."
                  className="main-input"
                />

                <CustomDropdown
                  options={userOptions}
                  selectedValue={selectedUser}
                  setSelectedValue={setSelectedUser}
                  placeholder="Select User"
                />

                <CustomDropdown
                  options={typesOptions}
                  selectedValue={selectedType}
                  setSelectedValue={setSelectedType}
                  placeholder="Select Type"
                />

                <CustomDropdown
                  options={priorityOptions}
                  selectedValue={selectedPriority}
                  setSelectedValue={setSelectedPriority}
                  placeholder="Priority"
                />

                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={toggleCalendar}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Pick deadline date and time"
                  >
                    <CalendarDays size={24} />
                  </button>

                  {showCalendar && (
                    <div className="calendar-dropdown">
                      <DatePicker
                        selected={deadline}
                        onChange={(date) => setDeadline(date)}
                        inline
                        minDate={new Date()}
                      />
                      <div className="time-selection">
                        <label className="time-label">Select Time:</label>
                        <CustomDropdown
                          options={timeOptions}
                          selectedValue={deadlineTime}
                          setSelectedValue={setDeadlineTime}
                          placeholder="Time"
                        />
                      </div>
                      <div className="calendar-actions">
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="calendar-done-btn"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAdd}
                  className="add-btn primary"
                  disabled={!inputValue.trim() || !selectedUser}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="content-area">
                {filteredLists.length > 0 ? (
                  <div className="lists-section">
                    <h2 className="section-title">
                      <List size={20} /> Users with Tasks ({filteredLists.length}/{lists.length})
                    </h2>
                    <div className="lists-container">
                      {filteredLists
                        .sort((a, b) => a.completed - b.completed)
                        .map((list) => (
                          <TodoList
                            key={list.id}
                            list={list}
                            subLists={list.lists}
                            onComplete={completeList}
                            onDelete={deleteList}
                            onRestore={restoreUser}
                            onAddTaskToSublist={handleAddTaskToSublist}
                            onCompleteTask={completeTaskInList}
                            onDeleteTask={deleteTaskFromList}
                            onCompleteSublistTask={completeSublistTask}
                            onDeleteSublistTask={deleteSublistTask}
                            editingTaskInfo={editingTaskInfo}
                            editingText={editingText}
                            setEditingText={setEditingText}
                            onEditTask={handleEditTask}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            showHiddenUsers={showHiddenUsers}
                          />
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No users with tasks yet. Add a task to see the user here.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;