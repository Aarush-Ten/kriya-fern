import React, { useEffect, useState, useMemo } from "react";
import { Plus, Check, Trash2, List, Flag, Clock } from "lucide-react";
import Task from "./Task";
import ProgressBar from "./ProgressBar";
import CustomDropdown from "./CustomDropDown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";
<<<<<<< HEAD
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);
=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

const TodoList = ({
  list,
  onComplete,
  onDelete,
<<<<<<< HEAD
  onRestore,
=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
  onCompleteTask,
  onDeleteTask,
  editingTaskInfo,
  editingText,
  setEditingText,
  onEditTask,
  onSaveEdit,
  onCancelEdit,
  onAddTaskToSublist,
  onCompleteSublistTask,
  onDeleteSublistTask,
<<<<<<< HEAD
  showHiddenUsers,
=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [doNotAskTaskDelete, setDoNotAskTaskDelete] = useState(false);
  const [sublistInputs, setSublistInputs] = useState({});
  const [selectedPriority, setSelectedPriority] = useState('mid');
  const [sublistCalendars, setSublistCalendars] = useState({});
  const [sublistDeadlines, setSublistDeadlines] = useState({});
  const [sublistTimes, setSublistTimes] = useState({});
<<<<<<< HEAD
  const [taskOrder, setTaskOrder] = useState(list.tasks.map(t => t.id));
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [quickAddText, setQuickAddText] = useState('');
=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

  const priorityOrder = {
    low: 3,
    mid: 2,
    high: 1,
  };

  const priorityOptions = [
    { value: 'high', label: 'High Priority', icon: <Flag size={16} color="#ff4444" /> },
    { value: 'mid', label: 'Medium Priority', icon: <Flag size={16} color="#ffaa44" /> },
    { value: 'low', label: 'Low Priority', icon: <Flag size={16} color="#44ff44" /> }
  ];

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
        
        if (hour !== 12 || minute !== 45) {
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

<<<<<<< HEAD
  const filteredTasks = list.tasks.filter(task =>
    (filterPriority === 'all' || task.priority === filterPriority) &&
    (filterStatus === 'all' || (filterStatus === 'completed' ? task.completed : !task.completed))
  );
  const sortedTasks = sortBy === 'default' ? filteredTasks : [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === 'due') return new Date(a.deadline) - new Date(b.deadline);
    return 0;
  });
=======
  const sortedTasks = useMemo(() => {
    return [...list.tasks].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [list.tasks]);
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

  useEffect(() => {
    const saved = localStorage.getItem(`dontAskAgain_task_list_${list.id}`);
    if (saved === "true") {
      setDoNotAskTaskDelete(true);
    }
  }, [list.id]);

<<<<<<< HEAD
  useEffect(() => { setTaskOrder(list.tasks.map(t => t.id)); }, [list.tasks]);

=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
  const toggleDoNotAskTaskDelete = () => {
    const updated = !doNotAskTaskDelete;
    setDoNotAskTaskDelete(updated);
    if (updated) {
      localStorage.setItem(`dontAskAgain_task_list_${list.id}`, "true");
    } else {
      localStorage.removeItem(`dontAskAgain_task_list_${list.id}`);
    }
  };

  const combineDateTime = (date, time) => {
    if (!date) return null;
    const time24h = convertTo24Hour(time);
    const [hours, minutes] = time24h.split(':');
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combinedDate;
  };

  const toggleSublistCalendar = (sublistId) => {
    setSublistCalendars(prev => ({
      ...prev,
      [sublistId]: !prev[sublistId]
    }));
  };

  const handleEditTaskText = (listId, taskId, newText) => {
    const task = list.tasks.find((t) => t.id === taskId);
    if (task && onEditTask) {
      onEditTask(listId, task);
    }
  };

  const handleEditSublistTask = (sublistId, taskId) => {
    const sublist = list.lists.find((s) => s.id === sublistId);
    const task = sublist?.task?.find((t) => t.id === taskId);
    if (task && onEditTask) {
      onEditTask(list.id, task, sublistId);
    }
  };

  const handleSublistInputChange = (sublistId, value) => {
    setSublistInputs((prev) => ({ ...prev, [sublistId]: value }));
  };

  const handleSublistTaskAdd = (sublistId) => {
    const taskText = sublistInputs[sublistId]?.trim();
    const sublistDeadline = sublistDeadlines[sublistId];
    const sublistTime = sublistTimes[sublistId] || '11:59 PM';
    
    if (taskText && onAddTaskToSublist) {
      onAddTaskToSublist(list.id, sublistId, taskText, sublistDeadline, sublistTime, selectedPriority);
      setSublistInputs((prev) => ({ ...prev, [sublistId]: "" }));
      setSublistDeadlines((prev) => ({ ...prev, [sublistId]: null }));
      setSublistTimes((prev) => ({ ...prev, [sublistId]: '11:59 PM' }));
      setSublistCalendars(prev => ({ ...prev, [sublistId]: false }));
    }
  };

  const totalTasks = list.tasks.length;
  const completedTasks = list.completed
    ? totalTasks
    : list.tasks.filter((task) => task.completed).length;

<<<<<<< HEAD
  const onSaveNote = async (taskId, noteText, sublistId = null, updatedComments = [], updatedAttachments = [], updatedTimeline = []) => {
    // Find the user (list) this task belongs to
    const user = list;
    let updatedTasks = user.tasks;
    let updatedLists = user.lists;

    if (sublistId) {
      // Update note, comments, attachments in sublist task
      updatedLists = user.lists.map(sublist =>
        sublist.id === sublistId
          ? {
              ...sublist,
              task: sublist.task.map(task =>
                task.id === taskId ? { ...task, note: noteText, comments: updatedComments, attachments: updatedAttachments } : task
              ),
            }
          : sublist
      );
    } else {
      // Update note, comments, attachments in main task
      updatedTasks = user.tasks.map(task =>
        task.id === taskId ? { ...task, note: noteText, comments: updatedComments, attachments: updatedAttachments } : task
      );
    }

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        ...user,
        tasks: updatedTasks,
        lists: updatedLists,
      },
      { merge: true }
    );

    // Update local state (optional, if needed)
    if (sublistId) {
      if (onCompleteSublistTask) onCompleteSublistTask(user.id, sublistId, taskId, noteText, updatedComments, updatedAttachments);
    } else {
      if (onCompleteTask) onCompleteTask(user.id, taskId, noteText, updatedComments, updatedAttachments);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(taskOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setTaskOrder(newOrder);
    // Reorder tasks in Firestore
    const reorderedTasks = newOrder.map(id => list.tasks.find(t => t.id === id)).filter(Boolean);
    const userRef = doc(db, 'users', list.uid);
    await setDoc(userRef, { ...list, tasks: reorderedTasks }, { merge: true });
  };

  const handleBulkComplete = async () => {
    const updatedTasks = list.tasks.map(t => selectedTasks.includes(t.id) ? { ...t, completed: true } : t);
    const userRef = doc(db, 'users', list.uid);
    await setDoc(userRef, { ...list, tasks: updatedTasks }, { merge: true });
    setSelectedTasks([]);
  };

  const handleBulkDelete = async () => {
    const updatedTasks = list.tasks.filter(t => !selectedTasks.includes(t.id));
    const userRef = doc(db, 'users', list.uid);
    await setDoc(userRef, { ...list, tasks: updatedTasks }, { merge: true });
    setSelectedTasks([]);
  };

  const handleQuickAdd = async () => {
    if (!quickAddText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: quickAddText.trim(),
      completed: false,
      deadline: null,
      deadlineTime: '11:59 PM',
      priority: 'mid',
      notes: '',
      comments: [],
      attachments: [],
      timeline: [],
    };
    const updatedTasks = [...list.tasks, newTask];
    const userRef = doc(db, 'users', list.uid);
    await setDoc(userRef, { ...list, tasks: updatedTasks }, { merge: true });
    setQuickAddText('');
  };

  const completedCount = list.tasks.filter(t => t.completed).length;
  const incompleteCount = list.tasks.length - completedCount;
  const pieData = {
    labels: ['Completed', 'Incomplete'],
    datasets: [
      {
        data: [completedCount, incompleteCount],
        backgroundColor: ['#44ff44', '#ff4444'],
        borderWidth: 1,
      },
    ],
  };

=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
  return (
    <div className={`todo-list-item ${list.completed ? "completed" : ""}`}>
      <div className="list-header">
        <div className="list-info">
          <button
            onClick={() => onComplete(list.id)}
            className={`checkbox ${list.completed ? "checked" : ""}`}
          >
            {list.completed && <Check size={12} />}
          </button>
          <h3 className={`list-name ${list.completed ? "strikethrough" : ""}`}>
            {list.name}
          </h3>
          <span className="task-count">
            ({completedTasks}/{totalTasks})
          </span>
        </div>
        <div className="list-actions">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="toggle-btn"
          >
            <List size={16} />
          </button>
<<<<<<< HEAD
          {showHiddenUsers && !list.visible ? (
            <button onClick={() => onRestore(list.id)} className="restore-btn" title="Restore User">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </button>
          ) : (
            <button onClick={() => onDelete(list.id)} className="delete-btn">
              <Trash2 size={16} />
            </button>
          )}
=======
          <button onClick={() => onDelete(list.id)} className="delete-btn">
            <Trash2 size={16} />
          </button>
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
        </div>
      </div>

      {showTasks && (
        <label
          style={{
            fontSize: "1rem",
            display: "flex",
            marginTop: "0.5rem",
            justifyContent: "center",
            padding: 5,
          }}
        >
          Don't ask again to confirm
          <input
            type="checkbox"
            checked={doNotAskTaskDelete}
            onChange={toggleDoNotAskTaskDelete}
            style={{ marginLeft: "6px" }}
          />
        </label>
      )}

      {showTasks && (
<<<<<<< HEAD
        <div className="task-controls-chart" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2em',
          background: 'rgba(24,24,24,0.98)',
          borderRadius: '16px',
          padding: '1.5em 1em',
          margin: '1.5em 0',
          boxShadow: '0 2px 16px #0003',
          color: '#fff',
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        }}>
          <div className="task-filters" style={{display:'flex',gap:'1em',alignItems:'center',flexWrap:'wrap',flex:2,minWidth:'220px'}}>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{background:'#222',color:'#fff',border:'1.5px solid #444',borderRadius:'8px',padding:'0.4em 1em',fontWeight:500}}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="mid">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{background:'#222',color:'#fff',border:'1.5px solid #444',borderRadius:'8px',padding:'0.4em 1em',fontWeight:500}}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{background:'#222',color:'#fff',border:'1.5px solid #444',borderRadius:'8px',padding:'0.4em 1em',fontWeight:500}}>
              <option value="default">Default</option>
              <option value="priority">Sort by Priority</option>
              <option value="due">Sort by Due Date</option>
            </select>
            <button onClick={handleBulkComplete} disabled={selectedTasks.length === 0} style={{opacity:selectedTasks.length===0?0.5:1,cursor:selectedTasks.length===0?'not-allowed':'pointer',background:'#222',color:'#fff',border:'1.5px solid #fff',borderRadius:'8px',padding:'0.5em 1.2em',fontWeight:600}}>Bulk Complete</button>
            <button onClick={handleBulkDelete} disabled={selectedTasks.length === 0} style={{opacity:selectedTasks.length===0?0.5:1,cursor:selectedTasks.length===0?'not-allowed':'pointer',background:'#222',color:'#fff',border:'1.5px solid #fff',borderRadius:'8px',padding:'0.5em 1.2em',fontWeight:600}}>Bulk Delete</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,minWidth:'140px',maxWidth:'180px',margin:'0 auto'}}>
            <Pie data={pieData} options={{plugins:{legend:{display:true,position:'bottom'}}}} />
            <div style={{display:'flex',gap:'1em',marginTop:'0.5em',fontSize:'0.95em',justifyContent:'center'}}>
              <span style={{display:'flex',alignItems:'center',gap:'0.3em'}}><span style={{width:12,height:12,background:'#44ff44',display:'inline-block',borderRadius:2}}></span>Completed</span>
              <span style={{display:'flex',alignItems:'center',gap:'0.3em'}}><span style={{width:12,height:12,background:'#ff4444',display:'inline-block',borderRadius:2}}></span>Incomplete</span>
            </div>
          </div>
        </div>
      )}

      {showTasks && (
        <div className="list-tasks">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`droppable-tasks-${list.id}`}>
              {(provided) => (
                <div className="tasks-container" ref={provided.innerRef} {...provided.droppableProps}>
                  {taskOrder.map((taskId, idx) => {
                    const task = list.tasks.find(t => t.id === taskId);
                    if (!task) return null;
                    return (
                      <Draggable key={task.id} draggableId={String(task.id)} index={idx}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={e => setSelectedTasks(sel => e.target.checked ? [...sel, task.id] : sel.filter(id => id !== task.id))} style={{marginRight:'0.5em'}} />
                            <Task
                              task={task}
                              onComplete={(taskId) => onCompleteTask(list.id, taskId)}
                              onDelete={(taskId) => onDeleteTask(list.id, taskId, doNotAskTaskDelete)}
                              priority={task.priority}
                              onEdit={() => handleEditTaskText(list.id, task.id)}
                              doNotAskTaskDelete={doNotAskTaskDelete}
                              isEditing={editingTaskInfo?.listId === list.id && editingTaskInfo?.taskId === task.id && !editingTaskInfo?.sublistId}
                              editingText={editingText}
                              setEditingText={setEditingText}
                              onSaveEdit={onSaveEdit}
                              onCancelEdit={onCancelEdit}
                              onSave={(taskId, noteText, updatedComments, updatedAttachments, updatedTimeline) => onSaveNote(taskId, noteText, null, updatedComments, updatedAttachments, updatedTimeline)}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
=======
        <div className="list-tasks">
          <div className="tasks-container">
            {sortedTasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onComplete={(taskId) => onCompleteTask(list.id, taskId)}
                onDelete={(taskId) =>
                  onDeleteTask(list.id, taskId, doNotAskTaskDelete)
                }
                priority={task.priority}
                onEdit={() => handleEditTaskText(list.id, task.id)}
                doNotAskTaskDelete={doNotAskTaskDelete}
                isEditing={
                  editingTaskInfo?.listId === list.id &&
                  editingTaskInfo?.taskId === task.id &&
                  !editingTaskInfo?.sublistId
                }
                editingText={editingText}
                setEditingText={setEditingText}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
              />
            ))}
            {list.tasks.length === 0 && (
              <p className="empty-state">No tasks in this list yet.</p>
            )}
          </div>
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f

          {list.lists && list.lists.length > 0 && (
            <div className="sublists-section">
              <div className="sublists-section-02">
                <h4 className="sublist-title">📂 Sub Lists</h4>
                {list.lists.map((subList) => (
                  <div key={subList.id} className="sublist-card">
                    <p className="sublist-name">
                      <strong>{subList.name}</strong>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "0.5rem",
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}
                    >
                      <input
                        type="text"
                        className="sublist-input"
                        placeholder="Add task to sublist"
                        value={sublistInputs[subList.id] || ""}
                        onChange={(e) =>
                          handleSublistInputChange(subList.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSublistTaskAdd(subList.id);
                        }}
                        style={{
                          flex: 1,
                          padding: "4px 6px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          minWidth: "200px"
                        }}
                      />
                      
                      <CustomDropdown
                        options={priorityOptions}
                        selectedValue={selectedPriority}
                        setSelectedValue={setSelectedPriority}
                        placeholder="Priority"
                      />
                      
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                          onClick={() => toggleSublistCalendar(subList.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Pick deadline date and time"
                        >
                          <CalendarDays size={24} />
                        </button>

                        {sublistCalendars[subList.id] && (
                          <div className="calendar-dropdown">
                            <DatePicker
                              selected={sublistDeadlines[subList.id]}
                              onChange={(date) => {
                                setSublistDeadlines(prev => ({
                                  ...prev,
                                  [subList.id]: date
                                }));
                              }}
                              inline
                              minDate={new Date()}
                            />
                            <div className="time-selection">
                              <label className="time-label">Select Time:</label>
                              <CustomDropdown
                                options={timeOptions}
                                selectedValue={sublistTimes[subList.id] || '11:59 PM'}
                                setSelectedValue={(time) => setSublistTimes(prev => ({
                                  ...prev,
                                  [subList.id]: time
                                }))}
                                placeholder="Time"
                              />
                            </div>
                            <div className="calendar-actions">
                              <button 
                                onClick={() => setSublistCalendars(prev => ({
                                  ...prev,
                                  [subList.id]: false
                                }))}
                                className="calendar-done-btn"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setShowSubTasks(!showSubTasks)}
                        className="toggle-btn"
                      >
                        <List size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleSublistTaskAdd(subList.id)}
                        style={{
                          padding: "4px 10px",
                          border: "none",
                          background: "#4CAF50",
                          color: "white",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {showSubTasks && (
                      <div className="sublist-tasks">
                        {subList.task && subList.task.length > 0 ? (
                          subList.task
                            .sort(
                              (a, b) =>
                                priorityOrder[a.priority] -
                                priorityOrder[b.priority]
                            )
                            .map((task) => (
                              <Task
                                key={task.id}
                                task={task}
                                onComplete={(taskId) =>
                                  onCompleteSublistTask
                                    ? onCompleteSublistTask(
                                        list.id,
                                        subList.id,
                                        taskId
                                      )
                                    : console.log(
                                        "onCompleteSublistTask not provided"
                                      )
                                }
                                onDelete={(taskId) =>
                                  onDeleteSublistTask
                                    ? onDeleteSublistTask(
                                        list.id,
                                        subList.id,
                                        taskId,
                                        doNotAskTaskDelete
                                      )
                                    : console.log(
                                        "onDeleteSublistTask not provided"
                                      )
                                }
                                priority={task.priority}
                                onEdit={() =>
                                  handleEditSublistTask(subList.id, task.id)
                                }
                                doNotAskTaskDelete={doNotAskTaskDelete}
                                isEditing={
                                  editingTaskInfo?.listId === list.id &&
                                  editingTaskInfo?.taskId === task.id &&
                                  editingTaskInfo?.sublistId === subList.id
                                }
                                editingText={editingText}
                                setEditingText={setEditingText}
                                onSaveEdit={onSaveEdit}
                                onCancelEdit={onCancelEdit}
<<<<<<< HEAD
                                onSave={(taskId, noteText, updatedComments, updatedAttachments) => onSaveNote(taskId, noteText, subList.id, updatedComments, updatedAttachments)}
=======
>>>>>>> 717bb6c8201bc91ebe2dbe2aeba9e89db86f767f
                              />
                            ))
                        ) : (
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#888",
                              fontStyle: "italic",
                              margin: "0.5rem 0",
                            }}
                          >
                            No tasks in this sublist yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {list.tasks.length > 0 && (
        <ProgressBar completedTask={completedTasks} total={totalTasks} />
      )}
    </div>
  );
};

export default TodoList;