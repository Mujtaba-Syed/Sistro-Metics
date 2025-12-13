# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entrypoint script first (for better caching)
COPY entrypoint.sh /app/entrypoint.sh

# Copy project files
COPY . /app/

# Make scripts executable
RUN chmod +x /app/entrypoint.sh /app/scripts/dev.sh /app/scripts/prod.sh

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
