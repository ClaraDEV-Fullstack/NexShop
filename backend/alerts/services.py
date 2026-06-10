import logging
import os

from .models import UserNotification

logger = logging.getLogger(__name__)


def notify_user(user, notification_type, title, message, link=None):
    """Create an in-app notification for a user."""
    if user is None or not getattr(user, 'pk', None):
        return None

    try:
        return UserNotification.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            link=link or '',
        )
    except Exception as exc:
        logger.error('Failed to create notification for user %s: %s', user.pk, exc)
        return None


def frontend_link(path: str) -> str:
    """Build a frontend-relative link stored in notifications."""
    base = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    if not path:
        return base
    if path.startswith('http'):
        return path
    return f"{base}{path if path.startswith('/') else f'/{path}'}"
