from app.core.database import SessionLocal, init_db
from app.models import Category, User, Technician, UserRoleEnum, TechnicianStatusEnum, Booking, BookingStatusEnum
from app.core.security import hash_password
import json
from datetime import datetime

def seed_categories():
    """Seed default categories at startup."""
    db = SessionLocal()
    try:
        default_categories = [
            {"name": "AC", "description": "Air Conditioning Services"},
            {"name": "Electrician", "description": "Electrical Services"},
            {"name": "Plumbing", "description": "Plumbing Services"},
            {"name": "Cleaning", "description": "House Cleaning Services"},
            {"name": "Painting", "description": "Painting Services"},
        ]
        
        for cat_data in default_categories:
            existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                cat = Category(
                    name=cat_data["name"],
                    description=cat_data["description"]
                )
                db.add(cat)
        db.commit()
    finally:
        db.close()

def seed_demo_data():
    """Seed demo data for testing."""
    db = SessionLocal()
    try:
        # Create demo admin if not exists
        admin = db.query(User).filter(User.phone == "1234567890").first()
        if not admin:
            admin = User(
                phone="1234567890",
                password_hash=hash_password("admin123"),
                name="System Admin",
                email="admin@fyxion.com",
                role=UserRoleEnum.ADMIN
            )
            db.add(admin)

        # Create demo customer
        demo_customer = db.query(User).filter(User.phone == "9000000001").first()
        if not demo_customer:
            demo_customer = User(
                phone="9000000001",
                password_hash=hash_password("customer123"),
                name="John Doe",
                email="customer@demo.com",
                role=UserRoleEnum.CUSTOMER
            )
            db.add(demo_customer)
            db.flush()
        
        # Create multiple demo technicians
        demo_technicians = [
            {
                "phone": "9100000001",
                "name": "Tech Pro",
                "email": "tech@demo.com",
                "skills": ["AC", "Electrician"],
                "rating": 4.8,
                "city": "Delhi"
            },
            {
                "phone": "9100000002",
                "name": "Raj Kumar",
                "email": "raj@demo.com",
                "skills": ["Plumbing", "AC"],
                "rating": 4.6,
                "city": "Delhi"
            }
        ]
        
        for tech_data in demo_technicians:
            existing_user = db.query(User).filter(User.phone == tech_data["phone"]).first()
            if not existing_user:
                u = User(
                    phone=tech_data["phone"],
                    password_hash=hash_password("tech123"),
                    name=tech_data["name"],
                    email=tech_data["email"],
                    role=UserRoleEnum.TECHNICIAN
                )
                db.add(u)
                db.flush()
                
                t = Technician(
                    user_id=u.id,
                    status=TechnicianStatusEnum.APPROVED,
                    skills=json.dumps(tech_data["skills"]),
                    rating=tech_data["rating"],
                    rating_count=20,
                    total_jobs=15,
                    city=tech_data["city"],
                    is_online=True
                )
                db.add(t)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {str(e)}")
    finally:
        db.close()
