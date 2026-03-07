"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Determine if using local SQLite or PostgreSQL
if "postgresql" in settings.DATABASE_URL or "postgres" in settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=1800,
    )
else:
    # Use SQLite for local development
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """Initialize database tables."""
    # Import all models so they are registered with Base.metadata
    from app.models import User, Technician, Category, Booking, RefundLog, SupportTicket
    
    # Drop all tables first to ensure fresh schema with new columns
    Base.metadata.drop_all(bind=engine)
    logger.info("✓ Dropped all existing tables")
    
    # Create all tables with current schema
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Database tables initialized")

def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
