from rest_framework import viewsets, status, generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .filters import ProductFilter
from rest_framework.pagination import PageNumberPagination

class Pagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    pagination_class = Pagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ProductSearchView(generics.ListAPIView):
    """
    Search products by name or category with partial matching
    Example: /product/search/?q=umbrella (searches for products containing 'umbrella')
    Example: /product/search/?q=um (searches for products containing 'um')
    """
    serializer_class = ProductSerializer
    pagination_class = Pagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        Get search results based on query parameter
        """
        query = self.request.query_params.get('q', '').strip()
        
        if not query:
            return Product.objects.none()
        
        # Base queryset - only active products
        queryset = Product.objects.filter(is_active=True)
        
        # Search in product name and category name (case-insensitive)
        search_query = Q(name__icontains=query) | Q(category__name__icontains=query)
        
        # Apply search filter
        queryset = queryset.filter(search_query)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to add custom response format
        """
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({
                'error': 'Search query is required. Use ?q=search_term'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get queryset
        queryset = self.get_queryset()
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data['query'] = query
            paginated_response.data['search_type'] = 'partial_match'
            return paginated_response
        
        # If no pagination
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'query': query,
            'search_type': 'partial_match',
            'count': queryset.count(),
            'data': serializer.data
        })
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ProductFilterView(generics.ListAPIView):
    """
    Class-based view for filtering products based on different criteria:
    - discounted: Products with is_on_sale=True
    - featured: Products with is_featured=True  
    - new: Products with is_new=True
    - best_selling: Products with rating=5
    """
    serializer_class = ProductSerializer
    pagination_class = Pagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        Get filtered queryset based on filter type
        """
        filter_type = self.request.query_params.get('type', None)
        
        if not filter_type:
            return Product.objects.none()
        
        # Base queryset - only active products
        queryset = Product.objects.filter(is_active=True)
        
        # Apply filters based on type
        if filter_type == 'discounted':
            queryset = queryset.filter(is_on_sale=True)
            
        elif filter_type == 'featured':
            queryset = queryset.filter(is_featured=True)
            
        elif filter_type == 'new':
            queryset = queryset.filter(is_new=True)
            
        elif filter_type == 'best_selling':
            queryset = queryset.filter(rating=5)
            
        else:
            return Product.objects.none()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to add custom response format
        """
        filter_type = request.query_params.get('type', None)
        
        if not filter_type:
            return Response({
                'error': 'Filter type is required. Use ?type=discounted|featured|new|best_selling'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate filter type
        valid_types = ['discounted', 'featured', 'new', 'best_selling']
        if filter_type not in valid_types:
            return Response({
                'error': f'Invalid filter type. Use: {", ".join(valid_types)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get filter name
        filter_names = {
            'discounted': 'Discounted Products',
            'featured': 'Featured Products',
            'new': 'New Products',
            'best_selling': 'Best Selling Products'
        }
        filter_name = filter_names[filter_type]
        
        # Get queryset
        queryset = self.get_queryset()
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data['filter_name'] = filter_name
            paginated_response.data['filter_type'] = filter_type
            return paginated_response
        
        # If no pagination
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'filter_name': filter_name,
            'filter_type': filter_type,
            'count': queryset.count(),
            'data': serializer.data
        })