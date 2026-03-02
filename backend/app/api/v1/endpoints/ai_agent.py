from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.utils.responses import success_response

router = APIRouter(prefix="/ai", tags=["AI Agent"])

class ComplaintAnalysisRequest(BaseModel):
    complaint_text: str

class ComplaintAnalysisResponse(BaseModel):
    category: str
    urgency: str
    keywords: List[str]

@router.post("/analyze", response_model=dict)
async def analyze_complaint(req: ComplaintAnalysisRequest):
    """
    AI-powered complaint analysis endpoint.
    Uses keyword detection to classify complaints into categories and urgency levels.
    Cloud-ready stateless function.
    """
    complaint = req.complaint_text.lower()
    keywords = []
    category = "General"
    urgency = "normal"
    
    # Category detection (rule-based for hackathon demo)
    category_rules = {
        "AC Repair": ["ac", "air conditioner", "cooling", "compressor", "refrigerant", "hvac"],
        "Plumbing": ["plumbing", "pipe", "leak", "water", "faucet", "drain", "toilet", "sink"],
        "Electrical": ["electrical", "wiring", "power", "electricity", "socket", "switch", "light", "fan", "circuit"],
        "Appliance Repair": ["washing machine", "refrigerator", "microwave", "oven", "dishwasher", "appliance"],
        "Carpentry": ["carpenter", "furniture", "door", "window", "wood", "cabinet"],
        "Painting": ["painting", "paint", "wall", "ceiling", "color"],
        "Cleaning": ["cleaning", "clean", "sanitize", "dust", "vacuum"],
        "Pest Control": ["pest", "rats", "cockroach", "termite", "insects", "rodent"],
    }
    
    matched_category = None
    max_matches = 0
    
    for cat, words in category_rules.items():
        matches = [w for w in words if w in complaint]
        if len(matches) > max_matches:
            max_matches = len(matches)
            matched_category = cat
            keywords = matches
    
    if matched_category:
        category = matched_category
    
    # Urgency detection
    urgent_indicators = ["urgent", "emergency", "immediately", "asap", "critical", "broken", "not working", "leaking badly", "fire", "smoke", "gas leak"]
    high_indicators = ["soon", "today", "quickly", "important", "priority"]
    
    for indicator in urgent_indicators:
        if indicator in complaint:
            urgency = "urgent"
            keywords.append(indicator)
            break
    
    if urgency != "urgent":
        for indicator in high_indicators:
            if indicator in complaint:
                urgency = "high"
                if indicator not in keywords:
                    keywords.append(indicator)
                break
    
    return success_response(
        data={
            "category": category,
            "urgency": urgency,
            "keywords": list(set(keywords))[:5],  # Limit to 5 unique keywords
        },
        message="Complaint analyzed successfully"
    )
