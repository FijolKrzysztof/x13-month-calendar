import {bootstrapApplication} from '@angular/platform-browser';

import {AppComponent} from './app/app';
import {appConfig} from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('🗓️ 13-Month Calendar Application started successfully!');

    // Optional: Setup global event listeners
    setupGlobalEventListeners();

    // Optional: Setup service worker for PWA (future enhancement)
    // setupServiceWorker();
  })
  .catch(err => {
    console.error('❌ Error starting application:', err);

    // Show user-friendly error message
    document.body.innerHTML = `
      <div style="
        display: flex;
        items-center: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: #f8fafc;
        font-family: system-ui, sans-serif;
      ">
        <div style="text-align: center; max-width: 400px;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280; margin-bottom: 1.5rem;">
            Sorry, there was an error loading the calendar application.
            Please refresh the page to try again.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background: #1f2937;
              color: white;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 0.9rem;
            "
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  });

function setupGlobalEventListeners() {
  // Prevent default drag behaviors that might interfere with calendar
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  // Add global click handler for analytics (future enhancement)
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    // Track calendar interactions
    if (target.closest('.calendar-day')) {
      console.log('📅 Calendar day clicked');
    } else if (target.closest('[data-event]')) {
      console.log('📝 Event clicked');
    }
  });

  // Handle window resize for responsive adjustments
  let resizeTimer: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Trigger responsive recalculations if needed
      console.log('📱 Window resized');
    }, 150);
  });

  // Handle online/offline status
  window.addEventListener('online', () => {
    console.log('🌐 Application is online');
    // Could sync data with server here
  });

  window.addEventListener('offline', () => {
    console.log('📴 Application is offline');
    // Could show offline indicator here
  });
}

// Optional: Service Worker setup for PWA
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('🔧 Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  }
}
