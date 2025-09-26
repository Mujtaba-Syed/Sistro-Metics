from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import BlogPost, BlogComment, BlogImage

class BlogImageInline(admin.TabularInline):
    model = BlogImage
    extra = 1
    fields = ('image', 'alt_text', 'order')
    ordering = ('order',)

class BlogCommentInline(admin.TabularInline):
    model = BlogComment
    extra = 0
    fields = ('user', 'comment', 'is_active', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_active', 'is_new', 'rating', 'number_of_views', 'number_of_likes', 'number_of_comments', 'created_at')
    list_filter = ('is_active', 'is_new', 'category', 'created_at', 'author')
    search_fields = ('title', 'content', 'category', 'tags')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at', 'number_of_views', 'number_of_likes', 'number_of_comments')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'content', 'author')
        }),
        ('Categorization', {
            'fields': ('category', 'tags')
        }),
        ('Status & Settings', {
            'fields': ('is_active', 'is_new')
        }),
        ('Statistics', {
            'fields': ('rating', 'number_of_views', 'number_of_likes', 'number_of_comments'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [BlogImageInline, BlogCommentInline]
    ordering = ('-created_at',)
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author')

@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('blog_title', 'user', 'comment_preview', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'blog__category')
    search_fields = ('comment', 'user__username', 'blog__title')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Comment Details', {
            'fields': ('blog', 'user', 'comment')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ('-created_at',)
    list_per_page = 25
    
    def blog_title(self, obj):
        return obj.blog.title
    blog_title.short_description = 'Blog Post'
    
    def comment_preview(self, obj):
        return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
    comment_preview.short_description = 'Comment Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('blog', 'user')

@admin.register(BlogImage)
class BlogImageAdmin(admin.ModelAdmin):
    list_display = ('blog_title', 'image_preview', 'alt_text', 'order', 'created_at')
    list_filter = ('created_at', 'blog__category')
    search_fields = ('alt_text', 'blog__title')
    readonly_fields = ('created_at', 'image_preview')
    fieldsets = (
        ('Image Details', {
            'fields': ('blog', 'image', 'alt_text', 'order')
        }),
        ('Preview', {
            'fields': ('image_preview',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    ordering = ('blog', 'order', 'created_at')
    list_per_page = 25
    
    def blog_title(self, obj):
        return obj.blog.title
    blog_title.short_description = 'Blog Post'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('blog')
