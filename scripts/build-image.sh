#!/bin/bash
cd "$(dirname "$0")" || exit

BACKEND_IMAGE="registry.gitlab.com/cbpaguay17/uce/puyu-backend:latest"

echo "Creando imagen Backend"
docker build --no-cache -t "$BACKEND_IMAGE" ../
