import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useAuth, useTheme } from '../App';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Check, Trash2, StickyNote, Flag, Calendar, User, LogOut, MessageCircle, Paperclip } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../index.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
=======
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
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
<<<<<<< HEAD
        try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
=======
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

<<<<<<< HEAD
  const handleCompleteTask = async (taskId) => {
    if (!userData || !user) return;

    const updatedTasks = userData.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedLists = userData.lists ? userData.lists.map(list => ({
      ...list,
      tasks: list.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    })) : [];

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        tasks: updatedTasks,
        lists: updatedLists
      });
      setUserData(prev => ({
        ...prev,
        tasks: updatedTasks,
        lists: updatedLists
      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCompleteList = async (listId) => {
    if (!userData || !user) return;

    const updatedLists = userData.lists.map(list => 
      list.id === listId ? { ...list, completed: !list.completed } : list
    );

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lists: updatedLists
      });
      setUserData(prev => ({
        ...prev,
        lists: updatedLists
      }));
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleCompleteTaskInList = async (listId, taskId) => {
    if (!userData || !user) return;

    const updatedLists = userData.lists.map(list => 
      list.id === listId ? {
        ...list,
        tasks: list.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      } : list
    );

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lists: updatedLists
      });
      setUserData(prev => ({
        ...prev,
        lists: updatedLists
      }));
    } catch (error) {
      console.error('Error updating task in list:', error);
    }
  };

  const handleOpenNotes = (task, initialNote = '') => {
    setSelectedTask(task);
    setNotesText(initialNote || task.note || '');
    setShowNotes(true);
  };

  const handleSaveNote = async () => {
    if (!selectedTask || !userData || !user) return;

    const updatedNote = notesText.trim();
    
    // Update task in main tasks array
    const updatedTasks = userData.tasks.map(task => 
      task.id === selectedTask.id ? { ...task, note: updatedNote } : task
    );

    // Update task in lists if it exists there
    const updatedLists = userData.lists ? userData.lists.map(list => ({
      ...list,
      tasks: list.tasks.map(task => 
        task.id === selectedTask.id ? { ...task, note: updatedNote } : task
      )
    })) : [];

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        tasks: updatedTasks,
        lists: updatedLists
      });
      setUserData(prev => ({
        ...prev,
        tasks: updatedTasks,
        lists: updatedLists
      }));
      setShowNotes(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDeadline = (deadline, deadlineTime) => {
    if (!deadline) return 'No deadline';
    
    const date = new Date(deadline);
    const dateStr = date.toLocaleDateString();
    
    let timeStr = deadlineTime || '11:59 PM';
    
    return `${dateStr} at ${timeStr}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'mid': return '#ffaa44';
      case 'low': return '#44ff44';
      default: return '#888';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'mid': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'No Priority';
    }
  };

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    if (email) return email[0].toUpperCase();
    return '?';
  };

  const TaskItem = ({ task, onComplete, onOpenNotes }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(task.comments || []);
    const [attachments, setAttachments] = useState(task.attachments || []);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
      setComments(task.comments || []);
      setAttachments(task.attachments || []);
    }, [task.comments, task.attachments]);

    const handleAddComment = async () => {
      if (!commentText.trim()) return;
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author: user?.uid || 'user',
        authorName: userData?.fullName || user?.email || 'User',
        timestamp: new Date().toISOString(),
      };
      const updatedComments = [...(comments || []), newComment];
      setComments(updatedComments);
      setCommentText('');
      // Save to Firestore (update task.comments)
      const updatedTasks = userData.tasks.map(t => t.id === task.id ? { ...t, comments: updatedComments } : t);
      await updateDoc(doc(db, 'users', user.uid), { tasks: updatedTasks });
    };

    const handleFileChange = async (e) => {
      const files = Array.from(e.target.files);
      const newAttachments = await Promise.all(files.map(async (file) => {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { name: file.name, url: base64, type: file.type };
      }));
      const updated = [...attachments, ...newAttachments];
      setAttachments(updated);
      // Save to Firestore (update task.attachments)
      const updatedTasks = userData.tasks.map(t => t.id === task.id ? { ...t, attachments: updated } : t);
      await updateDoc(doc(db, 'users', user.uid), { tasks: updatedTasks });
    };

    return (
      <div className={`task-item ${task.completed ? 'completed' : ''}`}>
        <div className="task-content">
          <div className="task-main">
            <button
              onClick={() => onComplete(task.id)}
              className={`checkbox ${task.completed ? 'checked' : ''}`}
            >
              {task.completed && <Check size={12} />}
            </button>
            <div className="task-info">
              <span className={`task-text ${task.completed ? 'strikethrough' : ''}`}>
                {task.text}
              </span>
              <div className="task-meta">
                <span className="task-deadline">
                  <Calendar size={14} />
                  {formatDeadline(task.deadline, task.deadlineTime)}
                </span>
                <span className="task-priority" style={{ color: getPriorityColor(task.priority) }}>
                  <Flag size={14} />
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
            </div>
          </div>
          <div className="task-actions">
            <button onClick={() => onOpenNotes(task)} className="note-btn" title="Add notes">
              <StickyNote size={16} />
            </button>
            <button onClick={() => setShowChat(true)} className="chat-btn" title="Task Comments">
              <MessageCircle size={16} />
            </button>
            <button onClick={() => fileInputRef.current.click()} className="attach-btn" title="Attach file/image">
              <Paperclip size={16} />
            </button>
            <input type="file" multiple style={{display:'none'}} ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </div>
        {showDetails && task.note && (
          <div className="task-notes">
            <p>{task.note}</p>
          </div>
        )}
        {showChat && (
          <div className="modal-overlay">
            <div className="modal-content chat-modal">
              <div className="modal-header">
                <h3>Task Comments</h3>
                <button onClick={() => setShowChat(false)} className="close-btn">×</button>
              </div>
              <div className="chat-messages" style={{maxHeight:'250px',overflowY:'auto',marginBottom:'1em'}}>
                {comments.length === 0 && <div style={{color:'#888'}}>No comments yet.</div>}
                {comments.map(c => (
                  <div key={c.id} style={{marginBottom:'0.7em',display:'flex',alignItems:'flex-start',gap:'0.5em'}}>
                    <div className="avatar-circle" style={{width:28,height:28,borderRadius:'50%',background:'#333',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.95rem'}}>
                      {c.authorName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{fontWeight:500,fontSize:'0.97em'}}>{c.authorName || 'User'}</div>
                      <div style={{fontSize:'0.85em',color:'#aaa'}}>{new Date(c.timestamp).toLocaleString()}</div>
                      <div style={{marginTop:'0.2em'}}>{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat-input-row" style={{display:'flex',gap:'0.5em'}}>
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Type a comment..."
                  style={{flex:1,padding:'0.5em',borderRadius:'6px',border:'1px solid #ccc'}}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                />
                <button onClick={handleAddComment} style={{padding:'0.5em 1em',borderRadius:'6px',background:'#4CAF50',color:'#fff',border:'none'}}>Send</button>
              </div>
            </div>
          </div>
        )}
        {attachments.length > 0 && (
          <div className="task-attachments" style={{marginTop:'0.5em',display:'flex',gap:'0.5em',flexWrap:'wrap'}}>
            {attachments.map((att, i) => (
              <a key={i} href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',color:'#4CAF50',fontWeight:500}}>
                {att.type.startsWith('image') ? (
                  <img src={att.url} alt={att.name} style={{width:32,height:32,objectFit:'cover',borderRadius:'4px',border:'1px solid #ccc'}} />
                ) : (
                  <Paperclip size={16} />
                )}
                <span style={{fontSize:'0.9em',marginLeft:'0.3em'}}>{att.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ListItem = ({ list, onComplete, onCompleteTask, onOpenNotes }) => {
    const [showTasks, setShowTasks] = useState(false);
    const completedTasks = list.tasks.filter(task => task.completed).length;
    const totalTasks = list.tasks.length;

    return (
      <div className={`list-item ${list.completed ? 'completed' : ''}`}>
        <div className="list-header">
          <div className="list-main">
            <button
              onClick={() => onComplete(list.id)}
              className={`checkbox ${list.completed ? 'checked' : ''}`}
            >
              {list.completed && <Check size={12} />}
            </button>
            <div className="list-info">
              <h3 className={`list-name ${list.completed ? 'strikethrough' : ''}`}>
                {list.name}
              </h3>
              <span className="list-progress">
                {completedTasks} of {totalTasks} tasks completed
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="toggle-btn"
            title={showTasks ? 'Hide tasks' : 'Show tasks'}
          >
            {showTasks ? '−' : '+'}
          </button>
        </div>
        
        {showTasks && (
          <div className="list-tasks">
            {list.tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={(taskId) => onCompleteTask(list.id, taskId)}
                onOpenNotes={(task) => onOpenNotes(task)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="user-dashboard-container">
        <div className="no-data">
          <h2>No user data found</h2>
          <p>Please contact your administrator to get tasks assigned.</p>
        </div>
      </div>
    );
  }

  const hasTasks = userData.tasks && userData.tasks.length > 0;
  const hasLists = userData.lists && userData.lists.length > 0;
  const totalTasks = (userData.tasks || []).length + (userData.lists || []).reduce((acc, list) => acc + list.tasks.length, 0);
  const completedTasks = (userData.tasks || []).filter(task => task.completed).length + 
                        (userData.lists || []).reduce((acc, list) => acc + list.tasks.filter(task => task.completed).length, 0);

  return (
    <div className={`user-dashboard-container theme-${theme}`}>
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            <div className="avatar-circle" style={{width:36,height:36,borderRadius:'50%',background:'#333',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.1rem'}}>
              {getInitials(userData?.fullName, user?.email)}
            </div>
          </div>
          <div className="user-details">
            <h1>Welcome, {userData?.fullName || user?.email}!</h1>
            <p>Your Personal Task Dashboard</p>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <span className="stat-number">{totalTasks}</span>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <span className="stat-number">{completedTasks}</span>
        </div>
        <div className="stat-card">
          <h3>Progress</h3>
          <span className="stat-number">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
        </div>
      </div>

      <div className="dashboard-content">
        {hasTasks && (
          <div className="tasks-section">
            <h2>Individual Tasks</h2>
            <div className="tasks-container">
              {userData.tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onOpenNotes={handleOpenNotes}
                />
              ))}
            </div>
          </div>
        )}

        {hasLists && (
          <div className="lists-section">
            <h2>Task Lists</h2>
            <div className="lists-container">
              {userData.lists.map(list => (
                <ListItem
                  key={list.id}
                  list={list}
                  onComplete={handleCompleteList}
                  onCompleteTask={handleCompleteTaskInList}
                  onOpenNotes={handleOpenNotes}
                />
              ))}
            </div>
          </div>
        )}

        {!hasTasks && !hasLists && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks assigned yet</h3>
            <p>Your administrator will assign tasks to you here.</p>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Notes</h3>
              <button onClick={() => setShowNotes(false)} className="close-btn">×</button>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Write your notes here..."
              className="notes-textarea"
            />
            <div className="modal-actions">
              <button onClick={() => setShowNotes(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveNote} className="save-btn">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
=======
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
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
    </div>
  );
};

<<<<<<< HEAD
export default UserDashboard;
=======
export default UserDashboard;
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
