from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from .models import BlogPost, BlogComment, BlogImage
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostCreateSerializer,
    BlogCommentSerializer, CommentCreateSerializer, CommentLikeSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.filter(is_active=True).select_related('author').prefetch_related('images', 'comments')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_new', 'author']
    search_fields = ['title', 'content', 'category', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'rating', 'number_of_views', 'number_of_likes']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        elif self.action == 'retrieve':
            return BlogPostDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogPostCreateSerializer
        return BlogPostListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag)
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        BlogPost.objects.filter(pk=instance.pk).update(number_of_views=F('number_of_views') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        blog_post = self.get_object()
        blog_post.number_of_likes += 1
        blog_post.save()
        return Response({'status': 'liked', 'likes': blog_post.number_of_likes})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        blog_post = self.get_object()
        if blog_post.number_of_likes > 0:
            blog_post.number_of_likes -= 1
            blog_post.save()
        return Response({'status': 'unliked', 'likes': blog_post.number_of_likes})

class BlogCommentViewSet(viewsets.ModelViewSet):
    queryset = BlogComment.objects.filter(is_active=True).select_related('user', 'blog')
    serializer_class = BlogCommentSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['blog', 'user']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create']:
            return CommentCreateSerializer
        return BlogCommentSerializer

    def perform_create(self, serializer):
        blog_post = serializer.validated_data['blog']
        # Increment comment count
        BlogPost.objects.filter(pk=blog_post.pk).update(number_of_comments=F('number_of_comments') + 1)
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        blog_post = comment.blog
        # Decrement comment count
        if blog_post.number_of_comments > 0:
            BlogPost.objects.filter(pk=blog_post.pk).update(number_of_comments=F('number_of_comments') - 1)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CommentLikeAPIView(generics.GenericAPIView):
    serializer_class = CommentLikeSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        comment_id = serializer.validated_data['comment_id']
        action = serializer.validated_data['action']
        
        try:
            comment = BlogComment.objects.get(id=comment_id, is_active=True)
        except BlogComment.DoesNotExist:
            return Response(
                {'error': 'Comment not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if action == 'like':
            # Here you could implement a proper like system with a separate model
            # For now, we'll just return success
            return Response({
                'status': 'success',
                'message': 'Comment liked',
                'comment_id': comment_id
            })
        elif action == 'unlike':
            return Response({
                'status': 'success',
                'message': 'Comment unliked',
                'comment_id': comment_id
            })

class BlogSearchAPIView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'category', 'tags']
    ordering_fields = ['created_at', 'rating', 'number_of_views']
    ordering = ['-created_at']
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = BlogPost.objects.filter(is_active=True).select_related('author').prefetch_related('images')
        
        # Get search parameters
        search_query = self.request.query_params.get('q', None)
        category = self.request.query_params.get('category', None)
        tags = self.request.query_params.get('tags', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(content__icontains=search_query) |
                Q(category__icontains=search_query) |
                Q(tags__icontains=search_query)
            )
        
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag)
        
        return queryset

class BlogCategoryAPIView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating', 'number_of_views']
    ordering = ['-created_at']
    permission_classes = [AllowAny]

    def get_queryset(self):
        category = self.kwargs.get('category')
        return BlogPost.objects.filter(
            is_active=True, 
            category__icontains=category
        ).select_related('author').prefetch_related('images')
