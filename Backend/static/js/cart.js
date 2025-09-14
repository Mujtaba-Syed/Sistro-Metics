// Cart functionality for shopping cart page
console.log('Cart.js loaded successfully');

// API Configuration
window.API_BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = window.API_BASE_URL;
const CART_API_BASE = `${API_BASE_URL}/cart/`;

console.log('API_BASE_URL:', API_BASE_URL);
console.log('CART_API_BASE:', CART_API_BASE);

// CSRF Token helper
function getCSRFToken() {
    return window.CSRF_TOKEN || document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

console.log('CSRF Token available:', !!getCSRFToken());

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the cart page
    if (document.querySelector('.table-shopping-cart')) {
        loadCartItems();
        setupEventListeners();
    }
});

// Load cart items from API
async function loadCartItems() {
    try {
        const response = await fetch(`${CART_API_BASE}get_items/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle different response formats
        let items = [];
        if (Array.isArray(data)) {
            items = data;
        } else if (data.data && Array.isArray(data.data)) {
            items = data.data;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        } else if (data.results && Array.isArray(data.results)) {
            items = data.results;
        } else {
            console.warn('Unexpected API response format:', data);
            items = [];
        }
        
        displayCartItems(items);
    } catch (error) {
        console.error('Error loading cart items:', error);
        showEmptyCart();
    }
}

// Display cart items in the table
function displayCartItems(items) {
    const tableBody = document.querySelector('.table-shopping-cart tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    // Ensure items is an array
    if (!Array.isArray(items)) {
        console.error('Items is not an array:', items);
        showEmptyCart();
        return;
    }

    // Clear existing rows (except header)
    const headerRow = tableBody.querySelector('.table_head');
    tableBody.innerHTML = '';
    if (headerRow) {
        tableBody.appendChild(headerRow);
    }

    if (items.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Add cart items
    items.forEach((item, index) => {
        const row = createCartItemRow(item, index);
        tableBody.appendChild(row);
    });

    updateCartTotals(items);
}

// Create a cart item row
function createCartItemRow(item, index) {
    const row = document.createElement('tr');
    row.className = 'table_row';
    
    // Check if item has the expected structure
    if (!item || !item.product) {
        console.error('Invalid item structure:', item);
        return row;
    }
    
    row.setAttribute('data-product-id', item.product.id);

    // Get the primary image (order: 1) or first available image, or fallback to product.image
    let productImage = '/static/images/product-01.jpg';
    
    if (item.product.images && item.product.images.length > 0) {
        // Sort images by order and get the first one (order: 1)
        const sortedImages = item.product.images.sort((a, b) => a.order - b.order);
        productImage = sortedImages[0].image;
    } else if (item.product.image) {
        productImage = item.product.image;
    }
    const productName = item.product.name;
    const productPrice = parseFloat(item.product.price);
    const quantity = item.quantity;
    const total = productPrice * quantity;

    // Construct proper image URL
    const imageUrl = productImage.startsWith('http') 
        ? productImage 
        : productImage.startsWith('/') 
            ? `${API_BASE_URL}${productImage}` 
            : `${API_BASE_URL}/${productImage}`;

    console.log('Product image details:', {
        productImage,
        imageUrl,
        API_BASE_URL,
        productName
    });

    row.innerHTML = `
        <td class="column-1">
            <div class="how-itemcart1">
                <img src="${imageUrl}" alt="${productName}" onerror="console.log('Image failed to load:', this.src); this.src='${API_BASE_URL}/static/images/product-01.jpg'">
            </div>
        </td>
        <td class="column-2">${productName}</td>
        <td class="column-3">Rs ${productPrice.toFixed(2)}</td>
        <td class="column-4">
            <div class="wrap-num-product flex-w m-l-auto m-r-0">
                <div class="btn-num-product-down cl8 hov-btn3 trans-04 flex-c-m" data-product-id="${item.product.id}">
                    <i class="fs-16 zmdi zmdi-minus"></i>
                </div>
                <input class="mtext-104 cl3 txt-center num-product" type="number" name="num-product${index}" value="${quantity}" min="1" data-product-id="${item.product.id}">
                <div class="btn-num-product-up cl8 hov-btn3 trans-04 flex-c-m" data-product-id="${item.product.id}">
                    <i class="fs-16 zmdi zmdi-plus"></i>
                </div>
            </div>
        </td>
        <td class="column-5">Rs ${total.toFixed(2)}</td>
        <td class="column-6">
            <button class="btn-remove-item" data-product-id="${item.product.id}" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 18px;">
                <i class="fa fa-trash"></i>
            </button>
        </td>
    `;

    return row;
}

// Show empty cart message
function showEmptyCart() {
    const tableBody = document.querySelector('.table-shopping-cart tbody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr class="table_row">
            <td colspan="6" class="text-center p-t-50 p-b-50">
                <h3 class="stext-104 cl2">Your cart is empty</h3>
                <p class="stext-105 cl3">Add some products to get started!</p>
                <a href="/" class="btn btn-primary">Continue Shopping</a>
            </td>
        </tr>
    `;

    // Update totals to show zero
    updateCartTotals([]);
}

// Update cart totals
function updateCartTotals(items) {
    const subtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const shipping = 0; // Free shipping for now
    const total = subtotal + shipping;

    // Update subtotal
    const subtotalElement = document.querySelector('.mtext-110.cl2');
    if (subtotalElement) {
        subtotalElement.textContent = `Rs ${subtotal.toFixed(2)}`;
    }

    // Update total
    const totalElement = document.querySelector('.mtext-110.cl2:last-of-type');
    if (totalElement) {
        totalElement.textContent = `Rs ${total.toFixed(2)}`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Quantity increase buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-num-product-up')) {
            const productId = e.target.closest('.btn-num-product-up').dataset.productId;
            increaseQuantity(productId);
        }
    });

    // Quantity decrease buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-num-product-down')) {
            const productId = e.target.closest('.btn-num-product-down').dataset.productId;
            decreaseQuantity(productId);
        }
    });

    // Quantity input changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('num-product')) {
            const productId = e.target.dataset.productId;
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                updateQuantity(productId, newQuantity);
            }
        }
    });

    // Remove item buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-remove-item')) {
            const productId = e.target.closest('.btn-remove-item').dataset.productId;
            removeItemFromCart(productId);
        }
    });

    // Clear cart button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.clear-cart-btn')) {
            clearCart();
        }
    });
}

