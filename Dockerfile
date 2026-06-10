# Root Dockerfile for Render — builds the Django backend from monorepo root.
# Render clones the repo and runs `docker build` here (no Root Directory set).

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=nexshop.settings

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN mkdir -p logs staticfiles media \
    && python manage.py collectstatic --noinput --clear \
    && chmod +x start.sh \
    && addgroup --system django \
    && adduser --system --ingroup django django \
    && chown -R django:django /app

USER django

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://localhost:{os.environ.get(\"PORT\", \"8000\")}/api/health/', timeout=5)"

CMD ["./start.sh"]
