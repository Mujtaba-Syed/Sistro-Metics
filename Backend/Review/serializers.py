from rest_framework import serializers
from .models import Review
from Product.serializers import ProductSerializer

class ReviewSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'rating', 'comment', 'created_at']