// Increase item quantity
async function increaseQuantity(productId) {
    try {
        const response = await fetch(`${CART_API_BASE}increase_item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems(); // Reload cart items
            showNotification('Quantity increased', 'success');
        } else {
            showNotification(data.message || 'Failed to increase quantity', 'error');
        }
    } catch (error) {
        console.error('Error increasing quantity:', error);
        showNotification('Error increasing quantity', 'error');
    }
}

// Decrease item quantity
async function decreaseQuantity(productId) {
    try {
        const response = await fetch(`${CART_API_BASE}remove_item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems(); // Reload cart items
            showNotification('Quantity decreased', 'success');
        } else {
            showNotification(data.message || 'Failed to decrease quantity', 'error');
        }
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        showNotification('Error decreasing quantity', 'error');
    }
}

// Update item quantity
async function updateQuantity(productId, quantity) {
    try {
        // First remove the item
        await fetch(`${CART_API_BASE}remove_item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        // Then add it back with the new quantity
        const response = await fetch(`${CART_API_BASE}add_item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems(); // Reload cart items
            showNotification('Quantity updated', 'success');
        } else {
            showNotification(data.message || 'Failed to update quantity', 'error');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Error updating quantity', 'error');
    }
}

// Remove item from cart
async function removeItemFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }

    try {
        const response = await fetch(`${CART_API_BASE}remove_item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems(); // Reload cart items
            showNotification('Item removed from cart', 'success');
        } else {
            showNotification(data.message || 'Failed to remove item', 'error');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showNotification('Error removing item', 'error');
    }
}

// Clear entire cart
async function clearCart() {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
        return;
    }

    try {
        const response = await fetch(`${CART_API_BASE}clear_cart/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            }
        });

        const data = await response.json();
        if (data.success) {
            loadCartItems(); // Reload cart items
            showNotification('Cart cleared', 'success');
        } else {
            showNotification(data.message || 'Failed to clear cart', 'error');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showNotification('Error clearing cart', 'error');
    }
}

// Add item to cart (for use by other scripts)
async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch(`${CART_API_BASE}add_item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Item added to cart', 'success');
            updateCartCount();
            return true;
        } else {
            showNotification(data.message || 'Failed to add item to cart', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
        return false;
    }
}

// Get cart item count
async function getCartItemCount() {
    try {
        const response = await fetch(`${CART_API_BASE}get_items/`);
        if (!response.ok) {
            return 0;
        }
        const data = await response.json();
        return data.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
        console.error('Error getting cart count:', error);
        return 0;
    }
}

// Update cart count in UI
async function updateCartCount() {
    const count = await getCartItemCount();
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Export functions for global access
window.addToCart = addToCart;
window.getCartItemCount = getCartItemCount;
window.updateCartCount = updateCartCount;
window.showNotification = showNotification;
window.loadCartItems = loadCartItems;
window.displayCartItems = displayCartItems;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.updateQuantity = updateQuantity;
window.removeItemFromCart = removeItemFromCart;
window.clearCart = clearCart;

console.log('Cart functions exported to window:', {
    addToCart: typeof window.addToCart,
    getCartItemCount: typeof window.getCartItemCount,
    updateCartCount: typeof window.updateCartCount,
    showNotification: typeof window.showNotification
});
