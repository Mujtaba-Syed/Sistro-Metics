from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    code = models.CharField(max_length=50, unique=True, help_text="Coupon code that users will enter ALWAYS IN UPPERCASE")
    description = models.TextField(blank=True, help_text="Description of the coupon")
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Discount amount (percentage or fixed amount)"
    )
    total_count = models.PositiveIntegerField(
        default=1,
        help_text="Total number of times this coupon can be used"
    )
    used_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this coupon has been used"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.discount_type} ({self.discount_value})"
    
    @property
    def remaining_count(self):
        """Calculate remaining usage count"""
        return max(0, self.total_count - self.used_count)
    
    def is_valid(self):
        """Check if coupon is valid (active and has remaining uses)"""
        return self.is_active and self.remaining_count > 0
    
    def can_be_used_by_user(self, user):
        """Check if user can use this coupon (hasn't used it before)"""
        return not CouponUsage.objects.filter(user=user, coupon=self).exists()
    
    def apply_discount(self, cart_total):
        """Apply discount to cart total and return discounted amount"""
        if self.discount_type == 'percentage':
            # Ensure percentage doesn't exceed 100%
            discount_percentage = min(self.discount_value, Decimal('100'))
            discount_amount = (cart_total * discount_percentage) / Decimal('100')
        else:  # fixed amount
            discount_amount = min(self.discount_value, cart_total)
        
        return discount_amount


class CouponUsage(models.Model):
    """Track which users have used which coupons"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'coupon']  # One user can use one coupon only once
        ordering = ['-used_at']
    
    def __str__(self):
        return f"{self.user.username} used {self.coupon.code} on {self.used_at}"