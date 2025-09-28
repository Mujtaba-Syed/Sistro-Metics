from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BlogPost, BlogComment, BlogImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'alt_text', 'order']

class BlogCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = BlogComment
        fields = ['id', 'blog', 'user', 'user_id', 'comment', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class BlogPostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True)
    images = BlogImageSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'author', 'author_id', 
            'created_at', 'updated_at', 'category', 'tags', 'is_active', 
            'is_new', 'number_of_views', 'number_of_likes', 'number_of_comments',
            'rating', 'images', 'comments_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'slug', 'number_of_views', 'number_of_likes', 'number_of_comments']
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_active=True).count()

class BlogPostDetailSerializer(BlogPostListSerializer):
    comments = BlogCommentSerializer(many=True, read_only=True)
    
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ['comments']

class BlogPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['title', 'content', 'author', 'category', 'tags', 'is_active', 'is_new', 'rating']

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['blog', 'user', 'comment']

class AnonymousCommentCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=150, write_only=True)
    email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = BlogComment
        fields = ['blog', 'comment', 'name', 'email']
        read_only_fields = ['id', 'user', 'is_active', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Extract name and email
        name = validated_data.pop('name')
        email = validated_data.pop('email')
        
        # Create or get a user for anonymous comments
        # We'll create a user with the provided name and email
        user, created = User.objects.get_or_create(
            username=f"anonymous_{email}",
            defaults={
                'first_name': name.split(' ')[0] if ' ' in name else name,
                'last_name': name.split(' ')[1] if ' ' in name else '',
                'email': email,
                'is_active': False  # Mark as inactive since it's anonymous
            }
        )
        
        # Add user to validated_data
        validated_data['user'] = user
        
        return super().create(validated_data)

class CommentLikeSerializer(serializers.Serializer):
    comment_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['like', 'unlike'])
