#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

PORT="${PORT:-8000}"
WORKERS="${WEB_CONCURRENCY:-1}"

echo "Starting Gunicorn on port ${PORT} with ${WORKERS} worker(s)..."
exec gunicorn \
  --bind "0.0.0.0:${PORT}" \
  --workers "${WORKERS}" \
  --threads 2 \
  --worker-class gthread \
  --timeout 120 \
  --worker-tmp-dir /dev/shm \
  --access-logfile - \
  --error-logfile - \
  nexshop.wsgi:application
