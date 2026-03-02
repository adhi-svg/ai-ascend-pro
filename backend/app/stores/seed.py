from app.stores.category_store import category_store
from app.stores.booking_store import booking_store
from app.stores.user_store import user_store
from app.stores.technician_store import technician_store

def seed_categories():
    """Seed default categories at startup."""
    default_categories = [
        {"name": "AC", "emoji": "❄️", "tagline": "Air Conditioning Services"},
        {"name": "Electrician", "emoji": "⚡", "tagline": "Electrical Services"},
        {"name": "Plumbing", "emoji": "🔧", "tagline": "Plumbing Services"},
        {"name": "Cleaning", "emoji": "🧹", "tagline": "House Cleaning Services"},
        {"name": "Painting", "emoji": "🎨", "tagline": "Painting Services"},
    ]
    
    for cat in default_categories:
        existing = category_store.get_by_name(cat["name"])
        if not existing:
            category_store.create(
                name=cat["name"],
                emoji=cat.get("emoji"),
                tagline=cat.get("tagline")
            )
    
    print(f"Categories seeded: {len(category_store.get_all())} categories")

def seed_demo_data():
    """Seed demo data for testing."""
    from app.core.security import hash_password
    
    # Create demo customer
    demo_customer = user_store.create(
        phone="9000000001",
        password="customer123",
        name="John Doe",
        email="customer@demo.com",
        role="customer"
    )
    
    # Create multiple demo technicians with various skills
    demo_technicians = [
        {
            "phone": "9100000001",
            "name": "Tech Pro",
            "email": "tech@demo.com",
            "skills": ["AC", "Electrician"],
            "rating": 4.8,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "city": "Delhi",
            "area": "Connaught Place"
        },
        {
            "phone": "9100000002",
            "name": "Raj Kumar",
            "email": "raj@demo.com",
            "skills": ["Plumbing", "AC"],
            "rating": 4.6,
            "latitude": 28.6289,
            "longitude": 77.2065,
            "city": "Delhi",
            "area": "Karol Bagh"
        },
        {
            "phone": "9100000003",
            "name": "Amit Singh",
            "email": "amit@demo.com",
            "skills": ["Electrician", "Painting"],
            "rating": 4.9,
            "latitude": 28.5355,
            "longitude": 77.3910,
            "city": "Noida",
            "area": "Sector 18"
        },
        {
            "phone": "9100000004",
            "name": "Priya Sharma",
            "email": "priya@demo.com",
            "skills": ["Cleaning", "Painting"],
            "rating": 4.7,
            "latitude": 28.4595,
            "longitude": 77.0266,
            "city": "Gurugram",
            "area": "DLF Phase 1"
        },
        {
            "phone": "9100000005",
            "name": "Vijay Patel",
            "email": "vijay@demo.com",
            "skills": ["AC", "Electrician", "Plumbing"],
            "rating": 4.5,
            "latitude": 28.7041,
            "longitude": 77.1025,
            "city": "Delhi",
            "area": "Rohini"
        }
    ]
    
    created_techs = []
    for tech_data in demo_technicians:
        existing_user = user_store.get_by_phone(tech_data["phone"])
        if not existing_user:
            tech_user = user_store.create(
                phone=tech_data["phone"],
                password="tech123",
                name=tech_data["name"],
                email=tech_data["email"],
                role="technician"
            )
            
            if tech_user:
                tech_profile = technician_store.create(
                    tech_user["id"], 
                    skills=tech_data["skills"]
                )
                if tech_profile:
                    # Update with additional details and set online
                    technician_store.update(
                        tech_profile["id"],
                        rating=tech_data["rating"],
                        rating_count=20,
                        total_jobs=15,
                        latitude=tech_data["latitude"],
                        longitude=tech_data["longitude"],
                        city=tech_data["city"],
                        area=tech_data["area"],
                        is_online=True,
                        shop_available=tech_data["phone"] in ["9100000001", "9100000003"]
                    )
                    created_techs.append(tech_profile)
                    print(f"Created technician: {tech_data['name']} (online: True)")

    if demo_customer and created_techs:
        demo_category = category_store.get_by_name("Electrician")
        if demo_category:
            booking = booking_store.create_with_id(
                booking_id="BK-1001",
                customer_id=demo_customer["id"],
                category_id=demo_category["id"],
                address="12 Cedar Lane, North District",
                notes="Demo booking for live tracking.",
            )
            if booking:
                booking_store.assign_technician("BK-1001", created_techs[0]["id"])
                booking_store.update("BK-1001", status="ON_THE_WAY")
    
    print(f"Demo data seeded: {len(created_techs)} technicians created")
