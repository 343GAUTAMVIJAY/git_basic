# Personal Dashboard Application

A comprehensive personal dashboard application built with HTML, CSS, JavaScript, and Firebase. This application allows users to manage various aspects of their personal information in one centralized location.

## Features

- **Bio Management**: Add, edit, and delete personal information fields
- **Document Storage**: Upload and manage documents with Firebase Storage
- **Links & Tools**: Organize and store important links and resources
- **Notes**: Rich text editor with auto-save functionality
- **To-Do List**: Task management with completion tracking
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Data syncs across devices via Firebase

## Technologies Used

- HTML5
- CSS3 (with modern flexbox and grid layouts)
- JavaScript (ES6+ modules)
- Firebase Firestore (database)
- Firebase Storage (file storage)
- Font Awesome (icons)

## Project Structure

```
personal-dashboard/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js              # Main application logic
├── firebase.config.js  # Firebase configuration
├── firebase.services.js # Firebase service functions
├── utils.js            # Utility functions and helpers
├── firestore.rules     # Firestore security rules
├── storage.rules       # Storage security rules
└── README.md           # Project documentation
```

## Setup Instructions

### Prerequisites

- A Firebase project with Firestore and Storage enabled
- Web browser that supports ES6 modules

### Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore and Storage
3. Add a web app to your Firebase project
4. Update `firebase.config.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Running the Application

1. Clone or download this repository
2. Update the Firebase configuration in `firebase.config.js`
3. Serve the files using a local web server (like Live Server in VS Code)
4. Open the application in your browser

## How to Use

### Bio Section
- Click "Add Field" to add new bio fields
- Click on any bio value to edit it
- Use the trash icon to delete fields

### Documents Section
- Drag and drop files or click the upload area to upload documents
- View uploaded documents with icons based on file type
- Download or delete documents as needed

### Links Section
- Click "Add Link" to add new links
- Provide name, URL, and optional description
- Delete links with the delete button

### Notes Section
- Type in the notes area to create content
- Notes auto-save periodically
- Clear all notes with the "Clear Notes" button

### To-Do Section
- Add tasks using the input field
- Mark tasks as complete with checkboxes
- Edit task text by clicking on it
- Delete tasks with the trash icon

## Security Rules

Firestore and Storage rules are configured to ensure users can only access their own data:

- Users can read/write only their own bio data
- Users can read/write only their own documents
- Users can read/write only their own links
- Users can read/write only their own notes
- Users can read/write only their own todos

## Code Architecture

The application follows a modular architecture:

- `app.js`: Main application logic and UI interactions
- `firebase.config.js`: Firebase initialization and exports
- `firebase.services.js`: Firebase service functions for each feature
- `utils.js`: Reusable utilities like AutoSaveManager and ErrorHandler
- `styles.css`: Comprehensive styling with responsive design

## Performance Features

- Client-side caching to reduce API calls
- Auto-save functionality to prevent data loss
- Lazy loading of components
- Optimized image and file handling

## Customization

The application can be customized by:

- Modifying the CSS variables in `styles.css`
- Adding new fields to the default bio fields
- Adjusting auto-save intervals in `app.js`
- Extending the file type support in the document upload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.