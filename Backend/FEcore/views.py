from django.shortcuts import render, redirect
from django.views import View
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import login
from Product.models import Product
import os
import json
import secrets
import string

# Create your views here.
class HomeView(View): #done
    def get(self,request):
        # Get API URL from environment or use default
        api_url = os.environ.get('BASE_URL', 'http://127.0.0.1:8000')
        
        # Fetch new arrival products
        new_arrivals = Product.objects.filter(is_active=True, is_new=True).select_related('category').prefetch_related('images').order_by('-created_at')[:8]
        
        # Fetch all active products for Product Overview section
        all_products = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images').order_by('-created_at')
        
        context = {
            'base_url': api_url,
            'new_arrivals': new_arrivals,
            'all_products': all_products
        }
        return render(request,'index.html', context)

class Home2View(View): #done
    def get(self,request):
        return render(request,'home-02.html')

class Home3View(View): #done
    def get(self,request):
        return render(request,'home-03.html')

class BlogView(View): #done
    def get(self,request):
        return render(request,'blog.html')
    
class ContactView(View): #done
    def get(self,request):
        return render(request,'contact.html')

class AboutView(View): #done
    def get(self,request):
        return render(request,'about.html')
    
    
class BlogDetailView(View): #done
    def get(self, request, blog_id):
        # Pass the blog_id to the template context for JavaScript to use
        context = {
            'blog_id': blog_id
        }
        return render(request, 'blog-detail.html', context)
    

    
class ProductDetailView(View): #done
    def get(self, request):
        # Get product ID from URL parameter
        product_id = request.GET.get('id')
        print(f"DEBUG: Product ID from URL: {product_id}")
        
        if not product_id:
            # If no ID provided, return template with no product data
            print("DEBUG: No product ID provided")
            context = {'product': None, 'product_id': None, 'debug': True, 'error': 'No product ID provided'}
            return render(request, 'product-detail.html', context)
        
        try:
            # Fetch product with related data
            print(f"DEBUG: Attempting to fetch product with ID: {product_id}")
            product = Product.objects.select_related('category').prefetch_related('images').get(
                id=product_id, 
                is_active=True
            )
            print(f"DEBUG: Product found: {product.name}")
            
            # Convert product to dictionary format similar to API response
            product_data = {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': str(product.price),
                'quantity': product.quantity,
                'category': {
                    'id': product.category.id,
                    'name': product.category.name,
                    'description': product.category.description,
                    'created_at': product.category.created_at.isoformat()
                },
                'created_at': product.created_at.isoformat(),
                'is_active': product.is_active,
                'is_featured': product.is_featured,
                'is_on_sale': product.is_on_sale,
                'is_new': product.is_new,
                'percentage_discount': str(product.percentage_discount) if product.percentage_discount else "0.00",
                'discounted_price': float(product.get_discounted_price()) if product.is_on_sale else None,
                'rating': str(product.rating) if product.rating else "0.00",
                'total_reviews': product.total_reviews,
                'images': [
                    {
                        'id': img.id,
                        'image': img.image.url,
                        'alt_text': img.alt_text,
                        'order': img.order,
                        'is_active': img.is_active
                    }
                    for img in product.images.filter(is_active=True).order_by('order')
                ]
            }
            
            print(f"DEBUG: Product data prepared: {product_data}")
            context = {'product': product_data, 'product_id': product_id, 'debug': True}
            return render(request, 'product-detail.html', context)
            
        except Product.DoesNotExist:
            # Product not found
            print(f"DEBUG: Product with ID {product_id} not found")
            context = {'product': None, 'product_id': product_id, 'debug': True, 'error': 'Product not found'}
            return render(request, 'product-detail.html', context)
        except Exception as e:
            # Handle other errors
            print(f"DEBUG: Error occurred: {str(e)}")
            context = {'product': None, 'product_id': product_id, 'debug': True, 'error': str(e)}
            return render(request, 'product-detail.html', context)

class CartView(View): #done
    def get(self,request):  
        return render(request,'shoping-cart.html')
    
    
class ProductView(View): #done
    def get(self,request):
        # Get API URL from environment or use default
        api_url = os.environ.get('BASE_URL', 'http://127.0.0.1:8000')
        
        # Fetch all active products with related data
        products = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images').order_by('-created_at')
        
        # Get categories for filtering
        categories = Product.objects.filter(is_active=True).values_list('category__name', flat=True).distinct()
        
        context = {
            'base_url': api_url,
            'products': products,
            'categories': categories
        }
        return render(request,'product.html', context)

class CheckoutView(View):
    def get(self,request):
        return render(request,'checkout.html')

@method_decorator(csrf_exempt, name='dispatch')
class AddToCartAPIView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            product_id = data.get('product_id')
            quantity = data.get('quantity', 1)
            session_id = data.get('session_id')
            access_token = data.get('access_token')
            user_type = data.get('user_type', 'guest')
            
            if not product_id:
                return JsonResponse({'error': 'Product ID is required'}, status=400)
            
            # Validate product exists
            try:
                product = Product.objects.get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                return JsonResponse({'error': 'Product not found'}, status=404)
            
            # For now, just return success
            # In a real implementation, you would:
            # 1. Validate the session/token
            # 2. Add item to cart in database
            # 3. Return updated cart data
            
            return JsonResponse({
                'success': True,
                'message': 'Item added to cart successfully',
                'product_id': product_id,
                'product_name': product.name,
                'quantity': quantity,
                'session_id': session_id
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

class GoogleOAuthStartView(View):
    def get(self, request):
        # Store the return URL in session before redirecting to Google OAuth
        return_url = request.GET.get('return_url', '/')
        request.session['return_url'] = return_url
        
        # Redirect to Django allauth Google OAuth
        return redirect('/accounts/google/login/')

class GoogleOAuthCallbackView(View):
    def get(self, request):
        # This view handles the Google OAuth callback after Django allauth processes it
        # Django allauth will have already authenticated the user
        
        # Get the return URL from session or default to home
        return_url = request.session.get('return_url', '/')
        
        # Check if user is authenticated (Django allauth should have done this)
        if request.user.is_authenticated:
            # Redirect back to the original page with success indicator
            redirect_url = f"{return_url}?google_auth=success"
            return redirect(redirect_url)
        else:
            # OAuth failed, redirect with error
            return redirect(f"{return_url}?google_auth=error")
    