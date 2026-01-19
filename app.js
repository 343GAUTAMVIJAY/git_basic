// Simple localStorage-based dashboard
const userId = 'dashboard_user';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    initializeApp();
});

async function initializeApp() {
    showLoading(true);
    try {
        await Promise.all([
            loadBioData(),
            loadDocuments(),
            loadLinks(),
            loadNotes(),
            loadTodos()
        ]);
        setupEventListeners();
        console.log('Dashboard loaded successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    } finally {
        showLoading(false);
    }
}

function setupEventListeners() {
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('notesTextarea').addEventListener('input', debounceNotesSave);
    document.getElementById('todoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
}

// Bio Section
async function loadBioData() {
    const data = JSON.parse(localStorage.getItem('bio_' + userId)) || { fields: { 'Name': '', 'Email': '', 'Phone': '', 'Location': '' } };
    localStorage.setItem('bio_' + userId, JSON.stringify(data));
    renderBioTable(data.fields);
}

function renderBioTable(fields) {
    const tbody = document.getElementById('bioTableBody');
    tbody.innerHTML = '';
    
    Object.entries(fields).forEach(([key, value]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${key}</td>
            <td>
                <input type="text" class="bio-field-value" value="${value}" 
                       onchange="updateBioField('${key}', this.value)">
            </td>
            <td>
                <button class="delete-field-btn" onclick="deleteBioField('${key}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addBioField() {
    const fieldName = prompt('Enter field name:');
    if (!fieldName || fieldName.trim() === '') return;
    
    const data = JSON.parse(localStorage.getItem('bio_' + userId)) || { fields: {} };
    data.fields[fieldName.trim()] = '';
    localStorage.setItem('bio_' + userId, JSON.stringify(data));
    renderBioTable(data.fields);
    alert('Field added successfully!');
}

async function updateBioField(fieldName, value) {
    const data = JSON.parse(localStorage.getItem('bio_' + userId)) || { fields: {} };
    data.fields[fieldName] = value;
    localStorage.setItem('bio_' + userId, JSON.stringify(data));
}

async function deleteBioField(fieldName) {
    if (!confirm(`Delete field "${fieldName}"?`)) return;
    
    const data = JSON.parse(localStorage.getItem('bio_' + userId));
    delete data.fields[fieldName];
    localStorage.setItem('bio_' + userId, JSON.stringify(data));
    renderBioTable(data.fields);
}

// Documents Section
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    showLoading(true);
    
    try {
        const documents = JSON.parse(localStorage.getItem('documents_' + userId)) || [];
        
        for (const file of files) {
            const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const fileData = {
                id: fileId,
                userId: userId,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date().toISOString(),
                url: '#',
                storagePath: 'local_' + fileId
            };
            documents.push(fileData);
        }
        
        localStorage.setItem('documents_' + userId, JSON.stringify(documents));
        await loadDocuments();
        alert('Files uploaded successfully!');
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('Error uploading files. Please try again.');
    } finally {
        showLoading(false);
        event.target.value = '';
    }
}

async function loadDocuments() {
    const documents = JSON.parse(localStorage.getItem('documents_' + userId)) || [];
    renderDocuments(documents);
}

function renderDocuments(documents) {
    const grid = document.getElementById('documentsGrid');
    grid.innerHTML = '';
    
    if (documents.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #a0a0a0; padding: 20px;">No documents uploaded yet</p>';
        return;
    }
    
    documents.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'document-item';
        
        const icon = getFileIcon(doc.type, doc.name);
        const date = new Date(doc.uploadDate).toLocaleDateString();
        
        // Check if it's an image for preview
        const isImage = doc.type.startsWith('image/');
        
        item.innerHTML = `
            <div class="document-icon">${icon}</div>
            <div class="document-info">
                <div class="document-name">${doc.name}</div>
                <div class="document-date">${date}</div>
                ${isImage ? '<div class="image-preview">📷 Image file</div>' : ''}
            </div>
            <div class="document-actions">
                ${isImage ? `<button class="action-btn" onclick="previewImage('${doc.url}', '${doc.name}')"><i class="fas fa-eye"></i> Preview</button>` : ''}
                <button class="action-btn" onclick="openDocument('${doc.url}')">
                    <i class="fas fa-external-link-alt"></i> Open
                </button>
                <button class="action-btn" onclick="downloadDocument('${doc.url}', '${doc.name}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="action-btn" onclick="shareDocument('${doc.url}', '${doc.name}')">
                    <i class="fas fa-share"></i> Share
                </button>
                <button class="action-btn delete" onclick="deleteDocument('${doc.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        grid.appendChild(item);
    });
}

function getFileIcon(type, name) {
    const ext = name.split('.').pop().toLowerCase();
    
    if (type.startsWith('image/')) return '<i class="fas fa-image"></i>';
    if (ext === 'pdf') return '<i class="fas fa-file-pdf"></i>';
    if (['doc', 'docx'].includes(ext)) return '<i class="fas fa-file-word"></i>';
    if (['xls', 'xlsx'].includes(ext)) return '<i class="fas fa-file-excel"></i>';
    if (['ppt', 'pptx'].includes(ext)) return '<i class="fas fa-file-powerpoint"></i>';
    if (ext === 'zip') return '<i class="fas fa-file-archive"></i>';
    
    return '<i class="fas fa-file"></i>';
}

function openDocument(url) {
    if (url === '#') {
        alert('File preview not available in demo mode');
        return;
    }
    window.open(url, '_blank');
}

function downloadDocument(url, filename) {
    if (url === '#') {
        alert('File download not available in demo mode');
        return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

async function deleteDocument(docId) {
    if (!confirm('Delete this document?')) return;
    
    try {
        showLoading(true);
        const documents = JSON.parse(localStorage.getItem('documents_' + userId)) || [];
        const updatedDocuments = documents.filter(doc => doc.id !== docId);
        localStorage.setItem('documents_' + userId, JSON.stringify(updatedDocuments));
        await loadDocuments();
        alert('Document deleted successfully!');
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Links Section
function showAddLinkModal() {
    document.getElementById('addLinkModal').style.display = 'block';
    document.getElementById('linkName').focus();
}

function closeAddLinkModal() {
    document.getElementById('addLinkModal').style.display = 'none';
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkDescription').value = '';
}

async function saveLinkFromModal() {
    const name = document.getElementById('linkName').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    const description = document.getElementById('linkDescription').value.trim();
    
    if (!name || !url) {
        alert('Please enter both name and URL');
        return;
    }
    
    try {
        const links = JSON.parse(localStorage.getItem('links_' + userId)) || [];
        const linkId = Date.now().toString();
        const linkData = {
            id: linkId,
            userId: userId,
            name: name,
            url: url,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        links.push(linkData);
        localStorage.setItem('links_' + userId, JSON.stringify(links));
        
        closeAddLinkModal();
        await loadLinks();
        alert('Link added successfully!');
    } catch (error) {
        console.error('Error saving link:', error);
        alert('Error saving link. Please try again.');
    }
}

async function loadLinks() {
    const links = JSON.parse(localStorage.getItem('links_' + userId)) || [];
    renderLinks(links);
}

function renderLinks(links) {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = '';
    
    if (links.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #a0a0a0; padding: 20px;">No links added yet</p>';
        return;
    }
    
    links.forEach(link => {
        const item = document.createElement('div');
        item.className = 'link-item';
        item.onclick = () => window.open(link.url, '_blank');
        
        item.innerHTML = `
            <div class="link-content">
                <div class="link-header">
                    <div class="link-name">${link.name}</div>
                </div>
                <div class="link-url">${link.url}</div>
                ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
            </div>
            <button class="delete-field-btn" onclick="event.stopPropagation(); deleteLink('${link.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        grid.appendChild(item);
    });
}

async function deleteLink(linkId) {
    if (!confirm('Delete this link?')) return;
    
    try {
        const links = JSON.parse(localStorage.getItem('links_' + userId)) || [];
        const updatedLinks = links.filter(link => link.id !== linkId);
        localStorage.setItem('links_' + userId, JSON.stringify(updatedLinks));
        await loadLinks();
        alert('Link deleted successfully!');
    } catch (error) {
        console.error('Error deleting link:', error);
    }
}

// Notes Section
let notesTimeout;

function debounceNotesSave() {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(saveNotes, 1000);
}

async function saveNotes() {
    const notes = document.getElementById('notesTextarea').value;
    
    try {
        const notesData = {
            content: notes,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('notes_' + userId, JSON.stringify(notesData));
    } catch (error) {
        console.error('Error saving notes:', error);
    }
}

async function loadNotes() {
    const notesData = JSON.parse(localStorage.getItem('notes_' + userId)) || { content: '' };
    document.getElementById('notesTextarea').value = notesData.content || '';
}

// Todo Section
async function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('Please enter a task');
        return;
    }
    
    try {
        const todos = JSON.parse(localStorage.getItem('todos_' + userId)) || [];
        const todoId = Date.now().toString();
        const todoData = {
            id: todoId,
            userId: userId,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.push(todoData);
        localStorage.setItem('todos_' + userId, JSON.stringify(todos));
        
        input.value = '';
        await loadTodos();
        alert('Task added successfully!');
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Error adding task. Please try again.');
    }
}

async function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos_' + userId)) || [];
    todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderTodos(todos);
}

