from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from Product.models import Product
from rest_framework.permissions import AllowAny
import json

class BaseCartView(APIView):
    permission_classes = [AllowAny]
    
    def get_session_cart(self):
        """Get cart from session for anonymous users"""
        cart_data = self.request.session.get('cart', {})
        return cart_data

    def save_session_cart(self, cart_data):
        """Save cart to session for anonymous users"""
        self.request.session['cart'] = cart_data

    def get_cart_items(self):
        """Get cart items for both authenticated and anonymous users"""
        if self.request.user.is_authenticated:
            cart = Cart.objects.get_or_create(user=self.request.user)[0]
            items = cart.items.all()
            return CartItemSerializer(items, many=True).data
        else:
            cart_data = self.get_session_cart()
            items = []
            for product_id, quantity in cart_data.items():
                try:
                    product = Product.objects.get(id=product_id)
                    primary_image = product.images.filter(order=1).first()
                    if not primary_image:
                        primary_image = product.images.filter(is_active=True).first()
                    
                    items.append({
                        'id': f"session_{product_id}",
                        'product': {
                            'id': product.id,
                            'name': product.name,
                            'price': str(product.price),
                            'image': primary_image.image.url if primary_image else None,
                            'images': [{'image': img.image.url, 'order': img.order} for img in product.images.filter(is_active=True).order_by('order')]
                        },
                        'quantity': quantity,
                        'created_at': None
                    })
                except Product.DoesNotExist:
                    continue
            return items

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
        
        if request.user.is_authenticated:
            cart = Cart.objects.get_or_create(user=request.user)[0]
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
        else:
            cart_data = self.get_session_cart()
            if product_id in cart_data:
                cart_data[product_id] += quantity
            else:
                cart_data[product_id] = quantity
            
            self.save_session_cart(cart_data)
            
            item_data = {
                'id': f"session_{product_id}",
                'product': self.get_product_data(product),
                'quantity': cart_data[product_id],
                'created_at': None
            }
            
            return Response({
                'success': True,
                'data': item_data,
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
        
        if request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
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
        else:
            cart_data = self.get_session_cart()
            if product_id not in cart_data:
                return Response({
                    'success': False,
                    'message': 'Item not found in cart'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if cart_data[product_id] > 1:
                cart_data[product_id] -= 1
                self.save_session_cart(cart_data)
                
                try:
                    product = Product.objects.get(id=product_id)
                    item_data = {
                        'id': f"session_{product_id}",
                        'product': self.get_product_data(product),
                        'quantity': cart_data[product_id],
                        'created_at': None
                    }
                    return Response({
                        'success': True,
                        'data': item_data,
                        'message': 'Item quantity decreased successfully'
                    })
                except Product.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Product not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                del cart_data[product_id]
                self.save_session_cart(cart_data)
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
        
        if request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
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
        else:
            cart_data = self.get_session_cart()
            if product_id not in cart_data:
                return Response({
                    'success': False,
                    'message': 'Item not found in cart'
                }, status=status.HTTP_404_NOT_FOUND)
            
            cart_data[product_id] += 1
            self.save_session_cart(cart_data)
            
            try:
                product = Product.objects.get(id=product_id)
                item_data = {
                    'id': f"session_{product_id}",
                    'product': self.get_product_data(product),
                    'quantity': cart_data[product_id],
                    'created_at': None
                }
                return Response({
                    'success': True,
                    'data': item_data,
                    'message': 'Item quantity increased successfully'
                })
            except Product.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Product not found'
                }, status=status.HTTP_404_NOT_FOUND)

class ClearCartView(BaseCartView):
    """API 5: Clear all items from cart (empty the cart)"""
    
    def delete(self, request):
        if request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
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
        else:
            self.request.session['cart'] = {}
            return Response({
                'success': True,
                'message': 'Cart cleared successfully'
            })
