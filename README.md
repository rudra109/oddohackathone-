# VendorBridge - Hackathon Setup

## 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Make sure you have a local PostgreSQL server running, then update `.env` `DATABASE_URL`.
4. `npx prisma migrate dev --name init`
5. `npm run db:seed`
6. `npm run dev`

## 2. Python AI Service Setup
1. `cd ai`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload --port 8000`

## 3. Demo Info
- Admin: admin@vendorbridge.com / password123
- Officer: officer@vendorbridge.com / password123
- Manager: manager@vendorbridge.com / password123
- Vendor: vendor@furnico.com / password123
