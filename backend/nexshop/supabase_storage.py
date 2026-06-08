"""
Custom Django storage backend for Supabase Storage (REST API).
Uses Supabase's HTTP API directly — more reliable than S3 compatibility layer.
"""
import os
import mimetypes
import requests
from django.core.files.storage import Storage
from django.conf import settings
from django.utils.deconstruct import deconstructible


@deconstructible
class SupabaseStorage(Storage):
    """
    Stores files in Supabase Storage via the REST API.
    Files are publicly accessible via CDN URL — permanent regardless of host.
    """

    def __init__(self):
        self.project_url = getattr(settings, 'SUPABASE_URL', '')
        self.service_key = getattr(settings, 'SUPABASE_SERVICE_KEY', '')
        self.bucket = getattr(settings, 'SUPABASE_BUCKET', 'media')

    @property
    def _headers(self):
        return {
            'Authorization': f'Bearer {self.service_key}',
            'apikey': self.service_key,
        }

    def _api(self, path=''):
        return f'{self.project_url}/storage/v1/object/{self.bucket}/{path}'

    def _save(self, name, content):
        content.seek(0)
        data = content.read()
        mime = mimetypes.guess_type(name)[0] or 'application/octet-stream'

        url = self._api(name)
        headers = {**self._headers, 'Content-Type': mime, 'x-upsert': 'true'}
        resp = requests.post(url, data=data, headers=headers, timeout=30)

        if resp.status_code not in (200, 201):
            raise IOError(f"Supabase upload failed ({resp.status_code}): {resp.text}")

        return name

    def _open(self, name, mode='rb'):
        url = self.url(name)
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        from django.core.files.base import ContentFile
        return ContentFile(resp.content, name=name)

    def delete(self, name):
        url = self._api(name)
        requests.delete(url, headers=self._headers, timeout=15)

    def exists(self, name):
        # Always return False — let Supabase handle overwrites via x-upsert
        return False

    def url(self, name):
        base = getattr(settings, 'MEDIA_URL', '/media/')
        return f'{base.rstrip("/")}/{name.lstrip("/")}'

    def size(self, name):
        return 0

    def listdir(self, path):
        return [], []
