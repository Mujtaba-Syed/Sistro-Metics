from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, CouponValidationSerializer, CouponUsageSerializer
from Cart.models import Cart, CartItem
from Cart.serializers import CartItemSerializer
from Product.models import Product
from decimal import Decimal


class ValidateCouponView(APIView):
    """API to validate coupon code and check if user can use it"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        
        if not code:
            return Response({
                'success': False,
                'message': 'Coupon code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid coupon code'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if coupon is valid
        if not coupon.is_valid():
            return Response({
                'success': False,
                'message': 'Coupon is no longer valid or has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has already used this coupon
        if not coupon.can_be_used_by_user(request.user):
            return Response({
                'success': False,
                'message': 'You have already used this coupon'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate cart total
        cart_total = self.calculate_cart_total(request.user)
        
        if cart_total <= 0:
            return Response({
                'success': False,
                'message': 'Your cart is empty'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate discount amount
        discount_amount = coupon.apply_discount(cart_total)
        final_amount = cart_total - discount_amount
        
        return Response({
            'success': True,
            'data': {
                'code': coupon.code,
                'is_valid': True,
                'can_use': True,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value,
                'remaining_count': coupon.remaining_count,
                'cart_total': cart_total,
                'discount_amount': discount_amount,
                'final_amount': final_amount,
                'message': 'Coupon is valid and can be applied'
            },
            'message': 'Coupon validated successfully'
        })
    
    def calculate_cart_total(self, user):
        """Calculate total cart amount"""
        try:
            cart = Cart.objects.get(user=user)
            total = Decimal('0')
            for item in cart.items.all():
                total += item.product.price * item.quantity
            return total
        except Cart.DoesNotExist:
            return Decimal('0')


class ApplyCouponView(APIView):
    """API to apply coupon to cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        
        if not code:
            return Response({
                'success': False,
                'message': 'Coupon code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid coupon code'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if coupon is valid
        if not coupon.is_valid():
            return Response({
                'success': False,
                'message': 'Coupon is no longer valid or has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has already used this coupon
        if not coupon.can_be_used_by_user(request.user):
            return Response({
                'success': False,
                'message': 'You have already used this coupon'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate cart total
        cart_total = self.calculate_cart_total(request.user)
        
        if cart_total <= 0:
            return Response({
                'success': False,
                'message': 'Your cart is empty'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Apply coupon with transaction
        try:
            with transaction.atomic():
                # Create coupon usage record
                CouponUsage.objects.create(user=request.user, coupon=coupon)
                
                # Update coupon used count
                coupon.used_count += 1
                coupon.save()
                
                # Calculate discount amount
                discount_amount = coupon.apply_discount(cart_total)
                final_amount = cart_total - discount_amount
                
                return Response({
                    'success': True,
                    'data': {
                        'code': coupon.code,
                        'discount_type': coupon.discount_type,
                        'discount_value': coupon.discount_value,
                        'cart_total': cart_total,
                        'discount_amount': discount_amount,
                        'final_amount': final_amount,
                        'remaining_count': coupon.remaining_count
                    },
                    'message': 'Coupon applied successfully'
                })
                
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to apply coupon. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def calculate_cart_total(self, user):
        """Calculate total cart amount"""
        try:
            cart = Cart.objects.get(user=user)
            total = Decimal('0')
            for item in cart.items.all():
                total += item.product.price * item.quantity
            return total
        except Cart.DoesNotExist:
            return Decimal('0')


class RemoveCouponView(APIView):
    """API to remove applied coupon (if user hasn't completed checkout)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        
        if not code:
            return Response({
                'success': False,
                'message': 'Coupon code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon_usage = CouponUsage.objects.get(user=request.user, coupon__code=code)
        except CouponUsage.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No coupon usage found for this code'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            with transaction.atomic():
                # Remove coupon usage record
                coupon_usage.delete()
                
                # Decrease coupon used count
                coupon = coupon_usage.coupon
                coupon.used_count = max(0, coupon.used_count - 1)
                coupon.save()
                
                return Response({
                    'success': True,
                    'message': 'Coupon removed successfully'
                })
                
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to remove coupon. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CouponUsageHistoryView(APIView):
    """API to get user's coupon usage history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        coupon_usages = CouponUsage.objects.filter(user=request.user).order_by('-used_at')
        serializer = CouponUsageSerializer(coupon_usages, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Coupon usage history retrieved successfully'
        })


class CouponListView(APIView):
    """API to list all active coupons (for admin or public view)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        coupons = Coupon.objects.filter(is_active=True).order_by('-created_at')
        serializer = CouponSerializer(coupons, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Active coupons retrieved successfully'
        })