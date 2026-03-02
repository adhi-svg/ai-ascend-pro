"""AWS SNS integration for emergency alerts."""
import boto3
import json
import logging
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class SNSManager:
    """Manages SNS messages for emergency alerts."""
    
    def __init__(self):
        self.enabled = settings.ENABLE_SNS_ALERTS and settings.AWS_SNS_TOPIC_ARN
        if self.enabled:
            self.sns_client = boto3.client(
                'sns',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            self.topic_arn = settings.AWS_SNS_TOPIC_ARN
    
    def publish_emergency_alert(
        self,
        booking_id: str,
        severity: str,
        location: str,
        latitude: float,
        longitude: float,
        description: Optional[str] = None,
        customer_name: Optional[str] = None,
        customer_phone: Optional[str] = None
    ) -> Optional[str]:
        """
        Publish emergency booking alert to SNS topic.
        
        Args:
            booking_id: Booking ID
            severity: Alert severity (LOW, MEDIUM, HIGH, CRITICAL)
            location: Location string
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            description: Additional description
            customer_name: Customer name
            customer_phone: Customer phone number
            
        Returns:
            Message ID from SNS or None on failure
        """
        if not self.enabled:
            # Log simulated alert
            logger.warning(f"[SIMULATED ALERT] Emergency: {severity} - Booking {booking_id} at {location}")
            return f"simulated-{booking_id}"
        
        try:
            message = {
                "booking_id": booking_id,
                "severity": severity,
                "location": location,
                "latitude": latitude,
                "longitude": longitude,
                "description": description or "",
                "customer_name": customer_name or "Unknown",
                "customer_phone": customer_phone or "Unknown",
                "alert_type": "EMERGENCY_BOOKING"
            }
            
            response = self.sns_client.publish(
                TopicArn=self.topic_arn,
                Subject=f"Emergency Alert - Severity: {severity}",
                Message=json.dumps(message, default=str),
                MessageAttributes={
                    'severity': {'DataType': 'String', 'StringValue': severity},
                    'booking_id': {'DataType': 'String', 'StringValue': booking_id},
                    'alert_type': {'DataType': 'String', 'StringValue': 'EMERGENCY_BOOKING'}
                }
            )
            
            message_id = response['MessageId']
            logger.info(f"✓ Emergency alert published to SNS: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"SNS publish failed: {str(e)}")
            # Fallback: Log as simulated alert
            logger.warning(f"[FALLBACK] Emergency: {severity} - Booking {booking_id} at {location}")
            return None
    
    def publish_custom_alert(self, subject: str, message: Dict[str, Any]) -> Optional[str]:
        """
        Publish custom alert to SNS topic.
        
        Args:
            subject: Message subject
            message: Message content as dict
            
        Returns:
            Message ID from SNS or None on failure
        """
        if not self.enabled:
            logger.warning(f"[SIMULATED] {subject}: {message}")
            return "simulated-alert"
        
        try:
            response = self.sns_client.publish(
                TopicArn=self.topic_arn,
                Subject=subject,
                Message=json.dumps(message, default=str)
            )
            
            message_id = response['MessageId']
            logger.info(f"✓ Alert published to SNS: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"SNS publish failed: {str(e)}")
            logger.warning(f"[FALLBACK] {subject}: {message}")
            return None


# Singleton instance
sns_manager = SNSManager()
