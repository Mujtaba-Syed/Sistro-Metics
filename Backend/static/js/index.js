// this is JS file for index.html

// API Configuration - Get from Django template
const API_BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const PRODUCTS_API = `${API_BASE_URL}/product/products/`;

// DOM Elements
const productGrid = document.querySelector('.isotope-grid');

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch(PRODUCTS_API);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Fetch individual product details for quick view
async function fetchProductDetail(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/product/products/${productId}/`);
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

// Create product card HTML
function createProductCard(product) {
    const discountedPrice = product.discounted_price || product.price;
    const originalPrice = product.is_on_sale ? product.price : null;
    const discountPercentage = product.is_on_sale ? Math.round(product.percentage_discount) : 0;
    
    // Get the primary image (order: 1) or first available image
    const primaryImage = product.images && product.images.length > 0 
        ? product.images.find(img => img.order === 1) || product.images[0]
        : null;
    const imageUrl = primaryImage ? `${API_BASE_URL}${primaryImage.image}` : `${API_BASE_URL}/static/images/product-01.jpg`;
    
    // Map categories to CSS classes for filtering
    const categoryClass = getCategoryClass(product.category.name);
    
    return `
        <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${categoryClass}">
            <!-- Block2 -->
            <div class="block2" style="border: 2px solid #e83e8c; border-radius: 8px; padding: 8px; overflow: visible; display: flex; flex-direction: column; min-height: 400px; height: auto;">
                <div class="block2-pic hov-img0" style="overflow: hidden; position: relative; cursor: zoom-in; flex-shrink: 0; height: 200px;">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='${API_BASE_URL}/static/images/product-01.jpg'" style="transition: transform 0.3s ease; width: 100%; height: 100%; object-fit: cover; transform-origin: center;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                    ${product.is_on_sale ? `<span class="block2-label-sale" style="position: absolute; top: 10px; left: 10px; z-index: 100; background: #e83e8c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">-${discountPercentage}%</span>` : ''}
                    ${product.is_new ? '<span class="block2-label-new" style="position: absolute; top: 10px; right: 10px; z-index: 100; background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">New</span>' : ''}
                    ${product.is_featured ? '<span class="block2-label-featured" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 100; background: #ffc107; color: black; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Featured</span>' : ''}

                </div>

                <div class="block2-txt flex-w flex-t p-t-14" style="flex-grow: 1;">
                    <div class="block2-txt-child1 flex-col-l">
                        <a href="product-detail.html?id=${product.id}" class="stext-104 cl5 hov-cl1 trans-04 js-name-b2 p-b-6">
                            ${product.name}
                        </a>

                        <div class="stext-105 cl3">
                            ${originalPrice ? 
                                `<span class="stext-106 cl4" style="text-decoration: line-through;">Rs ${originalPrice}</span>
                                 <span class="stext-105 cl3 font-weight-bold font-size-16">Rs ${discountedPrice}</span>
                                 <div class="stext-107 cl6" style="font-size: 12px; color: #e83e8c; font-weight: bold; margin-top: 2px;">
                                     Save Rs ${(parseFloat(originalPrice) - parseFloat(discountedPrice)).toFixed(2)}
                                 </div>` : 
                                `<span class="stext-105 cl3 font-weight-bold font-size-16">Rs ${discountedPrice}</span>`
                            }
                        </div>
                        
                        <div class="rating-section" style="margin-top: 8px; display: flex; align-items: center; gap: 5px;">
                            <div class="stars" style="display: flex; gap: 1px;">
                                ${generateStars(product.rating)}
                            </div>
                            <span class="rating-text" style="font-size: 14px; color: #666; font-weight: 500;">
                                ${product.rating} (${product.total_reviews} reviews)
                            </span>
                        </div>
                    </div>

                    <div class="block2-txt-child2 flex-r p-t-3">
                        <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-product-id="${product.id}">
                            <img class="icon-heart1 dis-block trans-04" src="${API_BASE_URL}/static/images/icons/icon-heart-01.png" alt="ICON">
                            <img class="icon-heart2 dis-block trans-04 ab-t-l" src="${API_BASE_URL}/static/images/icons/icon-heart-02.png" alt="ICON">
                        </a>
                    </div>
                </div>
                
                <div class="block2-btn-container" style="text-align: center; margin-top: auto; padding-top: 10px;">
                    <a href="#" class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 js-show-modal1" data-product-id="${product.id}" style="background-color: #e83e8c; color: white; border: none; border-radius: 25px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 24px; font-size: 12px; position:relative; top: 0px">
                        Quick View
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Map product categories to CSS classes for filtering
function getCategoryClass(categoryName) {
    const categoryMap = {
        // Makeup categories
        'Blush': 'women',
        'Foundation': 'women', 
        'Lipstick': 'women',
        'Eyeshadow': 'women',
        'Mascara': 'women',
        'Eyeliner': 'women',
        'Concealer': 'women',
        'Powder': 'women',
        'Makeup': 'women',
        
        // Skincare categories
        'Skincare': 'men',
        'Moisturizer': 'men',
        'Cleanser': 'men',
        'Serum': 'men',
        'Toner': 'men',
        'Sunscreen': 'men',
        
        // Fragrance categories
        'Fragrance': 'bag',
        'Perfume': 'bag',
        'Cologne': 'bag',
        
        // Tools categories
        'Tools': 'shoes',
        'Brushes': 'shoes',
        'Sponges': 'shoes',
        'Mirrors': 'shoes',
        
        // Accessories categories
        'Accessories': 'watches',
        'Bags': 'watches',
        'Cases': 'watches'
    };
    return categoryMap[categoryName] || 'women';
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

    // Update add to cart button with product ID
    const addToCartBtn = document.querySelector('.js-addcart-detail');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-product-id', product.id);
    }

    // Update wishlist button with product ID
    const wishlistBtn = document.querySelector('.js-addwish-detail');
    if (wishlistBtn) {
        wishlistBtn.setAttribute('data-product-id', product.id);
    }

    // Reinitialize any sliders or modals if needed
    if (typeof window.initSlick3 === 'function') {
        window.initSlick3();
    }
}

