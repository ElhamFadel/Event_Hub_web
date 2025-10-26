
# EventHub – All-in-One Project

A complete package combining the frontend, backend, and smart contract with English documentation.

## Structure
```
EventHub/
├── frontend/
├── backend/
├── smart_contract/
└── docs/
```

## Run
1) **Backend**
```bash
cd backend
npm install
npm start
# API -> http://localhost:3000/api
```
2) **Frontend**
Open `frontend/index.html` directly in your browser. The JS auto-detects the API host on port `3000`.

3) **Smart Contract (Remix)**
- Open `smart_contract/EventHubRegistry.sol` at https://remix.ethereum.org
- Compile with 0.8.20 and deploy to **JavaScript VM**
- Call `upsertEvent`, then `getEvent`, and `deleteEvent`

## Endpoints
- `POST /api/register` `{ username, password }`
- `POST /api/login` `{ username, password }` → `{ token }`
- `GET /api/events` → `[ ... ]`
- `POST /api/events` (auth) → `{ ... }`
- `DELETE /api/events/:id` (auth) → `{ ok: true }`

## Notes
- Storage is in-memory for grading/demo purposes.
- Keep frontend and backend on the same host when testing via phone/LAN.
