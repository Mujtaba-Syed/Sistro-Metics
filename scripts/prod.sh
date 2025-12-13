#!/bin/bash

# Production script for Django project
# This script runs migrations, collects static files, and starts Gunicorn

set -e

echo "=== Starting Production Server ==="

# Change to Backend directory
cd /app/Backend

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn server
echo "Starting Gunicorn server on 0.0.0.0:8000..."
exec gunicorn Backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
