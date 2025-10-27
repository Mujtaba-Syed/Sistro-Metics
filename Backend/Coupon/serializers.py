from rest_framework import serializers
from .models import Coupon, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    remaining_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'total_count', 'used_count', 'remaining_count', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['used_count', 'remaining_count', 'created_at', 'updated_at']


class CouponValidationSerializer(serializers.Serializer):
    """Serializer for coupon validation response"""
    code = serializers.CharField()
    is_valid = serializers.BooleanField()
    can_use = serializers.BooleanField()
    discount_type = serializers.CharField()
    discount_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    remaining_count = serializers.IntegerField()
    message = serializers.CharField()


class CouponUsageSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'user_email', 'coupon_code', 'used_at']
        read_only_fields = ['used_at']