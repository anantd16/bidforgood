# BidForGood – Charity Auction Backend
Node.js + Express + MongoDB (Mongoose) + Socket.io + Firebase (optional)

## Setup
1. `npm install`
2. `cp .env.example .env` and set `MONGO_URI` and `JWT_SECRET`
3. (Optional) Put Firebase service account JSON at `config/serviceAccountKey.json`
4. `npm run dev`  → http://localhost:5000

## Endpoints (base `/api`)
| Area | Endpoints |
|---|---|
| Auth | POST /auth/register, POST /auth/login, PUT /auth/fcm-token |
| Items | GET /items, GET /items/:id, POST /items, PUT /items/:id, DELETE /items/:id |
| Bids | POST /bids, GET /bids, GET /bids/item/:id |
| Auctions | GET /auctions, GET /auctions/:id, POST /auctions/:id/end (admin) |
| Winners | GET /winners, GET /winners/:id |
| Notifications | POST /notifications/send (admin) |

Protected routes need `Authorization: Bearer <token>`.

## Test flow (Thunder Client)
1. Register admin (`role: "admin"`) + two users; login to get tokens.
2. User A: POST /items `{ "title":"Painting","startingPrice":100,"durationMinutes":1 }`
3. User B: POST /bids `{ "itemId":"<id>","amount":150 }`
4. Wait 1 min (or admin POST /auctions/:id/end) → GET /winners shows winner + totalFunds.

## Socket.io
Connect with `{ auth: { token } }`. Events: emit `joinAuction(itemId)`, `placeBid({itemId, amount})`;
listen `newBid`, `auctionEnded`.
