from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import UserProfile
from .serializers import UserProfileSerializer, UserRegistrationSerializer, UserLoginSerializer
import json
import time

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class UserRegistrationView(APIView):
    """
    Register a new user
    POST /api/auth/register/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create user
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', '')
            )
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                phone=serializer.validated_data.get('phone', ''),
                address=serializer.validated_data.get('address', '')
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'data': {
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh),
                    }
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """
    Login user and return JWT tokens
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if user:
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'data': {
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                        },
                        'tokens': {
                            'access': str(access_token),
                            'refresh': str(refresh),
                        }
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class TokenRefreshView(APIView):
    """
    Refresh access token using refresh token
    POST /api/auth/refresh/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'Token refreshed successfully',
                'data': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)

class UserLogoutView(APIView):
    """
    Logout user and blacklist refresh token
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Logout failed'
            }, status=status.HTTP_400_BAD_REQUEST)

class CheckAuthView(APIView):
    """
    Check if user is authenticated via Django session
    GET /user-auth/check-auth/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        if request.user.is_authenticated:
            try:
                # Generate JWT tokens for the authenticated user
                refresh = RefreshToken.for_user(request.user)
                access_token = refresh.access_token
                
                return JsonResponse({
                    'authenticated': True,
                    'user': {
                        'id': request.user.id,
                        'username': request.user.username,
                        'email': request.user.email,
                        'first_name': request.user.first_name,
                        'last_name': request.user.last_name,
                        'is_authenticated': True
                    },
                    'access_token': str(access_token),
                    'refresh_token': str(refresh)
                })
            except Exception as e:
                return JsonResponse({
                    'authenticated': False,
                    'error': str(e)
                })
        else:
            return JsonResponse({
                'authenticated': False
            })

class GuestTokenView(APIView):
    """
    Generate JWT tokens for guest users
    POST /user-auth/guest-tokens/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Create a temporary guest user or use a special guest user
            # For simplicity, we'll create a guest user with a unique identifier
            guest_id = f"guest_{request.data.get('guest_id', int(time.time() * 1000))}"
            
            # Create or get a guest user
            guest_user, created = User.objects.get_or_create(
                username=guest_id,
                defaults={
                    'email': f'{guest_id}@guest.local',
                    'first_name': 'Guest',
                    'last_name': 'User',
                    'is_active': True
                }
            )
            
            # Generate JWT tokens for the guest user
            refresh = RefreshToken.for_user(guest_user)
            access_token = refresh.access_token
            
            # Add custom claims to identify this as a guest token
            access_token['is_guest'] = True
            access_token['guest_id'] = guest_id
            
            return Response({
                'success': True,
                'message': 'Guest tokens generated successfully',
                'data': {
                    'user': {
                        'id': guest_user.id,
                        'username': guest_user.username,
                        'email': guest_user.email,
                        'first_name': guest_user.first_name,
                        'last_name': guest_user.last_name,
                        'is_guest': True,
                        'guest_id': guest_id
                    },
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh),
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to generate guest tokens',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)