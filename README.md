# RateHub — Store Rating Platform

A full-stack web application where users can submit ratings (1–5) for registered stores.

## Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Frontend:** React.js

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # PostgreSQL pool
│   │   ├── controllers/          # authController, adminController, storeController, ownerController
│   │   ├── middleware/           # auth.js (JWT), validate.js
│   │   ├── migrations/           # 001_init.sql, run.js
│   │   ├── routes/               # auth.js, admin.js, stores.js
│   │   └── index.js              # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/           # Layout, Modal, ProtectedRoute, SortableTable, StarRating
    │   ├── context/AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── admin/            # Dashboard, Users, Stores
    │   │   ├── user/             # Stores
    │   │   ├── owner/            # Dashboard
    │   │   └── shared/           # ChangePassword
    │   ├── styles/global.css
    │   ├── utils/api.js
    │   ├── utils/validators.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## Setup Instructions

### 1. PostgreSQL — Create the Database

```sql
CREATE DATABASE store_rating_db;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
node src/migrations/run.js   # Creates tables + seeds default admin
npm run dev                  # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start                    # Starts on http://localhost:3000
```

---

## Default Admin Credentials

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@storerating.com    |
| Password | Admin@123                |

> **Note:** The seed password hash in `001_init.sql` is for the string `password`. Change it immediately after first login.

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path        | Description            | Access  |
|--------|-------------|------------------------|---------|
| POST   | /login      | Login (all roles)      | Public  |
| POST   | /signup     | Register new user      | Public  |
| PUT    | /password   | Update own password    | Any     |

### Admin (`/api/admin`)
| Method | Path         | Description               |
|--------|--------------|---------------------------|
| GET    | /dashboard   | Stats (users/stores/ratings) |
| GET    | /users       | List users (filter+sort)  |
| POST   | /users       | Create user               |
| GET    | /users/:id   | User detail               |
| GET    | /stores      | List stores (filter+sort) |
| POST   | /stores      | Create store              |

### Stores (`/api/stores`)
| Method | Path                   | Description               | Role         |
|--------|------------------------|---------------------------|--------------|
| GET    | /                      | List stores with ratings  | user         |
| POST   | /:storeId/ratings      | Submit or update rating   | user         |
| GET    | /my-store              | Owner store dashboard     | store_owner  |

---

## User Roles

| Role          | Can Do                                                      |
|---------------|-------------------------------------------------------------|
| `admin`       | Create users/stores, view dashboard, filter all listings    |
| `user`        | Browse stores, submit/update ratings, change password       |
| `store_owner` | View own store dashboard (raters + avg rating), change password |

---

## Form Validation Rules

| Field    | Rules                                                    |
|----------|----------------------------------------------------------|
| Name     | Min 20 chars, Max 60 chars                               |
| Email    | Valid email format                                       |
| Password | 8–16 chars, at least 1 uppercase, at least 1 special char|
| Address  | Max 400 chars                                            |
| Rating   | Integer 1–5                                              |

---

## Key Features

- JWT-based authentication with role-based access control
- Sortable tables (click column headers to sort asc/desc)
- Filterable listings for admin (name, email, address, role)
- Store search for users (name, address)
- Submit and update ratings with interactive star picker
- Store owners see all raters and their average score
- Admin can assign a store to any user (auto-promotes them to store_owner)
- Password change enforced with current password verification
- All validation mirrored on both frontend and backend