function renderTodos(todos) {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    
    if (todos.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #a0a0a0; padding: 20px;">No tasks added yet</p>';
        return;
    }
    
    todos.forEach(todo => {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo('${todo.id}', this.checked)">
            <span class="todo-text">${todo.text}</span>
            <button class="todo-delete" onclick="deleteTodo('${todo.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        list.appendChild(item);
    });
}

async function toggleTodo(todoId, completed) {
    try {
        const todos = JSON.parse(localStorage.getItem('todos_' + userId)) || [];
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        
        if (todoIndex !== -1) {
            todos[todoIndex].completed = completed;
            localStorage.setItem('todos_' + userId, JSON.stringify(todos));
            await loadTodos();
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

async function deleteTodo(todoId) {
    if (!confirm('Delete this task?')) return;
    
    try {
        const todos = JSON.parse(localStorage.getItem('todos_' + userId)) || [];
        const updatedTodos = todos.filter(todo => todo.id !== todoId);
        localStorage.setItem('todos_' + userId, JSON.stringify(updatedTodos));
        await loadTodos();
        alert('Task deleted successfully!');
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

// Utility Functions
function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

// Make functions globally available
window.addBioField = addBioField;
window.updateBioField = updateBioField;
window.deleteBioField = deleteBioField;
window.openDocument = openDocument;
window.downloadDocument = downloadDocument;
window.deleteDocument = deleteDocument;
window.previewImage = previewImage;
window.shareDocument = shareDocument;
window.showAddLinkModal = showAddLinkModal;
window.closeAddLinkModal = closeAddLinkModal;
window.saveLinkFromModal = saveLinkFromModal;
window.deleteLink = deleteLink;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// Image preview function
function previewImage(url, filename) {
    if (url === '#') {
        alert('Image preview not available in demo mode');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'image-preview-modal';
    modal.innerHTML = `
        <div class="image-preview-content">
            <div class="image-preview-header">
                <h3>${filename}</h3>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="image-preview-body">
                <img src="${url}" alt="${filename}" style="max-width: 100%; max-height: 80vh; object-fit: contain;">
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.querySelector('.image-preview-content').style.cssText = `
        background: #560064;
        border-radius: 12px;
        max-width: 90%;
        max-height: 90%;
        overflow: hidden;
        border: 1px solid #c084fc;
    `;
    
    modal.querySelector('.image-preview-header').style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: #3d0047;
        color: #c084fc;
        border-bottom: 1px solid #c084fc;
    `;
    
    modal.querySelector('.close').style.cssText = `
        font-size: 24px;
        cursor: pointer;
        color: #c084fc;
    `;
    
    modal.querySelector('.image-preview-body').style.cssText = `
        padding: 20px;
        text-align: center;
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Share document function
function shareDocument(url, filename) {
    if (url === '#') {
        alert('Share not available in demo mode');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: filename,
            text: `Check out this document: ${filename}`,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Document link copied to clipboard!');
        }).catch(() => {
            // Manual copy fallback
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Document link copied to clipboard!');
        });
    }
}