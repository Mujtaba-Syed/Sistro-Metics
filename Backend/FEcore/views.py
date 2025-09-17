from django.shortcuts import render
from django.views import View
from django.conf import settings
from Product.models import Product
import os

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
    