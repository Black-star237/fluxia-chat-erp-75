import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Script main.tsx chargé avec succès !");
console.log("🔧 Mounting React app...");
createRoot(document.getElementById("root")!).render(<App />);
console.log("✅ React app mounted successfully!");

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
