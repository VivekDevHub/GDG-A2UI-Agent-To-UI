import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from agent import ADKRestaurantAgent

load_dotenv()

app = FastAPI(
    title="Google A2UI Restaurant ADK Agent",
    description="Agent Development Kit Backend for Google A2UI Material UI Demo",
    version="1.0.0"
)

# Enable CORS for React Frontend (localhost:5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = ADKRestaurantAgent()

class AgentMessageRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    event: Optional[Any] = None
    context: Optional[Dict[str, Any]] = None

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Google A2UI ADK Agent",
        "supported_spec": "v0.9",
        "catalog": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
    }

@app.post("/agent/message")
async def handle_message(req: AgentMessageRequest):
    """Unified handler: passes conversational prompts & UI events to the live Google ADK agent."""
    try:
        # 1. Normalize user message / query
        user_input = req.message or req.query

        # 2. Normalize UI action event & context
        event_name = ""
        context = req.context or {}

        if isinstance(req.event, dict):
            event_name = req.event.get("eventName", "")
            context = { **context, **req.event.get("context", {}) }
        elif isinstance(req.event, str):
            event_name = req.event

        # 3. Invoke unified ADK Agent
        return await agent.handle_message(
            message=user_input,
            event_name=event_name,
            context=context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10002))
    print(f"🚀 Starting Google A2UI ADK Server on http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
