#!/bin/bash

# Entrypoint script that runs the appropriate script based on ENVIRONMENT variable

if [ "$ENVIRONMENT" = "development" ]; then
    echo "Starting in DEVELOPMENT mode..."
    exec /app/scripts/dev.sh
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "Starting in PRODUCTION mode..."
    exec /app/scripts/prod.sh
else
    echo "ERROR: ENVIRONMENT variable must be set to either 'development' or 'production'"
    echo "Current ENVIRONMENT value: ${ENVIRONMENT:-not set}"
    exit 1
fi

