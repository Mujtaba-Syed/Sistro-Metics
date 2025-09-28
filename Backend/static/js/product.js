// Product.js - Simplified product functionality

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Update this to your actual backend URL

// Global variables
let allProducts = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Get products from the page (rendered by Django template)
    initializeProducts();
    setupEventListeners();
});

// Initialize products from the page
function initializeProducts() {
    const productElements = document.querySelectorAll('.js-name-b2');
    allProducts = Array.from(productElements).map(element => {
        const productId = element.closest('.block2').querySelector('[data-product-id]').getAttribute('data-product-id');
        const productName = element.textContent.trim();
        const priceElement = element.closest('.block2').querySelector('.stext-105');
        const price = priceElement ? priceElement.textContent.replace('Rs ', '').trim() : '0';
        const imageElement = element.closest('.block2').querySelector('img');
        const image = imageElement ? imageElement.src : '/static/images/product-01.jpg';
        
        return {
            id: parseInt(productId),
            name: productName,
            price: price,
            image: image
        };
    });
}

// Handle add to cart functionality
function handleAddToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found');
        return;
    }
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.is_on_sale ? product.discounted_price : product.price,
            image: product.images && product.images.length > 0 ? `${API_BASE_URL}${product.images[0].image}` : '/static/images/product-01.jpg',
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success message
    showSuccessMessage(`${product.name} added to cart!`);
    
    // Update cart count if cart counter exists
    updateCartCount();
}

// Handle quick view functionality
function handleQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found');
        return;
    }
    
    // You can implement quick view modal here
    // For now, redirect to product detail page
    window.location.href = `/product-detail/?id=${productId}`;
}

// Update cart count display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart counter if it exists
    const cartCounter = document.querySelector('.cart-count');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Quick view buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('js-show-modal1')) {
            e.preventDefault();
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            handleQuickView(productId);
        }
    });
    
    // Wishlist buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.js-addwish-b2')) {
            e.preventDefault();
            const productId = parseInt(e.target.closest('.js-addwish-b2').getAttribute('data-product-id'));
            handleAddToWishlist(productId);
        }
    });
}

// Handle add to wishlist
function handleAddToWishlist(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found');
        return;
    }
    
    // Get existing wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Check if product already exists in wishlist
    const existingItem = wishlist.find(item => item.id === productId);
    
    if (existingItem) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.id !== productId);
        showInfoMessage(`${product.name} removed from wishlist!`);
    } else {
        // Add to wishlist
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.is_on_sale ? product.discounted_price : product.price,
            image: product.images && product.images.length > 0 ? `${API_BASE_URL}${product.images[0].image}` : '/static/images/product-01.jpg'
        });
        showSuccessMessage(`${product.name} added to wishlist!`);
    }
    
    // Save wishlist to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Update wishlist button state
    updateWishlistButton(productId, !existingItem);
}

// Update wishlist button state
function updateWishlistButton(productId, isInWishlist) {
    const wishlistBtn = document.querySelector(`[data-product-id="${productId}"].js-addwish-b2`);
    if (wishlistBtn) {
        const heart1 = wishlistBtn.querySelector('.icon-heart1');
        const heart2 = wishlistBtn.querySelector('.icon-heart2');
        
        if (isInWishlist) {
            heart1.style.display = 'none';
            heart2.style.display = 'block';
        } else {
            heart1.style.display = 'block';
            heart2.style.display = 'none';
        }
    }
}


// Show success message
function showSuccessMessage(message) {
    showToast(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showToast(message, 'error');
}

// Show info message
function showInfoMessage(message) {
    showToast(message, 'info');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}
