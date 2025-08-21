from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("LISTCASTAI_API_KEY", "dev-secret")

app = FastAPI(title="mock-listcastai-fastapi")

class Msg(BaseModel):
    role: str
    content: str
    created_at: Optional[str] = None

class Link(BaseModel):
    label: str
    url: str

class Context(BaseModel):
    pilot_links: Optional[Dict[str, List[Link]]] = None

class Payload(BaseModel):
    zip: str = Field(..., description="5 digit postal code")
    prompt: str
    history: List[Msg] = []
    context: Optional[Context] = None

@app.get("/")
def health():
    return {"ok": True, "name": "mock-listcastai-fastapi"}

@app.post("/")
async def infer(payload: Payload, request: Request):
    auth = request.headers.get("authorization", "")
    if auth:
        parts = auth.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer" or parts[1] != API_KEY:
            raise HTTPException(401, "Unauthorized")
    if not (payload.zip and payload.zip.isdigit() and len(payload.zip) == 5):
        raise HTTPException(400, "zip (5 digits) is required")
    if not payload.prompt:
        raise HTTPException(400, "prompt is required")

    links = (payload.context.pilot_links if payload.context and payload.context.pilot_links else {})

    sections = []
    for key in ["schools","utilities","dmv","taxes","parks","listings"]:
        items = links.get(key) or []
        if items:
            top = "\n".join([f"• {it['label']}: {it['url']}" for it in items[:2]])
            sections.append(f"\n{key.upper()}\n{top}")

    text = (
        f"Here’s what I can find for ZIP {payload.zip} related to “{payload.prompt}”.\n"
        + "\n".join(sections)
        + "\n\nIf that’s not quite it, tell me more (e.g., “transfer electric service” or “enroll a 2nd grader”)."
    )
    return JSONResponse({"text": text})
