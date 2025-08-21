# Mock ListCastAI — Express

## Quick start
```bash
cp .env.example .env
npm install
npm run dev
# -> http://localhost:8080
```

## Test
```bash
curl -s -X POST http://localhost:8080/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -d '{
    "zip":"33606",
    "prompt":"set up new water service",
    "history":[{"role":"user","content":"hello"}],
    "context":{"pilot_links":{"utilities":[{"label":"City of Tampa Water","url":"https://www.tampa.gov/water"}]}}
  }' | jq .
```
