"""SQLAlchemy database models."""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from .core.database import Base


class UserRoleEnum(str, enum.Enum):
    CUSTOMER = "customer"
    TECHNICIAN = "technician"
    ADMIN = "admin"


class TechnicianStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class BookingStatusEnum(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class RefundStatusEnum(str, enum.Enum):
    PENDING = "pending"
    INITIATED = "initiated"
    PROCESSED = "processed"
    COMPLETED = "completed"
    FAILED = "failed"


class TicketStatusEnum(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class User(Base):
    """Users table - customers, technicians, and admins."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.CUSTOMER, nullable=False)
    profile_complete = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # OAuth
    google_id = Column(String(255), unique=True, nullable=True)
    facebook_id = Column(String(255), unique=True, nullable=True)
    
    # Relationships
    technician = relationship("Technician", back_populates="user", uselist=False)
    bookings_as_customer = relationship("Booking", back_populates="customer", foreign_keys="Booking.customer_id")
    bookings_as_technician = relationship("Booking", back_populates="technician_user", foreign_keys="Booking.technician_id")
    support_tickets = relationship("SupportTicket", back_populates="user")
    refund_logs = relationship("RefundLog", back_populates="initiator")


class Technician(Base):
    """Technician profiles."""
    __tablename__ = "technicians"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Application Status
    status = Column(Enum(TechnicianStatusEnum), default=TechnicianStatusEnum.PENDING, nullable=False, index=True)
    
    # Skills and Category
    skills = Column(Text, nullable=True)  # JSON string of skills
    category_id = Column(String, nullable=True)  # Primary category
    
    # Location
    city = Column(String(100), nullable=True, index=True)
    area = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Performance Metrics
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    total_jobs = Column(Integer, default=0)
    completed_jobs = Column(Integer, default=0)
    cancelled_jobs = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)  # completed_jobs / total_jobs
    cancellation_rate = Column(Float, default=0.0)  # cancelled_jobs / total_jobs
    
    # Status
    is_online = Column(Boolean, default=False, index=True)
    is_busy = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    
    # Profile
    shop_available = Column(Boolean, default=False)
    profile_image_url = Column(String(500), nullable=True)
    documents = Column(Text, nullable=True)  # JSON string of document URLs
    
    # Performance Score (calculated)
    performance_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="technician")
    active_booking = relationship("Booking", uselist=False, foreign_keys="Booking.technician_id_active")


class Booking(Base):
    """Service bookings."""
    __tablename__ = "bookings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    technician_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    technician_id_active = Column(String, ForeignKey("technicians.id"), nullable=True)
    
    # Service Details
    category_id = Column(String, nullable=False, index=True)
    service_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    
    # Time & Pricing
    preferred_date = Column(DateTime, nullable=True, index=True)
    appointment_time = Column(String(50), nullable=True)
    duration_minutes = Column(Integer, default=60)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    actual_cost = Column(Numeric(10, 2), nullable=True)
    
    # Status & Priority
    status = Column(Enum(BookingStatusEnum), default=BookingStatusEnum.PENDING, nullable=False, index=True)
    priority = Column(String(20), default="NORMAL")  # NORMAL, HIGH, EMERGENCY
    is_emergency = Column(Boolean, default=False, index=True)
    
    # Metrics
    assignment_attempts = Column(Integer, default=0)
    
    # Cancellation
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by = Column(String(50), nullable=True)  # "customer" or "technician"
    cancelled_at = Column(DateTime, nullable=True)
    
    # Refund
    refund_status = Column(Enum(RefundStatusEnum), default=RefundStatusEnum.PENDING, nullable=True)
    refund_amount = Column(Numeric(10, 2), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = relationship("User", back_populates="bookings_as_customer", foreign_keys=[customer_id])
    technician_user = relationship("User", back_populates="bookings_as_technician", foreign_keys=[technician_id])
    emergency_log = relationship("EmergencyLog", back_populates="booking", uselist=False)
    refund_log = relationship("RefundLog", back_populates="booking", uselist=False)


class EmergencyLog(Base):
    """Emergency booking alerts and logs."""
    __tablename__ = "emergency_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"), unique=True, nullable=False, index=True)
    
    # Alert Details
    severity = Column(String(50), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=True)
    location = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # SNS Details
    sns_message_id = Column(String(255), nullable=True)
    sns_published = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    booking = relationship("Booking", back_populates="emergency_log")


class RefundLog(Base):
    """Refund transaction logs."""
    __tablename__ = "refund_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"), unique=True, nullable=False, index=True)
    initiated_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Refund Details
    amount = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(Enum(RefundStatusEnum), default=RefundStatusEnum.PENDING, nullable=False, index=True)
    
    # Processing
    processed_at = Column(DateTime, nullable=True)
    transaction_id = Column(String(255), unique=True, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    booking = relationship("Booking", back_populates="refund_log")
    initiator = relationship("User", back_populates="refund_logs")


class SupportTicket(Base):
    """Customer and Technician support tickets."""
    __tablename__ = "support_tickets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    booking_id = Column(String, nullable=True, index=True)
    
    # Ticket Details
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    priority = Column(String(20), default="NORMAL")  # LOW, NORMAL, HIGH, URGENT
    status = Column(Enum(TicketStatusEnum), default=TicketStatusEnum.OPEN, nullable=False, index=True)
    
    # Resolution
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    assigned_admin_id = Column(String, nullable=True)
    
    # Attachments
    attachment_urls = Column(Text, nullable=True)  # JSON string of URLs
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="support_tickets")


class Category(Base):
    """Service categories."""
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
