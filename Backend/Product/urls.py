from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('filter/', views.ProductFilterView.as_view(), name='product-filter'),
    path('search/', views.ProductSearchView.as_view(), name='product-search'),
]
