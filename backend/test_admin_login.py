"""Test admin login locally."""
import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models import User, UserRoleEnum
from app.core.security import hash_password, verify_password

def test_admin_login():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@fyxion.com").first()
        
        if not admin:
            print("❌ Admin user NOT found in database!")
            print("   Email: admin@fyxion.com")
            print("\nLet me check all users:")
            all_users = db.query(User).all()
            for user in all_users:
                print(f"   - {user.email} | {user.phone} | {user.role.value}")
            return False
        
        print("✅ Admin user found in database")
        print(f"   ID: {admin.id}")
        print(f"   Email: {admin.email}")
        print(f"   Phone: {admin.phone}")
        print(f"   Name: {admin.name}")
        print(f"   Role: {admin.role.value}")
        print(f"   Has password hash: {bool(admin.password_hash)}")
        
        # Test password verification
        test_password = "admin123"
        if not admin.password_hash:
            print("\n❌ Admin has NO password hash!")
            return False
        
        print(f"\nTesting password verification with: '{test_password}'")
        is_valid = verify_password(test_password, admin.password_hash)
        
        if is_valid:
            print("✅ Password verification PASSED!")
            print("\n🎉 Admin login should work!")
            return True
        else:
            print("❌ Password verification FAILED!")
            print("   This means the password hash doesn't match.")
            
            # Try creating a new hash to compare
            print(f"\n   Testing hash generation:")
            new_hash = hash_password(test_password)
            print(f"   New hash: {new_hash[:50]}...")
            print(f"   Stored hash: {admin.password_hash[:50]}...")
            
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Admin Login")
    print("=" * 60)
    result = test_admin_login()
    print("=" * 60)
    sys.exit(0 if result else 1)
