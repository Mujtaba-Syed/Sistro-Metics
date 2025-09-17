// this is JS file for index.html

// DOM Elements
const productGrid = document.querySelector('.isotope-grid');

// Fetch individual product details for quick view
async function fetchProductDetail(productId) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/product/products/${productId}/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
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
        modal.innerHTML = `
            <div class="wrap-modal1">
                <div class="overlay-modal1"></div>
                <div class="modal1-content">
                    <div class="close-modal1 js-hide-modal1">
                        <img src="${window.API_BASE_URL}/static/images/icons/icon-close.png" alt="CLOSE">
                    </div>
                    <div class="wrap-pic-w p-lr-38 p-t-27 p-b-34">
                        <div class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                            <p class="stext-105 cl3 p-t-10">Loading product details...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Show error state in quick view modal
function showQuickViewError(message) {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        modal.innerHTML = `
            <div class="wrap-modal1">
                <div class="overlay-modal1"></div>
                <div class="modal1-content">
                    <div class="close-modal1 js-hide-modal1">
                        <img src="${window.API_BASE_URL}/static/images/icons/icon-close.png" alt="CLOSE">
                    </div>
                    <div class="wrap-pic-w p-lr-38 p-t-27 p-b-34">
                        <div class="text-center">
                            <h3 class="stext-104 cl2">Error</h3>
                            <p class="stext-105 cl3">${message}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Restore original modal structure
