from fastapi import WebSocket
from typing import Dict, List, Set
import json

class ConnectionManager:
    def __init__(self):
        # booking_id -> set of WebSocket connections
        self.booking_subscriptions: Dict[str, Set[WebSocket]] = {}
        # technician_id -> WebSocket connection
        self.technician_connections: Dict[str, WebSocket] = {}
    
    async def subscribe_to_booking(self, booking_id: str, websocket: WebSocket):
        await websocket.accept()
        if booking_id not in self.booking_subscriptions:
            self.booking_subscriptions[booking_id] = set()
        self.booking_subscriptions[booking_id].add(websocket)
    
    async def disconnect_booking(self, booking_id: str, websocket: WebSocket):
        if booking_id in self.booking_subscriptions:
            self.booking_subscriptions[booking_id].discard(websocket)
            if not self.booking_subscriptions[booking_id]:
                del self.booking_subscriptions[booking_id]
    
    async def connect_technician(self, technician_id: str, websocket: WebSocket):
        await websocket.accept()
        self.technician_connections[technician_id] = websocket
    
    async def disconnect_technician(self, technician_id: str):
        if technician_id in self.technician_connections:
            del self.technician_connections[technician_id]
    
    async def broadcast_location(self, booking_id: str, technician_id: str, lat: float, lng: float):
        """Broadcast location to all clients subscribed to a booking."""
        if booking_id not in self.booking_subscriptions:
            return
        
        message = {
            "type": "location_update",
            "technician_id": technician_id,
            "latitude": lat,
            "longitude": lng,
        }
        
        # Send to all subscribed clients
        disconnected = []
        for websocket in self.booking_subscriptions[booking_id]:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)
        
        # Clean up disconnected clients
        for ws in disconnected:
            await self.disconnect_booking(booking_id, ws)

manager = ConnectionManager()

