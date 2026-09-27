dnf update -y
dnf install -y docker
systemctl enable --now docker


# reemplazar variables al momento de cargar el archivo
REGISTRY=registry.gitlab.com
BACKEND_IMAGE=registry.gitlab.com/cbpaguay17/uce/puyu-backend:latest
DEPLOY_USER='puyu-backend'
DEPLOY_TOKEN='<token-con-permiso-de-lectura-de-container-registry>'

echo "$DEPLOY_TOKEN" | docker login $REGISTRY -u "$DEPLOY_USER" --password-stdin

docker run -d --name puyu-backend --restart always -p 3000:3000 \
  -e DB_HOST=<ENDPOINT_RDS> \
  -e DB_SSL=true \
  -e DB_DATABASE=<nombre_db> \
  -e DB_PORT=<puerto_db> \
  -e DB_USERNAME=<usuario_db> \
  -e DB_PASSWORD=<password_db> \
  -e JWT_SECRET=<tu_secreto_jwt_super_seguro_aqui> \
  -e JWT_EXPIRES_IN=600s \
  -e GEMINI_API_KEY=<tu_gemini_api_key_aqui> \
  -e GEMINI_MODEL=gemini-2.5-flash \
  -e TELEGRAM_BOT_TOKEN=<tu_telegram_bot_token_aqui> \
  -e TELEGRAM_CHAT_ID=<tu_telegram_chat_id_aqui> \
  -e IA_CRON_INTERVAL_MINUTES=20 \
  $BACKEND_IMAGE
