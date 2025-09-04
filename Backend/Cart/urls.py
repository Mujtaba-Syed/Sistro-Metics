from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'carts', views.CartViewSet)
router.register(r'items', views.CartItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
