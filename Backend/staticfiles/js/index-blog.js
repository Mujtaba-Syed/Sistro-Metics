// Blog functionality for index.html page
class IndexBlogManager {
    constructor() {
        this.apiUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}blog/posts`;
        this.categoriesUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}blog/categories/`;
        this.productsUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}product/products/?is_featured=true`;
        this.blogContainer = document.querySelector('.blog-posts-container');
        this.categoriesContainer = document.querySelector('.blog-categories-list');
        this.featuredProductsContainer = document.querySelector('.blog-featured-products-list');
        
        console.log('IndexBlogManager initialized:', {
            blogContainer: !!this.blogContainer,
            categoriesContainer: !!this.categoriesContainer,
            featuredProductsContainer: !!this.featuredProductsContainer
        });
        
        this.init();
    }

    async init() {
        try {
            await Promise.all([
                this.loadLatestBlogPosts(),
                this.loadCategories(),
                this.loadFeaturedProducts()
            ]);
        } catch (error) {
            console.error('Error initializing index blog:', error);
            this.showError('Failed to load blog posts');
        }
    }

    async loadLatestBlogPosts() {
        try {
            // Show loading message
            this.showLoading();
            
            // Load all blog posts for the index page (or limit to reasonable number)
            const url = `${this.apiUrl}?page=1&page_size=12`;
            
            console.log('Loading latest blog posts from URL:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('API Response data:', data);
            this.populateBlogCards(data.results);
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.showError('Failed to load blog posts');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(this.categoriesUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.renderCategories(data.categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadFeaturedProducts() {
        try {
            const response = await fetch(this.productsUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.renderFeaturedProducts(data.results || data);
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }

    showLoading() {
        // Clear existing blog cards
        if (this.blogContainer) {
            this.blogContainer.innerHTML = '';
        }
        
        // Show loading message
        const loadingMessage = document.querySelector('.blog-loading-message');
        const errorMessage = document.querySelector('.blog-error-message');
        
        if (loadingMessage) loadingMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
    }

    populateBlogCards(posts) {
        if (!this.blogContainer) {
            console.error('Blog container not found');
            return;
        }

        // Hide loading and error messages
        const loadingMessage = document.querySelector('.blog-loading-message');
        const errorMessage = document.querySelector('.blog-error-message');
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';

        if (posts.length === 0) {
            this.showError('No blog posts found.');
            return;
        }

        // Clear existing content
        this.blogContainer.innerHTML = '';

        // Create blog cards dynamically
        posts.forEach(post => {
            const blogCard = this.createBlogCard(post);
            this.blogContainer.appendChild(blogCard);
        });
    }

    createBlogCard(post) {
        // Get the first image (order 0) or fallback
        const mainImage = post.images.find(img => img.order === 0) || post.images[0];
        const imageUrl = mainImage ? mainImage.image : '/static/images/blog-04.jpg';
        const imageAlt = mainImage ? mainImage.alt_text : 'Blog Image';
        
        // Debug: Log the image URL being used
        console.log('Blog post image URL:', imageUrl);
        console.log('Blog post images:', post.images);

        // Format date
        const formattedDate = this.formatDate(post.created_at);
        const dateParts = formattedDate.split(' ');

        // Format tags
        const tags = post.tags ? post.tags.split(',').slice(0, 2).join(', ') : 'General';

        // Create the blog card element
        const blogCard = document.createElement('div');
        blogCard.className = 'col-sm-6 col-md-4 col-lg-4 mb-4';
        
        blogCard.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="position-relative">
                    <a href="/blog-detail/${post.id}/" class="blog-link text-decoration-none">
                        <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top blog-image" style="height: 200px; object-fit: cover;">
                    </a>
                    <div class="position-absolute top-0 end-0 m-3">
                        <div class="px-2 py-1 rounded blog-date-badge" style="color: #e83e8c !important; text-align: right;">
                            <div class="fw-bold blog-day">${dateParts[0]} ${dateParts[1] } ${dateParts[2]}</div>
                        </div>
                    </div>
                </div>
                
                <div class="card-body d-flex flex-column" style="padding: 0 1.25rem 1.25rem 1.25rem;">
                    <h5 class="card-title">
                        <a href="/blog-detail/${post.id}/" class="blog-link text-decoration-none text-dark blog-title">
                            ${post.title}
                        </a>
                    </h5>
                    
                    <p class="card-text text-muted flex-grow-1 blog-excerpt">
                        ${this.truncateText(post.content, 100)}
                    </p>
                    
                    <div class="mt-3 mb-2" >
                        <div class="small text-muted mb-2 blog-meta">
                            <span class="fw-semibold" style="color: #e83e8c !important;">By</span> <span class="blog-author">${post.author.first_name} ${post.author.last_name}</span>
                            <span class="mx-1" style="color: #e83e8c !important;">|</span>
                            <span class="blog-tags" style="color: #e83e8c !important;">${tags}</span>
                            <span class="mx-1" style="color: #e83e8c !important;">|</span>
                            <span class="blog-comments" style="color: #e83e8c !important;">${post.comments_count} Comments</span>
                        </div>
                        
                        <a href="/blog-detail/${post.id}/" class="btn btn-sm blog-link" style="background-color: #e83e8c !important; color: white !important">
                            Read More <i class="fa fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;

        return blogCard;
    }

    renderCategories(categories) {
        if (!this.categoriesContainer) {
            console.error('Categories container not found');
            return;
        }

        // Clear existing categories
        this.categoriesContainer.innerHTML = '';

        // Add "All Categories" option
        const allCategoriesItem = document.createElement('li');
        allCategoriesItem.className = 'bor18';
        allCategoriesItem.innerHTML = `
            <a href="/blog/" class="dis-block stext-115 cl6 hov-cl1 trans-04 p-tb-8 p-lr-4">
                All Categories
            </a>
        `;
        this.categoriesContainer.appendChild(allCategoriesItem);

        // Add individual categories (limit to 5 for sidebar)
        const limitedCategories = categories.slice(0, 5);
        limitedCategories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'bor18';
            categoryItem.innerHTML = `
                <a href="/blog/?category=${encodeURIComponent(category.name)}" class="dis-block stext-115 cl6 hov-cl1 trans-04 p-tb-8 p-lr-4">
                    ${category.name} (${category.post_count})
                </a>
            `;
            this.categoriesContainer.appendChild(categoryItem);
        });
    }

    renderFeaturedProducts(products) {
        if (!this.featuredProductsContainer) {
            console.error('Featured products container not found');
            return;
        }

        // Clear existing products
        this.featuredProductsContainer.innerHTML = '';

        if (products.length === 0) {
            this.featuredProductsContainer.innerHTML = '<p class="text-center">No featured products available.</p>';
            return;
        }

        // Limit to 3 products for the sidebar
        const limitedProducts = products.slice(0, 3);

        limitedProducts.forEach(product => {
            const productElement = this.createFeaturedProductElement(product);
            this.featuredProductsContainer.appendChild(productElement);
        });
    }

    createFeaturedProductElement(product) {
        const productLi = document.createElement('li');
        productLi.className = 'flex-w flex-t p-b-30';

        // Get the first image or fallback
        const mainImage = product.images && product.images.length > 0 
            ? product.images.find(img => img.order === 0) || product.images[0]
            : null;
        
        const imageUrl = mainImage ? mainImage.image : '/static/images/product-min-01.jpg';
        const imageAlt = mainImage ? mainImage.alt_text : product.name;

        // Calculate price (use discounted price if on sale)
        const displayPrice = product.is_on_sale && product.discounted_price 
            ? product.discounted_price 
            : product.price;

        productLi.innerHTML = `
            <a href="/product-detail/${product.id}/" class="wrao-pic-w size-214 hov-ovelay1 m-r-20">
                <img src="${imageUrl}" alt="${imageAlt}" style="width: 80px; height: 80px; object-fit: cover;">
            </a>

            <div class="size-215 flex-col-t p-t-8">
                <a href="/product-detail/${product.id}/" class="stext-116 cl8 hov-cl1 trans-04">
                    ${product.name}
                </a>

                <span class="stext-116 cl6 p-t-20">
                    Rs ${parseFloat(displayPrice).toFixed(2)}
                    ${product.is_on_sale ? `<span class="stext-117 cl3" style="text-decoration: line-through; margin-left: 5px;">Rs ${parseFloat(product.price).toFixed(2)}</span>` : ''}
                </span>
            </div>
        `;

        return productLi;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    showError(message) {
        // Hide loading message
        const loadingMessage = document.querySelector('.blog-loading-message');
        if (loadingMessage) loadingMessage.style.display = 'none';
        
        // Show error message
        const errorMessage = document.querySelector('.blog-error-message');
        if (errorMessage) {
            errorMessage.querySelector('p').textContent = message;
            errorMessage.style.display = 'block';
        }
        
        // Clear blog container
        if (this.blogContainer) {
            this.blogContainer.innerHTML = '';
        }
    }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the index page and the blog container exists
    if (document.querySelector('.blog-posts-container')) {
        new IndexBlogManager();
    }
});