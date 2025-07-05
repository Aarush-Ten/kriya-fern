import React, { useState, useEffect } from 'react';
import { Check, Trash2, StickyNote, Pencil, X, Save, Flag, MessageCircle, Paperclip } from 'lucide-react';
import { useAuth } from '../../App';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Components
import Notes from './Notes';

const Task = ({ 
  task, 
  onComplete, 
  onDelete, 
  onSave, 
  onEdit, 
  priority,
  isEditing,
  editingText,
  setEditingText,
  onSaveEdit,
  onCancelEdit
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState(task.note || '');
  const [showChat, setShowChat] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const { user } = useAuth ? useAuth() : { user: null };
  const fileInputRef = React.useRef(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState(task.timeline || []);

  // Load comments from Firestore (real-time)
  useEffect(() => {
    setComments(task.comments || []);
  }, [task.comments]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      author: user?.uid || 'admin',
      authorName: user?.displayName || user?.email || 'Admin',
      timestamp: new Date().toISOString(),
    };
    const updatedComments = [...(comments || []), newComment];
    setComments(updatedComments);
    setCommentText('');
    // Save to Firestore (update task.comments)
    // (Assume parent will handle full user doc update, or add Firestore update here if needed)
    // If you want to update Firestore here:
    // const userRef = doc(db, 'users', ...); // Need userId
    // await setDoc(userRef, { ... }, { merge: true });
    if (onSave) onSave(task.id, task.note || '', updatedComments, attachments);
  };

  const handleSaveNote = () => {
    onSave(task.id, notesText, comments, attachments);
    setShowNotes(false);
  };

  const handleEditTask = () => {
    if (onEdit) {
      onEdit(); 
    }
  };

  const handleSaveEdit = () => {
    if (onSaveEdit) {
      onSaveEdit(); 
    }
  };

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit(); 
    }
  };

  const formatDeadlineWithTime = (deadline, deadlineTime) => {
    if (!deadline) return 'No deadline set';
    
    const date = new Date(deadline);
    const dateStr = date.toLocaleDateString();
    
    // If deadlineTime exists (12-hour format), use it; otherwise extract from deadline
    let timeStr = '11:59 PM'; // default
    
    if (deadlineTime) {
      timeStr = deadlineTime;
    } else if (deadline instanceof Date || typeof deadline === 'string') {
      const dateObj = new Date(deadline);
      if (!isNaN(dateObj.getTime())) {
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        timeStr = `${hour12}:${minutes} ${ampm}`;
      }
    }
    
    return `${dateStr} at ${timeStr}`;
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    // For demo, use base64. In production, upload to Firebase Storage and save URLs.
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
    if (onSave) onSave(task.id, task.note || '', task.comments || [], updated);
  };

  const addTimelineEvent = async (action, extra = {}) => {
    const event = {
      id: Date.now().toString(),
      action,
      author: user?.displayName || user?.email || 'Admin',
      timestamp: new Date().toISOString(),
      ...extra
    };
    const updatedTimeline = [...(timeline || []), event];
    setTimeline(updatedTimeline);
    if (onSave) onSave(task.id, task.note || '', task.comments || [], task.attachments || [], updatedTimeline);
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;
  const isDueSoon = task.deadline && !isOverdue && (new Date(task.deadline) - new Date() < 24*60*60*1000) && !task.completed;

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`} style={{borderBottomColor: priority === 'low' ? "#44ff44" : priority === 'mid' ? '#ffd528' :'#ff4444', background: isOverdue ? '#2a0a0a' : isDueSoon ? '#2a1a0a' : undefined}}>
      <div className="task-content">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button
            onClick={() => onComplete(task.id)}
            className={`checkbox ${task.completed ? 'checked' : ''}`}
          >
            {task.completed && <Check size={12} />}
          </button>

          <div className="content">
            {isEditing ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="edit-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
            ) : (
              <div className={`task-text ${task.completed ? 'strikethrough' : ''}`}>
                {task.text}
              </div>
            )}
            <div className="deadline-text">
              Deadline: {formatDeadlineWithTime(task.deadline, task.deadlineTime)}
            </div>
            {task.note && task.note.trim() !== '' && (
              <div className="task-note-display" style={{marginTop: '0.5em', color: '#ffd528', background: '#232323', borderRadius: '6px', padding: '0.5em 0.75em', fontSize: '0.97em', display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                <StickyNote size={16} style={{color: '#ffaa44'}} />
                <span>{task.note}</span>
              </div>
            )}
          </div>
        </div>
        <div className='priority'>
          {(priority === "low") ? (
            <Flag size={16} color="#44ff44" />
          ): (priority === "mid") ? (
            <Flag size={16} color="#ffaa44" />
          ):(
            <Flag size={16} color="#ff4444" />
          )}
          <span>{priority}</span>
        </div>
        {isOverdue && <span style={{color:'#ff4444',fontWeight:600,marginLeft:'0.5em'}}>Overdue</span>}
        {isDueSoon && <span style={{color:'#ffd528',fontWeight:600,marginLeft:'0.5em'}}>Due Soon</span>}
      </div>

      <div className="task-action-group" style={{
        display:'flex',
        alignItems:'center',
        gap:'0.7em',
        background:'var(--task-action-bg, rgba(255,255,255,0.08))',
        borderRadius:'12px',
        padding:'0.4em 0.7em',
        margin:'0.7em 0',
        boxShadow:'0 2px 8px #0002',
        border:'1.5px solid var(--task-action-border, #2222)',
      }}>
        <button onClick={() => setShowNotes(true)} className="note-btn" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}} title="Notes"><StickyNote size={18} /></button>
        <button onClick={() => setShowChat(true)} className="chat-btn" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}} title="Task Comments"><MessageCircle size={18} /></button>
        {isEditing ? (
          <>
            <button onClick={handleSaveEdit} title="Save changes" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}}><Save size={18} /></button>
            <button onClick={handleCancelEdit} title="Cancel editing" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}}><X size={18} /></button>
          </>
        ) : (
          <button onClick={handleEditTask} title="Edit task" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}}><Pencil size={18} /></button>
        )}
        <button onClick={() => onDelete(task.id)} className="delete-btn" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}} title="Delete"><Trash2 size={18} /></button>
        <button onClick={() => fileInputRef.current.click()} className="attach-btn" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}} title="Attach file/image"><Paperclip size={18} /></button>
        <input type="file" multiple style={{display:'none'}} ref={fileInputRef} onChange={handleFileChange} />
        <button onClick={() => setShowTimeline(t => !t)} className="timeline-btn" style={{background:'none',border:'none',padding:'0.5em',borderRadius:'8px',transition:'background 0.2s',color:'var(--task-action-icon, #222)'}} title="Show activity timeline">🕒</button>
      </div>

      {showNotes && (
        <Notes
          noteText={notesText}
          onChange={setNotesText}
          onClose={() => setShowNotes(false)}
          onSave={handleSaveNote}
        />
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

      {showTimeline && (
        <div className="task-timeline" style={{marginTop:'0.5em',background:'#181818',borderRadius:'6px',padding:'0.5em 1em'}}>
          <div style={{fontWeight:600,marginBottom:'0.3em'}}>Activity Timeline</div>
          {timeline.length === 0 && <div style={{color:'#888'}}>No activity yet.</div>}
          {timeline.map(ev => (
            <div key={ev.id} style={{fontSize:'0.97em',marginBottom:'0.3em'}}>
              <span style={{color:'#ffaa44'}}>[{new Date(ev.timestamp).toLocaleString()}]</span> {ev.author}: {ev.action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Task;