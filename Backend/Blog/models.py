from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    tags = models.CharField(max_length=500, null=True, blank=True, help_text="Comma-separated tags")
    is_active = models.BooleanField(default=True)
    is_new = models.BooleanField(default=False)
    number_of_views = models.PositiveIntegerField(default=0)
    number_of_likes = models.PositiveIntegerField(default=0)
    number_of_comments = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)],
        help_text="Rating from 0.00 to 5.00"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class BlogComment(models.Model):
    blog = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_comments')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Blog Comment'
        verbose_name_plural = 'Blog Comments'
    
    def __str__(self):
        return f"{self.user.username} - {self.comment[:50]}..."

class BlogImage(models.Model):
    blog = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    alt_text = models.CharField(max_length=200, blank=True, help_text="Alternative text for accessibility")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Blog Image'
        verbose_name_plural = 'Blog Images'
    
    def __str__(self):
        return f"{self.blog.title} - Image {self.order}" if self.image else f"{self.blog.title} - No Image"

