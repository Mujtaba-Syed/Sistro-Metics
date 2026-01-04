// Blog Detail functionality for blog-detail.html
class BlogDetailManager {
    constructor() {
        this.blogId = window.BLOG_ID || this.getBlogIdFromUrl();
        this.apiUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}blog/posts/${this.blogId}/`;
        this.categoriesUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}blog/categories/`;
        this.productsUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}product/products/?is_featured=true`;
        this.commentsUrl = `${window.BASE_URL || 'http://127.0.0.1:8000/'}blog/comments/`;
        this.blogData = null;
        
        // Sidebar containers
        this.categoriesContainer = document.querySelector('.categories-list');
        this.featuredProductsContainer = document.querySelector('.featured-products-list');
        
        this.init();
    }

    getBlogIdFromUrl() {
        // Extract blog ID from URL like /blog-detail/1/
        const pathParts = window.location.pathname.split('/');
        const blogIndex = pathParts.indexOf('blog-detail');
        return blogIndex !== -1 && pathParts[blogIndex + 1] ? pathParts[blogIndex + 1] : null;
    }

    async init() {
        if (!this.blogId) {
            console.error('Blog ID not found in URL');
            this.showError('Blog post not found');
            return;
        }

        try {
            await Promise.all([
                this.loadBlogDetail(),
                this.loadCategories(),
                this.loadFeaturedProducts()
            ]);
            this.renderBlogDetail();
        } catch (error) {
            console.error('Error initializing blog detail:', error);
            this.showError('Failed to load blog post');
        }
    }

    async loadBlogDetail() {
        try {
            console.log('Fetching blog detail from:', this.apiUrl);
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.blogData = await response.json();
            console.log('Blog detail loaded:', this.blogData);
        } catch (error) {
            console.error('Error loading blog detail:', error);
            throw error;
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
            console.log('Fetching featured products from:', this.productsUrl);
            const response = await fetch(this.productsUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Handle both paginated and non-paginated responses
            const products = data.results || data;
            console.log('All products received:', products);
            
            // Filter products client-side if server-side filtering doesn't work
            const featuredProducts = products.filter(product => product.is_featured === true);
            console.log('Featured products after filtering:', featuredProducts);
            
            this.renderFeaturedProducts(featuredProducts);
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }

    renderBlogDetail() {
        if (!this.blogData) {
            console.error('No blog data available');
            return;
        }

        this.createDynamicBlogStructure();
    }

    createDynamicBlogStructure() {
        const mainContainer = document.querySelector('.p-r-45.p-r-0-lg');
        if (!mainContainer) {
            console.error('Main container not found');
            return;
        }

        // Clear existing content
        mainContainer.innerHTML = '';

        // Create the complete blog structure
        const blogHTML = this.createBlogHTML();
        mainContainer.innerHTML = blogHTML;
        
        // Setup comment form after HTML is inserted
        this.setupCommentForm();
    }

    createBlogHTML() {
        const formattedDate = this.formatDate(this.blogData.created_at);
        const dateParts = formattedDate.split(' ');
        const authorName = `${this.blogData.author.first_name} ${this.blogData.author.last_name}`.trim() || this.blogData.author.username;
        
        // Get the first image (order 0) or fallback
        const mainImage = this.blogData.images.find(img => img.order === 0) || this.blogData.images[0];
        const imageUrl = mainImage ? mainImage.image : '/static/images/blog-04.jpg';
        const imageAlt = mainImage ? mainImage.alt_text : this.blogData.title;

        // Split content into paragraphs
        const paragraphs = this.blogData.content.split('\n\n').filter(p => p.trim());
        const contentParagraphs = paragraphs.map(paragraph => 
            `<p class="stext-117 cl6 p-b-26">${paragraph.trim()}</p>`
        ).join('');

        // Create tags
        const tags = this.blogData.tags ? this.blogData.tags.split(',').map(tag => tag.trim()) : ['General'];
        const tagElements = tags.map(tag => 
            `<a href="#" class="flex-c-m stext-107 cl6 size-301 bor7 p-lr-15 hov-tag1 trans-04 m-r-5 m-b-5">${tag}</a>`
        ).join('');

        // Create comments
        const commentsHTML = this.createCommentsHTML();

        return `
            <!-- Main Blog Image -->
            <div class="wrap-pic-w how-pos5-parent">
                <img src="${imageUrl}" alt="${imageAlt}">
                <div class="flex-col-c-m size-123 bg9 how-pos5">
                    <span class="ltext-107 cl2 txt-center">
                        ${dateParts[0]}
                    </span>
                    <span class="stext-109 cl3 txt-center">
                        ${dateParts[1]} ${dateParts[2]}
                    </span>
                </div>
            </div>

            <!-- Blog Info and Content -->
            <div class="p-t-32">
                <span class="flex-w flex-m stext-111 cl2 p-b-19">
                    <span>
                        <span class="cl4">By</span> ${authorName}
                        <span class="cl12 m-l-4 m-r-6">|</span>
                    </span>
                    <span>
                        ${formattedDate}
                        <span class="cl12 m-l-4 m-r-6">|</span>
                    </span>
                    <span>
                        ${this.blogData.tags || 'General'}
                        <span class="cl12 m-l-4 m-r-6">|</span>
                    </span>
                    <span>
                        ${this.blogData.comments_count} Comments
                    </span>
                </span>

                <h4 class="ltext-109 cl2 p-b-28">
                    ${this.blogData.title}
                </h4>

                ${contentParagraphs}
            </div>

            <!-- Tags Section -->
            <div class="flex-w flex-t p-t-16">
                <span class="size-216 stext-116 cl8 p-t-4">
                    Tags
                </span>
                <div class="flex-w size-217">
                    ${tagElements}
                </div>
            </div>

            <!-- Comments Section -->
            ${commentsHTML}

            <!-- Comment Form -->
            <div class="p-t-40">
                <h5 class="mtext-113 cl2 p-b-12">
                    Leave a Comment
                </h5>
                <p class="stext-107 cl6 p-b-40">
                    Your email address will not be published. Required fields are marked *
                </p>
                <form id="comment-form" onsubmit="return false;">
                    <div class="bor19 m-b-20">
                        <textarea class="stext-111 cl2 plh3 size-124 p-lr-18 p-tb-15" name="cmt" placeholder="Comment..." required></textarea>
                    </div>
                    <div class="bor19 size-218 m-b-20">
                        <input class="stext-111 cl2 plh3 size-116 p-lr-18" type="text" name="name" placeholder="Name *" required>
                    </div>
                    <div class="bor19 size-218 m-b-20">
                        <input class="stext-111 cl2 plh3 size-116 p-lr-18" type="email" name="email" placeholder="Email *" required>
                    </div>

                    <button type="submit" class="flex-c-m stext-101 cl0 size-125 bg3 bor2 hov-btn3 p-lr-15 trans-04">
                        Post Comment
                    </button>
                </form>
            </div>
        `;
    }

    createCommentsHTML() {
        if (!this.blogData.comments || this.blogData.comments.length === 0) {
            return '';
        }

        const commentsHTML = this.blogData.comments.map(comment => {
            const authorName = `${comment.user.first_name} ${comment.user.last_name}`.trim() || comment.user.username;
            const commentDate = this.formatDate(comment.created_at);
            
            return `
                <div class="comment-item p-b-20">
                    <div class="flex-w flex-t p-b-20">
                        <div class="size-207">
                            <div class="flex-w flex-sb-m p-tb-17">
                                <span class="mtext-107 cl6 p-r-20">
                                    ${authorName}
                                </span>
                                <span class="fs-18 cl11">
                                    ${commentDate}
                                </span>
                            </div>
                            <p class="stext-102 cl6">
                                ${comment.comment}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="comments-section p-t-40">
                <h5 class="mtext-113 cl2 p-b-12">
                    Comments (${this.blogData.comments_count})
                </h5>
                <div class="comments-list">
                    ${commentsHTML}
                </div>
            </div>
        `;
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

        // Add individual categories
        categories.forEach(category => {
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
                    $${parseFloat(displayPrice).toFixed(2)}
                    ${product.is_on_sale ? `<span class="stext-117 cl3" style="text-decoration: line-through; margin-left: 5px;">$${parseFloat(product.price).toFixed(2)}</span>` : ''}
                </span>
            </div>
        `;

        return productLi;
    }

    async submitComment(commentData) {
        try {
            console.log('Submitting comment to URL:', this.commentsUrl);
            console.log('Comment data:', commentData);
            
            const response = await fetch(this.commentsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
            }

            const newComment = await response.json();
            console.log('Comment submitted successfully:', newComment);
            
            // Reload the blog detail to show the new comment
            await this.loadBlogDetail();
            this.renderBlogDetail();
            
            // Show success message
            this.showSuccessMessage('🎉 Comment posted successfully! Thank you for your feedback.');
            
            // Clear the form
            this.clearCommentForm();
            
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showErrorMessage('❌ Unable to post comment. Please try again or contact support if the issue persists.');
        }
    }

    setupCommentForm() {
        const commentForm = document.querySelector('#comment-form');
        if (!commentForm) {
            console.error('Comment form not found!');
            return;
        }

        console.log('Comment form found, setting up event listener');
        console.log('Form element:', commentForm);
        console.log('Form action:', commentForm.action);
        console.log('Form method:', commentForm.method);
        
        // Remove any existing event listeners
        commentForm.removeEventListener('submit', this.handleFormSubmit);
        
        // Add the event listener
        commentForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    async handleFormSubmit(e) {
        console.log('Form submit event triggered!');
        e.preventDefault();
        e.stopPropagation();
        console.log('Form submitted, preventing default');
        
        const commentForm = document.querySelector('#comment-form');
        const formData = new FormData(commentForm);
        const comment = formData.get('cmt');
        const name = formData.get('name');
        const email = formData.get('email');

        console.log('Form data:', { comment, name, email, blogId: this.blogId });

        // Validate form data
        if (!comment || !name || !email) {
            console.log('Validation failed - missing fields');
            this.showErrorMessage('⚠️ Please fill in all required fields to post your comment.');
            return;
        }

        // Prepare comment data
        const commentData = {
            blog: parseInt(this.blogId),
            comment: comment,
            name: name,
            email: email
        };

        console.log('Submitting comment data:', commentData);
        await this.submitComment(commentData);
    }

    clearCommentForm() {
        const commentForm = document.querySelector('#comment-form');
        if (commentForm) {
            commentForm.reset();
        }
    }

    showSuccessMessage(message) {
        this.showToastNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showToastNotification(message, 'error');
    }

    showToastNotification(message, type = 'info') {
        // Remove any existing notifications of the same type to avoid stacking
        const existingNotifications = document.querySelectorAll('.toast-notification');
        existingNotifications.forEach(notification => {
            if (notification.classList.contains(`toast-${type}`)) {
                notification.remove();
            }
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `toast-notification toast-${type}`;
        
        // Calculate top position based on existing notifications
        const existingCount = document.querySelectorAll('.toast-notification').length;
        const topPosition = 20 + (existingCount * 80);
        
        // Enhanced styling with animations
        notification.style.cssText = `
            position: fixed;
            top: ${topPosition}px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 350px;
            word-wrap: break-word;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            line-height: 1.4;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
            opacity: 0;
            border-left: 4px solid ${type === 'success' ? '#1e7e34' : type === 'error' ? '#c82333' : '#138496'};
        `;
        
        // Add icon based on type
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 18px; font-weight: bold;">${icon}</span>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // Remove after 4 seconds with animation
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month}, ${year}`;
    }

    showError(message) {
        const mainContent = document.querySelector('.p-r-45.p-r-0-lg');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="alert alert-danger text-center p-t-50">
                    <h4>Error</h4>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize blog detail manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BlogDetailManager();
});