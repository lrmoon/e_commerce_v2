# SPECIFIC version for stability & slim for security/size
# Change your Dockerfile to use Python 3.9 instead of 3.11
FROM python:3.9-slim-bullseye

# Set environment variables for Python optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Create a non-root user for security (CRITICAL for production)
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --gid 1001 --no-create-home app

WORKDIR /app

# Copy ONLY requirements first for optimal Docker layer caching
COPY --chown=app:app requirements.txt .

# Install dependencies as root (necessary for system packages)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc python3-dev && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get remove -y gcc python3-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Copy application code as the non-root user
COPY --chown=app:app . .

# Collect static files (adjust path if needed)
RUN python manage.py collectstatic --noinput

# Switch to the non-root user for execution
USER app

# Use Gunicorn with production-ready settings
CMD ["gunicorn", "e_commerce_v2.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--worker-class", "sync", \
     "--timeout", "60", \
     "--preload"]