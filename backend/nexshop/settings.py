import os
import sentry_sdk
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-in-production')
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')

# Allowed hosts
allowed_hosts_str = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1")
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(",") if h.strip()]

# Render sets RENDER=true — allow any *.onrender.com hostname automatically
if os.getenv("RENDER") == "true" and ".onrender.com" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(".onrender.com")

# CSRF Trusted Origins (for production)
csrf_origins_str = os.getenv("CSRF_TRUSTED_ORIGINS", "")
CSRF_TRUSTED_ORIGINS = [h.strip() for h in csrf_origins_str.split(",") if h.strip()]

# Allow Google OAuth popup
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin-allow-popups'

# =============================================================================
# PRODUCTION SECURITY SETTINGS
# =============================================================================
if not DEBUG:
    # HTTPS Settings
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True').lower() == 'true'
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    # Cookie Security
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True

    # HSTS Settings
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Other Security Headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'SAMEORIGIN'  # Changed from DENY to allow Google popup

# Cross-Origin settings for Google OAuth (both dev and prod)
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin-allow-popups'

# =============================================================================
# APPLICATION DEFINITION
# =============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'storages',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',

    # Local apps
    'accounts',
    'products',
    'orders',
    'payments',
    'reviews',
    'wishlist',
    'alerts',
    'cart',
    'config',
]

# =============================================================================
# SENTRY — error tracking
# =============================================================================
SENTRY_DSN = os.getenv('SENTRY_DSN', '')
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=0.2,
        send_default_pii=False,
    )

# =============================================================================
# SUPABASE MEDIA STORAGE — permanent CDN URLs, free, no credit card needed
# =============================================================================
SUPABASE_URL = os.getenv('SUPABASE_URL', '')           # https://xxx.supabase.co
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET', 'media')

if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    DEFAULT_FILE_STORAGE = 'nexshop.supabase_storage.SupabaseStorage'
    MEDIA_URL = f'{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/'
else:
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nexshop.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nexshop.wsgi.application'

# =============================================================================
# DATABASE CONFIGURATION - FIXED FOR RENDER BUILD
# =============================================================================
import sys

# Get DATABASE_URL from environment
DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Handle potential issues
if DATABASE_URL:
    # Handle bytes encoding (edge case)
    if isinstance(DATABASE_URL, bytes):
        DATABASE_URL = DATABASE_URL.decode('utf-8')

    # Strip whitespace
    DATABASE_URL = DATABASE_URL.strip()

    # Make sure it starts with a valid scheme
    if DATABASE_URL.startswith('postgres://') or DATABASE_URL.startswith('postgresql://'):
        try:
            DATABASES = {
                "default": dj_database_url.parse(
                    DATABASE_URL,
                    conn_max_age=600,
                    conn_health_checks=True,
                )
            }
        except Exception as e:
            print(f"Error parsing DATABASE_URL: {e}")
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': BASE_DIR / 'db.sqlite3',
                }
            }
    else:
        print(f"Invalid DATABASE_URL scheme, using SQLite")
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    # No DATABASE_URL - use SQLite (for build time or local dev)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# =============================================================================
# PASSWORD VALIDATION
# =============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =============================================================================
# INTERNATIONALIZATION
# =============================================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
LOCALE_PATHS = []

# =============================================================================
# STATIC FILES (CSS, JavaScript, Images)
# =============================================================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Use simpler storage that works better with Django 6.0
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# =============================================================================
# MEDIA FILES (User uploads)
# =============================================================================
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
if 'MEDIA_URL' not in dir():
    MEDIA_URL = '/media/'

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# CORS SETTINGS
# =============================================================================
# Get CORS origins from environment variable
cors_origins_str = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
CORS_ALLOWED_ORIGINS = [h.strip() for h in cors_origins_str.split(",") if h.strip()]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'nexshop.pagination.FlexiblePageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',

    # Production settings
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ) if not DEBUG else (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),

    # Throttling (rate limiting) - UPDATED FOR DEVELOPMENT
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ] if not DEBUG else [],  # Disable throttling in DEBUG mode

    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',   # Increased from 100
        'user': '5000/hour'    # Increased from 1000
    }
}

# =============================================================================
# SWAGGER/OPENAPI SETTINGS
# =============================================================================
SPECTACULAR_SETTINGS = {
    'TITLE': 'NEXSHOP API',
    'DESCRIPTION': 'E-commerce REST API with JWT authentication',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'TAGS': [
        {'name': 'Accounts', 'description': 'User authentication & profile'},
        {'name': 'Categories', 'description': 'Product categories'},
        {'name': 'Products', 'description': 'Product listing & details'},
    ],
}

# =============================================================================
# JWT SETTINGS
# =============================================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# =============================================================================
# CUSTOM USER MODEL
# =============================================================================
AUTH_USER_MODEL = 'accounts.User'

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'noreply@nexshop.com')

# Fallback to console backend only when no real provider is configured
_has_email_provider = bool(os.getenv('BREVO_API_KEY') or os.getenv('EMAIL_HOST_USER'))
if not _has_email_provider and DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print('WARNING: No BREVO_API_KEY or EMAIL_HOST_USER — emails print to console only')
elif os.getenv('BREVO_API_KEY'):
    print('Email configured via Brevo API')
elif EMAIL_HOST_USER:
    print(f'Email configured via SMTP: {EMAIL_HOST_USER}')

# =============================================================================
# PAYMENTS — CinetPay (live) or mock (portfolio / local demo)
# =============================================================================
PAYMENT_MODE = os.getenv('PAYMENT_MODE', 'mock').lower()
CINETPAY_API_KEY = os.getenv('CINETPAY_API_KEY', '')
CINETPAY_SITE_ID = os.getenv('CINETPAY_SITE_ID', '')
CINETPAY_CURRENCY = os.getenv('CINETPAY_CURRENCY', 'XOF')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')

if DEBUG:
    if PAYMENT_MODE == 'mock':
        print('Payment mode: MOCK (no real charges — portfolio demo)')
    elif CINETPAY_API_KEY and CINETPAY_SITE_ID:
        print('Payment mode: LIVE (CinetPay configured)')
    else:
        print('WARNING: PAYMENT_MODE=live but CinetPay credentials are missing')

# =============================================================================
# GOOGLE OAUTH CONFIGURATION
# =============================================================================
GOOGLE_OAUTH_CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID', '')
GOOGLE_OAUTH_CLIENT_SECRET = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET', '')

if GOOGLE_OAUTH_CLIENT_ID and DEBUG:
    print("Google OAuth configured")
elif DEBUG:
    print("WARNING: Google OAuth not configured - add GOOGLE_OAUTH_CLIENT_ID to .env")

# =============================================================================
# LOGGING — structured JSON in production, verbose in dev
# =============================================================================
logs_dir = os.path.join(BASE_DIR, 'logs')
os.makedirs(logs_dir, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'logging.Formatter',
            'format': '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json' if not DEBUG else 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(logs_dir, 'django.log'),
            'maxBytes': 10 * 1024 * 1024,  # 10 MB
            'backupCount': 5,
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
    },
    'loggers': {
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}