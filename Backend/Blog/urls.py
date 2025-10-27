from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.BlogPostViewSet, basename='blogpost')
router.register(r'comments', views.BlogCommentViewSet, basename='blogcomment')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional API endpoints
    path('comments/like/', views.CommentLikeAPIView.as_view(), name='comment-like'),
    path('search/', views.BlogSearchAPIView.as_view(), name='blog-search'),
    path('category/<str:category>/', views.BlogCategoryAPIView.as_view(), name='blog-category'),
    path('categories/', views.BlogCategoriesListAPIView.as_view(), name='blog-categories-list'),
]