// Populate product gallery with all images
function populateProductGallery(product) {
    console.log('populateProductGallery called with product:', product);
    const thumbnailList = document.querySelector('.thumbnail-list');
    const mainImage = document.getElementById('main-product-image');
    
    console.log('Elements found:', { thumbnailList: !!thumbnailList, mainImage: !!mainImage });
    
    if (!thumbnailList || !mainImage) return;

    // Clear existing thumbnails
    thumbnailList.innerHTML = '';

    if (product.images && product.images.length > 0) {
        // Sort images by order
        const sortedImages = product.images.sort((a, b) => a.order - b.order);
        
        // Create thumbnails
        sortedImages.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail-item';
            thumbnail.style.cssText = `
                width: 70px;
                height: 70px;
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                position: relative;
            `;
            
            thumbnail.innerHTML = `
                <img src="${API_BASE_URL}${image.image}" 
                     alt="${image.alt_text || product.name}" 
                     style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                     onmouseover="this.style.transform='scale(1.1)'" 
                     onmouseout="this.style.transform='scale(1)'"
                     data-zoom-image="${API_BASE_URL}${image.image}">
            `;
            
            // Add click event to switch main image
            thumbnail.addEventListener('click', () => {
                // Remove active class from all thumbnails
                document.querySelectorAll('.thumbnail-item').forEach(t => {
                    t.style.borderColor = 'transparent';
                });
                
                // Add active class to clicked thumbnail
                thumbnail.style.borderColor = '#e83e8c';
                
                // Update main image
                mainImage.src = `${API_BASE_URL}${image.image}`;
                mainImage.alt = image.alt_text || product.name;
                mainImage.setAttribute('data-zoom-image', `${API_BASE_URL}${image.image}`);
                
                // Reinitialize Elevate Zoom with new image
                if (typeof $.fn.elevateZoom !== 'undefined') {
                    if (mainImage.data('elevateZoom')) {
                        mainImage.data('elevateZoom').destroy();
                    }
                    
                    $(mainImage).elevateZoom({
                        zoomType: "lens",
                        lensShape: "round",
                        lensSize: 200,
                        zoomWindowPosition: 1,
                        zoomWindowWidth: 400,
                        zoomWindowHeight: 400,
                        borderSize: 2,
                        borderColour: "#e83e8c",
                        cursor: "crosshair",
                        tint: true,
                        tintColour: "#e83e8c",
                        tintOpacity: 0.1,
                        zoomLevel: 2,
                        scrollZoom: true,
                        easing: true
                    });
                }
            });
            
            // Set first image (order 1) as active by default
            if (index === 0) {
                thumbnail.style.borderColor = '#e83e8c';
                mainImage.src = `${API_BASE_URL}${image.image}`;
                mainImage.alt = image.alt_text || product.name;
                mainImage.setAttribute('data-zoom-image', `${API_BASE_URL}${image.image}`);
            }
            
            thumbnailList.appendChild(thumbnail);
        });
    } else {
        // No images available, show placeholder
        mainImage.src = `${API_BASE_URL}/static/images/product-01.jpg`;
        mainImage.alt = product.name;
    }

    // Create custom magnifying glass effect
    console.log('Setting up magnifying glass...');
    setTimeout(() => {
        const mainImage = document.getElementById('main-product-image');
        console.log('Main image found:', !!mainImage);
        
        if (mainImage) {
            console.log('Creating magnifying glass elements...');
            // Create magnifying glass elements
            const magnifier = document.createElement('div');
            magnifier.id = 'magnifier';
            magnifier.style.cssText = `
                position: absolute;
                width: 150px;
                height: 150px;
                border: 3px solid #e83e8c;
                border-radius: 50%;
                background: rgba(232, 62, 140, 0.1);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
                display: none;
            `;
            
            const zoomWindow = document.createElement('div');
            zoomWindow.id = 'zoom-window';
            zoomWindow.style.cssText = `
                position: absolute;
                width: 300px;
                height: 300px;
                border: 3px solid #e83e8c;
                border-radius: 8px;
                background: white;
                overflow: hidden;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10000;
                display: none;
                right: -320px;
                top: 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            
            const zoomImage = document.createElement('img');
            zoomImage.id = 'zoom-image';
            zoomImage.src = mainImage.src;
            zoomImage.style.cssText = `
                width: 1200px;
                height: 1200px;
                object-fit: cover;
                transform-origin: top left;
                position: absolute;
            `;
            
            zoomWindow.appendChild(zoomImage);
            
            // Add elements to the image wrapper
            const imageWrapper = mainImage.parentElement;
            imageWrapper.style.position = 'relative';
            imageWrapper.style.overflow = 'visible'; // Allow magnifier to be visible outside bounds
            imageWrapper.appendChild(magnifier);
            imageWrapper.appendChild(zoomWindow);
            
            // Test: Make magnifier visible for debugging
            console.log('Magnifier elements created and added to DOM');
            console.log('Image wrapper:', imageWrapper);
            console.log('Magnifier element:', magnifier);
            console.log('Zoom window element:', zoomWindow);
            
            // Set initial magnifier styles
            magnifier.style.display = 'none';
            magnifier.style.opacity = '0';
            magnifier.style.backgroundColor = 'rgba(232, 62, 140, 0.3)';
            magnifier.style.border = '3px solid #e83e8c';
            magnifier.style.zIndex = '9999';
            magnifier.style.boxShadow = '0 0 15px rgba(232, 62, 140, 0.5)';
            magnifier.style.position = 'absolute';
            
            // Set initial zoom window styles
            zoomWindow.style.display = 'none';
            zoomWindow.style.opacity = '0';
            
            // Create a simple mousemove handler
            function handleMouseMove(e) {
                // Get the image wrapper position instead of the image
                const rect = imageWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Position magnifier
                const magnifierSize = 150;
                const magnifierX = x - magnifierSize / 2;
                const magnifierY = y - magnifierSize / 2;
                
                // Keep magnifier within bounds
                const maxX = rect.width - magnifierSize;
                const maxY = rect.height - magnifierSize;
                
                const finalX = Math.max(0, Math.min(magnifierX, maxX));
                const finalY = Math.max(0, Math.min(magnifierY, maxY));
                
                // Update position using direct style assignment
                magnifier.style.left = finalX + 'px';
                magnifier.style.top = finalY + 'px';
                
                // Reset transform to ensure it doesn't override left/top
                magnifier.style.transform = 'none';
                
                // Force a reflow
                magnifier.offsetHeight;
                
                // Update the zoom window to show the magnified portion
                if (zoomWindow && zoomImage) {
                    // Calculate the zoom level (2x magnification)
                    const zoomLevel = 2;
                    
                    // Calculate the zoom image position to center the magnified area
                    // We need to move the zoom image so that the area under the magnifier is centered in the zoom window
                    const zoomWindowSize = 300; // 300px zoom window
                    const magnifierSize = 150; // 150px magnifier
                    
                    // Calculate the center point of the magnifier relative to the main image
                    const magnifierCenterX = finalX + (magnifierSize / 2);
                    const magnifierCenterY = finalY + (magnifierSize / 2);
                    
                    // Calculate the zoom image position to center this point in the zoom window
                    const zoomX = (zoomWindowSize / 2) - (magnifierCenterX * zoomLevel);
                    const zoomY = (zoomWindowSize / 2) - (magnifierCenterY * zoomLevel);
                    
                    zoomImage.style.left = zoomX + 'px';
                    zoomImage.style.top = zoomY + 'px';
                    
                    // Position the zoom window next to the magnifier
                    const zoomWindowX = finalX + 200; // Offset to the right
                    const zoomWindowY = finalY;
                    
                    zoomWindow.style.left = zoomWindowX + 'px';
                    zoomWindow.style.top = zoomWindowY + 'px';
                    zoomWindow.style.display = 'block';
                    zoomWindow.style.opacity = '1';
                }
            }
            
            // Add event listeners
            imageWrapper.addEventListener('mouseenter', (e) => {
                magnifier.style.display = 'block';
                magnifier.style.opacity = '1';
            });
            
            imageWrapper.addEventListener('mouseleave', (e) => {
                magnifier.style.opacity = '0';
                if (zoomWindow) {
                    zoomWindow.style.opacity = '0';
                    setTimeout(() => {
                        zoomWindow.style.display = 'none';
                    }, 300);
                }
                setTimeout(() => {
                    magnifier.style.display = 'none';
                }, 300);
            });
            
            // Add mousemove listener to the image wrapper
            imageWrapper.addEventListener('mousemove', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMouseMove(e);
            });
            
            
        }
    }, 300);
}

// Restore the original modal structure
function restoreModalStructure() {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        const contentContainer = modal.querySelector('.bg0.p-t-60.p-b-30.p-lr-15-lg');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <button class="how-pos3 hov3 trans-04 js-hide-modal1">
                    <img src="${API_BASE_URL}/static/images/icons/icon-close.png" alt="CLOSE">
                </button>

                <div class="row">
                    <div class="col-md-6 col-lg-7 p-b-30">
                        <div class="p-l-25 p-r-30 p-lr-0-lg">
                            <div class="product-gallery-container" style="display: flex; gap: 15px;">
                                <!-- Thumbnail Gallery -->
                                <div class="thumbnail-gallery" style="width: 80px; flex-shrink: 0;">
                                    <div class="thumbnail-list" style="display: flex; flex-direction: column; gap: 8px;">
                                        <!-- Thumbnails will be populated here -->
                                    </div>
                                </div>
                                
                                <!-- Main Image Display -->
                                <div class="main-image-container" style="flex: 1; position: relative;">
                                    <div class="main-image-wrapper" style="position: relative; overflow: hidden; border-radius: 8px;">
                                        <img id="main-product-image" src="" alt="Product Image" style="width: 100%; height: 400px; object-fit: cover; cursor: zoom-in;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 col-lg-5 p-b-30">
                        <div class="p-r-50 p-t-5 p-lr-0-lg">
                            <h4 class="mtext-105 cl2 js-name-detail p-b-14">
                                Loading...
                            </h4>

                            <span class="mtext-106 cl2">
                                Loading...
                            </span>

                            <p class="stext-102 cl3 p-t-23">
                                Loading...
                            </p>
                            
                            <div class="p-t-33">
                             
                               

                                <div class="flex-w flex-r-m p-b-10">
                                    <div class="size-204 flex-w flex-m respon6-next">
                                        <div class="wrap-num-product flex-w m-r-20 m-tb-10">
                                            <div class="btn-num-product-down cl8 hov-btn3 trans-04 flex-c-m">
                                                <i class="fs-16 zmdi zmdi-minus"></i>
                                            </div>

                                            <input class="mtext-104 cl3 txt-center num-product" type="number" name="num-product" value="1">

                                            <div class="btn-num-product-up cl8 hov-btn3 trans-04 flex-c-m">
                                                <i class="fs-16 zmdi zmdi-plus"></i>
                                            </div>
                                        </div>

                                        <button class="flex-c-m stext-101 cl0 size-101 bg1 bor1 hov-btn1 p-lr-15 trans-04 js-addcart-detail">
                                            Add to cart
                                        </button>
                                    </div>
                                </div>	
                            </div>

                            <div class="flex-w flex-m p-l-100 p-t-40 respon7">
                                <div class="flex-m bor9 p-r-10 m-r-11">
                                    <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 js-addwish-detail tooltip100" data-tooltip="Add to Wishlist">
                                        <i class="zmdi zmdi-favorite"></i>
                                    </a>
                                </div>

                                <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 m-r-8 tooltip100" data-tooltip="Facebook">
                                    <i class="fa fa-facebook"></i>
                                </a>

                                <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 m-r-8 tooltip100" data-tooltip="Twitter">
                                    <i class="fa fa-twitter"></i>
                                </a>

                                <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 m-r-8 tooltip100" data-tooltip="Google Plus">
                                    <i class="fa fa-google-plus"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Show loading state in quick view modal
function showQuickViewLoading() {
    const modal = document.querySelector('.js-modal1');
    if (modal) {
        // Show modal
        modal.classList.add('show-modal1');
        
        // Show loading content
        const contentContainer = modal.querySelector('.bg0.p-t-60.p-b-30.p-lr-15-lg');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="row justify-content-center">
                    <div class="col-12 text-center p-t-50">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p class="stext-105 cl3 p-t-20">Loading product details...</p>
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
        const contentContainer = modal.querySelector('.bg0.p-t-60.p-b-30.p-lr-15-lg');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="row justify-content-center">
                    <div class="col-12 text-center p-t-50">
                        <div class="alert alert-danger" role="alert">
                            <i class="fa fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
                            <h4 class="stext-104 cl2">Oops!</h4>
                            <p class="stext-105 cl3">${message}</p>
                            <button class="btn btn-primary js-hide-modal1" style="margin-top: 20px;">Close</button>
                        </div>
                    </div>
                </div>
            `;
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

// Render products to the grid
function renderProducts(products) {
    if (!productGrid) {
        console.error('Product grid not found');
        return;
    }
    
    // Clear existing content
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12 text-center p-t-50">
                <h3 class="stext-104 cl2">No products found</h3>
                <p class="stext-105 cl3">Check back later for new arrivals!</p>
            </div>
        `;
        return;
    }
    

    
    // Create product cards
    const productCards = products.map(createProductCard).join('');
    productGrid.innerHTML = productCards;
    
    // Reinitialize isotope if it exists
    if (typeof window.initIsotope === 'function') {
        window.initIsotope();
    }
}

// Add loading state
function showLoading() {
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="col-12 text-center p-t-50">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="stext-105 cl3 p-t-10">Loading products...</p>
            </div>
        `;
    }
}

// Initialize products on page load
async function initProducts() {
    showLoading();
    const products = await fetchProducts();
    renderProducts(products);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initProducts();
    
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
window.fetchProducts = fetchProducts;
window.renderProducts = renderProducts;
window.fetchProductDetail = fetchProductDetail;
window.populateQuickViewModal = populateQuickViewModal;
window.showQuickViewModal = showQuickViewModal;
window.hideQuickViewModal = hideQuickViewModal;
window.restoreModalStructure = restoreModalStructure;
