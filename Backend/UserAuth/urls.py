from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # JWT Authentication endpoints
    path('api/auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('api/auth/login/', views.UserLoginView.as_view(), name='login'),
    path('api/auth/refresh/', views.TokenRefreshView.as_view(), name='refresh'),
    path('api/auth/logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # Authentication check endpoint
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),
    
    # Guest token endpoint
    path('guest-tokens/', views.GuestTokenView.as_view(), name='guest-tokens'),
]
