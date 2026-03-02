#!/usr/bin/env python3
"""Test script for Gemini-powered AI chat endpoint."""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_ai_chat():
    """Test the AI chat endpoint."""
    endpoint = f"{BASE_URL}/api/v1/ai/chat"
    
    payload = {
        "message": "My AC is not cooling, and it's really hot inside",
        "context": {
            "user_role": "customer",
            "locale": "en-IN"
        }
    }
    
    print("\n" + "="*60)
    print("🧪 Testing FLEX AI Chat Endpoint (Gemini-Powered)")
    print("="*60)
    
    print(f"\n📤 POST {endpoint}")
    print(f"Message: {payload['message']}")
    
    try:
        response = requests.post(endpoint, json=payload, timeout=15)
        print(f"\n✅ Status Code: {response.status_code}")
        
        data = response.json()
        
        # Pretty print response
        print("\n📥 Response:")
        print(json.dumps(data, indent=2))
        
        # Analyze response
        if response.status_code == 200:
            chat_data = data.get("data", {})
            print("\n" + "="*60)
            print("📊 Response Analysis")
            print("="*60)
            print(f"Assistant: {chat_data.get('assistant_name', 'N/A')}")
            print(f"Intent: {chat_data.get('intent', 'N/A')}")
            print(f"Category: {chat_data.get('category', 'N/A')}")
            print(f"Urgency: {chat_data.get('urgency', 'N/A')}")
            print(f"Suggest Booking: {chat_data.get('suggest_booking', False)}")
            print(f"Reply: {chat_data.get('reply', 'N/A')[:100]}...")
            
            if chat_data.get('safe_steps'):
                print(f"\nSafe Steps:")
                for i, step in enumerate(chat_data['safe_steps'], 1):
                    print(f"  {i}. {step}")
            
            print("\n✅ AI Chat is working!")
        else:
            print(f"\n❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out (backend might be slow)")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend at localhost:8000")
        print("Make sure backend is running: `npm run dev` or `python -m uvicorn app.main:app --reload`")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_ai_chat()
