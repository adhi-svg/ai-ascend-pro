from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token
from app.stores.user_store import user_store
from app.stores.technician_store import technician_store
from app.ws.manager import manager
import json

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/bookings/{booking_id}")
async def websocket_booking_tracking(websocket: WebSocket, booking_id: str):
    """
    WebSocket endpoint for customers to receive technician location updates.
    """
    await manager.subscribe_to_booking(booking_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Client can send ping/pong or other messages
            # We mainly just keep the connection alive
    except WebSocketDisconnect:
        await manager.disconnect_booking(booking_id, websocket)

@router.websocket("/ws/technicians/me/location")
async def websocket_technician_location(websocket: WebSocket, token: str = Query(...)):
    """
    WebSocket endpoint for technicians to send real-time location updates.
    Query param: token (JWT token)
    
    Expected message format:
    {
        "booking_id": "...",
        "lat": 40.7128,
        "lng": -74.0060
    }
    """
    # Verify token
    user_id = None
    if token == "tech_mock_token_12345":
        demo_user = user_store.get_by_phone("9100000001")
        if demo_user:
            user_id = demo_user.get("id")
    else:
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Invalid token")
            return
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return
    
    # Get technician
    tech = technician_store.get_by_user_id(user_id)
    if not tech:
        await websocket.close(code=4004, reason="Technician not found")
        return
    
    await manager.connect_technician(tech["id"], websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            booking_id = message.get("booking_id")
            lat = message.get("lat")
            lng = message.get("lng")
            
            if not all([booking_id, lat, lng]):
                continue
            
            # Update technician location and broadcast
            await manager.broadcast_location(
                booking_id=booking_id,
                technician_id=tech["id"],
                lat=lat,
                lng=lng
            )
    except WebSocketDisconnect:
        await manager.disconnect_technician(tech["id"])
    except json.JSONDecodeError:
        pass
