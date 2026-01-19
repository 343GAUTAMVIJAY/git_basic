// Utility functions for auto-save and error handling

// Auto-save manager
export class AutoSaveManager {
    constructor(saveFunction, delay = 1000) {
        this.saveFunction = saveFunction;
        this.delay = delay;
        this.timeoutId = null;
    }
    
    // Trigger auto-save with debounce
    trigger() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        this.timeoutId = setTimeout(() => {
            this.saveFunction();
            this.timeoutId = null;
        }, this.delay);
    }
    
    // Cancel pending auto-save
    cancel() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

// Error handling utilities
export class ErrorHandler {
    static handle(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Display user-friendly error message
        let userMessage = 'An unexpected error occurred.';
        
        if (error.name === 'FirebaseError') {
            switch (error.code) {
                case 'db_not_initialized':
                    userMessage = 'Database connection failed. Please try again later.';
                    break;
                case 'storage_db_not_initialized':
                    userMessage = 'Storage service unavailable. Please try again later.';
                    break;
                case 'file_size_exceeded':
                    userMessage = 'File size exceeds 100MB limit.';
                    break;
                case 'get_bio_failed':
                    userMessage = 'Failed to load bio information. Please refresh the page.';
                    break;
                case 'update_bio_failed':
                    userMessage = 'Failed to update bio information. Please try again.';
                    break;
                case 'add_bio_field_failed':
                    userMessage = 'Failed to add bio field. Please try again.';
                    break;
                case 'delete_bio_field_failed':
                    userMessage = 'Failed to delete bio field. Please try again.';
                    break;
                case 'upload_document_failed':
                    userMessage = 'Failed to upload document. Please try again.';
                    break;
                case 'get_documents_failed':
                    userMessage = 'Failed to load documents. Please refresh the page.';
                    break;
                case 'delete_document_failed':
                    userMessage = 'Failed to delete document. Please try again.';
                    break;
                case 'add_link_failed':
                    userMessage = 'Failed to add link. Please try again.';
                    break;
                case 'get_links_failed':
                    userMessage = 'Failed to load links. Please refresh the page.';
                    break;
                case 'update_link_failed':
                    userMessage = 'Failed to update link. Please try again.';
                    break;
                case 'delete_link_failed':
                    userMessage = 'Failed to delete link. Please try again.';
                    break;
                case 'get_notes_failed':
                    userMessage = 'Failed to load notes. Please refresh the page.';
                    break;
                case 'save_notes_failed':
                    userMessage = 'Failed to save notes. Changes may not be saved.';
                    break;
                case 'add_todo_failed':
                    userMessage = 'Failed to add task. Please try again.';
                    break;
                case 'get_todos_failed':
                    userMessage = 'Failed to load tasks. Please refresh the page.';
                    break;
                case 'update_todo_failed':
                    userMessage = 'Failed to update task. Please try again.';
                    break;
                case 'delete_todo_failed':
                    userMessage = 'Failed to delete task. Please try again.';
                    break;
                case 'update_todo_text_failed':
                    userMessage = 'Failed to update task text. Please try again.';
                    break;
                default:
                    userMessage = error.message || userMessage;
            }
        } else if (error.name === 'TypeError' || error.name === 'ReferenceError') {
            // Handle JavaScript errors
            userMessage = 'An application error occurred. Please refresh the page.';
            // Log more detailed info for developers
            console.error(`JavaScript Error in ${context}:`, error.stack);
        } else if (error.name === 'NetworkError' || error.message.includes('network') || error.message.includes('fetch')) {
            // Handle network errors
            userMessage = 'Network connection error. Please check your internet connection.';
        } else {
            // General error
            userMessage = error.message || userMessage;
        }
        
        // Show error notification to user
        this.showNotification(userMessage, 'error');
        
        // Log error for debugging
        console.error(`Error in ${context}:`, error);
    }
    
    static showNotification(message, type = 'info') {
        // Remove existing notifications of the same type to avoid clutter
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            zIndex: '10000',
            maxWidth: '400px',
            wordWrap: 'break-word',
            boxShadow: '0 4px 6px rgba(0,0,0.1)',
            animation: 'slideIn 0.3s ease-out',
            cursor: 'pointer'
        });
        
        // Set background color based on type
        if (type === 'error') {
            notification.style.backgroundColor = '#e74c3c';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#2ecc71';
        } else {
            notification.style.backgroundColor = '#3498db';
        }
        
        // Add click to dismiss functionality
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after delay (unless it's an error which should stay until dismissed)
        if (type !== 'error') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
}

// Loading state manager
export class LoadingManager {
    static showLoading(show = true) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
}

// Debounce utility function
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

// Throttle utility function
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Validation utilities
export class Validator {
    static isValidUrl(string) {
        try {
            const url = new URL(string);
            return ['http:', 'https:'].includes(url.protocol);
        } catch (_) {
            return false;
        }
    }
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static isFileSizeValid(file, maxSizeInMB = 100) {
        return file.size <= maxSizeInMB * 1024 * 1024;
    }
    
    static isFileTypeValid(file, allowedTypes = []) {
        if (allowedTypes.length === 0) {
            // Default allowed types
            allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain', 'text/csv',
                'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
                'application/x-tar', 'application/gzip',
                'audio/mpeg', 'audio/wav', 'audio/ogg',
                'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
                'application/json', 'application/xml',
                'text/html', 'text/css', 'application/javascript', 'text/markdown'
            ];
        }
        
        return allowedTypes.includes(file.type);
    }
}