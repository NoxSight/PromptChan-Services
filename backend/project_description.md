# Prompt Catalog Backend

## Overview
Prompt Catalog is a comprehensive backend API for managing, sharing, and discovering AI prompt templates. Users can create, search, favorite, and organize reusable prompt templates with structured input fields for LLM applications.

## Key Features

### ✨ **Core Functionality**
- **Prompt Template Management** - Create, update, delete structured prompt templates
- **Full-Text Search** - PostgreSQL TSVector-powered search across title, description, and tags
- **Input Field System** - YAML-defined input schemas with validation, placeholders, and options
- **Template Validation** - Automatic {{ }} bracket matching and placeholder-input consistency checks

### 🔐 **Authentication & Authorization**
- **OAuth2.0 JWT** - Access tokens (30min) + Refresh tokens (7 days)
- **Secure Registration/Login** - bcrypt password hashing
- **Protected Endpoints** - Bearer token authentication for all CRUD operations

### 👥 **User Features**
- **User Profiles** - Email/username accounts with prompt ownership
- **Favorites System** - Many-to-many user-prompt favorites
- **Creator Permissions** - Only owners can edit/delete their prompts

### 🔍 **Advanced Search & Filtering**
```
GET /api/prompts?q=marketing&tags=social,sales&skip=0&limit=20
```
- Full-text search with relevance ranking
- Tag filtering (comma-separated)
- Creator filtering
- Pagination support

### 🛡️ **Visibility Control**
- **Public prompts** - Visible/searchable by all users
- **Private prompts** - Only visible to creator
- Automatic visibility filtering in all list/search operations

### 📋 **API Endpoints**

**Auth (`/api/auth`)**
```
POST /api/auth/register    # Create account
POST /api/auth/login       # Get access+refresh tokens  
POST /api/auth/refresh     # Refresh access token
```

**Prompts (`/api/prompts`)**
```
POST  /api/prompts          # Create prompt
GET   /api/prompts          # List/search prompts
GET   /api/prompts/{id}     # Get single prompt
PUT   /api/prompts/{id}     # Update (creator only)
DELETE /api/prompts/{id}    # Delete (creator only)
POST  /api/prompts/{id}/favorite   # Add to favorites
DELETE /api/prompts/{id}/favorite  # Remove from favorites
```

**Users (`/api/users`)**
```
GET /api/users/me/favorites  # User's favorited prompts
```

## 🏗️ Technology Stack
```
Framework: FastAPI (async)
Database: PostgreSQL + asyncpg
ORM: SQLAlchemy 2.0+
Migrations: Alembic
Auth: PyJWT (OAuth2.0)
Validation: Pydantic v2
Search: PostgreSQL Full-Text Search (TSVector/TSQuery)
Deployment: Uvicorn
```

## 🚀 Quick Start

1. **Copy environment**
```bash
cp backend/.env.example backend/.env
```

2. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Run migrations**
```bash
alembic upgrade head
```

4. **Start server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. **API Docs**: http://localhost:8000/docs

## 📊 Example Prompt Template

```yaml
inputs:
  - name: product_name
    type: text
    label: "Product Name"
    placeholder: "Quantum Keyboard"
    required: true
  
template: |
  Write a compelling Twitter thread about {{ product_name }} 
  targeting developers. Include 5 tweets with emojis.
```

**Interactive API**: http://localhost:8000/docs

## 🛠️ Future Enhancements
- [ ] Prompt versioning
- [ ] Categories/folders
- [ ] Usage analytics
- [ ] Export/import templates
- [ ] Frontend integration