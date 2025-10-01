from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'total_count', 'used_count', 'remaining_count', 'is_active', 'created_at']
    list_filter = ['discount_type', 'is_active', 'created_at']
    search_fields = ['code', 'description']
    readonly_fields = ['used_count', 'remaining_count', 'created_at']
    ordering = ['-created_at']


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'coupon', 'used_at']
    list_filter = ['used_at', 'coupon']
    search_fields = ['user__username', 'user__email', 'coupon__code']
    readonly_fields = ['used_at']
    ordering = ['-used_at']