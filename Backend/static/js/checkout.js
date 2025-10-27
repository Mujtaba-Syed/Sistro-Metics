// Checkout.js - Dynamic cart functionality
console.log('Checkout.js loaded successfully');

// API Configuration
window.API_BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = window.API_BASE_URL;
const CART_API_BASE = `${API_BASE_URL}/cart/`;

console.log('API_BASE_URL:', API_BASE_URL);
console.log('CART_API_BASE:', CART_API_BASE);

// Helper function to check if user is authenticated
function isUserAuthenticated() {
    try {
        const authTokens = sessionStorage.getItem('authTokens');
        if (authTokens) {
            const tokens = JSON.parse(authTokens);
            return !!(tokens.accessToken && tokens.user);
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
    return false;
}

// Helper function to show login modal when authentication is required
function showLoginModalIfNeeded() {
    if (!isUserAuthenticated()) {
        console.log('User not authenticated, showing login modal');
        if (typeof openLoginModal === 'function') {
            openLoginModal();
        } else {
            console.error('openLoginModal function not found');
        }
        return true; // Return true if modal was shown
    }
    return false; // Return false if user is authenticated
}

// Helper function to get headers with authentication
function getAuthenticatedHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
    };
    
    const accessToken = getAccessToken();
    if (!accessToken) {
        return null; // Return null if no token
    }
    headers['Authorization'] = `Bearer ${accessToken}`;
    return headers;
}

// Helper function to handle authentication errors
function handleAuthError(response) {
    if (response.status === 401) {
        console.log('Unauthorized response, showing login modal');
        showLoginModalIfNeeded();
        return true; // Return true if auth error was handled
    }
    return false; // Return false if no auth error
}

// Helper function to get access token from session storage
function getAccessToken() {
    try {
        const authTokens = sessionStorage.getItem('authTokens');
        if (authTokens) {
            const tokens = JSON.parse(authTokens);
            return tokens.accessToken || '';
        }
    } catch (error) {
        console.error('Error parsing auth tokens:', error);
    }
    return '';
}

// CSRF Token helper
function getCSRFToken() {
    return window.CSRF_TOKEN || document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

console.log('CSRF Token available:', !!getCSRFToken());
console.log('Access Token available:', !!getAccessToken());

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart on page load
    loadCartItems();
    
    // Add event listeners for quantity controls
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-num-product-up')) {
            handleQuantityChange(e.target.closest('.btn-num-product-up'), 'increase');
        } else if (e.target.closest('.btn-num-product-down')) {
            handleQuantityChange(e.target.closest('.btn-num-product-down'), 'decrease');
        }
    });
    
    // Add event listener for WhatsApp order button
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', handleWhatsAppOrder);
    }
});

// Load cart items from API
async function loadCartItems() {
    try {
        const headers = getAuthenticatedHeaders();
        if (!headers) {
            console.log('No access token found, showing login modal');
            showLoginModalIfNeeded();
            return;
        }
        
        const response = await fetch(`${CART_API_BASE}get_items/`, {
            method: 'GET',
            headers: headers
        });
        
        if (handleAuthError(response)) {
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderCartItems(data.data);
        } else {
            console.error('Failed to load cart items:', data.message);
            showEmptyCart();
        }
    } catch (error) {
        console.error('Error loading cart items:', error);
        showEmptyCart();
    }
}


// Handle quantity changes
async function handleQuantityChange(button, action) {
    const cartItemId = button.getAttribute('data-cart-item-id');
    const quantityInput = document.querySelector(`input[data-cart-item-id="${cartItemId}"]`);
    let currentQuantity = parseInt(quantityInput.value);
    
    if (action === 'increase') {
        currentQuantity += 1;
    } else if (action === 'decrease' && currentQuantity > 1) {
        currentQuantity -= 1;
    }
    
    // Update the input value
    quantityInput.value = currentQuantity;
    
    // Update cart via API
    await updateCartItemQuantity(cartItemId, currentQuantity);
}

// Update cart item quantity via API
async function updateCartItemQuantity(cartItemId, quantity) {
    try {
        const headers = getAuthenticatedHeaders();
        if (!headers) {
            console.log('No access token found for quantity update');
            showLoginModalIfNeeded();
            return;
        }
        
        const response = await fetch(`${CART_API_BASE}update_quantity/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                cart_item_id: cartItemId,
                quantity: quantity
            })
        });
        
        if (handleAuthError(response)) {
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Reload cart items to get updated totals
            loadCartItems();
        } else {
            console.error('Failed to update quantity:', data.message);
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Update total amount display
function updateTotalAmount(totalAmount) {
    // Find or create total display element
    let totalElement = document.querySelector('.cart-total');
    if (!totalElement) {
        // Create total display after the cart table
        const cartTable = document.querySelector('.table-responsive');
        totalElement = document.createElement('div');
        totalElement.className = 'cart-total text-end mt-3 p-3 bg-light';
        cartTable.parentNode.insertBefore(totalElement, cartTable.nextSibling);
    }
    
    totalElement.innerHTML = `
        <h4 class="text-dark mb-0">
            <strong>Total: Rs ${totalAmount.toFixed(2)}</strong>
        </h4>
    `;
}

// Show empty cart message
function showEmptyCart() {
    const tableBody = document.querySelector('.table-shopping-cart tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr class="table_row">
                <td colspan="5" class="text-center py-4">
                    <p class="text-muted">Your cart is empty</p>
                    <a href="/" class="btn btn-primary">Continue Shopping</a>
                </td>
            </tr>
        `;
    }
    
    // Hide total amount
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.style.display = 'none';
    }
}

