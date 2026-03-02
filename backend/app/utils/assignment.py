"""AI-based technician auto-assignment system."""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2
import logging

from app.models import Booking, Technician, BookingStatusEnum, TechnicianStatusEnum

logger = logging.getLogger(__name__)


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates in kilometers (Haversine formula).
    """
    R = 6371  # Earth's radius in km
    
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance


def calculate_proximity_score(booking_lat: float, booking_lon: float, 
                             tech_lat: float, tech_lon: float, 
                             max_distance_km: float = 15) -> float:
    """
    Calculate proximity score based on distance.
    
    Score: 1.0 = at location, 0.0 = outside max distance
    """
    if not (tech_lat and tech_lon):
        return 0.0
    
    distance = calculate_distance(booking_lat, booking_lon, tech_lat, tech_lon)
    
    if distance > max_distance_km:
        return 0.0
    
    # Score decreases with distance
    proximity_score = 1.0 - (distance / max_distance_km)
    return max(0.0, proximity_score)


def calculate_performance_score(technician: Technician, 
                               booking_lat: float, booking_lon: float) -> float:
    """
    Calculate overall performance score for technician.
    
    Score = (0.35 × rating) + (0.25 × completion_rate) + 
            (0.20 × cancellation_rate) + (0.20 × proximity_score)
    
    All normalized to 0-1 scale.
    """
    # Rating score (0-5 scale normalized to 0-1)
    rating_score = min(1.0, technician.rating / 5.0) if technician.rating_count > 0 else 0.5
    
    # Completion rate
    completion_rate = technician.completion_rate
    
    # Cancellation penalty (inverted: high cancellations = low score)
    cancellation_penalty = 1.0 - technician.cancellation_rate
    
    # Proximity score
    proximity_score = calculate_proximity_score(
        booking_lat, booking_lon,
        technician.latitude, technician.longitude
    )
    
    # Weighted calculation
    performance = (
        (0.35 * rating_score) +
        (0.25 * completion_rate) +
        (0.20 * cancellation_penalty) +
        (0.20 * proximity_score)
    )
    
    return performance


def get_eligible_technicians(db: Session, booking: Booking, category_id: str = None) -> List[Tuple[Technician, float]]:
    """
    Get list of eligible technicians with their performance scores.
    
    Filters:
    - status = approved
    - is_online = true
    - not currently busy
    - matches category (if provided)
    
    Returns:
        List of (technician, performance_score) tuples, sorted by score (highest first)
    """
    query = db.query(Technician).filter(
        Technician.status == TechnicianStatusEnum.APPROVED,
        Technician.is_online == True,
        Technician.is_busy == False,
        Technician.is_available == True
    )
    
    # Filter by category if provided
    if category_id:
        # Simple category filter - can be enhanced with many-to-many relationship
        query = query.filter(Technician.category_id == category_id)
    
    technicians = query.all()
    
    # Calculate performance scores
    scored_technicians = []
    for tech in technicians:
        score = calculate_performance_score(tech, booking.latitude, booking.longitude)
        scored_technicians.append((tech, score))
    
    # Sort by score (highest first)
    scored_technicians.sort(key=lambda x: x[1], reverse=True)
    
    return scored_technicians


async def assign_booking(db: Session, booking: Booking, max_attempts: int = 3) -> Tuple[bool, Optional[str]]:
    """
    Automatically assign booking to best available technician.
    
    Args:
        db: Database session
        booking: Booking to assign
        max_attempts: Maximum technicians to try assigning to
        
    Returns:
        Tuple of (success: bool, technician_id: Optional[str])
    """
    try:
        # Get category from booking (if available)
        category_id = booking.category_id if hasattr(booking, 'category_id') else None
        
        # Get eligible technicians sorted by performance
        eligible = get_eligible_technicians(db, booking, category_id)
        
        if not eligible:
            logger.warning(f"No eligible technicians found for booking {booking.id}")
            return False, None
        
        # Try to assign to top technicians
        assigned = False
        for i, (tech, score) in enumerate(eligible[:max_attempts]):
            try:
                # Update technician
                tech.is_busy = True
                tech.performance_score = score
                
                # Update booking
                booking.status = BookingStatusEnum.ASSIGNED
                booking.technician_id = tech.user_id
                booking.assignment_attempts = i + 1
                
                db.add(tech)
                db.add(booking)
                db.commit()
                
                logger.info(f"✓ Booking {booking.id} assigned to technician {tech.id} (score: {score:.2f})")
                assigned = True
                break
                
            except Exception as e:
                logger.warning(f"Assignment attempt {i+1} failed: {str(e)}")
                db.rollback()
                continue
        
        return assigned, booking.technician_id if assigned else None
        
    except Exception as e:
        logger.error(f"Auto-assignment failed: {str(e)}")
        return False, None


def update_technician_metrics(db: Session, technician_id: str, 
                             completed: bool = False, cancelled: bool = False):
    """
    Update technician performance metrics.
    
    Args:
        db: Database session
        technician_id: Technician ID to update
        completed: Job completed flag
        cancelled: Job cancelled flag
    """
    try:
        tech = db.query(Technician).filter(Technician.id == technician_id).first()
        if not tech:
            return
        
        # Update job counts
        if completed:
            tech.completed_jobs += 1
            tech.is_busy = False
        elif cancelled:
            tech.cancelled_jobs += 1
            tech.is_busy = False
        
        tech.total_jobs = tech.completed_jobs + tech.cancelled_jobs
        
        # Recalculate rates
        if tech.total_jobs > 0:
            tech.completion_rate = tech.completed_jobs / tech.total_jobs
            tech.cancellation_rate = tech.cancelled_jobs / tech.total_jobs
        
        db.add(tech)
        db.commit()
        
        logger.info(f"✓ Technician {technician_id} metrics updated")
        
    except Exception as e:
        logger.error(f"Metric update failed: {str(e)}")
        db.rollback()
