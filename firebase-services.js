// Firebase Services Module
// Import from CDN in HTML: <script type="module" src="firebase-services.js"></script>

export async function initializeFirebaseServices(db, storage, currentUserId) {
    
    // Bio Service
    const bioService = {
        getBio: async () => {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const bioDoc = await getDoc(doc(db, 'users', currentUserId, 'data', 'bio'));
            if (bioDoc.exists()) {
                return bioDoc.data();
            }
            return { fields: {} };
        },
        updateBio: async (fields) => {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await setDoc(doc(db, 'users', currentUserId, 'data', 'bio'), { fields }, { merge: true });
            return { success: true };
        },
        addBioField: async (fieldName, value = '') => {
            const bio = await bioService.getBio();
            bio.fields[fieldName] = value;
            await bioService.updateBio(bio.fields);
            return { success: true };
        },
        deleteBioField: async (fieldName) => {
            const bio = await bioService.getBio();
            delete bio.fields[fieldName];
            await bioService.updateBio(bio.fields);
            return { success: true };
        }
    };

    // Document Service
    const documentService = {
        uploadDocument: async (file) => {
            const { ref: storageRef, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const fileRef = storageRef(storage, `documents/${currentUserId}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            
            const doc = {
                name: file.name,
                type: file.type || '',
                size: file.size,
                url: url,
                storagePath: fileRef.fullPath,
                uploadDate: new Date().toISOString()
            };
            
            const docRef = await addDoc(collection(db, 'users', currentUserId, 'documents'), doc);
            return { id: docRef.id, ...doc };
        },
        getUserDocuments: async () => {
            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const docsSnap = await getDocs(collection(db, 'users', currentUserId, 'documents'));
            return docsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        deleteDocument: async (docId, storagePath) => {
            const { doc: firestoreDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const { ref: storageRef, deleteObject } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
            
            if (storagePath) {
                try {
                    const fileRef = storageRef(storage, storagePath);
                    await deleteObject(fileRef);
                } catch (e) {
                    console.warn('Could not delete file from storage:', e);
                }
            }
            
            await deleteDoc(firestoreDoc(db, 'users', currentUserId, 'documents', docId));
            return { success: true };
        }
    };

    // Link Service
    const linkService = {
        addLink: async (linkData) => {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const docRef = await addDoc(collection(db, 'users', currentUserId, 'links'), linkData);
            return { id: docRef.id, ...linkData };
        },
        getUserLinks: async () => {
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const linksSnap = await getDocs(collection(db, 'users', currentUserId, 'links'));
            return linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        deleteLink: async (linkId) => {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await deleteDoc(doc(db, 'users', currentUserId, 'links', linkId));
            return { success: true };
        }
    };

    // Note Service
    const noteService = {
        getNotes: async () => {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const noteDoc = await getDoc(doc(db, 'users', currentUserId, 'data', 'notes'));
            if (noteDoc.exists()) {
                return noteDoc.data();
            }
            return { content: '', lastUpdated: new Date().toISOString() };
        },
        saveNotes: async (content) => {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await setDoc(doc(db, 'users', currentUserId, 'data', 'notes'), {
                content: content,
                lastUpdated: new Date().toISOString()
            });
            return { success: true };
        }
    };

    // Todo Service
    const todoService = {
        addTodo: async (text) => {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const todo = {
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, 'users', currentUserId, 'todos'), todo);
            return { id: docRef.id, ...todo };
        },
        getUserTodos: async () => {
            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const todosSnap = await getDocs(collection(db, 'users', currentUserId, 'todos'));
            return todosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        updateTodo: async (todoId, completed) => {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await updateDoc(doc(db, 'users', currentUserId, 'todos', todoId), { completed });
            return { success: true };
        },
        updateTodoText: async (todoId, text) => {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await updateDoc(doc(db, 'users', currentUserId, 'todos', todoId), { text });
            return { success: true };
        },
        deleteTodo: async (todoId) => {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await deleteDoc(doc(db, 'users', currentUserId, 'todos', todoId));
            return { success: true };
        }
    };

    // Settings Service
    const settingsService = {
        getSettings: async () => {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const settingsDoc = await getDoc(doc(db, 'users', currentUserId, 'settings', 'profile'));
            if (settingsDoc.exists()) {
                return settingsDoc.data();
            }
            return { dashboardName: 'Personal Dashboard' };
        },
        updateSettings: async (settings) => {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await setDoc(doc(db, 'users', currentUserId, 'settings', 'profile'), settings, { merge: true });
            return { success: true };
        }
    };

    return {
        bioService,
        documentService,
        linkService,
        noteService,
        todoService,
        settingsService
    };
}
