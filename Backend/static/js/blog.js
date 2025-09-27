// Blog functionality for blog.html
class BlogManager {
    constructor() {
        this.apiUrl = 'http://127.0.0.1:8000/blog/posts';
        this.categoriesUrl = 'http://127.0.0.1:8000/blog/categories/';
        this.currentPage = 1;
        this.currentCategory = null;
        this.blogContainer = document.querySelector('.blog-content-container');
        this.paginationContainer = document.querySelector('.pagination-container');
        this.categoriesContainer = document.querySelector('.categories-list');
        
        this.init();
    }

    async init() {
        try {
            await Promise.all([
                this.loadBlogPosts(),
                this.loadCategories()
            ]);
        } catch (error) {
            console.error('Error initializing blog:', error);
            this.showError('Failed to load blog posts');
        }
    }

    async loadBlogPosts(page = 1) {
        try {
            let url = `${this.apiUrl}?page=${page}`;
            if (this.currentCategory) {
                url += `&category=${encodeURIComponent(this.currentCategory)}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.renderBlogPosts(data.results);
            this.renderPagination(data);
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

    renderBlogPosts(posts) {
        if (!this.blogContainer) {
            console.error('Blog container not found');
            return;
        }

        this.blogContainer.innerHTML = '';

        if (posts.length === 0) {
            this.blogContainer.innerHTML = '<p class="text-center">No blog posts found.</p>';
            return;
        }

        posts.forEach(post => {
            const blogElement = this.createBlogElement(post);
            this.blogContainer.appendChild(blogElement);
        });
    }

    createBlogElement(post) {
        const blogDiv = document.createElement('div');
        blogDiv.className = 'p-b-63';

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
        const tags = post.tags ? post.tags.split(',').slice(0, 3).join(', ') : 'General';

        blogDiv.innerHTML = `
            <a href="/blog-detail/${post.slug}/" class="hov-img0 how-pos5-parent">
                <img src="${imageUrl}" alt="${imageAlt}">
                <div class="flex-col-c-m size-123 bg9 how-pos5">
                    <span class="ltext-107 cl2 txt-center">
                        ${dateParts[0]}
                    </span>
                    <span class="stext-109 cl3 txt-center">
                        ${dateParts[1]} ${dateParts[2]}
                    </span>
                </div>
            </a>

            <div class="p-t-32">
                <h4 class="p-b-15">
                    <a href="/blog-detail/${post.slug}/" class="ltext-108 cl2 hov-cl1 trans-04">
                        ${post.title}
                    </a>
                </h4>

                <p class="stext-117 cl6">
                    ${this.truncateText(post.content, 150)}
                </p>

                <div class="flex-w flex-sb-m p-t-18">
                    <span class="flex-w flex-m stext-111 cl2 p-r-30 m-tb-10">
                        <span>
                            <span class="cl4">By</span> ${post.author.first_name} ${post.author.last_name}
                            <span class="cl12 m-l-4 m-r-6">|</span>
                        </span>
                        <span>
                            ${tags}
                            <span class="cl12 m-l-4 m-r-6">|</span>
                        </span>
                        <span>
                            ${post.comments_count} Comments
                        </span>
                    </span>

                    <a href="/blog-detail/${post.slug}/" class="stext-101 cl2 hov-cl1 trans-04 m-tb-10">
                        Continue Reading
                        <i class="fa fa-long-arrow-right m-l-9"></i>
                    </a>
                </div>
            </div>
        `;

        return blogDiv;
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
            <a href="#" class="dis-block stext-115 cl6 hov-cl1 trans-04 p-tb-8 p-lr-4 category-link" data-category="">
                All Categories
            </a>
        `;
        this.categoriesContainer.appendChild(allCategoriesItem);

        // Add individual categories
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'bor18';
            categoryItem.innerHTML = `
                <a href="#" class="dis-block stext-115 cl6 hov-cl1 trans-04 p-tb-8 p-lr-4 category-link" data-category="${category.name}">
                    ${category.name} (${category.post_count})
                </a>
            `;
            this.categoriesContainer.appendChild(categoryItem);
        });

        // Add event listeners to category links
        this.categoriesContainer.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        
        // Update active category styling
        this.categoriesContainer.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active-category');
            if (link.getAttribute('data-category') === category) {
                link.classList.add('active-category');
            }
        });
        
        // Reload blog posts with new filter
        this.loadBlogPosts(1);
    }

    renderPagination(data) {
        if (!this.paginationContainer) {
            console.error('Pagination container not found');
            return;
        }

        const totalPages = Math.ceil(data.count / 10); // Assuming 10 posts per page
        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="flex-l-m flex-w w-full p-t-10 m-lr--7">';

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === this.currentPage ? 'active-pagination1' : '';
            paginationHTML += `
                <a href="#" class="flex-c-m how-pagination1 trans-04 m-all-7 ${activeClass}" data-page="${i}">
                    ${i}
                </a>
            `;
        }

        paginationHTML += '</div>';
        this.paginationContainer.innerHTML = paginationHTML;

        // Add event listeners to pagination links
        this.paginationContainer.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                this.currentPage = page;
                this.loadBlogPosts(page);
            });
        });
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
        if (this.blogContainer) {
            this.blogContainer.innerHTML = `
                <div class="alert alert-danger text-center">
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BlogManager();
});