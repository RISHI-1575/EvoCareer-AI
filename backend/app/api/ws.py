from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_access_token
import json, logging

logger = logging.getLogger(__name__)
router = APIRouter()
active_connections = {}


@router.websocket("/career")
async def career_websocket(websocket: WebSocket, token: str = Query(...)):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001)
        return
    user_id = int(payload["sub"])
    await websocket.accept()
    active_connections[user_id] = websocket
    try:
        await websocket.send_json({"type": "connected", "message": "EvoCareer AI connected"})
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                else:
                    await websocket.send_json({"type": "ack", "received": msg.get("type")})
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)