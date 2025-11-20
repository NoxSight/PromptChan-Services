# Docker Setup for PromptChan Services

This Docker configuration includes both backend and frontend services with the backend being proxied through the frontend.

## Architecture

- **Frontend**: Vue.js application served by Nginx (exposed on port 80)
- **Backend**: Node.js Express API (internal only, proxied via frontend)
- **Database**: SQLite database with persistent volume storage

## Quick Start

1. **Build and start the services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - API Documentation: http://localhost/api-docs
   - Health Check: http://localhost/health

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Rebuild services
```bash
docker-compose up --build
```

### Clean up (remove containers, networks, and volumes)
```bash
docker-compose down -v
```

## Network Configuration

- Only the frontend (port 80) is exposed externally
- Backend runs internally on the `app-network` 
- All API requests (`/api/*`, `/health`, `/api-docs`) are proxied from frontend to backend
- Database data persists in the `backend-data` Docker volume

## Environment Variables

Backend environment variables are configured in the docker-compose.yml file:
- `NODE_ENV=production`
- `PORT=3000`
- `DB_PATH=/app/data/database.sqlite`
- `JWT_SECRET` (change in production)
- `JWT_EXPIRE_MINUTES=60`

## Security

- Both containers run as root user as requested
- Backend is not directly accessible from outside the Docker network
- All external traffic goes through the Nginx frontend proxy