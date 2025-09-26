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
    def get(self,request):
        return render(request,'blog-detail.html')
    

    
class ProductDetailView(View): #done
    def get(self,request):
        return render(request,'product-detail.html')

class CartView(View): #done
    def get(self,request):  
        return render(request,'shoping-cart.html')
    
    
class ProductView(View): #done
    def get(self,request):
        return render(request,'product.html')

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
    