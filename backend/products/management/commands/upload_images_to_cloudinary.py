"""Deprecated — use migrate_images_to_r2 to upload images to Cloudflare R2."""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Deprecated. Use migrate_images_to_r2 instead."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING(
            "This command is deprecated. Run `python manage.py migrate_images_to_r2` to upload images to R2."
        ))
