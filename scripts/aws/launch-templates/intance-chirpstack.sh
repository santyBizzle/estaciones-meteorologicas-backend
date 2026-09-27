dnf update -y
dnf install -y docker git
systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

git clone https://github.com/chirpstack/chirpstack-docker.git
cd chirpstack-docker

sed -i 's/"8080:8080"/"80:8080"/g' docker-compose.yml

docker compose up -d
