#!/bin/bash

# PostgreSQL Database Setup for Digiboard
# This script helps set up a local PostgreSQL database

echo "Setting up PostgreSQL database for Digiboard..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    echo "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    exit 1
fi

# Variables
DB_NAME="digiboard_db"
DB_USER="digiboard_user"
DB_PASSWORD="digiboard_password"

echo "Creating database and user..."

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

echo "Database setup complete!"
echo ""
echo "Update your .env.local file with:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "Then run:"
echo "npx prisma migrate dev --name init"
echo "npx prisma generate"
