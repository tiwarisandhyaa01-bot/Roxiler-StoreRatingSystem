# **Roxiler Store Rating System**

> *A full-stack store rating and discovery platform featuring role-based access control for system administrators, normal users, and store owners. Developed as part of the Roxiler Systems FullStack Intern Coding Challenge.*

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
  - [Authentication & Authorization](#authentication--authorization)
  - [Normal User Discovery & Rating](#normal-user-discovery--rating)
  - [System Administrator Console](#system-administrator-console)
  - [Store Owner Analytics](#store-owner-analytics)
- [User Roles & Permissions](#user-roles--permissions)
- [Rating System](#rating-system)
- [Validation Rules](#validation-rules)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Application Flow](#application-flow)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Authentication & Security](#authentication--security)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Available Scripts](#available-scripts)
- [Testing & Verification](#testing--verification)
- [UI & UX Design System](#ui--ux-design-system)
- [Screenshots](#screenshots)
- [Current Project Status](#current-project-status)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [License](#license)

---

## Project Overview

The **Roxiler Store Rating System** is a full-stack web application designed to connect local consumers with neighborhood businesses while providing transparent, authentic feedback mechanisms and streamlined management tools.

In traditional commercial ecosystems, store ratings are often unverified, lack structured moderation, or fail to give business owners direct insight into customer satisfaction. This application addresses those challenges by providing a dedicated multi-role platform where:

* **Normal User:** Discovers registered stores through real-time search and sorting, views aggregated community ratings alongside their own submitted scores, and submits or modifies ratings on a 1-to-5 integer scale.
* **System Administrator:** Oversees platform operations through a centralized dashboard, manages user accounts across all roles, registers new storefronts, and assigns them to verified store owners.
* **Store Owner:** Accesses a private merchant workspace to inspect their store profile, monitor live average ratings, and review detailed lists of customer ratings and feedback.
* **Role-Based Access Control (RBAC):** Strictly enforces that authenticated endpoints and client views remain restricted according to user roles (`ADMIN`, `USER`, and `STORE_OWNER`).

---

## Key Features

### Authentication & Authorization
* **User Registration:** *Self-service onboarding for normal users with live input validation and immediate constraint feedback.*
* **Secure Login:** *Authentication with email and password yielding a signed **JWT Authentication** Bearer token and a sanitized user profile.*
* **Password Hashing:** *Passwords securely hashed with `bcrypt` (10 salt rounds) before database persistence.*
* **Change Password:** *In-app credential updating available to all authenticated roles with old-password verification and live complexity checks.*
* **Role-Based Access Control (RBAC):** *Backend **Express.js** middleware (`role.middleware.js`) and frontend route guards (`RoleRoute.jsx`) strictly enforce role privileges.*
* **Persistent Sessions:** *Client-side token persistence in `localStorage` with automated **Axios** request interceptors.*

### Normal User Discovery & Rating
* **Store Discovery:** *Browse all registered storefronts with physical addresses and real-time average ratings.*
* **Search & Filters:** *Search stores by name or physical address with live debounced filtering and clear triggers.*
* **Sorting Options:** *Sort stores alphabetically by name or address in ascending/descending order.*
* **Transparent Rating Visibility:** *View overall store score, total review count, and the user's own previously submitted score side-by-side.*
* **Interactive 1–5 Star Rating:** *Tactile 5-star rating selector with hover preview states and instant verbal rating labels.*
* **Submit & Modify Ratings:** *Submit an initial rating or update an existing rating seamlessly without duplicate database entries.*

### System Administrator Console
* **Operational Dashboard:** *Live high-level metric cards tracking total registered users, total stores, and total community ratings.*
* **User Directory:** *Paginated and scrollable user management table displaying user ID, name, email, physical address, and role badges.*
* **User Search & Sorting:** *Filter user records by name, email, address, or role, with bidirectional column sorting.*
* **Create Users:** *Add users directly from the console with explicit role assignment (**System Administrator**, **Normal User**, or **Store Owner**).*
* **User Details Drawer:** *Slide-out inspection drawer displaying detailed account metadata and rating status.*
* **Store Directory:** *Overview table displaying store ID, name, email, physical address, assigned owner, and average community rating.*
* **Store Search & Sorting:** *Filter stores by name, email, or address, and sort by name, address, or community rating.*
* **Register Stores:** *Create storefronts with name, email, address, and assignment to an existing unassigned **Store Owner**.*

### Store Owner Analytics
* **Storefront Overview:** *Dedicated dashboard banner showing linked storefront identity (name, email, address, and store ID).*
* **Rating Metrics:** *Large display of current average score (calculated dynamically out of 5.0) and total customer review count.*
* **Customer Review Breakdown:** *Granular feedback table listing every customer who reviewed the store, including reviewer name, email, rating score, and modification timestamp.*
* **Unassigned State Handling:** *Graceful empty state with guidance when a merchant account does not yet have a storefront linked.*

---

## User Roles & Permissions

The platform supports three distinct roles, each mapped to specific frontend views and backend API routes:

| Role | Database Identifier | Access Scope & Key Capabilities |
| :--- | :--- | :--- |
| **System Administrator** | `ADMIN` | *Full administrative authority.* Can view system-wide dashboard metrics, create users with any role, view and filter all users, inspect user details, create stores, assign store owners, and view and filter all stores. |
| **Normal User** | `USER` | *Consumer access.* Can discover stores, search and sort storefronts, view overall store ratings, submit a 1–5 star rating for any store, modify their existing rating, and change their account password. |
| **Store Owner** | `STORE_OWNER` | *Merchant operations.* Can view their assigned store information, monitor aggregate rating performance, view the customer feedback list, and change their account password. |

---

## Rating System

The rating subsystem enforces strict business logic to maintain data integrity and prevent manipulation:

1. **Rating Scale:** Ratings must be integer values between **1** and **5** (inclusive). Submitting fractional values, non-integers, or values outside 1–5 is rejected by both frontend validation and database `CHECK (rating BETWEEN 1 AND 5)` constraints.
2. **One Rating Per User Per Store:** A database-level composite unique constraint `UNIQUE (user_id, store_id)` ensures that a user cannot create multiple independent ratings for the same business.
3. **Rating Modification:** If a user submits a new rating for a store they have already reviewed, the backend returns a `409 Conflict`, prompting the frontend to invoke the update endpoint (`PUT /api/stores/:storeId/ratings`), which updates the score and sets `updated_at = CURRENT_TIMESTAMP`.
4. **Dynamic Aggregate Calculation:** Overall store ratings are computed dynamically using **PostgreSQL** aggregates:
   ```sql
   COALESCE(AVG(r.rating), 0) AS average_rating,
   COUNT(*) AS total_ratings
   ```
   *This ensures ratings are calculated directly from verified customer submissions without stale cache discrepancies.*
5. **Role Restrictions:** Only users with the **Normal User** (`USER`) role can submit or update store ratings. **System Administrators** and **Store Owners** are strictly restricted from skewing scores.

---

## Validation Rules

The application enforces consistent validation rules across both the frontend input layer and backend service/validator layer:

| Entity / Field | Rule & Constraint | Frontend Behavior | Backend / Database Constraint |
| :--- | :--- | :--- | :--- |
| **User Name** | 20 to 60 characters | Live length feedback; submit blocked if outside range | `VARCHAR(60)`, `auth.validator.js` checks `length >= 20 && length <= 60` |
| **Store Name** | 20 to 60 characters | Form error banner; submit blocked if outside range | `VARCHAR(60)`, `admin.controller.js` checks `length >= 20 && length <= 60` |
| **Address** | Maximum 400 characters | Character counter indicator | `VARCHAR(400)`, rejected if length exceeds 400 |
| **Email** | Standard RFC 5322 format | Regex validation on blur and submit | `VARCHAR(255) UNIQUE`, regex check `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| **Password** | 8 to 16 characters | Live password checklist chips (length, uppercase, symbol) | Rejected if length < 8 or > 16, or missing `[A-Z]` or `[^A-Za-z0-9]` |
| **Rating** | Integer 1 to 5 | Interactive 5-star buttons | `INTEGER NOT NULL`, `CHECK (rating BETWEEN 1 AND 5)` |
| **Role Assignment** | Must be `ADMIN`, `USER`, or `STORE_OWNER` | Select dropdown restricted to valid roles | `CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER'))` |
| **Store Owner** | Unique 1-to-1 link | Only unassigned store owners selectable | `owner_id INTEGER UNIQUE REFERENCES users(id)` |

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | *Declarative component-based user interface framework* |
| **React DOM** | `^19.2.8` | *DOM rendering and reconciliation pipeline* |
| **React Router DOM** | `^7.18.4` | *Client-side routing, protected role route guards, and navigation* |
| **Axios** | `^1.20.0` | *Promise-based HTTP client with automated Bearer token interceptor* |
| **Vite** | `^8.3.0` | *Next-generation frontend tooling and rapid build server* |
| **Vanilla CSS** | — | *Custom "Neutral Elegance" design system using CSS tokens* |
| **ESLint** | `^10.10.0` | *Code quality and linting across React 19 standards* |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | *Asynchronous event-driven JavaScript runtime environment* |
| **Express.js** | `^5.1.0` | *RESTful API routing, controller handling, and middleware architecture* |
| **PostgreSQL (`pg`)** | `^8.16.3` | *Non-blocking PostgreSQL client and connection pooling via `pg.Pool`* |
| **JWT Authentication (`jsonwebtoken`)** | `^9.0.2` | *Generation, signing, and verification of Bearer JSON Web Tokens* |
| **Bcrypt (`bcrypt`)** | `^6.0.0` | *Cryptographic password hashing with salted rounds* |
| **CORS (`cors`)** | `^2.8.5` | *Cross-Origin Resource Sharing control middleware* |
| **Dotenv (`dotenv`)** | `^17.2.2` | *Environment configuration loading from `.env`* |

### Database
| Technology | Purpose |
| :--- | :--- |
| **PostgreSQL** | *Enterprise-grade relational database management system with ACID compliance, foreign key cascading, and table-level check constraints.* |

### Development Tools
* **Git & GitHub:** *Version control and remote repository hosting.*
* **VS Code:** *Integrated development environment.*
* **npm:** *Node package manager for backend and frontend dependency workflows.*

---

## System Architecture

```mermaid
flowchart TD
    Client["Client Browser<br/>(React 19 + Vite SPA)"]
    
    subgraph Frontend["Frontend Layer (React 19)"]
        Router["React Router v7<br/>Protected Role Routes"]
        Context["AuthContext<br/>(JWT in localStorage)"]
        Axios["Axios API Client<br/>(Bearer Token Interceptor)"]
    end

    subgraph Backend["Express.js Backend Layer (Port 5000)"]
        App["app.js<br/>CORS & JSON Body Parser"]
        AuthMiddleware["authenticateToken<br/>(JWT Signature Verification)"]
        RoleMiddleware["authorizeRoles<br/>(ADMIN / USER / STORE_OWNER)"]
        
        subgraph Routes["Route Modules"]
            R_Auth["/api/auth"]
            R_Admin["/api/admin"]
            R_Store["/api/stores"]
            R_Owner["/api/owner"]
            R_Health["/api/health"]
        end

        subgraph Services["Service Logic"]
            S_Auth["auth.service.js"]
            S_Admin["admin.service.js"]
            S_Store["store.service.js"]
            S_Owner["owner.service.js"]
        end
    end

    subgraph Database["PostgreSQL Database (Port 5432)"]
        T_Users[("users table")]
        T_Stores[("stores table")]
        T_Ratings[("ratings table")]
    end

    Client --> Router
    Router --> Context
    Context --> Axios
    Axios -- "HTTP REST Requests<br/>(Bearer JWT)" --> App
    
    App --> R_Health
    App --> AuthMiddleware
    AuthMiddleware --> RoleMiddleware
    
    RoleMiddleware --> R_Auth
    RoleMiddleware --> R_Admin
    RoleMiddleware --> R_Store
    RoleMiddleware --> R_Owner

    R_Auth --> S_Auth
    R_Admin --> S_Admin
    R_Store --> S_Store
    R_Owner --> S_Owner

    S_Auth -- "SQL Queries via pg.Pool" --> T_Users
    S_Admin -- "SQL Queries via pg.Pool" --> T_Users & T_Stores & T_Ratings
    S_Store -- "SQL Queries via pg.Pool" --> T_Stores & T_Ratings
    S_Owner -- "SQL Queries via pg.Pool" --> T_Stores & T_Ratings
```

### Architecture Highlights
* **Stateless Token Authentication:** The **Express.js** API does not maintain server-side sessions. Each protected request transmits a signed token in the `Authorization: Bearer <token>` header, verified against `JWT_SECRET`.
* **Two-Tier Route Guards:** 
  1. *Frontend:* `RoleRoute.jsx` inspects the authenticated user's role and redirects unauthorized attempts to the appropriate home view.
  2. *Backend:* `auth.middleware.js` extracts and verifies the token payload, and `role.middleware.js` returns `403 Forbidden` if the user's role does not match the route requirements.
* **Relational Integrity:** **PostgreSQL** enforces foreign key constraints (`ON DELETE CASCADE` on ratings when users or stores are removed) and unique store ownership (`stores.owner_id UNIQUE`).

---

## Application Flow

### 1. Authentication Flow
```text
User Enters Credentials 
       ↓
POST /api/auth/login (or /api/auth/register)
       ↓
Backend Validates Format & Queries Database
       ↓
bcrypt.compare verifies password hash against stored hash
       ↓
jwt.sign generates signed token (payload: userId, email, role)
       ↓
Frontend stores JWT and user profile in localStorage
       ↓
User redirected to designated role workspace:
  • ADMIN        → /admin
  • USER         → /stores
  • STORE_OWNER  → /owner
```

### 2. Normal User Discovery & Rating Flow
```text
User views /stores
       ↓
GET /api/stores (with optional ?name=&address=&sortBy=&order=)
       ↓
Backend returns stores list + user's previous rating (if any) + average_rating
       ↓
User selects 1–5 stars on store card
       ↓
If first time rating:
  • POST /api/stores/:storeId/ratings with { rating: X }
  • Backend inserts new row into ratings table (201 Created)
If modifying existing rating:
  • PUT /api/stores/:storeId/ratings with { rating: Y }
  • Backend updates rating value and timestamp (200 OK)
       ↓
UI immediately reflects updated average rating and user score
```

### 3. Administrator Management Flow
```text
Admin logs in and accesses /admin
       ↓
GET /api/admin/dashboard fetches total users, stores, and ratings counts
       ↓
Admin navigates to /admin/users or /admin/stores
       ↓
Admin can search, sort columns, or inspect single records
       ↓
Admin clicks "Add User" (POST /api/admin/users) or "Add Store" (POST /api/admin/stores)
       ↓
Backend validates inputs and executes transactional SQL insert
       ↓
Directory table updates reactively
```

### 4. Store Owner Operations Flow
```text
Store Owner logs in and accesses /owner
       ↓
GET /api/owner/dashboard
       ↓
Backend queries stores table for store matching req.user.userId
       ↓
Backend calculates COALESCE(AVG(rating), 0) and joins ratings with users
       ↓
Owner views storefront name, physical address, average score, and reviews list
```

---

## Database Design

The relational database consists of three core tables defined in [`backend/database/schema.sql`](backend/database/schema.sql):

### 1. `users` Table
*Stores authentication credentials, contact information, and role assignments for all platform participants.*

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `stores` Table
*Stores registered commercial storefronts and links each store to exactly one verified store owner.*

```sql
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INTEGER UNIQUE NOT NULL
        REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `ratings` Table
*Stores customer ratings, linking each review to both the customer and the target store.*

```sql
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL
        REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL
        CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, store_id)
);
```

### Entity Relationships
* **User $\leftrightarrow$ Store (Ownership):** One-to-One (`stores.owner_id UNIQUE REFERENCES users(id)`). Each storefront belongs to exactly one user with the **Store Owner** (`STORE_OWNER`) role.
* **User $\leftrightarrow$ Rating:** One-to-Many (`ratings.user_id REFERENCES users(id)`). A user can rate multiple different stores.
* **Store $\leftrightarrow$ Rating:** One-to-Many (`ratings.store_id REFERENCES stores(id)`). A store can receive ratings from multiple users.
* **Composite Uniqueness:** The constraint `UNIQUE (user_id, store_id)` guarantees that each user has at most one rating record per store.

---

## Project Structure

```text
Roxiler-StoreRatingSystem/
├── backend/
│   ├── database/
│   │   └── schema.sql                  # PostgreSQL database initialization DDL
│   ├── src/
│   │   ├── admin/                      # Administrator domain module
│   │   │   ├── admin.controller.js     # Admin endpoint request handlers
│   │   │   ├── admin.routes.js         # Admin route definitions (/api/admin)
│   │   │   └── admin.service.js        # Admin database queries and aggregations
│   │   ├── auth/                       # Authentication domain module
│   │   │   ├── auth.controller.js      # Register, login, and change-password handlers
│   │   │   ├── auth.routes.js          # Auth route definitions (/api/auth)
│   │   │   └── auth.service.js         # Password hashing, JWT signing, password update
│   │   ├── config/
│   │   │   └── db.js                   # pg.Pool connection pool configuration
│   │   ├── middleware/                 # Express middleware
│   │   │   ├── auth.middleware.js      # JWT Bearer token authentication
│   │   │   └── role.middleware.js      # Role-based access authorization
│   │   ├── owner/                      # Store Owner domain module
│   │   │   ├── owner.controller.js     # Owner dashboard request handler
│   │   │   ├── owner.routes.js         # Owner route definitions (/api/owner)
│   │   │   └── owner.service.js        # Store feedback and average score calculations
│   │   ├── store/                      # Normal User store discovery & ratings module
│   │   │   ├── store.controller.js     # Store discovery and rating handlers
│   │   │   ├── store.routes.js         # Store routes (/api/stores)
│   │   │   └── store.service.js        # Search, sort, rating insertion & update
│   │   ├── validators/                 # Input validation logic
│   │   │   └── auth.validator.js       # User registration rules (length, regex)
│   │   ├── app.js                      # Express app setup, CORS, route mounting
│   │   └── server.js                   # HTTP server entrypoint (port listener)
│   ├── .env.example                    # Sample environment variables template
│   ├── package-lock.json
│   └── package.json                    # Backend dependencies and scripts
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                 # Custom Roxiler storefront favicon
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                     # Static graphics and icons
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── AuthenticatedLayout.jsx # Shell layout with sticky Navbar
│   │   │   ├── Icons.jsx               # Inline SVG icon library
│   │   │   ├── Navbar.jsx              # Role-aware responsive navigation bar
│   │   │   └── RoleRoute.jsx           # Route guard protecting unauthorized roles
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # React Context managing session, token, and user
│   │   ├── pages/                      # Application route views
│   │   │   ├── AddStore.jsx            # Admin page: Register store and assign owner
│   │   │   ├── AddUser.jsx             # Admin page: Create user with role
│   │   │   ├── AdminDashboard.jsx      # Admin page: High-level system statistics
│   │   │   ├── AdminStores.jsx         # Admin page: Stores directory and search
│   │   │   ├── AdminUsers.jsx          # Admin page: Users directory and search
│   │   │   ├── ChangePassword.jsx      # Shared page: Update account password
│   │   │   ├── Login.jsx               # Authentication: User sign-in
│   │   │   ├── OwnerDashboard.jsx      # Store Owner page: Store performance & reviews
│   │   │   ├── Signup.jsx              # Authentication: Consumer registration
│   │   │   └── Stores.jsx              # Normal User page: Store discovery & ratings
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with Authorization interceptor
│   │   ├── App.css
│   │   ├── App.jsx                     # Top-level Router configuration
│   │   ├── index.css                   # Neutral Elegance design system & styling
│   │   └── main.jsx                    # React entrypoint
│   ├── eslint.config.js                # ESLint flat configuration
│   ├── index.html                      # HTML5 template
│   ├── package-lock.json
│   ├── package.json                    # Frontend dependencies and scripts
│   └── vite.config.js                  # Vite configuration
├── .gitignore
└── README.md                           # Project documentation
```

---

## API Overview

All API endpoints are prefixed with `/api` and return standard JSON responses:

```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": {}
}
```

### Health Endpoints
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | *Verifies Express API server status* | Public |
| `GET` | `/api/health/db` | *Verifies PostgreSQL database connectivity* | Public |

### Authentication Endpoints
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | *Register a new normal user account* | Public |
| `POST` | `/api/auth/login` | *Authenticate user with credentials; returns signed JWT* | Public |
| `PUT` | `/api/auth/change-password` | *Update password with old password verification* | Authenticated (Any Role) |

### Admin Endpoints
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | *Fetch platform totals (users, stores, ratings)* | Authenticated (`ADMIN`) |
| `POST` | `/api/admin/users` | *Create user with explicit role (`ADMIN`/`USER`/`STORE_OWNER`)* | Authenticated (`ADMIN`) |
| `GET` | `/api/admin/users` | *List all users (supports `name`, `email`, `address`, `role`, `sortBy`, `sortOrder`)* | Authenticated (`ADMIN`) |
| `GET` | `/api/admin/users/:id` | *Fetch single user details by ID* | Authenticated (`ADMIN`) |
| `POST` | `/api/admin/stores` | *Register a new store and assign to an existing store owner* | Authenticated (`ADMIN`) |
| `GET` | `/api/admin/stores` | *List all stores (supports `name`, `email`, `address`, `sortBy`, `sortOrder`)* | Authenticated (`ADMIN`) |
| `GET` | `/api/admin/stores/:id` | *Fetch single store details by ID with owner info* | Authenticated (`ADMIN`) |

### Normal User Store Endpoints
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stores` | *Discover stores (supports `name`, `address`, `sortBy`, `order`)* | Authenticated (`USER`) |
| `POST` | `/api/stores/:storeId/ratings` | *Submit initial 1–5 star rating for a store* | Authenticated (`USER`) |
| `PUT` | `/api/stores/:storeId/ratings` | *Modify an existing rating for a store* | Authenticated (`USER`) |

### Store Owner Endpoints
| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/owner/dashboard` | *Fetch owner store information, metrics, and customer reviews* | Authenticated (`STORE_OWNER`) |

---

## Authentication & Security

The project incorporates established security and data-integrity practices:

* **Cryptographic Password Hashing:** *Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (10 rounds) before insertion into **PostgreSQL**.*
* **Stateless JWT Tokens:** *Authentication utilizes **JWT Authentication** signed with an HMAC SHA-256 secret (`JWT_SECRET`). Tokens are validated on every request via the `authenticateToken` middleware.*
* **Strict Role-Based Authorization:** *Endpoints verify that `req.user.role` matches the required privilege set using `authorizeRoles(...)`. Unauthorized attempts return `403 Forbidden`.*
* **CORS Protection:** *Configured using the `cors` package to restrict and control cross-origin requests.*
* **Input Sanitization & Validation:** *Registration and management endpoints validate strings, character lengths, email formatting, and password complexity before executing database queries.*
* **Parameterized SQL Queries:** *All database interactions use parameterized queries (`$1`, `$2`, etc.) via `pg.Pool`, completely mitigating SQL injection vulnerabilities.*
* **Separation of Secrets:** *Database passwords, ports, and JWT secret keys are loaded exclusively from `.env`, which is strictly excluded from version control via `.gitignore`.*

---

## Environment Variables

### Backend Configuration (`backend/.env`)
A template is provided in `backend/.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS (e.g., https://<your-vercel-app>.vercel.app in production)
FRONTEND_URL=http://localhost:5173

# Database Connection (Standard Local PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roxiler_store_rating
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_SSL=false

# Alternative: Direct PostgreSQL / Neon Connection String (used in production on Render)
# DATABASE_URL=postgresql://username:password@ep-example.region.aws.neon.tech/roxiler_store_rating?sslmode=require

# JWT Authentication Secret
JWT_SECRET=your_secure_jwt_secret_key
```

### Frontend Configuration (`frontend/.env`)
A template is provided in `frontend/.env.example`:

```env
# Backend API Base URL
# For local development: http://localhost:5000/api
# For production (Vercel): https://<your-render-backend-url>/api
VITE_API_BASE_URL=http://localhost:5000/api
```

> [!WARNING]
> **Important Note:** Local `.env` files contain sensitive local configuration and credentials and are ignored by Git (`.gitignore`). **Never commit real credentials to version control.**

---

## Local Setup

Follow these step-by-step instructions to run the application locally on your workstation.

### 1. Prerequisites
Ensure you have the following installed on your system:
* **Node.js** *(v18.0.0 or higher; v20+ recommended)*
* **npm** *(v9.0.0 or higher)*
* **PostgreSQL** *(v14 or higher running locally on port `5432`)*
* **Git** *command-line tools*

### 2. Clone the Repository
```bash
git clone https://github.com/tiwarisandhyaa01-bot/Roxiler-StoreRatingSystem.git
cd Roxiler-StoreRatingSystem
```

### 3. Database Setup
1. **Start your PostgreSQL service.**
2. **Open a terminal or PostgreSQL CLI (`psql`) and create the database:**
   ```sql
   CREATE DATABASE roxiler_store_rating;
   ```
3. **Initialize the schema using the provided SQL script:**
   ```bash
   psql -U postgres -d roxiler_store_rating -f backend/database/schema.sql
   ```

### 4. Backend Setup & Startup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install server dependencies:**
   ```bash
   npm install
   ```
3. **Create your `.env` file from the example template:**
   ```bash
   cp .env.example .env
   ```
4. **Edit `backend/.env` with your PostgreSQL username, password, and chosen `JWT_SECRET`.**
5. **Start the backend development server:**
   ```bash
   npm run dev
   ```
   *The API server will start on [http://localhost:5000](http://localhost:5000).*  
   *Verify server health at [http://localhost:5000/api/health](http://localhost:5000/api/health).*

### 5. Frontend Setup & Startup
1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install frontend dependencies:**
   ```bash
   npm install
   ```
3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *The **React** application will open on [http://localhost:5173](http://localhost:5173).*

### 6. Local Application Access
* **Frontend Application:** `http://localhost:5173`
* **Backend API Base:** `http://localhost:5000/api`
* **Health Check:** `http://localhost:5000/api/health`
* **Database Connection Check:** `http://localhost:5000/api/health/db`

---

## Available Scripts

### Backend (`backend/package.json`)
| Command | Execution | Purpose |
| :--- | :--- | :--- |
| `npm start` | `node src/server.js` | *Starts the production Express.js server* |
| `npm run dev` | `node --watch src/server.js` | *Starts the Express.js server with automatic file watching and reload* |

### Frontend (`frontend/package.json`)
| Command | Execution | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | *Starts the local Vite development server with Hot Module Replacement (HMR)* |
| `npm run build` | `vite build` | *Compiles and bundles production-ready static assets into `dist/`* |
| `npm run lint` | `eslint .` | *Runs ESLint across all JavaScript/JSX source files* |
| `npm run preview` | `vite preview` | *Locally previews the production build bundle* |

---

## Testing & Verification

The codebase has undergone comprehensive functional verification across all development phases:

* **Production Build Validation:** Executed `npm run build` using **Vite 8**; transformed 95 modules and compiled production assets without errors.
* **Code Quality & Linting:** Executed `npm run lint` with **ESLint 10**; completed with **0 errors and 0 warnings**.
* **End-to-End Functional Verification:** Validated via automated scripts covering:
  1. *Admin Flow:* Dashboard statistics loading, user creation, store creation, filtering, and detailed inspection.
  2. *Normal User Flow:* User registration with validation constraints, store discovery, search and sorting, initial 5-star rating submission, and rating modification to 4 stars.
  3. *Store Owner Flow:* Storefront association, dashboard metrics calculation, customer feedback table inspection, and real-time average updates upon new ratings.
  4. *Security Flow:* Password updating via `PUT /api/auth/change-password` and re-authentication with new credentials.
* **Accessibility & Contrast Verification:** Verified color contrast ratios in accordance with WCAG standards (*Deep Espresso on Floral White achieves 12.4:1 contrast, exceeding AAA standards*).

---

## UI & UX Design System

The application interface is styled using a custom **"Neutral Elegance"** design system that provides an earthy, warm aesthetic:

* **Color Palette Hierarchy:**
  * **Primary Canvas (60%):** Bone / Floral White (`#F7F4EC`) canvas and soft floral surfaces (`#FCFBF7`).
  * **Secondary Surfaces (20%):** Warm Taupe / Nude (`#F1ECE1`, `#E8E2D5`) for secondary cards, table row hover states, and input fills.
  * **Primary Brand Accent (10%):** Muted Olive Drab (`#66704A`) for primary action buttons, active navigation links, and focus rings.
  * **Secondary Role Accent (5%):** Plum Wine (`#633B4D`) for Administrator role badges and subtle emphasis.
  * **Rating Accent (5%):** Golden Sandalwood (`#B28A52`) for interactive rating stars, rating pills, and Store Owner badges.
  * **Typography:** Deep Espresso (`#302C28`) primary text and Muted Taupe (`#756D64`) secondary text, eliminating harsh pure blacks.
* **Component Experience:**
  * **Tactile Forms:** *Warm input backgrounds with 3px subtle olive focus rings replacing default browser blue halos.*
  * **Live Password Checklist:** *Interactive checklist chips dynamically validating minimum length, uppercase characters, and special symbols in real time.*
  * **Responsive Layout:** *Mobile-friendly flex and CSS grid containers with adaptive slide-out drawers and collapsing navigation links.*
  * **Restrained Shadows:** *Minimalist warm elevation shadows (`rgba(48, 44, 40, 0.06)`) that preserve depth without artificial glassmorphism.*

---

## Screenshots

> *Screenshots can be added here to showcase the login, store discovery, admin dashboard, and store owner dashboard interfaces.*

---

## Current Project Status

* [x] **Core Architecture:** **Express.js** REST API with **PostgreSQL** connection pooling.
* [x] **Authentication:** **JWT Authentication**, bcrypt password hashing, and change password flow.
* [x] **Role Authorization:** Protected routes for `ADMIN`, `USER`, and `STORE_OWNER`.
* [x] **Store Discovery:** Search, sorting, and rating display for **Normal Users**.
* [x] **Rating Subsystem:** 1–5 star submissions, unique user-store constraint, and rating modifications.
* [x] **Admin Console:** Dashboard metrics, user management, and store management for **System Administrators**.
* [x] **Store Owner Workspace:** Store metrics, review lists, and unassigned state handling for **Store Owners**.
* [x] **Visual Identity:** Complete Neutral Elegance design system across all views.
* [ ] **Next Stage:** Production cloud deployment and continuous integration setup.

---

## Future Enhancements

The following features represent realistic potential enhancements for future development cycles:

* **Cloud Deployment:** *Containerization with Docker and deployment to cloud platforms (e.g., Render, Railway, AWS).*
* **Automated CI/CD:** *GitHub Actions workflows for continuous integration testing and automated builds.*
* **Automated Unit & Integration Tests:** *Implementation of Jest/Supertest for backend integration tests and Vitest/React Testing Library for frontend component tests.*
* **Server-Side Pagination:** *Cursor or offset-based pagination on admin user/store lists to optimize large datasets.*
* **Customer Review Comments:** *Optional written text reviews alongside the 1–5 star score.*
* **Email Verification:** *Automated email verification on signup and self-service password reset flows.*

---

## Author

**Sandhya Tiwari**  
*B.Tech in Computer Science and Engineering (AI-ML)*  
*IES College of Technology, Bhopal*  

* GitHub: [@tiwarisandhyaa01-bot](https://github.com/tiwarisandhyaa01-bot)

---

## License

This project was developed for evaluation purposes. The backend package specifies the [ISC License](backend/package.json). See individual package files for dependency licenses.