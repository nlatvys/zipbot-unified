# Mock ListCastAI — FastAPI

## Quick start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8081
# -> http://localhost:8081
```

## Test
```bash
curl -s -X POST http://localhost:8081/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -d '{
    "zip":"33606",
    "prompt":"set up new water service",
    "history":[{"role":"user","content":"hello"}],
    "context":{"pilot_links":{"utilities":[{"label":"City of Tampa Water","url":"https://www.tampa.gov/water"}]}}
  }' | jq .
```
