// this is JS file for index.html

// DOM Elements
const productGrid = document.querySelector('.isotope-grid');

// Fetch individual product details for quick view
async function fetchProductDetail(productId) {
    try {
        console.log('Fetching product details for ID:', productId);
        console.log('API Base URL:', window.API_BASE_URL);
        
        const url = `${window.API_BASE_URL}/product/products/${productId}/`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Product data received:', product);
        return product;
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
}

// Generate star rating display
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<span style="color: #ffc107; font-size: 14px;">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<span style="color: #ffc107; font-size: 14px;">☆</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span style="color: #ddd; font-size: 14px;">☆</span>';
    }
    
    return stars;
}

// Show loading state in quick view modal
function showQuickViewLoading() {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        // Show the modal first
        modal.classList.add('show-modal1');
        
        // Update the content to show loading
        const nameElement = document.querySelector('.js-name-detail');
        const priceElement = document.querySelector('.js-price-detail');
        const descElement = document.querySelector('.js-description-detail');
        const ratingStarsElement = document.querySelector('.js-rating-stars');
        const ratingTextElement = document.querySelector('.js-rating-text');
        const galleryElement = document.querySelector('#quick-view-gallery');
        
        if (nameElement) nameElement.textContent = 'Loading...';
        if (priceElement) priceElement.innerHTML = '<span style="color: #999;">Loading price...</span>';
        if (descElement) descElement.textContent = 'Loading product details...';
        if (ratingStarsElement) ratingStarsElement.innerHTML = '';
        if (ratingTextElement) ratingTextElement.textContent = '';
        if (galleryElement) {
            galleryElement.innerHTML = `
                <div class="gallery-item">
                    <div class="wrap-pic-w pos-relative">
                        <div style="width: 100%; height: 300px; background: #f5f5f5; display: flex; align-items: center; justify-content: center;">
                            <div style="text-align: center;">
                                <div class="spinner-border" role="status" style="width: 3rem; height: 3rem; color: #e83e8c;">
                                    <span class="sr-only">Loading...</span>
                                </div>
                                <p style="margin-top: 15px; color: #666;">Loading product images...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Show error state in quick view modal
function showQuickViewError(message) {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        // Show the modal first
        modal.classList.add('show-modal1');
        
        // Update the content to show error
        const nameElement = document.querySelector('.js-name-detail');
        const priceElement = document.querySelector('.js-price-detail');
        const descElement = document.querySelector('.js-description-detail');
        const ratingStarsElement = document.querySelector('.js-rating-stars');
        const ratingTextElement = document.querySelector('.js-rating-text');
        const galleryElement = document.querySelector('#quick-view-gallery');
        
        if (nameElement) nameElement.textContent = 'Error Loading Product';
        if (priceElement) priceElement.innerHTML = '<span style="color: #dc3545;">Error</span>';
        if (descElement) descElement.textContent = message;
        if (ratingStarsElement) ratingStarsElement.innerHTML = '';
        if (ratingTextElement) ratingTextElement.textContent = '';
        if (galleryElement) {
            galleryElement.innerHTML = `
                <div class="gallery-item">
                    <div class="wrap-pic-w pos-relative">
                        <div style="width: 100%; height: 300px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; border: 2px dashed #dc3545;">
                            <div style="text-align: center; color: #dc3545;">
                                <i class="fa fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                                <p style="margin: 0;">Failed to load product images</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}


// Populate product gallery in quick view modal
function populateProductGallery(product) {
    const galleryContainer = document.querySelector('#quick-view-gallery');
    if (!galleryContainer) {
        console.warn('Gallery container not found');
        return;
    }
    
    // Handle case when no images are available
    if (!product.images || product.images.length === 0) {
        galleryContainer.innerHTML = `
            <div class="gallery-item">
                <div class="wrap-pic-w pos-relative">
                    <div style="width: 100%; height: 300px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border: 2px dashed #ddd;">
                        <div style="text-align: center; color: #999;">
                            <i class="fa fa-image" style="font-size: 3rem; margin-bottom: 15px;"></i>
                            <p style="margin: 0;">No images available</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Sort images by order
    const sortedImages = product.images.sort((a, b) => a.order - b.order);
    
    let galleryHTML = '';
    
    // Create gallery items for each image
    sortedImages.forEach((image, index) => {
        const imageUrl = `${window.API_BASE_URL}${image.image}`;
        
        galleryHTML += `
            <div class="gallery-item" data-thumb="${imageUrl}">
                <div class="wrap-pic-w pos-relative">
                    <img src="${imageUrl}" alt="${image.alt_text || product.name}" 
                         class="quick-view-main-image" 
                         style="width: 100%; height: auto; max-height: 400px; object-fit: contain;">
                    <a class="flex-c-m size-108 how-pos1 bor0 fs-16 cl10 bg0 hov-btn3 trans-04" 
                       href="${imageUrl}" data-lightbox="gallery">
                        <i class="fa fa-expand"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    galleryContainer.innerHTML = galleryHTML;
    
    // For quick view modal, we'll use a simple image display without Slick slider
    // to avoid the pagination issues. The images will be displayed in a clean layout.
    console.log('Gallery populated with', sortedImages.length, 'images');
    
    // Add click handlers for image switching if there are multiple images
    if (sortedImages.length > 1) {
        const images = galleryContainer.querySelectorAll('.quick-view-main-image');
        images.forEach((img, index) => {
            img.addEventListener('click', () => {
                // Simple image switching - show clicked image and hide others
                images.forEach((otherImg, otherIndex) => {
                    if (otherIndex === index) {
                        otherImg.style.display = 'block';
                        otherImg.parentElement.style.display = 'block';
                    } else {
                        otherImg.style.display = 'none';
                        otherImg.parentElement.style.display = 'none';
                    }
                });
            });
        });
        
        // Show only the first image initially
        images.forEach((img, index) => {
            if (index === 0) {
                img.style.display = 'block';
                img.parentElement.style.display = 'block';
            } else {
                img.style.display = 'none';
                img.parentElement.style.display = 'none';
            }
        });
    }
}

// Populate quick view modal with product data
function populateQuickViewModal(product) {
    if (!product) {
        console.error('No product data provided');
        return;
    }

    // Clear any existing badges first
    const existingSaleBadge = document.querySelector('.sale-badge');
    const existingNewBadge = document.querySelector('.new-badge');
    if (existingSaleBadge) existingSaleBadge.remove();
    if (existingNewBadge) existingNewBadge.remove();

    // Update product name
    const nameElement = document.querySelector('.js-name-detail');
    if (nameElement) {
        nameElement.textContent = product.name;
    }

    // Update product price
    const priceElement = document.querySelector('.js-price-detail');
    if (priceElement) {
        const discountedPrice = product.discounted_price || product.price;
        const originalPrice = product.is_on_sale ? product.price : null;
        
        if (originalPrice && product.is_on_sale) {
            priceElement.innerHTML = `
                <span style="text-decoration: line-through; color: #999; margin-right: 10px;">Rs ${originalPrice}</span>
                <span style="color: #e83e8c; font-weight: bold;">Rs ${discountedPrice}</span>
                <div style="font-size: 12px; color: #e83e8c; margin-top: 5px;">
                    Save Rs ${(parseFloat(originalPrice) - parseFloat(discountedPrice)).toFixed(2)} (${product.percentage_discount}% off)
                </div>
            `;
        } else {
            priceElement.innerHTML = `<span style="color: #333; font-weight: bold;">Rs ${discountedPrice}</span>`;
        }
    }

    // Update product description
    const descElement = document.querySelector('.js-description-detail');
    if (descElement) {
        descElement.textContent = product.description || 'No description available';
    }

    // Update rating display
    const ratingStarsElement = document.querySelector('.js-rating-stars');
    const ratingTextElement = document.querySelector('.js-rating-text');
    if (ratingStarsElement && ratingTextElement) {
        ratingStarsElement.innerHTML = generateStars(parseFloat(product.rating));
        ratingTextElement.textContent = `${product.rating} (${product.total_reviews} reviews)`;
    }

    // Update add to cart button with product ID
    const addToCartButton = document.querySelector('.js-addcart-detail');
    if (addToCartButton) {
        addToCartButton.setAttribute('data-product-id', product.id);
    }

    // Populate product gallery
    populateProductGallery(product);

    // Show sale badge if product is on sale
    if (product.is_on_sale) {
        const priceContainer = document.querySelector('.js-price-detail');
        if (priceContainer) {
            const saleBadge = document.createElement('div');
            saleBadge.className = 'sale-badge';
            saleBadge.style.cssText = 'background: #e83e8c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 5px;';
            saleBadge.textContent = 'SALE';
            priceContainer.appendChild(saleBadge);
        }
    }

    // Show new badge if product is new
    if (product.is_new) {
        const nameContainer = document.querySelector('.js-name-detail');
        if (nameContainer) {
            const newBadge = document.createElement('span');
            newBadge.className = 'new-badge';
            newBadge.style.cssText = 'background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-left: 10px;';
            newBadge.textContent = 'NEW';
            nameContainer.appendChild(newBadge);
        }
    }
}

// Show the quick view modal
function showQuickViewModal() {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        modal.classList.add('show-modal1');
    }
}

// Hide the quick view modal
function hideQuickViewModal() {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        modal.classList.remove('show-modal1');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Index.js loaded, checking cart functions...');
    console.log('addToCart available:', typeof addToCart);
    console.log('getCartItemCount available:', typeof getCartItemCount);
    console.log('showNotification available:', typeof showNotification);
    
    // Add event listeners for wishlist functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.js-addwish-b2')) {
            e.preventDefault();
            const productId = e.target.closest('.js-addwish-b2').dataset.productId;
            console.log('Add to wishlist:', productId);
            // Implement wishlist functionality here
        }
        
        if (e.target.closest('.js-show-modal1')) {
            e.preventDefault();
            const productId = e.target.closest('.js-show-modal1').dataset.productId;
            console.log('Quick view:', productId);
            
            // Show loading state in modal
            showQuickViewLoading();
            
            // Fetch product details and populate modal
            fetchProductDetail(productId)
                .then(product => {
                    if (product) {
                        populateQuickViewModal(product);
                        // Show the modal
                        showQuickViewModal();
                    } else {
                        showQuickViewError('Failed to load product details');
                    }
                })
                .catch(error => {
                    console.error('Error loading product details:', error);
                    showQuickViewError('Failed to load product details');
                });
        }
        
        // Handle add to cart from quick view modal
        if (e.target.closest('.js-addcart-detail')) {
            e.preventDefault();
            const button = e.target.closest('.js-addcart-detail');
            const productId = button.getAttribute('data-product-id');
            const quantity = document.querySelector('.num-product').value || 1;
            
            console.log('Add to cart from quick view:', productId, 'quantity:', quantity);
            
            if (typeof addToCart === 'function') {
                addToCart(productId, parseInt(quantity));
                // Close the modal after adding to cart
                hideQuickViewModal();
            } else {
                console.error('addToCart function not available');
                alert('Add to cart functionality not available');
            }
        }
        
        // Handle modal close buttons
        if (e.target.closest('.js-hide-modal1')) {
            e.preventDefault();
            hideQuickViewModal();
        }
        
        // Handle modal overlay click to close
        if (e.target.classList.contains('overlay-modal1')) {
            hideQuickViewModal();
        }
    });
});

// Export functions for global access
window.fetchProductDetail = fetchProductDetail;
window.populateQuickViewModal = populateQuickViewModal;
window.showQuickViewModal = showQuickViewModal;
window.hideQuickViewModal = hideQuickViewModal;