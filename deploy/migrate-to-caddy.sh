#!/bin/bash
# Run this ON THE SERVER as root to migrate from nginx-in-docker to Caddy file_server

set -e

cd /opt/rupesh-data-workers

echo "=== Backing up current configs ==="
cp Caddyfile Caddyfile.bak.$(date +%s)
cp docker-compose.yml docker-compose.yml.bak.$(date +%s)

echo "=== Writing new Caddyfile ==="
cat > Caddyfile <<'EOF'
rupeshpandey.dev {
	root * /srv/site
	file_server
	try_files {path} /index.html

	@html {
		path *.html
	}
	header @html Cache-Control "no-cache, no-store, must-revalidate"

	@assets {
		path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot *.otf *.webp *.glb *.gltf *.mp3 *.wasm
	}
	header @assets Cache-Control "public, immutable"
}

www.rupeshpandey.dev {
	redir https://rupeshpandey.dev{uri} permanent
}

eots.rupeshpandey.dev {
	reverse_proxy eots-server:8000
}
EOF

echo "=== Removing site service from docker-compose.yml ==="
# This uses a Python one-liner to safely remove the 'site:' service block
python3 <<'PYEOF'
import yaml, sys

with open('docker-compose.yml', 'r') as f:
    data = yaml.safe_load(f)

if 'site' in data.get('services', {}):
    del data['services']['site']
    print("Removed 'site' service.")
else:
    print("'site' service not found — maybe already removed.")

# Ensure caddy has the site volume mount
caddy = data['services'].get('caddy', {})
volumes = caddy.get('volumes', [])
mount = './site/dist:/srv/site'
if mount not in volumes:
    volumes.append(mount)
    caddy['volumes'] = volumes
    print("Added volume mount to caddy service.")

with open('docker-compose.yml', 'w') as f:
    yaml.dump(data, f, default_flow_style=False, sort_keys=False)

print("Updated docker-compose.yml.")
PYEOF

echo "=== Stopping and removing old site container ==="
docker stop site || true
docker rm site || true

echo "=== Restarting Caddy with new config ==="
docker compose up -d caddy

echo "=== Reloading Caddy config ==="
docker exec caddy caddy reload --config /etc/caddy/Caddyfile || docker compose restart caddy

echo "=== Pruning unused images ==="
docker image prune -f

echo "=== Done ==="
echo ""
echo "Caddy should now be serving rupeshpandey.dev directly from /opt/rupesh-data-workers/site/dist/"