// Global variables to store cart data
let currentCartItems = [];
let currentTotalAmount = 0;

// Update cart data when items are loaded
function updateCartData(cartItems, totalAmount) {
    currentCartItems = cartItems;
    currentTotalAmount = totalAmount;
}

// Handle WhatsApp order button click
async function handleWhatsAppOrder() {
    // Validate form first
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Get shipping details
    const shippingDetails = getShippingDetails();
    
    // Get cart items and total
    await loadCartItems();
    
    // Create WhatsApp message
    const message = createWhatsAppMessage(shippingDetails, currentCartItems, currentTotalAmount);
    
    // Redirect to WhatsApp
    redirectToWhatsApp(message);
}

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const requiredFields = [
        'first_name', 'last_name', 'address', 'city', 'country', 'mobile'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName.replace('_', '-'));
        if (field && !field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else if (field) {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate email format if provided
    const emailField = document.getElementById('email');
    if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            emailField.classList.add('is-invalid');
            isValid = false;
        } else {
            emailField.classList.remove('is-invalid');
        }
    }
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
        return false;
    }
    
    return true;
}

// Get shipping details from form
function getShippingDetails() {
    return {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim(),
        zipcode: document.getElementById('zipcode').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        email: document.getElementById('email').value.trim(),
        orderNotes: document.getElementById('order-notes').value.trim()
    };
}

// Create WhatsApp message with order details
function createWhatsAppMessage(shippingDetails, cartItems, totalAmount) {
    let message = ` *NEW ORDER REQUEST*\n\n`;
    
    // Customer Information
    message += ` *CUSTOMER DETAILS:*\n`;
    message += `Name: ${shippingDetails.firstName} ${shippingDetails.lastName}\n`;
    message += `Mobile: ${shippingDetails.mobile}\n`;
    if (shippingDetails.email) {
        message += `Email: ${shippingDetails.email}\n`;
    }
    message += `\n`;
    
    // Shipping Address
    message += ` *SHIPPING ADDRESS:*\n`;
    message += `${shippingDetails.address}\n`;
    message += `${shippingDetails.city}, ${shippingDetails.country}`;
    if (shippingDetails.zipcode) {
        message += ` ${shippingDetails.zipcode}`;
    }
    message += `\n\n`;
    
    // Order Items
    message += ` *ORDER ITEMS:*\n`;
    cartItems.forEach((item, index) => {
        const product = item.product;
        const price = parseFloat(product.discounted_price || product.price);
        const itemTotal = price * item.quantity;
        
        message += `${index + 1}. ${product.name}\n`;
        message += `   Qty: ${item.quantity} × ${price.toFixed(2)} = Rs ${itemTotal.toFixed(2)}\n`;
    });
    
    // Total Amount
    message += `\n *TOTAL AMOUNT: Rs ${totalAmount.toFixed(2)}*\n\n`;
    
    // Order Notes
    if (shippingDetails.orderNotes) {
        message += ` *ORDER NOTES:*\n${shippingDetails.orderNotes}\n\n`;
    }
    
    // Footer
    message += ` Order placed on: ${new Date().toLocaleString()}\n`;
    message += `Please confirm this order and provide payment details. Thank you! `;
    
    return message;
}

// Redirect to WhatsApp with the message
function redirectToWhatsApp(message) {
    // WhatsApp number (you can change this to your business number)
    const whatsappNumber = '923009845333'; 
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
}

// Update the renderCartItems function to store cart data
function renderCartItems(cartItems) {
    const tableBody = document.querySelector('.table-shopping-cart tbody');
    
    // Remove existing cart rows (keep header)
    const existingRows = document.querySelectorAll('.table-shopping-cart .table_row');
    existingRows.forEach(row => row.remove());
    
    if (cartItems.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Create tbody if it doesn't exist
    if (!tableBody) {
        const table = document.querySelector('.table-shopping-cart');
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }
    
    const tbody = document.querySelector('.table-shopping-cart tbody');
    let totalAmount = 0;
    
    cartItems.forEach((item, index) => {
        const product = item.product;
        const quantity = item.quantity;
        const price = parseFloat(product.discounted_price || product.price);
        const itemTotal = price * quantity;
        totalAmount += itemTotal;
        
        const row = document.createElement('tr');
        row.className = 'table_row';
        row.setAttribute('data-cart-item-id', item.id);
        
        // Get the first active image
        const productImage = product.images && product.images.length > 0 
            ? product.images[0].image 
            : '/static/images/item-cart-04.jpg'; // fallback image
        
        row.innerHTML = `
            <td class="column-1">
                <div class="how-itemcart1">
                    <img src="${productImage}" alt="${product.name}" onerror="this.src='/static/images/item-cart-04.jpg'">
                </div>
            </td>
            <td class="column-2">${product.name}</td>
            <td class="column-3">Rs ${price.toFixed(2)}</td>
            <td class="column-4">
                <div class="quantity-display">
                    <span class="quantity-value">${quantity}</span>
                </div>
            </td>
            <td class="column-5">Rs ${itemTotal.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update total amount display and store cart data
    updateTotalAmount(totalAmount);
    updateCartData(cartItems, totalAmount);
}
