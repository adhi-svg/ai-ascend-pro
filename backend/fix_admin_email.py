"""Fix admin email in database."""
import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models import User
from app.core.security import hash_password

def fix_admin_email():
    db = SessionLocal()
    try:
        # Find admin user with old email
        admin = db.query(User).filter(User.email == "admin@fixora.com").first()
        
        if admin:
            print(f"✅ Found admin with email: {admin.email}")
            print(f"   Updating to: admin@fyxion.com")
            print(f"   Resetting password to: admin123")
            
            admin.email = "admin@fyxion.com"
            admin.password_hash = hash_password("admin123")
            db.commit()
            
            print("✅ Admin user updated successfully!")
            print("\nYou can now login with:")
            print("   Email: admin@fyxion.com")
            print("   Password: admin123")
            return True
        else:
            print("❌ Admin user with email 'admin@fixora.com' not found")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Fixing Admin Email")
    print("=" * 60)
    result = fix_admin_email()
    print("=" * 60)
    sys.exit(0 if result else 1)
