# Deployment

## Target: Hetzner VPS via Docker

## Files in this repo

- `Dockerfile` — multi-stage build (Node build → nginx serve)
- `docker-compose.yml` — single-service compose for Hetzner
- `nginx.conf` — static serving with SPA fallback
- `.dockerignore` — skip `node_modules`, `dist`, `.git`

## Local build test

```bash
docker build -t athar:local .
docker run --rm -p 8080:80 athar:local
# open http://localhost:8080
```

## Hetzner deploy (simple path)

One-time setup on the Hetzner box:

```bash
ssh user@<hetzner-ip>
sudo mkdir -p /opt/athar
sudo chown $USER:$USER /opt/athar
```

Deploy from your laptop:

```bash
# Sync source to the server
rsync -avz --exclude node_modules --exclude dist --exclude .git \
  ./ user@<hetzner-ip>:/opt/athar/

# Build + run on the server
ssh user@<hetzner-ip> "cd /opt/athar && docker compose up -d --build"
```

Result: Athar is live on port 80 (or whatever is mapped in `docker-compose.yml`).

## Hetzner deploy (slightly better path)

Build the image locally, push to GHCR or Docker Hub, pull on the server. Avoids Node build step happening on the server.

```bash
docker build -t ghcr.io/<you>/athar:latest .
docker push ghcr.io/<you>/athar:latest

ssh user@<hetzner-ip> "cd /opt/athar && docker compose pull && docker compose up -d"
```

## nginx config notes

- Serves `/usr/share/nginx/html` (the built Vite output)
- SPA fallback: `try_files $uri /index.html` — React Router handles the route
- Cache-control: long TTL for hashed assets in `/assets/`, no-cache for `index.html`
- Gzip enabled; brotli can be added at reverse-proxy level if you have Caddy/Traefik in front

## TLS

Handled **upstream**. Run Caddy, Traefik, or Cloudflare in front of the Docker container for HTTPS. Do not terminate TLS inside the nginx image — keep that layer simple.

Example Caddy (`/etc/caddy/Caddyfile`):

```
athar.example.com {
  reverse_proxy localhost:8080
}
```

## Future: CI/CD

Out of scope for v1. When ready:
- GitHub Actions → build Docker image → push to `ghcr.io`
- Hetzner pulls via cron or webhook, `docker compose up -d`
- Slack / email notification on deploy
