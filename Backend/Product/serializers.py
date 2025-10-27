from rest_framework import serializers
from django.conf import settings
from .models import Product, Category, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'order', 'is_active']
    
    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    discounted_price = serializers.SerializerMethodField()

    images = ProductImageSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'quantity', 
            'category', 'created_at', 'is_active', 'is_featured', 'is_on_sale', 
            'is_new', 'percentage_discount', 'discounted_price', 'rating', 'total_reviews', 'images'
        ]
    
    def get_discounted_price(self, obj):
        return obj.get_discounted_price()
    
    def get_image_url(self, obj):
        # First try to get the first active image from ProductImage
        first_image = obj.images.filter(is_active=True).first()
        if first_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return f"{settings.MEDIA_URL}{first_image.image.name}"
        
        # Fallback to the old image field
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{settings.MEDIA_URL}{obj.image.name}"
        return None
