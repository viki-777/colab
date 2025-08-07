# Database Setup Instructions for Digiboard

## Prerequisites
- PostgreSQL installed on your system
- Node.js and npm installed

## Setup Steps

### 1. Install PostgreSQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### 2. Create Database and User

Option A: Use the automated script (Linux/macOS):
```bash
./scripts/setup-db.sh
```

Option B: Manual setup:
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE digiboard_db;
CREATE USER digiboard_user WITH ENCRYPTED PASSWORD 'digiboard_password';
GRANT ALL PRIVILEGES ON DATABASE digiboard_db TO digiboard_user;
ALTER USER digiboard_user CREATEDB;
\q
```

### 3. Update Environment Variables

Your `.env.local` should already have:
```
DATABASE_URL="postgresql://digiboard_user:digiboard_password@localhost:5432/digiboard_db?schema=public"
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

### 5. (Optional) View Database

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `brew services list | grep postgres` (macOS)
- Check if the port 5432 is available: `sudo netstat -tlnp | grep 5432`

### Permission Issues
- Make sure the user has proper permissions
- Try connecting manually: `psql -h localhost -U digiboard_user -d digiboard_db`

### Reset Database
If you need to reset everything:
```bash
# Drop and recreate database
sudo -u postgres psql
DROP DATABASE digiboard_db;
CREATE DATABASE digiboard_db;
GRANT ALL PRIVILEGES ON DATABASE digiboard_db TO digiboard_user;
\q

# Reset Prisma
npx prisma migrate reset --force
```

## Next Steps

After setting up the database:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Sign in with Google
4. You'll be redirected to the dashboard where you can create boards!

## Features Available

- ✅ User authentication with Google
- ✅ Create whiteboards and notebooks
- ✅ Save boards to PostgreSQL database
- ✅ Real-time collaboration (existing room functionality)
- ✅ Board management dashboard
- ✅ Public/private board settings
