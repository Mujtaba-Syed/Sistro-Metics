from django.shortcuts import render
from django.views import View

# Create your views here.
class HomeView(View): #done
    def get(self,request):
        return render(request,'index.html')

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
    