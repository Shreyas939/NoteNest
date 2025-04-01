import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import PWAPrompt from 'react-ios-pwa-prompt';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App /><PWAPrompt copyTitle='PWA Ready' appIconPath='../public/android-chrome-192x192.png'/>
  </AuthProvider>,

)
