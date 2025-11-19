# Prompt Catalog API

A complete RESTful API for managing prompt templates with user authentication, full-text search, favorites, and visibility control. Built with Node.js, Express, SQLite, and JWT.

## ✨ Features

- **User Authentication** (JWT + bcrypt)
- **Prompt CRUD** with public/private visibility
- **Full-text search** across title, description, and tags
- **Favorites system** (many-to-many)
- **Pagination** on all list endpoints
- **Input validation** with Joi
- **Production-ready** security (helmet, CORS, rate limiting ready)

## 🛠 Technology Stack

```
Node.js + Express
SQLite + Sequelize ORM
JWT + bcryptjs
Joi (validation)
helmet + cors (security)
```

## 🚀 Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Copy environment file**
```bash
cp .env.example .env
# Edit .env with your JWT_SECRET
```

3. **Run the server**
```bash
npm run dev
```

4. **API is available at** `http://localhost:3000`

## 📋 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Prompts (all require `Authorization: Bearer <token>`)
```
POST    /api/prompts              # Create prompt
GET     /api/prompts              # List prompts (?q=query&creator_id=1&tags=ai&skip=0&limit=20)
GET     /api/prompts/:id          # Get single prompt
PUT     /api/prompts/:id          # Update prompt (creator only)
DELETE  /api/prompts/:id          # Delete prompt (creator only)
POST    /api/prompts/:id/favorite # Add to favorites
DELETE  /api/prompts/:id/favorite # Remove from favorites
GET     /api/prompts/favorites    # Get my favorites (?skip=0&limit=20)
```

## 🗄 Database Schema

```sql
users: id, email, username, hashed_password
prompt_templates: id, title, short_description, long_description, template, inputs, tags, visibility, creator_id, created_at, updated_at
user_prompt_favorites: user_id, prompt_id (composite PK)
```

## 🌐 Example Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"testuser","password":"securepass123"}'
```

### Create Prompt
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Marketing Copy Generator",
    "short_description": "Generate marketing copy for products",
    "template": "Write a marketing email for {{product_name}} targeting {{target_audience}}",
    "tags": "marketing,email",
    "visibility": "public"
  }'
```

## 📁 Inputs YAML Format

The `inputs` field stores YAML defining prompt variables:

```yaml
- name: product_name
  type: text
  label: Product Name
  required: true
- name: target_audience
  type: select
  options:
    - label: Gamers
      value: gamers
```

## 🔒 Security Features

- JWT authentication with configurable expiry
- Password hashing (bcrypt, 12 rounds)
- Input validation (Joi schemas)
- Helmet security headers
- CORS protection
- SQL injection prevention (Sequelize)
- Visibility control (public/private prompts)

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health

# Install test tools
npm install -g artillery

# Load test
artillery quick --count 10 --num 5 http://localhost:3000/health
```

## 📈 Pagination & Filtering

All list endpoints support:
- `?skip=0&limit=20` - Pagination (max 100)
- `?q=search_term` - Full-text search
- `?creator_id=1` - Filter by user
- `?tags=ai` - Filter by tags

## ⚙ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `./database.sqlite` | SQLite database path |
| `JWT_SECRET` | Required | JWT signing secret |
| `JWT_EXPIRE_MINUTES` | `60` | Token expiry |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |

## 🐳 Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 License

MIT License