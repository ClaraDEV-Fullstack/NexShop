from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import logging

from alerts.services import notify_user, frontend_link

logger = logging.getLogger(__name__)
User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate user with Google OAuth token.

    Expects: { "credential": "google-id-token" }
    Returns: JWT tokens + user data
    """
    try:
        credential = request.data.get('credential')

        if not credential:
            return Response(
                {'error': 'Google credential is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '')
        if not client_id:
            logger.error('GOOGLE_OAUTH_CLIENT_ID is not set on the server')
            return Response(
                {'error': 'Google OAuth is not configured on the server. Set GOOGLE_OAUTH_CLIENT_ID in Render.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Verify the Google token using Google's API
        google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"

        try:
            google_response = requests.get(google_url)
            if google_response.status_code != 200:
                logger.error('Google tokeninfo failed: %s', google_response.text[:200])
                return Response(
                    {'error': 'Invalid Google token. Check authorized origins in Google Cloud Console.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            idinfo = google_response.json()
        except Exception as e:
            logger.error(f"Google token verification failed: {e}")
            return Response(
                {'error': 'Failed to verify Google token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the token is for our app
        token_aud = idinfo.get('aud')
        if token_aud != client_id:
            logger.error(
                'Google token audience mismatch: token aud=%s, server client_id=%s',
                token_aud, client_id,
            )
            return Response(
                {
                    'error': 'Google Client ID mismatch. VITE_GOOGLE_CLIENT_ID (frontend) must match GOOGLE_OAUTH_CLIENT_ID (backend).',
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract user info from Google token
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')

        if not email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists
        user = User.objects.filter(email=email).first()

        if user:
            # Existing user - log them in
            is_new_user = False
            logger.info(f"Google login for existing user: {email}")
        else:
            # New user - create account
            username = email.split('@')[0]

            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                password=None,  # No password for OAuth users
            )

            is_new_user = True
            logger.info(f"Created new user via Google: {email}")
            notify_user(
                user,
                'system',
                'Welcome to NEXSHOP!',
                'Your Google account is connected. Start exploring our catalog!',
                frontend_link('/products'),
            )

        # Generate JWT tokens
        tokens = get_tokens_for_user(user)

        # Prepare user data
        user_data = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }

        return Response({
            'success': True,
            'message': 'Welcome to NEXSHOP!' if is_new_user else 'Welcome back!',
            'is_new_user': is_new_user,
            'user': user_data,
            'tokens': tokens,
        })

    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        return Response(
            {'error': 'Authentication failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def google_client_id(request):
    """Return Google OAuth Client ID for frontend"""
    client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '')
    return Response({
        'client_id': client_id
    })