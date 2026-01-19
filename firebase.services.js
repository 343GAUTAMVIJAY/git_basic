// Firebase Service Functions for Personal Dashboard
import { db, storage, auth } from './firebase.config.js';
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    deleteDoc,
    orderBy,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Local storage fallback for data persistence when Firebase is unavailable
const LOCAL_STORAGE_PREFIX = 'dashboard_data_';
const getLocalStorageKey = (collection, id) => `${LOCAL_STORAGE_PREFIX}${collection}_${id}`;
const getLocalStorageCollection = (collection) => `${LOCAL_STORAGE_PREFIX}${collection}_all`;

// Helper function to get data from local storage
const getLocalData = (collection, id) => {
    try {
        const key = getLocalStorageKey(collection, id);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from local storage:', error);
        return null;
    }
};

// Helper function to set data in local storage
const setLocalData = (collection, id, data) => {
    try {
        const key = getLocalStorageKey(collection, id);
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error writing to local storage:', error);
        return false;
    }
};

// Helper function to get all items from a collection in local storage
const getAllLocalData = (collection) => {
    try {
        const key = getLocalStorageCollection(collection);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading collection from local storage:', error);
        return [];
    }
};

// Helper function to set all items in a collection in local storage
const setAllLocalData = (collection, data) => {
    try {
        const key = getLocalStorageCollection(collection);
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error writing collection to local storage:', error);
        return false;
    }
};

// Error handling utility
class FirebaseError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'FirebaseError';
        this.code = code;
    }
}

