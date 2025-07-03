import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

// Create a user with email, password, and profile data
export async function createUserWithProfile(email, password, fullName, role = 'user') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, 'users', user.uid), {
    fullName,
    email,
    role,
    notes: [],
    lists: [],
    tasks: [],
    createdAt: serverTimestamp(),
  });
  return user;
}

// Delete a user and their Firestore profile (admin only)
export async function deleteUserAndProfile(uid) {
  await deleteDoc(doc(db, 'users', uid));
  // To delete the auth user, you must be signed in as that user or use Firebase Admin SDK
}

// Add a note to a user
export async function addNote(uid, note) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const notes = userDoc.data().notes || [];
    transaction.update(userRef, { notes: [...notes, note] });
  });
}

// Edit a note
export async function editNote(uid, noteId, newNote) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const notes = (userDoc.data().notes || []).map(n => n.id === noteId ? { ...n, ...newNote } : n);
    transaction.update(userRef, { notes });
  });
}

// Delete a note
export async function deleteNote(uid, noteId) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const notes = (userDoc.data().notes || []).filter(n => n.id !== noteId);
    transaction.update(userRef, { notes });
  });
}

// Add a list
export async function addList(uid, list) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const lists = userDoc.data().lists || [];
    transaction.update(userRef, { lists: [...lists, list] });
  });
}

// Edit a list
export async function editList(uid, listId, newList) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const lists = (userDoc.data().lists || []).map(l => l.id === listId ? { ...l, ...newList } : l);
    transaction.update(userRef, { lists });
  });
}

// Delete a list
export async function deleteList(uid, listId) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const lists = (userDoc.data().lists || []).filter(l => l.id !== listId);
    transaction.update(userRef, { lists });
  });
}

// Add a task
export async function addTask(uid, task) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const tasks = userDoc.data().tasks || [];
    transaction.update(userRef, { tasks: [...tasks, task] });
  });
}

// Edit a task
export async function editTask(uid, taskId, newTask) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const tasks = (userDoc.data().tasks || []).map(t => t.id === taskId ? { ...t, ...newTask } : t);
    transaction.update(userRef, { tasks });
  });
}

// Delete a task
export async function deleteTask(uid, taskId) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const tasks = (userDoc.data().tasks || []).filter(t => t.id !== taskId);
    transaction.update(userRef, { tasks });
  });
}

// Get all users' data (admin only)
export async function getAllUsersData() {
  const usersSnap = await getDocs(collection(db, 'users'));
  return usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
} 