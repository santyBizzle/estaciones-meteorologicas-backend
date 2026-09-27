#!/bin/bash
cd "$(dirname "$0")" || exit

BACKEND_IMAGE="registry.gitlab.com/cbpaguay17/uce/puyu-backend:latest"

echo "Realizar login al Registry"
docker login registry.gitlab.com

echo "Subiendo imagen Backend"
docker push "$BACKEND_IMAGE"
