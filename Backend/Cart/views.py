from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from Product.models import Product
from Coupon.models import CouponUsage
from decimal import Decimal
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class BaseCartView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication for all cart operations
    authentication_classes = [JWTAuthentication]
    
    def get_authenticated_user(self):
        """Get authenticated user - authentication is required"""
        return self.request.user
    
    def get_cart_items(self):
        """Get cart items for authenticated users only"""
        user = self.get_authenticated_user()
        cart = Cart.objects.get_or_create(user=user)[0]
        items = cart.items.all()
        return CartItemSerializer(items, many=True).data

    def get_product_data(self, product):
        """Get product data with images"""
        primary_image = product.images.filter(order=1).first()
        if not primary_image:
            primary_image = product.images.filter(is_active=True).first()
        
        return {
            'id': product.id,
            'name': product.name,
            'price': str(product.price),
            'image': primary_image.image.url if primary_image else None,
            'images': [{'image': img.image.url, 'order': img.order} for img in product.images.filter(is_active=True).order_by('order')]
        }
    
    def calculate_cart_total(self):
        """Calculate total cart amount for authenticated users only"""
        user = self.get_authenticated_user()
        try:
            cart = Cart.objects.get(user=user)
            total = Decimal('0')
            for item in cart.items.all():
                total += item.product.price * item.quantity
            return total
        except Cart.DoesNotExist:
            return Decimal('0')

class GetCartItemsView(BaseCartView):
    """API 1: Get all items in the cart"""
    
    def get(self, request):
        items = self.get_cart_items()
        return Response({
            'success': True,
            'data': items,
            'message': 'Cart items retrieved successfully'
        })

class AddItemView(BaseCartView):
    """API 2: Add item to cart (or increase quantity if exists)"""
    
    def post(self, request):
        product_id = str(request.data.get('product_id'))
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response({
                'success': False,
                'message': 'product_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user = self.get_authenticated_user()
        cart = Cart.objects.get_or_create(user=user)[0]
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Item added to cart successfully'
        })

class RemoveItemView(BaseCartView):
    """API 3: Remove item from cart (decrease quantity by 1)"""
    
    def post(self, request):
        product_id = str(request.data.get('product_id'))
        
        if not product_id:
            return Response({
                'success': False,
                'message': 'product_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = self.get_authenticated_user()
        try:
            cart = Cart.objects.get(user=user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Item not found in cart'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if cart_item.quantity > 1:
            cart_item.quantity -= 1
            cart_item.save()
            serializer = CartItemSerializer(cart_item)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Item quantity decreased successfully'
            })
        else:
            cart_item.delete()
            return Response({
                'success': True,
                'message': 'Item removed from cart (quantity was 1)'
            })

class IncreaseItemView(BaseCartView):
    """API 4: Increase item quantity by 1"""
    
    def post(self, request):
        product_id = str(request.data.get('product_id'))
        
        if not product_id:
            return Response({
                'success': False,
                'message': 'product_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = self.get_authenticated_user()
        try:
            cart = Cart.objects.get(user=user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Item not found in cart'
            }, status=status.HTTP_404_NOT_FOUND)
        
        cart_item.quantity += 1
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Item quantity increased successfully'
        })

class ClearCartView(BaseCartView):
    """API 5: Clear all items from cart (empty the cart)"""
    
    def delete(self, request):
        user = self.get_authenticated_user()
        try:
            cart = Cart.objects.get(user=user)
            cart.items.all().delete()
            return Response({
                'success': True,
                'message': 'Cart cleared successfully'
            })
        except Cart.DoesNotExist:
            return Response({
                'success': True,
                'message': 'Cart is already empty'
            })
    
    def post(self, request):
        # Handle POST requests for CSRF compatibility
        return self.delete(request)


class GetCartSummaryView(BaseCartView):
    """API 6: Get cart summary with total and applied coupon info"""
    
    def get(self, request):
        cart_total = self.calculate_cart_total()
        items = self.get_cart_items()
        
        # Get applied coupon info for authenticated users
        applied_coupon = None
        discount_amount = Decimal('0')
        final_amount = cart_total
        
        user = self.get_authenticated_user()
        try:
            # Get the most recent coupon usage for this user
            coupon_usage = CouponUsage.objects.filter(user=user).order_by('-used_at').first()
            if coupon_usage:
                applied_coupon = {
                    'code': coupon_usage.coupon.code,
                    'discount_type': coupon_usage.coupon.discount_type,
                    'discount_value': coupon_usage.coupon.discount_value,
                    'used_at': coupon_usage.used_at
                }
                discount_amount = coupon_usage.coupon.apply_discount(cart_total)
                final_amount = cart_total - discount_amount
        except CouponUsage.DoesNotExist:
            pass
        
        return Response({
            'success': True,
            'data': {
                'items': items,
                'cart_total': cart_total,
                'applied_coupon': applied_coupon,
                'discount_amount': discount_amount,
                'final_amount': final_amount,
                'item_count': len(items)
            },
            'message': 'Cart summary retrieved successfully'
        })