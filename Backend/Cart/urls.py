from django.urls import path
from . import views

urlpatterns = [
    path('get_items/', views.GetCartItemsView.as_view(), name='get_cart_items'),
    path('add_item/', views.AddItemView.as_view(), name='add_item'),
    path('remove_item/', views.RemoveItemView.as_view(), name='remove_item'),
    path('increase_item/', views.IncreaseItemView.as_view(), name='increase_item'),
    path('clear_cart/', views.ClearCartView.as_view(), name='clear_cart'),
    path('summary/', views.GetCartSummaryView.as_view(), name='cart_summary'),
]
