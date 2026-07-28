#!/bin/bash
# ==========================================================
# FAMS Database Initialization Script
# Enables required PostgreSQL extensions
# ==========================================================

set -e

echo "🔧 Initializing FAMS database extensions..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable PostGIS for spatial/geographic data
    CREATE EXTENSION IF NOT EXISTS postgis;

    -- Enable pgcrypto for encryption functions
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Enable uuid-ossp for UUID generation
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Verify extensions
    SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis', 'pgcrypto', 'uuid-ossp');
EOSQL

echo "✅ FAMS database extensions initialized successfully!"
