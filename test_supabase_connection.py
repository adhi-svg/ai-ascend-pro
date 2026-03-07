#!/usr/bin/env python3
"""Test Supabase PostgreSQL database connection."""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

def test_database_connection():
    """Test connection to Supabase PostgreSQL database."""
    try:
        from sqlalchemy import create_engine, text
        from app.core.config import settings
        
        print("=" * 60)
        print("🔍 SUPABASE DATABASE CONNECTION TEST")
        print("=" * 60)
        
        # Check configuration
        print(f"\n📋 Configuration Status:")
        print(f"   Supabase URL: {settings.SUPABASE_URL}")
        print(f"   Supabase Key: {settings.SUPABASE_KEY[:20]}..." if settings.SUPABASE_KEY else "   ❌ No key configured")
        print(f"   Database Password: {'✓ Configured' if settings.SUPABASE_DB_PASSWORD else '❌ Not configured'}")
        
        # Try connection
        print(f"\n📡 Attempting Database Connection...")
        print(f"   Database URL: {settings.DATABASE_URL[:50]}...")
        
        # Create engine
        engine = create_engine(settings.DATABASE_URL, echo=False)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"\n✅ CONNECTION SUCCESSFUL!")
            print(f"\n🐘 PostgreSQL Version:")
            print(f"   {version}")
        
        # Test if tables exist
        print(f"\n📊 Checking Database Tables...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            
            if tables:
                print(f"   Found {len(tables)} table(s):")
                for table in tables:
                    print(f"      ✓ {table}")
            else:
                print(f"   No tables found (database is empty - ready for migration)")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED - Database is Connected!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED!")
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   {str(e)}")
        print("\n" + "=" * 60)
        print("🔧 Troubleshooting:")
        print("   1. Check DATABASE_URL in backend/.env is correct")
        print("   2. Check password is correctly URL encoded (@  = %40)")
        print("   3. Verify Supabase project is not paused")
        print("   4. Test manually with psql if available:")
        print(f"      psql postgresql://...")
        print("=" * 60)
        return False

def test_supabase_client():
    """Test Supabase client initialization."""
    try:
        from app.core.supabase_client import get_supabase_client
        
        print(f"\n🔍 SUPABASE CLIENT TEST")
        print(f"   Initializing Supabase client...")
        
        client = get_supabase_client()
        
        if client:
            print(f"✅ Supabase client initialized successfully!")
            print(f"   URL: {client.url}")
            return True
        else:
            print(f"⚠️ Supabase client not initialized (credentials may be missing)")
            return False
            
    except Exception as e:
        print(f"❌ Supabase client test failed: {e}")
        return False

if __name__ == "__main__":
    print("\n")
    db_ok = test_database_connection()
    print("\n")
    client_ok = test_supabase_client()
    
    sys.exit(0 if db_ok else 1)
