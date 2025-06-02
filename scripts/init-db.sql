-- MarketProbe 2.0 Database Initialization Script
-- This runs when the PostgreSQL container starts for the first time

-- Create additional databases for testing
CREATE DATABASE marketprobe_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE marketprobe_dev TO dev;
GRANT ALL PRIVILEGES ON DATABASE marketprobe_test TO dev;

-- Enable extensions that we might need
\c marketprobe_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

\c marketprobe_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
