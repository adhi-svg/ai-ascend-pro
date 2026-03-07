from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, categories, technicians, bookings, complaints, earnings, 
    tracking, ai_agent, ai_chat, technician_approval, support, refunds, protected_demo, s3_upload
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(technicians.router)
api_router.include_router(technician_approval.router)
api_router.include_router(bookings.router)
api_router.include_router(refunds.router)
api_router.include_router(complaints.router)
api_router.include_router(earnings.router)
api_router.include_router(tracking.router)
api_router.include_router(support.router)
api_router.include_router(ai_agent.router)
api_router.include_router(ai_chat.router)  # HACKATHON UPGRADE – AI CHAT
api_router.include_router(s3_upload.router)  # S3 Document Upload
api_router.include_router(protected_demo.router)

