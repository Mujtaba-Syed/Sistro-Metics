from django.contrib import admin
from .models import Product, Category, ProductImage
# Register your models here.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'quantity', 'category', 'get_discounted_price', 'created_at','is_active', 'is_featured', 'is_on_sale', 'is_new')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description', 'is_active', 'is_featured', 'is_on_sale', 'is_new')
    list_per_page = 10
    list_editable = ('price', 'quantity')
    list_display_links = ('name', 'category', 'created_at', 'is_active', 'is_featured', 'is_on_sale', 'is_new')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    list_per_page = 10
    list_display_links = ('name', 'description', 'created_at')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'alt_text', 'order', 'is_active')
    list_filter = ('is_active', 'product__category')
    search_fields = ('product__name', 'alt_text')
    list_per_page = 20
    list_editable = ('order', 'is_active')
    list_display_links = ('id', 'product', 'alt_text')
