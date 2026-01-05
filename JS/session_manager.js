class SessionManager {
  constructor(idleTimeoutMinutes = 15) {
    this.idleTimeoutMinutes = idleTimeoutMinutes;
    this.idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
    this.idleTimer = null;
    this.warningTimer = null;
    this.warningTimeMs = 60000; // 1 minute warning before timeout
    
    this.init();
  }

  init() {
    // Check if session is valid on page load
    this.checkSessionValidity();
    
    // Prevent browser caching
    this.preventCaching();
    
    // Setup idle timeout monitoring
    this.setupIdleTimeout();
    
    // Setup activity listeners
    this.setupActivityListeners();
    
    // Setup periodic session validation
    this.setupPeriodicValidation();
  }

  // Check if session is valid
  async checkSessionValidity() {
    try {
      const response = await fetch('../Accounts/check_session.php', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!data.valid) {
        this.showSessionExpired();
      }
    } catch (error) {
      console.error('Session check error:', error);
      // If can't verify session treat it as expired
      this.showSessionExpired();
    }
  }

  // Prevent browser caching
  preventCaching() {
    // Disable back button by manipulating history
    window.history.pushState(null, '', window.location.href);
    
    window.addEventListener('popstate', (event) => {
      window.history.pushState(null, '', window.location.href);
      this.checkSessionValidity();
    });

    // Prevent caching of sensitive pages
    if (window.performance && window.performance.navigation.type === 2) {
      // Page was accessed via back/forward button
      this.checkSessionValidity();
    }
  }

  // Setup idle timeout monitoring
  setupIdleTimeout() {
    this.resetIdleTimer();
  }

  // Setup activity listeners
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.resetIdleTimer();
      }, true);
    });
  }

  // Reset idle timer
  resetIdleTimer() {
    // Clear existing timers
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    
    // Close warning modal if open
    this.closeWarningModal();
    
    // Set warning timer (1 minute before logout)
    this.warningTimer = setTimeout(() => {
      this.showIdleWarning();
    }, this.idleTimeoutMs - this.warningTimeMs);
    
    // Set logout timer
    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.idleTimeoutMs);
  }

  // Show idle warning modal
  showIdleWarning() {
    let modal = document.getElementById('idle-warning-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'idle-warning-modal';
      modal.innerHTML = `
        <div class="idle-modal-overlay">
          <div class="idle-modal-content">
            <h2>⏰ Session Timeout Warning</h2>
            <p>Your session will expire in <span id="idle-countdown">60</span> seconds due to inactivity.</p>
            <p>Click "Stay Logged In" to continue your session.</p>
            <div class="idle-modal-buttons">
              <button id="stay-logged-in-btn" class="btn-primary">Stay Logged In</button>
              <button id="logout-now-btn" class="btn-secondary">Logout Now</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listeners
      document.getElementById('stay-logged-in-btn').addEventListener('click', () => {
        this.resetIdleTimer();
      });
      
      document.getElementById('logout-now-btn').addEventListener('click', () => {
        this.logout();
      });
    }
    
    modal.style.display = 'block';
    
    // Start countdown
    let countdown = 60;
    const countdownElement = document.getElementById('idle-countdown');
    
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownElement) {
        countdownElement.textContent = countdown;
      }
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    // Store interval for cleanup
    this.countdownInterval = countdownInterval;
  }

  // Close warning modal
  closeWarningModal() {
    const modal = document.getElementById('idle-warning-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Handle idle timeout
  async handleIdleTimeout() {
    this.closeWarningModal();
    
    try {
      // Destroy session on server
      await fetch('../Accounts/logout.php', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Show session expired message
    this.showSessionExpired('Your session has expired due to inactivity.');
  }

  // Show session expired page
  showSessionExpired(message = 'Your session has expired. Please login again.') {
    // Clear all page content
    document.body.innerHTML = `
      <div class="session-expired-container">
        <div class="session-expired-content">
          <div class="expired-icon">🔒</div>
          <h1>Session Expired</h1>
          <p>${message}</p>
          <a href="../login.html" class="btn-login">Return to Login</a>
        </div>
      </div>
    `;
    
    // Prevent any further navigation
    window.onbeforeunload = null;
  }

  // Setup periodic session validation
  setupPeriodicValidation() {
    setInterval(() => {
      this.checkSessionValidity();
    }, 300000); // 5 minutes
  }

  // Logout function
  async logout() {
    try {
      const response = await fetch('../Accounts/logout.php', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to login page
        window.location.href = '../login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '../login.html';
    }
  }
}

// Initialize session manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on authenticated pages (not on login page)
  const isLoginPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname === '/' ||
                      window.location.pathname.endsWith('/');
  
  if (!isLoginPage) {
    window.sessionManager = new SessionManager(15); // 15 minutes idle timeout
  }
});

// styles for modals and expired page
const style = document.createElement('style');
style.textContent = `
  #idle-warning-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  }

  .idle-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .idle-modal-content {
    background: white;
    padding: 40px;
    border-radius: 12px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .idle-modal-content h2 {
    color: #FFA500;
    margin-bottom: 20px;
    font-size: 1.8rem;
  }

  .idle-modal-content p {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  #idle-countdown {
    color: #ff4444;
    font-weight: bold;
    font-size: 1.3rem;
  }

  .idle-modal-buttons {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    justify-content: center;
  }

  .idle-modal-buttons button {
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
  }

  .btn-secondary {
    background: linear-gradient(135deg, #f44336, #da190b);
    color: white;
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #da190b, #c41700);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
  }

  .session-expired-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
  }

  .session-expired-content {
    background: white;
    padding: 60px 40px;
    border-radius: 20px;
    text-align: center;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .expired-icon {
    font-size: 5rem;
    margin-bottom: 20px;
  }

  .session-expired-content h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2.5rem;
  }

  .session-expired-content p {
    color: #666;
    margin-bottom: 30px;
    font-size: 1.2rem;
    line-height: 1.6;
  }

  .btn-login {
    display: inline-block;
    padding: 15px 40px;
    background: linear-gradient(135deg, #FFA500, #ff8c00);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: bold;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
  }

  .btn-login:hover {
    background: linear-gradient(135deg, #ff8c00, #ff7700);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 165, 0, 0.4);
  }
`;
document.head.appendChild(style);