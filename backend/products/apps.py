import logging
import os
import threading

from django.apps import AppConfig

logger = logging.getLogger(__name__)


def _seed_if_empty():
    """Seed catalog in background when Render DB is empty (free tier has no Shell)."""
    try:
        from django.core.management import call_command
        from products.models import Product

        if Product.objects.exists():
            return

        if not os.environ.get('SUPABASE_URL') or not os.environ.get('SUPABASE_SERVICE_KEY'):
            logger.warning(
                'AUTO_SEED_DB: database is empty but SUPABASE_URL / '
                'SUPABASE_SERVICE_KEY are missing — cannot seed images.'
            )
            return

        logger.info('AUTO_SEED_DB: empty database — seeding products and Supabase images…')
        call_command('seed_products')
        logger.info('AUTO_SEED_DB: seeding finished.')
    except Exception:
        logger.exception('AUTO_SEED_DB: seeding failed')


class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'

    def ready(self):
        # Render free tier has no Shell — auto-seed once when DB is empty.
        if os.environ.get('RENDER') != 'true':
            return
        if os.environ.get('AUTO_SEED_DB', 'true').lower() not in ('true', '1', 'yes'):
            return
        threading.Thread(target=_seed_if_empty, daemon=True).start()
