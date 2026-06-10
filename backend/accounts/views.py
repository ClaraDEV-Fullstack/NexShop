import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema

from .serializers import (
    UserSerializer, RegisterSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)
from alerts.services import notify_user, frontend_link

User = get_user_model()
logger = logging.getLogger(__name__)


@extend_schema(tags=['Accounts'])
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        notify_user(
            user,
            'system',
            'Welcome to NEXSHOP!',
            'Your account has been created. Explore products and start shopping!',
            frontend_link('/products'),
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Accounts'])
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            notify_user(
                request.user,
                'system',
                'Profile updated',
                'Your account details have been saved successfully.',
                frontend_link('/dashboard/settings'),
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Accounts'])
class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response({'error': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)

        avatar_file = request.FILES['avatar']

        if avatar_file.size > 5 * 1024 * 1024:
            return Response({'error': 'Image size must be less than 5MB'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return Response(
                {'error': 'Only JPEG, PNG, GIF, and WebP images are allowed'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.avatar = avatar_file
        request.user.save()
        notify_user(
            request.user,
            'system',
            'Profile photo updated',
            'Your avatar has been updated.',
            frontend_link('/dashboard/settings'),
        )
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def delete(self, request):
        if request.user.avatar:
            request.user.avatar.delete(save=False)
            request.user.avatar = None
            request.user.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)


@extend_schema(tags=['Accounts'])
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            notify_user(
                request.user,
                'system',
                'Password changed',
                'Your password was updated successfully. If this was not you, contact support immediately.',
                frontend_link('/dashboard/settings'),
            )
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Accounts'])
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Successfully logged out.'})
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Accounts'])
class PasswordResetRequestView(APIView):
    """Send a password reset link to the user's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            _send_password_reset_email(user, reset_link)
        except User.DoesNotExist:
            pass  # Don't reveal whether the email exists

        return Response({'message': 'If an account with that email exists, a reset link has been sent.'})


@extend_schema(tags=['Accounts'])
class PasswordResetConfirmView(APIView):
    """Confirm password reset with uid + token from email link."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, serializer.validated_data['token']):
            return Response({'error': 'Reset link has expired or is invalid.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password reset successful. You can now log in.'})


def _send_password_reset_email(user, reset_link: str):
    from orders.emails import send_email_async
    name = user.first_name or user.username or 'there'
    subject = 'Reset your NEXSHOP password'
    text = f"Hi {name},\n\nClick to reset your password:\n{reset_link}\n\nThis link expires in 24 hours."
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;">Password Reset</h1>
      </div>
      <div style="background:white;padding:30px;">
        <p>Hi <strong>{name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="{reset_link}" style="background:#3b82f6;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;">Reset Password</a>
        </div>
        <p style="color:#6b7280;font-size:14px;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
      </div>
    </div>
    """
    try:
        send_email_async(subject, text, html, user.email)
    except Exception as exc:
        logger.error('Failed to send password reset email to %s: %s', user.email, exc)
