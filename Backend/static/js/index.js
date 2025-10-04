// this is JS file for index.html

// API Configuration
window.API_BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const INDEX_API_BASE_URL = window.API_BASE_URL;

// DOM Elements (will be set after DOM loads)
let productGrid;
let dynamicProductsContainer;

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
        const imageUrl = `${window.API_BASE_URL.replace(/\/$/, '')}${image.image}`;
        
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

// Load all products
async function loadAllProducts() {
    showProductGridLoading();
    
    const data = await fetchAllProducts();
    if (data && data.results) {
        updateProductGrid(data.results, 'All Products');
    } else {
        showProductGridError('Failed to load products');
    }
}

// Load filtered products
async function loadFilteredProducts(filterType) {
    showProductGridLoading();
    
    const data = await fetchFilteredProducts(filterType);
    if (data && data.results) {
        updateProductGrid(data.results, data.filter_name);
    } else if (data && data.data) {
        updateProductGrid(data.data, data.filter_name);
    } else {
        showProductGridError('Failed to load filtered products');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    productGrid = document.querySelector('.isotope-grid');
    dynamicProductsContainer = document.getElementById('dynamic-products-container');
    
    console.log('Index.js loaded, checking cart functions...');
    console.log('addToCart available:', typeof addToCart);
    console.log('getCartItemCount available:', typeof getCartItemCount);
    console.log('showNotification available:', typeof showNotification);
    console.log('loadAllProducts available:', typeof loadAllProducts);
    console.log('loadFilteredProducts available:', typeof loadFilteredProducts);
    console.log('API_BASE_URL:', INDEX_API_BASE_URL);
    
    // Debug: Check if containers are found
    console.log('Product grid found:', !!productGrid);
    console.log('Dynamic products container found:', !!dynamicProductsContainer);
    
    // Don't load all products on page load - static products are already there
    // Only load when filter buttons are clicked
    console.log('Page loaded - static products are already displayed');
    
    // Add event listeners for filter buttons
    document.addEventListener('click', function(e) {
        // Handle filter button clicks
        if (e.target.closest('.filter-tope-group button')) {
            e.preventDefault();
            const button = e.target.closest('.filter-tope-group button');
            const filterText = button.textContent.trim();
            
            console.log('Filter button clicked:', filterText);
            console.log('Button element:', button);
            
            // Map filter text to API filter types
            const filterMap = {
                'All Products': null,
                'Discounted Products': 'discounted',
                'Featured Products': 'featured',
                'New Products': 'new',
                'Best Selling Products': 'best_selling'
            };
            
            const filterType = filterMap[filterText];
            console.log('Mapped filter type:', filterType);
            
            if (filterType === null) {
                // Load all products - clear dynamic container since static products are already there
                console.log('All Products clicked - clearing dynamic container');
                if (dynamicProductsContainer) {
                    dynamicProductsContainer.innerHTML = '';
                }
                updateFilterButtonStates('All Products');
            } else {
                // Load filtered products
                console.log('Loading filtered products for type:', filterType);
                loadFilteredProducts(filterType);
            }
        }
    });
    
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

// Fetch filtered products from API
async function fetchFilteredProducts(filterType) {
    try {
        console.log('Fetching filtered products for type:', filterType);
        
        const url = `${INDEX_API_BASE_URL}/product/filter/?type=${filterType}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Filtered products data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        return null;
    }
}

// Fetch all products from API
async function fetchAllProducts() {
    try {
        console.log('Fetching all products');
        
        const url = `${INDEX_API_BASE_URL}/product/products/`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('All products data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching all products:', error);
        return null;
    }
}

// Show loading state in product grid
function showProductGridLoading() {
    if (dynamicProductsContainer) {
        dynamicProductsContainer.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 50px;">
                <div class="spinner-border" role="status" style="width: 3rem; height: 3rem; color: #e83e8c;">
                    <span class="sr-only">Loading...</span>
                </div>
                <p style="margin-top: 15px; color: #666;">Loading products...</p>
            </div>
        `;
    }
}

// Show error state in product grid
function showProductGridError(message) {
    if (dynamicProductsContainer) {
        dynamicProductsContainer.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 50px;">
                <div style="color: #dc3545;">
                    <i class="fa fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p style="margin: 0;">${message}</p>
                    <button class="btn btn-primary mt-3" onclick="loadAllProducts()">Try Again</button>
                </div>
            </div>
        `;
    }
}

// Generate product card HTML
function generateProductCard(product) {
    const productImage = product.images && product.images.length > 0 
        ? `${INDEX_API_BASE_URL.replace(/\/$/, '')}${product.images[0].image}` 
        : '/static/images/product-01.jpg';
    
    const discountedPrice = product.discounted_price || product.price;
    const originalPrice = product.is_on_sale ? product.price : null;
    
    let priceHTML = '';
    if (originalPrice && product.is_on_sale) {
        priceHTML = `
            <span class="stext-105 cl3" style="text-decoration: line-through; color: #999; margin-right: 10px;">
                Rs ${originalPrice}
            </span>
            <span class="stext-105 cl3" style="color: #e83e8c; font-weight: bold;">
                Rs ${discountedPrice}
            </span>
        `;
    } else {
        priceHTML = `<span class="stext-105 cl3" style="color: #333; font-weight: bold;">Rs ${discountedPrice}</span>`;
    }
    
    let badgesHTML = '';
    if (product.is_on_sale) {
        badgesHTML += `<span class="block2-label-sale" style="position: absolute; top: 10px; left: 10px; z-index: 100; background: #e83e8c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">-${product.percentage_discount}%</span>`;
    }
    if (product.is_new) {
        badgesHTML += `<span class="block2-label-new" style="position: absolute; top: 10px; right: 10px; z-index: 100; background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">New</span>`;
    }
    if (product.is_featured) {
        badgesHTML += `<span class="block2-label-featured" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 100; background: #ffc107; color: black; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Featured</span>`;
    }
    
    return `
        <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${getProductClass(product)}">
            <div class="block2" style="border: 2px solid #e83e8c; border-radius: 8px; padding: 8px; overflow: visible; display: flex; flex-direction: column; min-height: 480px; height: auto;">
                <div class="block2-pic hov-img0" style="overflow: hidden; position: relative; cursor: zoom-in; flex-shrink: 0; height: 200px;">
                    <img src="${productImage}" alt="${product.name}" onerror="this.src='/static/images/product-01.jpg'" style="transition: transform 0.3s ease; width: 100%; height: 100%; object-fit: cover; transform-origin: center;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                    ${badgesHTML}
                    <a href="#" class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04 js-show-modal1" data-product-id="${product.id}">
                        Quick View
                    </a>
                </div>
                <div class="block2-txt flex-w flex-t p-t-14" style="flex-grow: 1; min-height: 160px;">
                    <div class="block2-txt-child1 flex-col-l">
                        <a href="product-detail.html?id=${product.id}" class="stext-104 cl5 hov-cl1 trans-04 js-name-b2 p-b-6" data-name="${product.name}">
                            ${product.name}
                        </a>
                        <span class="stext-105 cl3">
                            ${priceHTML}
                        </span>
                        <div class="stext-105 cl3" style="margin-top: 5px;">
                            ${generateStars(parseFloat(product.rating))}
                            <span style="font-size: 12px; color: #666; margin-left: 5px;">
                                ${product.rating} (${product.total_reviews})
                            </span>
                        </div>
                    </div>
                    <div class="block2-txt-child2 flex-r p-t-3">
                        <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-product-id="${product.id}">
                            <img class="icon-heart1 dis-block trans-04" src="/static/images/icons/icon-heart-01.png" alt="ICON">
                            <img class="icon-heart2 dis-block trans-04 ab-t-l" src="/static/images/icons/icon-heart-02.png" alt="ICON">
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get CSS class for product based on its properties
function getProductClass(product) {
    let classes = [];
    
    if (product.is_on_sale) classes.push('women'); // Discounted products
    if (product.is_featured) classes.push('men'); // Featured products
    if (product.is_new) classes.push('bag'); // New products
    if (product.rating == 5) classes.push('shoes'); // Best selling products
    
    return classes.join(' ');
}

// Update product grid with filtered products
function updateProductGrid(products, filterName = 'All Products') {
    console.log('updateProductGrid called with:', products?.length, 'products, filter:', filterName);
    console.log('dynamicProductsContainer:', dynamicProductsContainer);
    
    if (!dynamicProductsContainer) {
        console.error('Dynamic products container not found');
        return;
    }
    
    if (!products || products.length === 0) {
        dynamicProductsContainer.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 50px;">
                <div style="color: #666;">
                    <i class="fa fa-search" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p style="margin: 0;">No products found for "${filterName}"</p>
                </div>
            </div>
        `;
        return;
    }
    
    let gridHTML = '';
    products.forEach(product => {
        gridHTML += generateProductCard(product);
    });
    
    dynamicProductsContainer.innerHTML = gridHTML;
    
    // Update filter button states
    updateFilterButtonStates(filterName);
    
    console.log(`Updated product grid with ${products.length} products for "${filterName}"`);
}

// Update filter button active states
function updateFilterButtonStates(activeFilter) {
    const filterButtons = document.querySelectorAll('.filter-tope-group button');
    
    filterButtons.forEach(button => {
        button.classList.remove('how-active1');
        
        const buttonText = button.textContent.trim();
        if (buttonText === activeFilter || (activeFilter === 'All Products' && buttonText === 'All Products')) {
            button.classList.add('how-active1');
        }
    });
}


// Test function to verify container is working
function testDynamicContainer() {
    console.log('Testing dynamic container...');
    console.log('dynamicProductsContainer:', dynamicProductsContainer);
    
    if (dynamicProductsContainer) {
        dynamicProductsContainer.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 20px; background: #f0f0f0; border: 2px solid #e83e8c;">
                <h3 style="color: #e83e8c;">Test: Dynamic Container is Working!</h3>
                <p>This message was added by JavaScript to the dynamic container.</p>
            </div>
        `;
        console.log('Test content added to dynamic container');
    } else {
        console.error('Dynamic container not found!');
    }
}

// Export test function for console access
window.testDynamicContainer = testDynamicContainer;