from django.urls import path
from .views import *

urlpatterns = [
    path('',HomeView.as_view(),name='home'),
    path('home-02/',Home2View.as_view(),name='home-02'),
    path('home-03/',Home3View.as_view(),name='home-03'),
    path('blog/',BlogView.as_view(),name='blog'),
    path('contact/',ContactView.as_view(),name='contact'),
    path('about/',AboutView.as_view(),name='about'),
    path('blog-detail/',BlogDetailView.as_view(),name='blog-detail'),
    path('product-detail/',ProductDetailView.as_view(),name='product-detail'),
    path('cart/',CartView.as_view(),name='cart'),
    path('checkout/',CheckoutView.as_view(),name='checkout'),
    path('product/',ProductView.as_view(),name='product'),
    
    # API endpoints
    path('api/add-to-cart/',AddToCartAPIView.as_view(),name='add-to-cart'),
    path('oauth/google/start/',GoogleOAuthStartView.as_view(),name='google-oauth-start'),
    path('oauth/google/callback/',GoogleOAuthCallbackView.as_view(),name='google-oauth-callback'),
]