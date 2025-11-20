# Database Seed Script

This seed script populates the PromptChan database with sample data for development and demonstration purposes.

## What it creates:

### Demo User Account
- **Email:** `demo@promptchan.com`
- **Username:** `demo_user`
- **Password:** `password123`

### Sample Public Prompts (7 prompts)
1. **Code Review Assistant** - Get comprehensive code reviews with feedback
2. **Creative Writing Prompt Generator** - Generate engaging writing prompts
3. **Marketing Copy Optimizer** - Transform product descriptions into compelling copy
4. **Technical Documentation Writer** - Create clear technical documentation
5. **Social Media Content Planner** - Generate weekly social media content plans
6. **Learning Path Creator** - Design comprehensive learning paths for any skill
7. **Problem-Solution Framework** - Analyze problems and generate structured solutions

## How to run:

### Using npm script:
```bash
cd backend
npm run seed
```

### Or directly:
```bash
cd backend
node src/seed.js
```

## Features:

- ✅ **Idempotent**: Safe to run multiple times (won't create duplicates)
- ✅ **Smart checks**: Detects existing users and prompts
- ✅ **Comprehensive**: Creates realistic sample data for testing
- ✅ **User-friendly**: Clear console output showing what was created

## What happens when you run it:

1. Syncs the database schema
2. Checks if demo user already exists
3. Creates demo user if needed (with hashed password)
4. Checks if prompts already exist in the database
5. Creates sample prompts if database is empty
6. Shows summary of what was created

## Example output:
```
🌱 Starting database seed...
✅ Database synced
✅ Created demo user: demo@promptchan.com
🚀 Creating sample prompts...
   ✅ Created: "Code Review Assistant"
   ✅ Created: "Creative Writing Prompt Generator"
   ✅ Created: "Marketing Copy Optimizer"
   ✅ Created: "Technical Documentation Writer"
   ✅ Created: "Social Media Content Planner"
   ✅ Created: "Learning Path Creator"
   ✅ Created: "Problem-Solution Framework"

🎉 Seed completed successfully!

📋 Demo Account Details:
   Email: demo@promptchan.com
   Password: password123
   Username: demo_user

📊 Created 7 sample prompts
```

## Notes:

- The script uses bcryptjs to properly hash the demo user's password
- All prompts are created as public and include realistic input fields
- The prompts cover diverse use cases: development, writing, marketing, documentation, etc.
- Each prompt includes comprehensive templates with placeholders for dynamic content