// Bio Service Functions
export const bioService = {
    // Get bio details for current user
    async getBio(userId) {
        try {
            if (!db) {
                // Use local storage fallback
                const localData = getLocalData('bio', userId);
                if (localData) {
                    return localData;
                } else {
                    // Initialize with default fields
                    const defaultBio = {
                        id: userId,
                        fields: {
                            'Name': '',
                            'Email': '',
                            'Phone': '',
                            'Location': '',
                            'Bio': ''
                        },
                        userId: userId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    setLocalData('bio', userId, defaultBio);
                    return defaultBio;
                }
            }
            
            const docRef = doc(db, 'bio', userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                // Initialize with default fields if not exists
                const defaultFields = {
                    'Name': '',
                    'Email': '',
                    'Phone': '',
                    'Location': '',
                    'Bio': ''
                };
                await setDoc(docRef, { fields: defaultFields, userId: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                return { id: userId, fields: defaultFields, userId: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            }
        } catch (error) {
            console.error('Error getting bio:', error);
            throw new FirebaseError(`Failed to get bio: ${error.message}`, 'get_bio_failed');
        }
    },
    
    // Update bio details with timestamp
    async updateBio(userId, fields) {
        try {
            if (!db) {
                // Use local storage fallback
                const bioData = await this.getBio(userId);
                const updatedBio = {
                    ...bioData,
                    fields: fields,
                    updatedAt: new Date().toISOString()
                };
                setLocalData('bio', userId, updatedBio);
                return { success: true, message: 'Bio updated successfully' };
            }
            
            const docRef = doc(db, 'bio', userId);
            await setDoc(docRef, {
                fields,
                userId,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            return { success: true, message: 'Bio updated successfully' };
        } catch (error) {
            console.error('Error updating bio:', error);
            throw new FirebaseError(`Failed to update bio: ${error.message}`, 'update_bio_failed');
        }
    },
    
    // Update a specific bio field
    async updateBioField(userId, fieldName, value) {
        try {
            if (!db) {
                // Use local storage fallback
                const bioData = await this.getBio(userId);
                bioData.fields[fieldName] = value;
                bioData.updatedAt = new Date().toISOString();
                setLocalData('bio', userId, bioData);
                return { success: true, message: 'Bio field updated successfully' };
            }
            
            const currentBio = await this.getBio(userId);
            const updatedFields = { ...currentBio.fields, [fieldName]: value };
            
            const docRef = doc(db, 'bio', userId);
            await setDoc(docRef, {
                fields: updatedFields,
                userId,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            return { success: true, message: 'Bio field updated successfully' };
        } catch (error) {
            console.error('Error updating bio field:', error);
            throw new FirebaseError(`Failed to update bio field: ${error.message}`, 'update_bio_field_failed');
        }
    },
    
    // Add a new field to bio
    async addBioField(userId, fieldName, value = '') {
        try {
            if (!db) throw new FirebaseError('Database not initialized', 'db_not_initialized');
            
            const currentBio = await this.getBio(userId);
            const updatedFields = { ...currentBio.fields, [fieldName]: value };
            
            return await this.updateBio(userId, updatedFields);
        } catch (error) {
            console.error('Error adding bio field:', error);
            throw new FirebaseError(`Failed to add bio field: ${error.message}`, 'add_bio_field_failed');
        }
    },
    
    // Delete a field from bio
    async deleteBioField(userId, fieldName) {
        try {
            if (!db) throw new FirebaseError('Database not initialized', 'db_not_initialized');
            
            const currentBio = await this.getBio(userId);
            const updatedFields = { ...currentBio.fields };
            delete updatedFields[fieldName];
            
            return await this.updateBio(userId, updatedFields);
        } catch (error) {
            console.error('Error deleting bio field:', error);
            throw new FirebaseError(`Failed to delete bio field: ${error.message}`, 'delete_bio_field_failed');
        }
    }
};

// Documents Service Functions
export const documentService = {
    // Upload document to storage and save metadata to Firestore
    async uploadDocument(userId, file) {
        try {
            if (!storage || !db) {
                // Use local storage fallback
                const documentId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const documentData = {
                    id: documentId,
                    userId: userId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: new Date().toISOString(),
                    url: '#', // In local storage, we can't store the actual file
                    storagePath: `documents/${userId}/${documentId}_${encodeURIComponent(file.name)}`,
                    uploadedBy: userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Get existing documents and add the new one
                const documents = getAllLocalData('documents');
                documents.push(documentData);
                setAllLocalData('documents', documents);
                
                return {
                    id: documentId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: '#',
                    storagePath: documentData.storagePath,
                    success: true
                };
            }
            
            // Validate file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                throw new FirebaseError('File size exceeds 100MB limit', 'file_size_exceeded');
            }
            
            // Generate unique ID for the document
            const documentId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const storagePath = `documents/${userId}/${documentId}_${encodeURIComponent(file.name)}`;
            const storageRef = ref(storage, storagePath);
            
            // Upload file to storage
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Save metadata to Firestore
            const docRef = doc(db, 'documents', documentId);
            const documentData = {
                userId: userId,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date().toISOString(),
                url: downloadURL,
                storagePath: storagePath,
                uploadedBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            await setDoc(docRef, documentData);
            
            return {
                id: documentId,
                name: file.name,
                type: file.type,
                size: file.size,
                url: downloadURL,
                storagePath: storagePath,
                success: true
            };
        } catch (error) {
            console.error('Error uploading document:', error);
            throw new FirebaseError(`Failed to upload document: ${error.message}`, 'upload_document_failed');
        }
    },
    
    // Get all documents for a user
    async getUserDocuments(userId) {
        try {
            if (!db) {
                // Use local storage fallback
                const documents = getAllLocalData('documents');
                return documents.filter(doc => doc.userId === userId);
            }
            
            const q = query(
                collection(db, 'documents'),
                where('userId', '==', userId),
                orderBy('uploadDate', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const documents = [];
            
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() });
            });
            
            return documents;
        } catch (error) {
            console.error('Error getting documents:', error);
            throw new FirebaseError(`Failed to get documents: ${error.message}`, 'get_documents_failed');
        }
    },
    
    // Delete a document (from both storage and Firestore)
    async deleteDocument(userId, documentId, storagePath) {
        try {
            if (!storage || !db) {
                // Use local storage fallback
                const documents = getAllLocalData('documents');
                const filteredDocuments = documents.filter(doc => doc.id !== documentId);
                setAllLocalData('documents', filteredDocuments);
                return { success: true, message: 'Document deleted successfully' };
            }
            
            // Delete from storage
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
            
            // Delete from Firestore
            const docRef = doc(db, 'documents', documentId);
            await deleteDoc(docRef);
            
            return { success: true, message: 'Document deleted successfully' };
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new FirebaseError(`Failed to delete document: ${error.message}`, 'delete_document_failed');
        }
    }
};

// Links Service Functions
export const linkService = {
    // Add a new link
    async addLink(userId, linkData) {
        try {
            if (!db) {
                // Use local storage fallback
                const linkId = Date.now().toString();
                const linkDataWithTimestamps = {
                    id: linkId,
                    userId: userId,
                    name: linkData.name,
                    url: linkData.url,
                    description: linkData.description || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    addedBy: userId
                };
                
                // Get existing links and add the new one
                const links = getAllLocalData('links');
                links.push(linkDataWithTimestamps);
                setAllLocalData('links', links);
                
                return { id: linkId, ...linkData, success: true };
            }
            
            // Validate required fields
            if (!linkData.name || !linkData.url) {
                throw new FirebaseError('Name and URL are required', 'validation_error');
            }
            
            // Validate URL format
            try {
                new URL(linkData.url);
            } catch (e) {
                throw new FirebaseError('Invalid URL format', 'validation_error');
            }
            
            const linkId = Date.now().toString();
            const docRef = doc(db, 'links', linkId);
            
            const linkDataWithTimestamps = {
                userId: userId,
                name: linkData.name,
                url: linkData.url,
                description: linkData.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addedBy: userId
            };
            
            await setDoc(docRef, linkDataWithTimestamps);
            
            return { id: linkId, ...linkData, success: true };
        } catch (error) {
            console.error('Error adding link:', error);
            throw new FirebaseError(`Failed to add link: ${error.message}`, 'add_link_failed');
        }
    },
    
    // Get all links for a user
    async getUserLinks(userId) {
        try {
            if (!db) {
                // Use local storage fallback
                const links = getAllLocalData('links');
                return links.filter(link => link.userId === userId);
            }
            
            const q = query(
                collection(db, 'links'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const links = [];
            
            querySnapshot.forEach((doc) => {
                links.push({ id: doc.id, ...doc.data() });
            });
            
            return links;
        } catch (error) {
            console.error('Error getting links:', error);
            throw new FirebaseError(`Failed to get links: ${error.message}`, 'get_links_failed');
        }
    },
    
    // Update a link
    async updateLink(linkId, linkData) {
        try {
            if (!db) {
                // Use local storage fallback
                const links = getAllLocalData('links');
                const linkIndex = links.findIndex(link => link.id === linkId);
                if (linkIndex !== -1) {
                    links[linkIndex] = {
                        ...links[linkIndex],
                        name: linkData.name,
                        url: linkData.url,
                        description: linkData.description,
                        updatedAt: new Date().toISOString()
                    };
                    setAllLocalData('links', links);
                    return { id: linkId, ...linkData, success: true };
                } else {
                    throw new FirebaseError('Link not found', 'link_not_found');
                }
            }
            
            // Validate required fields
            if (!linkData.name || !linkData.url) {
                throw new FirebaseError('Name and URL are required', 'validation_error');
            }
            
            // Validate URL format
            try {
                new URL(linkData.url);
            } catch (e) {
                throw new FirebaseError('Invalid URL format', 'validation_error');
            }
            
            const docRef = doc(db, 'links', linkId);
            await updateDoc(docRef, {
                name: linkData.name,
                url: linkData.url,
                description: linkData.description,
                updatedAt: new Date().toISOString()
            });
            
            return { id: linkId, ...linkData, success: true };
        } catch (error) {
            console.error('Error updating link:', error);
            throw new FirebaseError(`Failed to update link: ${error.message}`, 'update_link_failed');
        }
    },
    
    // Delete a link
    async deleteLink(userId, linkId) {
        try {
            if (!db) {
                // Use local storage fallback
                const links = getAllLocalData('links');
                const filteredLinks = links.filter(link => link.id !== linkId);
                setAllLocalData('links', filteredLinks);
                return { success: true, message: 'Link deleted successfully' };
            }
            
            const docRef = doc(db, 'links', linkId);
            await deleteDoc(docRef);
            
            return { success: true, message: 'Link deleted successfully' };
        } catch (error) {
            console.error('Error deleting link:', error);
            throw new FirebaseError(`Failed to delete link: ${error.message}`, 'delete_link_failed');
        }
    },
    
    // Get a specific link by ID
    async getLinkById(userId, linkId) {
        try {
            if (!db) {
                // Use local storage fallback
                const links = getAllLocalData('links');
                const link = links.find(l => l.id === linkId && l.userId === userId);
                return link || null;
            }
            
            const docRef = doc(db, 'links', linkId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().userId === userId) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting link by ID:', error);
            throw new FirebaseError(`Failed to get link: ${error.message}`, 'get_link_failed');
        }
    }
};

// Notes Service Functions
export const noteService = {
    // Get notes for current user
    async getNotes(userId) {
        try {
            if (!db) {
                // Use local storage fallback
                const localData = getLocalData('notes', userId);
                if (localData) {
                    return localData;
                } else {
                    // Initialize with default notes
                    const defaultNotes = {
                        id: userId,
                        content: '',
                        lastUpdated: new Date().toISOString(),
                        userId: userId,
                        createdAt: new Date().toISOString()
                    };
                    setLocalData('notes', userId, defaultNotes);
                    return defaultNotes;
                }
            }
            
            const docRef = doc(db, 'notes', userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                // Initialize with empty notes if not exists
                await setDoc(docRef, {
                    content: '',
                    lastUpdated: new Date().toISOString(),
                    userId: userId,
                    createdAt: new Date().toISOString()
                });
                return {
                    id: userId,
                    content: '',
                    lastUpdated: new Date().toISOString(),
                    userId: userId,
                    createdAt: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('Error getting notes:', error);
            throw new FirebaseError(`Failed to get notes: ${error.message}`, 'get_notes_failed');
        }
    },
    
    // Save notes for current user
    async saveNotes(userId, content) {
        try {
            if (!db) {
                // Use local storage fallback
                const notesData = await this.getNotes(userId);
                const updatedNotes = {
                    ...notesData,
                    content: content,
                    lastUpdated: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setLocalData('notes', userId, updatedNotes);
                return { success: true, message: 'Notes saved successfully' };
            }
            
            const docRef = doc(db, 'notes', userId);
            await setDoc(docRef, {
                content: content,
                lastUpdated: new Date().toISOString(),
                userId: userId,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            return { success: true, message: 'Notes saved successfully' };
        } catch (error) {
            console.error('Error saving notes:', error);
            throw new FirebaseError(`Failed to save notes: ${error.message}`, 'save_notes_failed');
        }
    }
};

// Todos Service Functions
export const todoService = {
    // Add a new todo
    async addTodo(userId, text) {
        try {
            if (!db) {
                // Use local storage fallback
                const todoId = Date.now().toString();
                const todoData = {
                    id: todoId,
                    userId: userId,
                    text: text,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    addedBy: userId
                };
                
                // Get existing todos and add the new one
                const todos = getAllLocalData('todos');
                todos.push(todoData);
                setAllLocalData('todos', todos);
                
                return { id: todoId, ...todoData, success: true };
            }
            
            const todoId = Date.now().toString();
            const docRef = doc(db, 'todos', todoId);
            
            const todoData = {
                userId: userId,
                text: text,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addedBy: userId
            };
            
            await setDoc(docRef, todoData);
            
            return { id: todoId, ...todoData, success: true };
        } catch (error) {
            console.error('Error adding todo:', error);
            throw new FirebaseError(`Failed to add todo: ${error.message}`, 'add_todo_failed');
        }
    },
    
    // Get all todos for a user
    async getUserTodos(userId) {
        try {
            if (!db) {
                // Use local storage fallback
                const todos = getAllLocalData('todos');
                return todos.filter(todo => todo.userId === userId);
            }
            
            const q = query(
                collection(db, 'todos'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const todos = [];
            
            querySnapshot.forEach((doc) => {
                todos.push({ id: doc.id, ...doc.data() });
            });
            
            return todos;
        } catch (error) {
            console.error('Error getting todos:', error);
            throw new FirebaseError(`Failed to get todos: ${error.message}`, 'get_todos_failed');
        }
    },
    
    // Update a todo (toggle completion status)
    async updateTodo(todoId, completed) {
        try {
            if (!db) {
                // Use local storage fallback
                const todos = getAllLocalData('todos');
                const todoIndex = todos.findIndex(todo => todo.id === todoId);
                if (todoIndex !== -1) {
                    todos[todoIndex] = {
                        ...todos[todoIndex],
                        completed: completed,
                        updatedAt: new Date().toISOString()
                    };
                    setAllLocalData('todos', todos);
                    return { id: todoId, completed: completed, success: true };
                } else {
                    throw new FirebaseError('Todo not found', 'todo_not_found');
                }
            }
            
            const docRef = doc(db, 'todos', todoId);
            await updateDoc(docRef, {
                completed: completed,
                updatedAt: new Date().toISOString()
            });
            
            return { id: todoId, completed: completed, success: true };
        } catch (error) {
            console.error('Error updating todo:', error);
            throw new FirebaseError(`Failed to update todo: ${error.message}`, 'update_todo_failed');
        }
    },
    
    // Update todo text
    async updateTodoText(todoId, text) {
        try {
            if (!db) {
                // Use local storage fallback
                const todos = getAllLocalData('todos');
                const todoIndex = todos.findIndex(todo => todo.id === todoId);
                if (todoIndex !== -1) {
                    todos[todoIndex] = {
                        ...todos[todoIndex],
                        text: text,
                        updatedAt: new Date().toISOString()
                    };
                    setAllLocalData('todos', todos);
                    return { id: todoId, text: text, success: true };
                } else {
                    throw new FirebaseError('Todo not found', 'todo_not_found');
                }
            }
            
            const docRef = doc(db, 'todos', todoId);
            await updateDoc(docRef, {
                text: text,
                updatedAt: new Date().toISOString()
            });
            
            return { id: todoId, text: text, success: true };
        } catch (error) {
            console.error('Error updating todo text:', error);
            throw new FirebaseError(`Failed to update todo text: ${error.message}`, 'update_todo_text_failed');
        }
    },
    
    // Delete a todo
    async deleteTodo(userId, todoId) {
        try {
            if (!db) {
                // Use local storage fallback
                const todos = getAllLocalData('todos');
                const filteredTodos = todos.filter(todo => todo.id !== todoId);
                setAllLocalData('todos', filteredTodos);
                return { success: true, message: 'Todo deleted successfully' };
            }
            
            const docRef = doc(db, 'todos', todoId);
            await deleteDoc(docRef);
            
            return { success: true, message: 'Todo deleted successfully' };
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw new FirebaseError(`Failed to delete todo: ${error.message}`, 'delete_todo_failed');
        }
    }
};

// Utility function for auto-save with debounce
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Authentication helper
export const authHelper = {
    getCurrentUserId() {
        if (auth && auth.currentUser) {
            return auth.currentUser.uid;
        }
        // Fallback to localStorage if auth not available
        return localStorage.getItem('userId') || 'anonymous_user';
    },
    
    setCurrentUserId(userId) {
        localStorage.setItem('userId', userId);
    }
};