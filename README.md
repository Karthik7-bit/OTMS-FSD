# Organ Transplant Management System

A full-stack web application for managing organ donors, recipients, organ inventory, transplant requests, recipient matching, allocation, hospitals, notifications, and administrative monitoring.

## Features
- Donor and Recipient Management
- Organ Inventory
- Transplant Requests & Waiting List
- Matching Engine
- Allocation Workflow
- Transplant Tracking

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB 6.0 (Replica Set `rs0` for multi-document ACID transactions), Prisma ORM
- Cache: Redis 7
- Infrastructure: Docker, Docker Compose

## Full Project Documentation
For a complete architectural overview, schema definitions, matching algorithm details, API specifications, and testing accounts, see:
- [PROJECT_DESCRIPTION.md](file:///c:/Users/Karthikeyan/OneDrive/Desktop/Organ%20Transplant%20Management/PROJECT_DESCRIPTION.md)

## Quick Start

1. Ensure `.env` is configured (using MongoDB URL `mongodb://mongo:27017/organ_transplant?replicaSet=rs0`).
2. Run `docker compose up -d --build`.
3. Open `http://localhost:5173`.
   - **Doctor:** `doctor@otms.com` / `password123`
   - **Admin:** `admin@otms.com` / `admin123`
   *(Interactive 1-click RBAC role selector available on `/login`)*
