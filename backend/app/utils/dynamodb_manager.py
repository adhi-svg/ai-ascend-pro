"""AWS DynamoDB integration for session/cache data.

DynamoDB is used for supplementary data:
  - Real-time tracking sessions
  - Booking activity logs
  - Notification delivery tracking
  - Temporary session caches

Core relational data (Users, Bookings, Technicians) stays in PostgreSQL/SQLite.
"""
import boto3
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List

from app.core.config import settings

logger = logging.getLogger(__name__)


class DynamoDBManager:
    """Manages DynamoDB operations for supplementary data."""

    def __init__(self):
        self.enabled = settings.ENABLE_DYNAMODB and bool(settings.AWS_ACCESS_KEY_ID)
        self.prefix = settings.AWS_DYNAMODB_TABLE_PREFIX

        if self.enabled:
            self.client = boto3.client(
                "dynamodb",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
            self.resource = boto3.resource(
                "dynamodb",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
            logger.info("✓ DynamoDB client initialized")
        else:
            self.client = None
            self.resource = None
            logger.info("⊘ DynamoDB disabled — using in-memory fallback")

        # In-memory fallback for local development
        self._local_store: Dict[str, List[Dict]] = {}

    def _table_name(self, name: str) -> str:
        return f"{self.prefix}{name}"

    # ── Create tables (idempotent) ──────────────────────────────

    def ensure_tables(self):
        """Create DynamoDB tables if they don't exist. Safe to call on every startup."""
        if not self.enabled:
            return

        tables_to_create = [
            {
                "name": self._table_name("tracking_sessions"),
                "key_schema": [
                    {"AttributeName": "booking_id", "KeyType": "HASH"},
                ],
                "attribute_definitions": [
                    {"AttributeName": "booking_id", "AttributeType": "S"},
                ],
            },
            {
                "name": self._table_name("activity_logs"),
                "key_schema": [
                    {"AttributeName": "entity_id", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"},
                ],
                "attribute_definitions": [
                    {"AttributeName": "entity_id", "AttributeType": "S"},
                    {"AttributeName": "timestamp", "AttributeType": "S"},
                ],
            },
        ]

        existing = self.client.list_tables().get("TableNames", [])

        for table_def in tables_to_create:
            if table_def["name"] not in existing:
                try:
                    self.client.create_table(
                        TableName=table_def["name"],
                        KeySchema=table_def["key_schema"],
                        AttributeDefinitions=table_def["attribute_definitions"],
                        BillingMode="PAY_PER_REQUEST",
                    )
                    logger.info(f"✓ Created DynamoDB table: {table_def['name']}")
                except Exception as e:
                    logger.error(f"Failed to create table {table_def['name']}: {e}")

    # ── Tracking Sessions ───────────────────────────────────────

    def put_tracking(self, booking_id: str, lat: float, lng: float, technician_id: str) -> bool:
        """Store or update real-time tracking location."""
        item = {
            "booking_id": booking_id,
            "technician_id": technician_id,
            "latitude": str(lat),
            "longitude": str(lng),
            "updated_at": datetime.utcnow().isoformat(),
        }

        if not self.enabled:
            self._local_store.setdefault("tracking", {})[booking_id] = item
            logger.debug(f"[LOCAL] Tracking saved for booking {booking_id}")
            return True

        try:
            table = self.resource.Table(self._table_name("tracking_sessions"))
            table.put_item(Item=item)
            return True
        except Exception as e:
            logger.error(f"DynamoDB tracking put failed: {e}")
            self._local_store.setdefault("tracking", {})[booking_id] = item
            return False

    def get_tracking(self, booking_id: str) -> Optional[Dict]:
        """Get latest tracking location for a booking."""
        if not self.enabled:
            return self._local_store.get("tracking", {}).get(booking_id)

        try:
            table = self.resource.Table(self._table_name("tracking_sessions"))
            response = table.get_item(Key={"booking_id": booking_id})
            return response.get("Item")
        except Exception as e:
            logger.error(f"DynamoDB tracking get failed: {e}")
            return self._local_store.get("tracking", {}).get(booking_id)

    # ── Activity Logs ───────────────────────────────────────────

    def log_activity(self, entity_id: str, action: str, details: Optional[Dict] = None) -> bool:
        """Log an activity event (e.g., booking status change, login)."""
        item = {
            "entity_id": entity_id,
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "details": json.dumps(details or {}),
        }

        if not self.enabled:
            self._local_store.setdefault("activity", []).append(item)
            logger.debug(f"[LOCAL] Activity logged: {action} for {entity_id}")
            return True

        try:
            table = self.resource.Table(self._table_name("activity_logs"))
            table.put_item(Item=item)
            return True
        except Exception as e:
            logger.error(f"DynamoDB activity log failed: {e}")
            self._local_store.setdefault("activity", []).append(item)
            return False

    def get_activities(self, entity_id: str, limit: int = 50) -> List[Dict]:
        """Get recent activity logs for an entity."""
        if not self.enabled:
            return [
                a for a in self._local_store.get("activity", [])
                if a["entity_id"] == entity_id
            ][:limit]

        try:
            table = self.resource.Table(self._table_name("activity_logs"))
            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key("entity_id").eq(entity_id),
                ScanIndexForward=False,
                Limit=limit,
            )
            return response.get("Items", [])
        except Exception as e:
            logger.error(f"DynamoDB activity query failed: {e}")
            return []

    # ── Health Check ────────────────────────────────────────────

    def health_check(self) -> Dict[str, Any]:
        """Return DynamoDB connectivity status."""
        if not self.enabled:
            return {"status": "disabled", "fallback": "in-memory"}

        try:
            tables = self.client.list_tables()
            return {
                "status": "connected",
                "tables": [t for t in tables.get("TableNames", []) if t.startswith(self.prefix)],
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}


# Singleton instance
dynamodb_manager = DynamoDBManager()
