"""Support ticket endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import logging

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models import SupportTicket, TicketStatusEnum, User
from app.schemas.support import SupportTicketSchema, CreateSupportTicketSchema
from app.utils.responses import success_response, error_response
from app.utils.s3_manager import s3_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/support", tags=["support"])


@router.post("/ticket")
async def create_support_ticket(
    subject: str,
    description: str,
    category: Optional[str] = None,
    priority: Optional[str] = "NORMAL",
    booking_id: Optional[str] = None,
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new support ticket.
    
    Form data:
    - subject: Ticket subject
    - description: Detailed description
    - category: Optional category
    - priority: NORMAL, HIGH, URGENT
    - booking_id: Optional related booking
    - files: Optional file attachments
    """
    try:
        # Upload files if provided
        attachment_urls = []
        for file in files:
            try:
                file_data = await file.read()
                url = s3_manager.upload_file(file_data, file.filename, folder="support-tickets")
                if url:
                    attachment_urls.append(url)
            except Exception as e:
                logger.warning(f"File upload failed: {str(e)}")
        
        # Create ticket
        ticket = SupportTicket(
            user_id=current_user["id"],
            booking_id=booking_id,
            subject=subject,
            description=description,
            category=category,
            priority=priority,
            status=TicketStatusEnum.OPEN,
            attachment_urls="|".join(attachment_urls) if attachment_urls else None
        )
        
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        logger.info(f"✓ Support ticket created: {ticket.id}")
        
        return success_response(
            data=SupportTicketSchema.from_orm(ticket).dict(),
            message="Support ticket created successfully"
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Ticket creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")


@router.get("/tickets")
async def get_user_tickets(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get support tickets for current user.
    
    Query params:
    - status: Filter by status (open/in_progress/resolved/closed)
    """
    query = db.query(SupportTicket).filter(SupportTicket.user_id == current_user["id"])
    
    if status:
        try:
            query = query.filter(SupportTicket.status == TicketStatusEnum[status.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status")
    
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    
    return success_response(
        data=[SupportTicketSchema.from_orm(t).dict() for t in tickets],
        message=f"Found {len(tickets)} tickets"
    )


@router.get("/ticket/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get specific support ticket."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Check authorization
    if current_user["id"] != ticket.user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return success_response(
        data=SupportTicketSchema.from_orm(ticket).dict(),
        message="Ticket retrieved"
    )


@router.get("/all", dependencies=[Depends(require_role(["admin"]))])
async def get_all_tickets(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all support tickets (admin only).
    
    Query params:
    - status: Filter by status
    """
    query = db.query(SupportTicket)
    
    if status:
        try:
            query = query.filter(SupportTicket.status == TicketStatusEnum[status.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status")
    
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    
    return success_response(
        data=[SupportTicketSchema.from_orm(t).dict() for t in tickets],
        message=f"Found {len(tickets)} tickets"
    )


@router.patch("/ticket/{ticket_id}/resolve", dependencies=[Depends(require_role(["admin"]))])
async def resolve_ticket(
    ticket_id: str,
    resolution: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark ticket as resolved with resolution text."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = TicketStatusEnum.RESOLVED
    ticket.resolution = resolution
    ticket.resolved_at = datetime.utcnow()
    ticket.assigned_admin_id = current_user["id"]
    ticket.updated_at = datetime.utcnow()
    
    db.add(ticket)
    db.commit()
    
    logger.info(f"✓ Ticket resolved: {ticket.id}")
    
    return success_response(
        data={"ticket_id": ticket.id, "status": ticket.status},
        message="Ticket resolved"
    )


@router.patch("/ticket/{ticket_id}/close", dependencies=[Depends(require_role(["admin"]))])
async def close_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Close a ticket."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = TicketStatusEnum.CLOSED
    ticket.updated_at = datetime.utcnow()
    
    db.add(ticket)
    db.commit()
    
    return success_response(
        data={"ticket_id": ticket.id, "status": ticket.status},
        message="Ticket closed"
    )


@router.patch("/ticket/{ticket_id}/status", dependencies=[Depends(require_role(["admin"]))])
async def update_ticket_status(
    ticket_id: str,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update ticket status."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    try:
        ticket.status = TicketStatusEnum[new_status.upper()]
        ticket.updated_at = datetime.utcnow()
        db.add(ticket)
        db.commit()
        
        return success_response(
            data={"ticket_id": ticket.id, "status": ticket.status},
            message="Status updated"
        )
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid status")
