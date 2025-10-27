/**
 * Authentication Handler for SistoMatic
 * Handles guest user sessions and Google OAuth
 */

class AuthHandler {
    constructor() {
        console.log('AuthHandler initialized!');
        this.currentProductId = null;
        this.init();
    }

    init() {
        // Bind event listeners
        this.bindEvents();
        
        // Check if user is already authenticated
        this.checkAuthStatus();
        
        // Add debug method to window for testing
        window.testAuth = () => {
            console.log('Current auth status:', this.isAuthenticated());
            console.log('Auth data:', this.getAuthData());
        };
        
        // Add method to clear auth for testing
        window.clearAuth = () => {
            this.clearAuthData();
            console.log('Auth data cleared');
        };
    }

    bindEvents() {
        // Add to cart button clicks - use capture phase to intercept before other handlers
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target);
            
            if (e.target.classList.contains('js-addcart-detail') || 
                e.target.closest('.js-addcart-detail') ||
                e.target.textContent.trim() === 'Add to Cart') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Add to cart button clicked!');
                this.handleAddToCart(e);
                return false;
            }
        }, true); // Use capture phase

        // Modal button clicks
        document.getElementById('guestUserBtn')?.addEventListener('click', () => {
            this.handleGuestUser();
        });

        document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
            this.handleGoogleLogin();
        });
    }

    handleAddToCart(event) {
        // Get product ID from the button or its parent
        const productId = event.target.getAttribute('data-product-id') || 
                         event.target.closest('[data-product-id]')?.getAttribute('data-product-id') ||
                         this.extractProductIdFromContext(event.target);
        
        if (!productId) {
            console.error('Product ID not found');
            return;
        }

        this.currentProductId = productId;
        
        // Check if user is already authenticated
        console.log('Checking authentication status...');
        if (this.isAuthenticated()) {
            console.log('User is authenticated, adding to cart directly');
            this.addToCart(productId);
        } else {
            console.log('User not authenticated, showing modal');
            // Show authentication modal
            this.showAuthModal();
        }
    }

    extractProductIdFromContext(element) {
        // Try to find product ID in various ways
        const productElement = element.closest('[data-product-id]') || 
                              element.closest('.product-item') ||
                              element.closest('.block2');
        
        if (productElement) {
            return productElement.getAttribute('data-product-id');
        }
        
        // If in quick view modal, get from the modal
        const quickViewModal = document.querySelector('.js-modal1');
        if (quickViewModal && quickViewModal.style.display !== 'none') {
            const addToCartBtn = quickViewModal.querySelector('.js-addcart-detail');
            return addToCartBtn?.getAttribute('data-product-id');
        }
        
        return null;
    }

    showAuthModal() {
        const modalElement = document.getElementById('authModal');
        if (!modalElement) {
            console.error('Auth modal element not found');
            return;
        }
        
        console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
        console.log('jQuery available:', typeof $ !== 'undefined');
        console.log('jQuery modal available:', typeof $ !== 'undefined' && $.fn.modal);
        
        // Try Bootstrap 5 method first
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('Using Bootstrap 5 modal');
            const authModal = new bootstrap.Modal(modalElement);
            authModal.show();
        } else if (typeof $ !== 'undefined' && $.fn.modal) {
            // Fallback to jQuery Bootstrap method
            console.log('Using jQuery Bootstrap modal');
            $(modalElement).modal('show');
        } else {
            // Fallback to manual show
            console.log('Using manual modal show');
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = 'authModalBackdrop';
            document.body.appendChild(backdrop);
        }
    }

    hideAuthModal() {
        const modalElement = document.getElementById('authModal');
        if (!modalElement) return;
        
        // Try Bootstrap 5 method first
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const authModal = bootstrap.Modal.getInstance(modalElement);
            authModal?.hide();
        } else if (typeof $ !== 'undefined' && $.fn.modal) {
            // Fallback to jQuery Bootstrap method
            $(modalElement).modal('hide');
        } else {
            // Fallback to manual hide
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Remove backdrop
            const backdrop = document.getElementById('authModalBackdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    }

    showLoadingModal() {
        const modalElement = document.getElementById('loadingModal');
        if (!modalElement) {
            console.error('Loading modal element not found');
            return;
        }
        
        // Try Bootstrap 5 method first
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const loadingModal = new bootstrap.Modal(modalElement);
            loadingModal.show();
        } else if (typeof $ !== 'undefined' && $.fn.modal) {
            // Fallback to jQuery Bootstrap method
            $(modalElement).modal('show');
        } else {
            // Fallback to manual show
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
        }
    }

    hideLoadingModal() {
        const modalElement = document.getElementById('loadingModal');
        if (!modalElement) return;
        
        // Try Bootstrap 5 method first
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const loadingModal = bootstrap.Modal.getInstance(modalElement);
            loadingModal?.hide();
        } else if (typeof $ !== 'undefined' && $.fn.modal) {
            // Fallback to jQuery Bootstrap method
            $(modalElement).modal('hide');
        } else {
            // Fallback to manual hide
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    handleGuestUser() {
        this.showLoadingModal();
        this.hideAuthModal();
        
        // Generate guest session
        const guestSession = this.createGuestSession();
        
        // Save to localStorage
        this.saveAuthData('guest', guestSession);
        
        // Add to cart
        setTimeout(() => {
            this.hideLoadingModal();
            this.addToCart(this.currentProductId);
        }, 1000);
    }

    handleGoogleLogin() {
        this.showLoadingModal();
        this.hideAuthModal();
        
        // Redirect to Google OAuth
        const googleAuthUrl = this.getGoogleAuthUrl();
        window.location.href = googleAuthUrl;
    }

    createGuestSession() {
        const sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const accessToken = 'guest_access_' + btoa(sessionId + '_' + Date.now());
        const refreshToken = 'guest_refresh_' + btoa(sessionId + '_refresh_' + Date.now());
        
        return {
            sessionId: sessionId,
            accessToken: accessToken,
            refreshToken: refreshToken,
            userType: 'guest',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };
    }

    getGoogleAuthUrl() {
        const baseUrl = window.location.origin;
        const clientId = '179858787311-qjutgd02cht6haegoict6d9diqa110mi.apps.googleusercontent.com';
        const redirectUri = encodeURIComponent(`${baseUrl}/accounts/google/login/callback/`);
        const scope = encodeURIComponent('profile email');
        const state = encodeURIComponent(JSON.stringify({
            productId: this.currentProductId,
            returnUrl: window.location.href
        }));
        
        return `https://accounts.google.com/o/oauth2/v2/auth?` +
               `client_id=${clientId}&` +
               `redirect_uri=${redirectUri}&` +
               `scope=${scope}&` +
               `response_type=code&` +
               `state=${state}&` +
               `access_type=offline&` +
               `prompt=consent`;
    }

    saveAuthData(userType, authData) {
        const authInfo = {
            userType: userType,
            data: authData,
            timestamp: Date.now()
        };
        
        localStorage.setItem('sistomatic_auth', JSON.stringify(authInfo));
        
        // Also save to sessionStorage for immediate use
        sessionStorage.setItem('sistomatic_auth', JSON.stringify(authInfo));
        
        // Set cookies for server-side access
        this.setAuthCookies(authData);
    }

    setAuthCookies(authData) {
        const expires = new Date(authData.expiresAt);
        
        document.cookie = `sistomatic_session_id=${authData.sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `sistomatic_access_token=${authData.accessToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; HttpOnly`;
        document.cookie = `sistomatic_refresh_token=${authData.refreshToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; HttpOnly`;
    }

    isAuthenticated() {
        const authData = this.getAuthData();
        console.log('Auth data found:', authData);
        
        if (!authData) {
            console.log('No auth data found');
            return false;
        }
        
        // Check if session is expired
        if (authData.data.expiresAt && new Date(authData.data.expiresAt) < new Date()) {
            console.log('Session expired, clearing auth data');
            this.clearAuthData();
            return false;
        }
        
        // Check if we have valid tokens
        if (!authData.data.sessionId || !authData.data.accessToken) {
            console.log('Invalid tokens found');
            return false;
        }
        
        console.log('User is authenticated with valid tokens');
        return true;
    }

    getAuthData() {
        try {
            const authStr = localStorage.getItem('sistomatic_auth') || sessionStorage.getItem('sistomatic_auth');
            return authStr ? JSON.parse(authStr) : null;
        } catch (e) {
            console.error('Error parsing auth data:', e);
            return null;
        }
    }

    clearAuthData() {
        localStorage.removeItem('sistomatic_auth');
        sessionStorage.removeItem('sistomatic_auth');
        
        // Clear cookies
        document.cookie = 'sistomatic_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'sistomatic_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'sistomatic_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    checkAuthStatus() {
        const authData = this.getAuthData();
        if (authData) {
            console.log('User authenticated as:', authData.userType);
            this.updateUIForAuthenticatedUser(authData);
        }
    }

    updateUIForAuthenticatedUser(authData) {
        // Update navbar or other UI elements
        const accountLinks = document.querySelectorAll('a[href="#"]');
        accountLinks.forEach(link => {
            if (link.textContent.includes('My Account')) {
                link.textContent = authData.userType === 'guest' ? 'Guest User' : authData.data.email || 'Google User';
                link.style.color = '#e83e8c';
            }
        });
    }

    addToCart(productId) {
        const authData = this.getAuthData();
        if (!authData) {
            console.error('No authentication data found');
            this.showAuthModal();
            return;
        }

        console.log('Adding to cart with auth data:', authData);
        // Make API call to add item to cart using the existing Cart API
        this.makeAddToCartRequest(productId, authData);
    }

    makeAddToCartRequest(productId, authData) {
        const requestData = {
            product_id: productId,
            quantity: 1
        };

        console.log('Making API call to add to cart:', requestData);

        // Make API call to add item to cart using the existing Cart API
        fetch('/cart/add_item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            console.log('API Response status:', response.status);
            console.log('API Response headers:', response.headers);
            return response.json();
        })
        .then(data => {
            console.log('Cart API response:', data);
            if (data.success) {
                this.showSuccessMessage(data.message);
                this.updateCartCount();
            } else {
                this.showErrorMessage(data.message || 'Failed to add item to cart');
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            this.showErrorMessage('Network error. Please try again.');
        });
    }

    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }

    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: 500;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showSuccessMessage(message) {
        // Create and show a toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: 500;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    updateCartCount() {
        // Update cart count in the UI
        const cartCountElements = document.querySelectorAll('.icon-header-noti[data-notify]');
        cartCountElements.forEach(element => {
            const currentCount = parseInt(element.getAttribute('data-notify')) || 0;
            element.setAttribute('data-notify', currentCount + 1);
        });
    }

    // Handle Google OAuth callback
    handleGoogleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (code && state) {
            try {
                const stateData = JSON.parse(decodeURIComponent(state));
                this.currentProductId = stateData.productId;
                
                // Exchange code for tokens (this would be done server-side in real implementation)
                this.processGoogleAuth(code);
            } catch (e) {
                console.error('Error processing Google callback:', e);
            }
        }
    }

    processGoogleAuth(code) {
        // In a real implementation, you would send the code to your backend
        // to exchange it for access and refresh tokens
        
        // For now, simulate the process
        const googleAuthData = {
            accessToken: 'google_access_' + btoa(code + '_' + Date.now()),
            refreshToken: 'google_refresh_' + btoa(code + '_refresh_' + Date.now()),
            userType: 'google',
            email: 'user@gmail.com', // This would come from Google API
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        };
        
        this.saveAuthData('google', googleAuthData);
        
        // Add to cart if product ID exists
        if (this.currentProductId) {
            this.addToCart(this.currentProductId);
        }
        
        // Redirect back to original page
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        if (state) {
            const stateData = JSON.parse(decodeURIComponent(state));
            if (stateData.returnUrl) {
                window.location.href = stateData.returnUrl;
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authHandler = new AuthHandler();
    
    // Check if this is a Google OAuth callback
    if (window.location.pathname.includes('/accounts/google/login/callback/')) {
        window.authHandler.handleGoogleCallback();
    }
});

// Export for use in other scripts
window.AuthHandler = AuthHandler;
