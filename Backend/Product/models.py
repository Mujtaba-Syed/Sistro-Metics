from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    percentage_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_on_sale = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)

   
    def __str__(self):
        return f"{self.name} - {self.id}"

    def get_discounted_price(self):
        if self.is_on_sale:
            return self.price - (self.price * self.percentage_discount / 100)
        return self.price
    
    

    def validate_rating(self):
        if self.rating < 0 or self.rating > 5:
            raise ValueError("Rating must be between 0 and 5")
        return self.rating
    

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    alt_text = models.CharField(max_length=200, blank=True, null=True)
    image = models.ImageField(upload_to='products/images/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product.name} - Image {self.id}"