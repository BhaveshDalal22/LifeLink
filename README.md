# LifeLink — Smart Emergency Healthcare Coordination Platform

LifeLink is a full-stack demo platform that connects patients, hospitals, ambulance
drivers, and administrators to coordinate emergency care faster in Bengaluru,
Karnataka. Patients report an emergency, get matched to nearby hospitals by a
transparent rule-based scoring system, request the nearest available ambulance,
and track the response in real time.

> **Demo disclaimer:** All hospital and ambulance data shipped with this project
> (names, locations, capacities, vehicle numbers) is **fictional** and intended
> only for development and academic demonstration. LifeLink is not connected to
> real hospitals or emergency dispatch services. In a real emergency in India,
> call **108** or **112**.

---

## 1. Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React (Vite), React Router DOM, Axios, Tailwind CSS, Lucide React, React Leaflet |
| Backend   | Node.js, Express.js, JWT, bcrypt.js, CORS, dotenv |
| Database  | MySQL (`lifelink_db`) |
| Maps      | Leaflet.js + OpenStreetMap tiles, browser Geolocation API, Haversine formula |

Machine learning is **not** used anywhere in this version. Hospital
recommendations use a transparent rule-based score (specialization match +
resource availability + distance). AI-based demand forecasting is noted only as
possible future scope.

---

## 2. Project Structure

```
lifelink/
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, Sidebar, HospitalCard, MapView, ...)
│   │   ├── pages/          # public/ patient/ hospital/ ambulance/ admin/
│   │   ├── layouts/        # PublicLayout, DashboardLayout
│   │   ├── services/       # Axios API wrappers per resource
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useAuth, useGeolocation
│   │   └── utils/          # constants, haversine, status colors
│   └── package.json
├── server/                 # Express + MySQL backend
│   ├── config/db.js        # MySQL connection pool
│   ├── controllers/        # Request handlers per resource
│   ├── middleware/         # auth (JWT + role), validation, error handling
│   ├── models/              # Thin SQL query layer per table
│   ├── routes/               # Express routers
│   ├── utils/                 # haversine, rule-based recommendation engine
│   ├── app.js
│   ├── server.js
│   └── package.json
├── database/
│   ├── schema.sql           # CREATE DATABASE + all tables, FKs, indexes, constraints
│   └── seed.sql              # Demo hospitals, users, ambulances (fictional data)
├── .env.example
├── package.json              # root convenience scripts (concurrently runs both apps)
└── README.md
```

---

## 3. Prerequisites

- Node.js 18+ and npm
- MySQL 8.x (or MySQL 5.7+) running locally, with a user that can create databases
- MySQL Workbench or the `mysql` CLI (to run the schema/seed scripts)

---

## 4. Setup Instructions

### 4.1 Clone / open the project

```bash
cd lifelink
```

### 4.2 Install dependencies

From the project root, install both the backend and frontend at once:

```bash
npm run install:all
```

This runs `npm install` inside `server/` and `client/`. (Equivalent to running
`npm install` in each folder separately.)

### 4.3 Create the database

Using the MySQL CLI:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Or open `database/schema.sql` then `database/seed.sql` in MySQL Workbench and
execute them in order. This creates the `lifelink_db` database, all tables with
foreign keys/constraints/indexes, and loads fictional demo data (5 hospitals,
13 users across all roles, 5 ambulances).

### 4.4 Configure environment variables

Copy the example env file into the server folder and fill in your MySQL
credentials:

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lifelink_db

JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
```

Never commit `server/.env` — it's already excluded via `.gitignore`.

### 4.5 Run the project

From the project root, run both the backend and frontend together:

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000` (Express API under `/api`)
- **Frontend** on `http://localhost:5173` (Vite dev server)

Or run them separately in two terminals:

```bash
npm run server   # backend only (nodemon)
npm run client   # frontend only (vite)
```

Visit **http://localhost:5173** in your browser.

---

## 5. Demo Accounts

All seeded accounts use the password **`Demo@123`**.

| Role              | Email                              |
|-------------------|-------------------------------------|
| Admin             | admin@lifelink.com                  |
| Patient           | patient1@lifelink.com               |
| Patient           | patient2@lifelink.com               |
| Hospital Staff    | staff.yelahanka@lifelink.com        |
| Hospital Staff    | staff.hebbal@lifelink.com           |
| Hospital Staff    | staff.indiranagar@lifelink.com      |
| Hospital Staff    | staff.whitefield@lifelink.com       |
| Hospital Staff    | staff.electroniccity@lifelink.com   |
| Ambulance Driver  | driver1@lifelink.com – driver5@lifelink.com |

New accounts can also self-register as **Patient**, **Hospital Staff**, or
**Ambulance Driver** from the Register page. Admin accounts cannot be created
through registration — only the accounts above (or ones you manually insert
into the `users` table) have the `admin` role.

> **Linking new hospital staff to a hospital:** when a new Hospital Staff
> account registers, it isn't linked to a hospital yet. An admin must assign
> them from **Admin → Manage Hospitals → Assigned Staff** dropdown (or when
> creating a new hospital). Ambulance drivers are linked to a new demo
> ambulance automatically at registration.

---

## 6. Core Features Implemented

- Role-based auth (patient, hospital_staff, ambulance_driver, admin) with JWT +
  bcrypt, redirecting to the correct dashboard after login.
- Emergency reporting with geolocation + manual map-based fallback.
- Rule-based hospital recommendation: specialization match (50%), resource
  availability (30%), distance via Haversine formula (20%).
- Hospital search with filters (distance, type, specialization, ICU/emergency
  bed/ventilator availability, status) and a Leaflet map with color-coded pins.
- Hospital admission requests (patient → hospital staff accept/reject/arrived).
- Nearest-ambulance matching, request/cancel flow, and a full trip status flow
  for drivers (Requested → ... → Completed).
- Hospital staff capacity management with available ≤ total validation.
- Live emergency status tracking with a timeline view (polls every 8s).
- Admin dashboard with platform statistics and simple bar-chart visualizations
  (no external chart library — dependency-free `BarChart` component).
- Admin CRUD for hospitals (add/edit/verify/delete/assign staff), user
  management, and platform-wide emergency/ambulance oversight.
- Ownership-scoped authorization: patients can't read other patients'
  emergencies; hospital staff can only manage their own hospital; drivers can
  only update their own ambulance; admin-only routes are gated by role
  middleware.

---

## 7. Testing the API with Postman

1. Import the base URL `http://localhost:5000/api`.
2. Call `POST /auth/login` with a demo account to get a JWT.
3. Set `Authorization: Bearer <token>` on subsequent requests.
4. Try `GET /hospitals`, `GET /hospitals/nearby?lat=12.9716&lng=77.5946`,
   `POST /emergencies`, etc. See `server/routes/*.js` for the full route list.

Health check (no auth required): `GET http://localhost:5000/api/health`

---

## 8. Future Scope (Not Implemented)

- AI/ML-based demand forecasting for proactive hospital and ambulance capacity
  planning.
- Real-time WebSocket push updates (current tracking uses polling).
- SMS/push notifications to patients and drivers.
- Payment/insurance integration.

---

## 9. Notes for Evaluators

This project was built as an academic/college demonstration of a full-stack
role-based coordination platform. It intentionally avoids machine learning per
the project brief, using a documented, transparent rule-based scoring formula
instead. All map data, hospital names, and ambulance details are fictional.
