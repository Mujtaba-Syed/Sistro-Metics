from django.urls import path
from .views import (
    ValidateCouponView,
    ApplyCouponView,
    RemoveCouponView,
    CouponUsageHistoryView,
    CouponListView
)

urlpatterns = [
    path('validate/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('apply/', ApplyCouponView.as_view(), name='apply-coupon'),
    path('remove/', RemoveCouponView.as_view(), name='remove-coupon'),
    path('history/', CouponUsageHistoryView.as_view(), name='coupon-history'),
    path('list/', CouponListView.as_view(), name='coupon-list'),
]