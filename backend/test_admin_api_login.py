"""Test admin login via API endpoint."""
import requests
import json

def test_admin_api_login():
    url = "http://localhost:8000/api/v1/auth/login"
    
    payload = {
        "email": "admin@fyxion.com",
        "password": "admin123"
    }
    
    print(f"Testing POST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                token = data.get("data", {}).get("access_token")
                user = data.get("data", {}).get("user", {})
                
                print(f"\n✅ Login successful!")
                print(f"   User: {user.get('name')} ({user.get('email')})")
                print(f"   Role: {user.get('role')}")
                print(f"   Token: {token[:50]}...")
                return True
            else:
                print(f"\n❌ Login failed: {data.get('message')}")
                return False
        else:
            print(f"\n❌ HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server!")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Admin API Login")
    print("=" * 60)
    result = test_admin_api_login()
    print("=" * 60)
