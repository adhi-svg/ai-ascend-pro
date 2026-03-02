"""Test to list available Gemini models"""
import os
import google.generativeai as genai

# Load API key from env
genai.configure(api_key="MY_GOOGLE_API_KEY")

print("Available Gemini models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"  - {model.name}")
