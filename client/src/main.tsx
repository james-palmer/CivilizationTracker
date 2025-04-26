import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { register } from "register-service-worker";

// Register service worker for PWA capabilities
if (import.meta.env.PROD) {
  register('/sw.js', {
    ready() {
      console.log('App is being served from cache by a service worker');
    },
    registered() {
      console.log('Service worker has been registered');
    },
    cached() {
      console.log('Content has been cached for offline use');
    },
    updatefound() {
      console.log('New content is downloading');
    },
    updated() {
      console.log('New content is available; please refresh');
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
