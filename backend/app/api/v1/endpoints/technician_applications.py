"""Technician application management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models import TechnicianApplication
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/technician-applications", tags=["technician-applications"])

# Pydantic schemas
class TechnicianApplicationCreate(BaseModel):
    fullName: str
    phone: str
    email: str
    skill: str
    experience: str
    radiusKm: str
    baseVisitFee: str
    hasShop: bool
    shopName: Optional[str] = None
    shopAddress: Optional[str] = None
    shopLocationText: Optional[str] = None
    aadhaarNumber: str
    profilePhotoUrl: Optional[str] = None
    aadhaarFrontUrl: Optional[str] = None
    aadhaarBackUrl: Optional[str] = None
    selfieUrl: Optional[str] = None

class TechnicianApplicationResponse(BaseModel):
    id: str
    fullName: str
    phone: str
    email: str
    skill: str
    experience: str
    radiusKm: str
    baseVisitFee: str
    hasShop: bool
    shopName: Optional[str] = None
    shopAddress: Optional[str] = None
    shopLocationText: Optional[str] = None
    aadhaarNumber: str
    profilePhotoUrl: Optional[str] = None
    aadhaarFrontUrl: Optional[str] = None
    aadhaarBackUrl: Optional[str] = None
    selfieUrl: Optional[str] = None
    status: str
    rejectionReason: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

@router.post("/submit", response_model=TechnicianApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_technician_application(
    app_data: TechnicianApplicationCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a technician application.
    Data is saved to Supabase PostgreSQL database.
    """
    try:
        # Create new application record
        application = TechnicianApplication(
            fullName=app_data.fullName,
            phone=app_data.phone,
            email=app_data.email,
            skill=app_data.skill,
            experience=app_data.experience,
            radiusKm=app_data.radiusKm,
            baseVisitFee=app_data.baseVisitFee,
            hasShop=app_data.hasShop,
            shopName=app_data.shopName,
            shopAddress=app_data.shopAddress,
            shopLocationText=app_data.shopLocationText,
            aadhaarNumber=app_data.aadhaarNumber,
            profilePhotoUrl=app_data.profilePhotoUrl or '/logo.png',
            aadhaarFrontUrl=app_data.aadhaarFrontUrl or '/logo.png',
            aadhaarBackUrl=app_data.aadhaarBackUrl or '/logo.png',
            selfieUrl=app_data.selfieUrl or '/logo.png',
            status='PENDING',
            rejectionReason=None,
            createdAt=datetime.utcnow()
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        print(f"[Technician Apps] New application submitted: {application.id} - {application.fullName}")
        
        return application
        
    except Exception as e:
        db.rollback()
        print(f"[Technician Apps] Error submitting application: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to submit application: {str(e)}"
        )

@router.get("/all", response_model=List[TechnicianApplicationResponse])
def get_all_applications(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all technician applications.
    Optional filter by status (PENDING, APPROVED, REJECTED).
    """
    try:
        query = db.query(TechnicianApplication)
        
        if status_filter:
            query = query.filter(TechnicianApplication.status == status_filter.upper())
        
        applications = query.order_by(TechnicianApplication.createdAt.desc()).all()
        
        return applications
        
    except Exception as e:
        print(f"[Technician Apps] Error fetching applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch applications: {str(e)}"
        )

@router.get("/{app_id}", response_model=TechnicianApplicationResponse)
def get_application(app_id: str, db: Session = Depends(get_db)):
    """Get a specific technician application by ID."""
    try:
        application = db.query(TechnicianApplication).filter(
            TechnicianApplication.id == app_id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return application
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Technician Apps] Error fetching application {app_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch application: {str(e)}"
        )

@router.patch("/{app_id}/approve")
def approve_application(app_id: str, db: Session = Depends(get_db)):
    """Approve a technician application."""
    try:
        application = db.query(TechnicianApplication).filter(
            TechnicianApplication.id == app_id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        application.status = 'APPROVED'
        application.rejectionReason = None
        db.commit()
        db.refresh(application)
        
        print(f"[Technician Apps] Application approved: {app_id}")
        
        return {
            "success": True,
            "message": f"Application {app_id} approved",
            "data": application
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[Technician Apps] Error approving application: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to approve application: {str(e)}"
        )

@router.patch("/{app_id}/reject")
def reject_application(app_id: str, reason: str = "", db: Session = Depends(get_db)):
    """Reject a technician application."""
    try:
        application = db.query(TechnicianApplication).filter(
            TechnicianApplication.id == app_id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        application.status = 'REJECTED'
        application.rejectionReason = reason
        db.commit()
        db.refresh(application)
        
        print(f"[Technician Apps] Application rejected: {app_id} - Reason: {reason}")
        
        return {
            "success": True,
            "message": f"Application {app_id} rejected",
            "data": application
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[Technician Apps] Error rejecting application: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reject application: {str(e)}"
        )
