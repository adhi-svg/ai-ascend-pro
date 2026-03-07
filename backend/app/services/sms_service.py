"""
SMS Service for OTP Delivery
Supports multiple providers: MSG91, Twilio, AWS SNS
"""
import requests
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from enum import Enum

logger = logging.getLogger(__name__)


class SMSProvider(Enum):
    """Supported SMS providers."""
    MSG91 = "msg91"
    TWILIO = "twilio"
    AWS_SNS = "aws_sns"
    MOCK = "mock"  # For development/testing


class SMSService:
    """Unified SMS service supporting multiple providers."""
    
    def __init__(self, provider: Optional[SMSProvider] = None):
        self.provider = provider or self._get_default_provider()
        logger.info(f"SMS Service initialized with provider: {self.provider.value}")
    
    def _get_default_provider(self) -> SMSProvider:
        """Determine SMS provider from environment."""
        if hasattr(settings, 'MSG91_API_KEY') and settings.MSG91_API_KEY:
            return SMSProvider.MSG91
        elif hasattr(settings, 'TWILIO_ACCOUNT_SID') and settings.TWILIO_ACCOUNT_SID:
            return SMSProvider.TWILIO
        elif hasattr(settings, 'AWS_ACCESS_KEY_ID') and settings.AWS_ACCESS_KEY_ID:
            return SMSProvider.AWS_SNS
        else:
            logger.warning("No SMS provider configured, using MOCK mode")
            return SMSProvider.MOCK
    
    def send_otp(self, phone: str, otp: str, expiry_minutes: int = 15) -> Dict[str, Any]:
        """
        Send OTP to phone number.
        
        Args:
            phone: Phone number (with or without country code)
            otp: OTP code to send
            expiry_minutes: OTP validity in minutes
        
        Returns:
            Dict with success status and message_id
        """
        # Normalize phone number (remove spaces, dashes, etc.)
        phone = self._normalize_phone(phone)
        
        # Create message
        message = self._format_otp_message(otp, expiry_minutes)
        
        # Send based on provider
        if self.provider == SMSProvider.MSG91:
            return self._send_via_msg91(phone, otp)
        elif self.provider == SMSProvider.TWILIO:
            return self._send_via_twilio(phone, message)
        elif self.provider == SMSProvider.AWS_SNS:
            return self._send_via_aws_sns(phone, message)
        else:  # MOCK
            return self._send_mock(phone, otp, message)
    
    def send_notification(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Send general SMS notification.
        
        Args:
            phone: Phone number
            message: Message to send
        
        Returns:
            Dict with success status
        """
        phone = self._normalize_phone(phone)
        
        if self.provider == SMSProvider.MSG91:
            return self._send_notification_msg91(phone, message)
        elif self.provider == SMSProvider.TWILIO:
            return self._send_via_twilio(phone, message)
        elif self.provider == SMSProvider.AWS_SNS:
            return self._send_via_aws_sns(phone, message)
        else:  # MOCK
            return self._send_mock(phone, "", message)
    
    # ===== MSG91 Implementation =====
    def _send_via_msg91(self, phone: str, otp: str) -> Dict[str, Any]:
        """Send OTP via MSG91."""
        try:
            url = "https://api.msg91.com/api/v5/otp"
            payload = {
                "template_id": settings.MSG91_OTP_TEMPLATE_ID,
                "mobile": f"91{phone}",
                "otp": otp,
            }
            headers = {
                "authkey": settings.MSG91_API_KEY,
                "content-type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"MSG91: OTP sent to {phone}")
                return {
                    "success": True,
                    "message_id": result.get("request_id"),
                    "provider": "msg91"
                }
            else:
                logger.error(f"MSG91 error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": response.text,
                    "provider": "msg91"
                }
        except Exception as e:
            logger.error(f"MSG91 exception: {str(e)}")
            return {"success": False, "error": str(e), "provider": "msg91"}
    
    def _send_notification_msg91(self, phone: str, message: str) -> Dict[str, Any]:
        """Send notification via MSG91."""
        try:
            url = "https://api.msg91.com/api/v5/flow/"
            payload = {
                "flow_id": settings.MSG91_FLOW_ID,
                "sender": settings.MSG91_SENDER_ID,
                "mobiles": f"91{phone}",
                "message": message
            }
            headers = {
                "authkey": settings.MSG91_API_KEY,
                "content-type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            return {
                "success": response.status_code == 200,
                "provider": "msg91"
            }
        except Exception as e:
            logger.error(f"MSG91 notification error: {str(e)}")
            return {"success": False, "error": str(e), "provider": "msg91"}
    
    # ===== Twilio Implementation =====
    def _send_via_twilio(self, phone: str, message: str) -> Dict[str, Any]:
        """Send SMS via Twilio."""
        try:
            from twilio.rest import Client
            
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            message_obj = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=f"+91{phone}"
            )
            
            logger.info(f"Twilio: SMS sent to {phone}")
            return {
                "success": True,
                "message_id": message_obj.sid,
                "provider": "twilio"
            }
        except Exception as e:
            logger.error(f"Twilio error: {str(e)}")
            return {"success": False, "error": str(e), "provider": "twilio"}
    
    # ===== AWS SNS Implementation =====
    def _send_via_aws_sns(self, phone: str, message: str) -> Dict[str, Any]:
        """Send SMS via AWS SNS."""
        try:
            import boto3
            
            sns = boto3.client(
                'sns',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            
            response = sns.publish(
                PhoneNumber=f"+91{phone}",
                Message=message,
                MessageAttributes={
                    'AWS.SNS.SMS.SenderID': {
                        'DataType': 'String',
                        'StringValue': 'FYXION'
                    },
                    'AWS.SNS.SMS.SMSType': {
                        'DataType': 'String',
                        'StringValue': 'Transactional'
                    }
                }
            )
            
            logger.info(f"AWS SNS: SMS sent to {phone}")
            return {
                "success": True,
                "message_id": response['MessageId'],
                "provider": "aws_sns"
            }
        except Exception as e:
            logger.error(f"AWS SNS error: {str(e)}")
            return {"success": False, "error": str(e), "provider": "aws_sns"}
    
    # ===== Mock Implementation (Development) =====
    def _send_mock(self, phone: str, otp: str, message: str) -> Dict[str, Any]:
        """Mock SMS sending for development."""
        logger.info(f"MOCK SMS to {phone}")
        logger.info(f"OTP: {otp}")
        logger.info(f"Message: {message}")
        print(f"\n{'='*50}")
        print(f"📱 MOCK SMS")
        print(f"{'='*50}")
        print(f"To: +91{phone}")
        print(f"OTP: {otp}")
        print(f"Message: {message}")
        print(f"{'='*50}\n")
        
        return {
            "success": True,
            "message_id": "mock-" + str(hash(phone + otp)),
            "provider": "mock"
        }
    
    # ===== Helper Methods =====
    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number to 10 digits."""
        # Remove all non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        
        # Remove country code if present
        if phone.startswith('91') and len(phone) == 12:
            phone = phone[2:]
        
        # Validate length
        if len(phone) != 10:
            logger.warning(f"Invalid phone number length: {phone}")
        
        return phone
    
    def _format_otp_message(self, otp: str, expiry_minutes: int) -> str:
        """Format OTP message."""
        return (
            f"Your FYXION verification code is {otp}. "
            f"Valid for {expiry_minutes} minutes. "
            f"Do not share this code with anyone."
        )


# Singleton instance
sms_service = SMSService()
