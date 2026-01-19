# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `personal-dashboard`
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 3. Enable Firebase Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore
5. Click "Done"

## 4. Get Firebase Configuration

1. In Firebase Console, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Enter app nickname: `personal-dashboard-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the firebaseConfig object

## 5. Update Configuration

Replace the firebaseConfig object in `app.js` with your actual configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## 6. Security Rules (Optional - for production)

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Open access for demo
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Open access for demo
    }
  }
}
```

## 7. Run the Application

1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## Features Included

✅ **Bio Section**: Editable personal details with custom fields
✅ **Documents**: File upload/download with cloud storage (PDF, DOC, images, etc.)
✅ **Links & Tools**: Bookmark management with descriptions
✅ **Notes**: Auto-saving rich text notes
✅ **Todo List**: Task management with completion tracking
✅ **Responsive Design**: Works on desktop, tablet, and mobile
✅ **Dark Theme**: Professional dashboard appearance
✅ **Cloud Backend**: Firebase Firestore + Storage
✅ **Real-time Sync**: Data persists across devices and sessions

## File Structure
```
personal-dashboard/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling (dark theme)
├── app.js             # JavaScript + Firebase integration
└── firebase-setup.md  # This setup guide
```

## Browser Compatibility
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Production Deployment
1. Update Firebase security rules
2. Deploy to Firebase Hosting or any static hosting service
3. Update CORS settings if needed