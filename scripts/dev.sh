#!/bin/bash

# Development script for Django project
# This script runs migrations and starts the Django development server

set -e

echo "=== Starting Development Server ==="

# Change to Backend directory
cd /app/Backend

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist (optional, can be removed if not needed)
# python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

# Collect static files (optional for dev, but good practice)
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

# Start Django development server
echo "Starting Django development server on 0.0.0.0:8000..."
exec python manage.py runserver 0.0.0.0:8000
