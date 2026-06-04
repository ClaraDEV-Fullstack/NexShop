"""
Management command to migrate existing product/avatar images to Cloudflare R2.

Usage:
    python manage.py migrate_images_to_r2 [--dry-run]
"""
import requests
import tempfile
import os
from django.core.management.base import BaseCommand
from django.core.files import File


class Command(BaseCommand):
    help = "Download existing images from old URLs and re-upload them to Cloudflare R2."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Preview without uploading')

    def handle(self, *args, **options):
        from products.models import ProductImage
        from accounts.models import User

        dry_run = options['dry_run']
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no files will be uploaded."))

        migrated, skipped, failed = 0, 0, 0

        for img in ProductImage.objects.all():
            result = self._migrate_field(img, 'image', str(img), dry_run)
            if result == 'ok':
                migrated += 1
            elif result == 'skip':
                skipped += 1
            else:
                failed += 1

        for user in User.objects.exclude(avatar='').exclude(avatar=None):
            result = self._migrate_field(user, 'avatar', user.email, dry_run)
            if result == 'ok':
                migrated += 1
            elif result == 'skip':
                skipped += 1
            else:
                failed += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Migrated: {migrated} | Skipped: {skipped} | Failed: {failed}"
        ))

    def _migrate_field(self, instance, field_name, label, dry_run):
        field = getattr(instance, field_name)
        if not field:
            return 'skip'

        try:
            url = field.url
        except Exception:
            return 'skip'

        # Already on R2 or a relative path (local storage) — nothing to migrate
        if not url.startswith('http') or 'r2.dev' in url or 'cloudflarestorage' in url:
            return 'skip'

        if dry_run:
            self.stdout.write(f"  WOULD migrate: {label} — {url[:80]}")
            return 'ok'

        try:
            resp = requests.get(url, timeout=30, stream=True)
            resp.raise_for_status()

            content_type = resp.headers.get('Content-Type', 'image/jpeg')
            ext = content_type.split('/')[-1].split(';')[0].strip()
            fname = f"{field_name}_{instance.pk}.{ext}"

            with tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False) as tmp:
                for chunk in resp.iter_content(8192):
                    tmp.write(chunk)
                tmp_path = tmp.name

            with open(tmp_path, 'rb') as f:
                getattr(instance, field_name).save(fname, File(f), save=True)

            os.unlink(tmp_path)
            self.stdout.write(f"  Migrated: {label}")
            return 'ok'

        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"  Failed {label}: {exc}"))
            return 'fail'