function restoreModalStructure() {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        modal.innerHTML = `
            <div class="wrap-modal1">
                <div class="overlay-modal1"></div>
                <div class="modal1-content">
                    <div class="close-modal1 js-hide-modal1">
                        <img src="${window.API_BASE_URL}/static/images/icons/icon-close.png" alt="CLOSE">
                    </div>
                    <div class="wrap-pic-w p-lr-38 p-t-27 p-b-34">
                        <div class="col-sm-6 col-md-7 col-lg-8 p-b-30">
                            <div class="wrap-pic-w">
                                <div class="product-gallery">
                                    <!-- Product images will be populated here -->
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-6 col-md-5 col-lg-4 p-b-30">
                            <div class="p-r-50 p-t-5 p-lr-0-lg">
                                <h4 class="mtext-105 cl2 js-name-detail">
                                    Product Name
                                </h4>
                                <span class="mtext-106 cl2">
                                    Rs 0.00
                                </span>
                                <p class="stext-102 cl3 p-t-23">
                                    Product description will be loaded here.
                                </p>
                                <div class="p-t-33">
                                    <div class="flex-w flex-r-m p-b-10">
                                        <div class="size-203 flex-c-m respon6">
                                            Size
                                        </div>
                                        <div class="size-204 respon6-next">
                                            <div class="rs1-select2 bor8 bg0">
                                                <select class="js-select2" name="time">
                                                    <option>Choose an option</option>
                                                    <option>Size S</option>
                                                    <option>Size M</option>
                                                    <option>Size L</option>
                                                    <option>Size XL</option>
                                                </select>
                                                <div class="dropDownSelect2"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex-w flex-r-m p-b-10">
                                        <div class="size-203 flex-c-m respon6">
                                            Color
                                        </div>
                                        <div class="size-204 respon6-next">
                                            <div class="rs1-select2 bor8 bg0">
                                                <select class="js-select2" name="time">
                                                    <option>Choose an option</option>
                                                    <option>Red</option>
                                                    <option>Green</option>
                                                    <option>Blue</option>
                                                </select>
                                                <div class="dropDownSelect2"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex-w flex-r-m p-b-10">
                                        <div class="size-203 flex-c-m respon6">
                                            Quantity
                                        </div>
                                        <div class="size-204 respon6-next">
                                            <div class="wrap-num-product flex-w m-r-20 m-tb-10">
                                                <div class="btn-num-product-down cl8 hov-btn3 trans-04 flex-c-m">
                                                    <i class="fs-16 zmdi zmdi-minus"></i>
                                                </div>
                                                <input class="mtext-104 cl3 txt-center num-product" type="number" name="num-product" value="1">
                                                <div class="btn-num-product-up cl8 hov-btn3 trans-04 flex-c-m">
                                                    <i class="fs-16 zmdi zmdi-plus"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex-w flex-m p-l-100 p-t-40 p-lr-15-sm">
                                        <div class="flex-c-m stext-101 cl2 size-104 bg0 bor2 hov-btn1 p-lr-15 trans-04 js-addcart-detail">
                                            Add to cart
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Populate product gallery in quick view modal
function populateProductGallery(product) {
    const galleryContainer = document.querySelector('.product-gallery');
    if (!galleryContainer || !product.images || product.images.length === 0) {
        return;
    }

    // Sort images by order
    const sortedImages = product.images.sort((a, b) => a.order - b.order);
    
    let galleryHTML = '';
    
    // Main image
    if (sortedImages[0]) {
        const mainImageUrl = `${window.API_BASE_URL}${sortedImages[0].image}`;
        galleryHTML += `
            <div class="main-image">
                <img src="${mainImageUrl}" alt="${product.name}" style="width: 100%; height: auto;">
            </div>
        `;
    }
    
    // Thumbnail images
    if (sortedImages.length > 1) {
        galleryHTML += '<div class="thumbnails" style="display: flex; gap: 10px; margin-top: 10px;">';
        sortedImages.forEach((image, index) => {
            const thumbUrl = `${window.API_BASE_URL}${image.image}`;
            galleryHTML += `
                <img src="${thumbUrl}" alt="${product.name}" 
                     style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border: 2px solid transparent;"
                     onmouseover="this.style.borderColor='#e83e8c'"
                     onmouseout="this.style.borderColor='transparent'"
                     onclick="document.querySelector('.main-image img').src='${thumbUrl}'">
            `;
        });
        galleryHTML += '</div>';
    }
    
    galleryContainer.innerHTML = galleryHTML;
}

// Populate quick view modal with product data
function populateQuickViewModal(product) {
    if (!product) {
        console.error('No product data provided');
        return;
    }

    // First, restore the original modal structure
    restoreModalStructure();

    // Update product name
    const nameElement = document.querySelector('.js-name-detail');
    if (nameElement) {
        nameElement.textContent = product.name;
    }

    // Update product price
    const priceElement = document.querySelector('.mtext-106.cl2');
    if (priceElement) {
        const discountedPrice = product.discounted_price || product.price;
        const originalPrice = product.is_on_sale ? product.price : null;
        
        if (originalPrice) {
            priceElement.innerHTML = `
                <span style="text-decoration: line-through; color: #999; margin-right: 10px;">Rs ${originalPrice}</span>
                <span style="color: #e83e8c; font-weight: bold;">Rs ${discountedPrice}</span>
                <div style="font-size: 12px; color: #e83e8c; margin-top: 5px;">
                    Save Rs ${(parseFloat(originalPrice) - parseFloat(discountedPrice)).toFixed(2)}
                </div>
            `;
        } else {
            priceElement.textContent = `Rs ${discountedPrice}`;
        }
    }

    // Update product description
    const descElement = document.querySelector('.stext-102.cl3.p-t-23');
    if (descElement) {
        descElement.textContent = product.description || 'No description available';
    }

    // Populate product gallery
    populateProductGallery(product);

    // Add rating display
    const ratingContainer = document.querySelector('.p-r-50.p-t-5.p-lr-0-lg');
    if (ratingContainer) {
        // Check if rating already exists, if not add it
        let ratingElement = ratingContainer.querySelector('.rating-section');
        if (!ratingElement) {
            ratingElement = document.createElement('div');
            ratingElement.className = 'rating-section';
            ratingElement.style.cssText = 'margin: 15px 0; display: flex; align-items: center; gap: 10px;';
            
            // Insert after price element
            const priceElement = ratingContainer.querySelector('.mtext-106.cl2');
            if (priceElement && priceElement.parentNode) {
                priceElement.parentNode.insertBefore(ratingElement, priceElement.nextSibling);
            }
        }
        
        ratingElement.innerHTML = `
            <div class="stars" style="display: flex; gap: 2px;">
                ${generateStars(product.rating)}
            </div>
            <span class="rating-text" style="font-size: 14px; color: #666; font-weight: 500;">
                ${product.rating} (${product.total_reviews} reviews)
            </span>
        `;
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
window.restoreModalStructure = restoreModalStructure;