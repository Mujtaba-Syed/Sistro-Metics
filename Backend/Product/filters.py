import django_filters
from .models import Product, Category

class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category__name')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    is_on_sale = django_filters.BooleanFilter(field_name='is_on_sale')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = ['name', 'price_min', 'price_max', 'category', 'is_featured', 'is_on_sale']

