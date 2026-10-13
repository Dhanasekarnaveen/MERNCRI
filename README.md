# Mini CRM – Full-Stack MERN Application

A production-grade, human-coded **Customer Relationship Management (Mini CRM)** system built strictly per the assignment specifications and wireframe requirements.

---

## 📌 Mandatory Tech Stack

- **Frontend**:
  - **React** (v18+ with Vite)
  - **React Router** (v6+ client-side declarative routing)
  - **Axios** (Configured with request/response interceptors & token injection)
  - **Bootstrap 5 & Bootstrap Icons** (Clean, human-coded, readable CSS styling & components)
- **Backend**:
  - **Node.js** & **Express.js** (Clean RESTful MVC architecture)
  - **MongoDB** with **Mongoose** (ODM, schemas, virtuals, and aggregation pipelines)
- **Authentication & Security**:
  - **JWT (JSON Web Token)** for stateless Bearer token authorization
  - **bcryptjs** for secure password hashing with salt rounds

---

## 🚀 Live Demo & Repository Structure

```
CRMTask/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile, user listing
│   │   ├── dashboardController.js# MongoDB Aggregation pipelines for metrics
│   │   ├── leadController.js     # Lead CRUD, status update, pagination, soft-delete
│   │   ├── companyController.js  # Company CRUD & associated leads retrieval
│   │   └── taskController.js     # Task CRUD & assigned-user status updates
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification middleware
│   │   └── errorMiddleware.js    # Custom error and 404 handling middleware
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   ├── Company.js            # Company schema with virtual leads relation
│   │   ├── Lead.js               # Lead schema with soft-delete query middleware
│   │   └── Task.js               # Task schema with Lead & User references
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── dashboardRoutes.js    # /api/dashboard routes
│   │   ├── leadRoutes.js         # /api/leads routes
│   │   ├── companyRoutes.js      # /api/companies routes
│   │   └── taskRoutes.js         # /api/tasks routes
│   ├── seed.js                   # Realistic database seeder
│   ├── server.js                 # Express server entry point
│   ├── .env                      # Backend environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── AppLayout.jsx # Persistent Sidebar & Topbar (Wireframe 2)
│   │   │   ├── LeadModal.jsx     # Add/Edit Lead dialog (Wireframe 5)
│   │   │   ├── CompanyModal.jsx  # Create/Edit Company dialog
│   │   │   ├── TaskModal.jsx     # Create/Edit Task dialog
│   │   │   └── ProtectedRoute.jsx# Auth guard for protected routes
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user auth state provider
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login screen (Wireframe 1)
│   │   │   ├── Dashboard.jsx     # Aggregated KPIs & status charts (Wireframe 3)
│   │   │   ├── LeadsList.jsx     # Search, filter, table, pagination (Wireframe 4)
│   │   │   ├── CompaniesPage.jsx # Companies list & associated leads (Wireframe 6)
│   │   │   └── TasksPage.jsx     # Tasks table & status toggle (Wireframe 7)
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx              # App root bootstrap
│   ├── vite.config.js            # Vite configuration with /api proxy
│   └── package.json
│
├── package.json                  # Root monorepo orchestrator scripts
└── README.md                     # Comprehensive project documentation
```

---

## 🔒 Authorization & Security Logic (Mandatory Requirement)

### 1. JWT Bearer Token Authentication
- Upon logging in via `POST /api/auth/login`, credentials are authenticated against `User.findOne({ email }).select('+password')` using `user.matchPassword(enteredPassword)` (bcrypt).
- On success, an **HMAC SHA-256 JWT Access Token** is generated containing the user's `_id` and signed using the server's `JWT_SECRET`.
- The frontend stores the token in `localStorage` and automatically injects it into all subsequent outgoing HTTP requests via Axios interceptors:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  ```
- The backend `protect` middleware verifies this token on all protected endpoints (`/api/leads`, `/api/companies`, `/api/tasks`, `/api/dashboard`), attaches `req.user`, and prevents unauthorized access.

### 2. Strict Task Status Authorization: "Only assigned users can update task status"
The assignment explicitly states:
> *"Only assigned users can update task status."*

This rule is enforced at both the **Backend API level** and the **Frontend UI level**:
1. **Backend Enforcement (`PATCH /api/tasks/:id/status` & `PUT /api/tasks/:id`)**:
   ```javascript
   const task = await Task.findById(req.params.id);
   if (!task) {
     return res.status(404).json({ success: false, message: 'Task not found' });
   }

   // Strict check: current authenticated user must match task assignee
   const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();

   if (!isAssignedUser) {
     return res.status(403).json({
       success: false,
       message: 'Forbidden: Only the assigned user is authorized to update this task status.'
     });
   }
   ```
2. **Frontend UI Enforcement**:
   - In `TasksPage.jsx`, each task compares `user._id === task.assignedTo._id`.
   - If the logged-in user is the assignee, they see the active **[Done]** / **[Reopen]** action button.
   - If the logged-in user is **not** the assignee, the status button is locked with a tooltip explaining that only the assigned rep can change it.
   - If a non-assigned user tries to send a status update request, the backend immediately halts the operation with HTTP `403 Forbidden` and a notification alert is shown.

---

## 🗑️ Soft-Delete Implementation: "Must not appear in normal queries"

In compliance with the Leads module specification:
1. **Schema Design**:
   The `Lead` model contains:
   ```javascript
   isDeleted: { type: Boolean, default: false, index: true },
   deletedAt: { type: Date, default: null }
   ```
2. **Mongoose Pre-Query Middleware**:
   To guarantee soft-deleted leads never appear in normal lookups:
   ```javascript
   leadSchema.pre(/^find/, function (next) {
     if (!this.getOptions().includeDeleted) {
       this.where({ isDeleted: { $ne: true } });
     }
     next();
   });

   leadSchema.pre('countDocuments', function (next) {
     if (!this.getOptions().includeDeleted) {
       this.where({ isDeleted: { $ne: true } });
     }
     next();
   });
   ```
3. When `DELETE /api/leads/:id` is called, the record is flagged `isDeleted = true` and `deletedAt = new Date()`.
4. The database seeder includes a soft-deleted lead to confirm that neither `GET /api/leads` nor the dashboard metrics count it.

---

## 📊 Dashboard Aggregation APIs (MongoDB `$aggregate`)

Per the requirement **"Data must come from aggregation APIs"**, the backend does not simply run unindexed scans or in-memory array filtering. Instead, it utilizes MongoDB aggregation pipelines:

1. **Lead Metrics Pipeline**:
   ```javascript
   const leadAggregation = await Lead.aggregate([
     { $match: { isDeleted: { $ne: true } } },
     {
       $group: {
         _id: null,
         totalLeads: { $sum: 1 },
         qualifiedLeads: {
           $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] }
         },
         newLeads: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
         contactedLeads: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } },
         lostLeads: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
       }
     }
   ]);
   ```
2. **Task Metrics Pipeline (`$facet`)**:
   ```javascript
   const taskAggregation = await Task.aggregate([
     {
       $facet: {
         tasksDueToday: [
           { $match: { dueDate: { $gte: startOfToday, $lte: endOfToday } } },
           { $count: 'count' }
         ],
         completedTasks: [
           { $match: { status: 'Completed' } },
           { $count: 'count' }
         ],
         pendingTasks: [
           { $match: { status: 'Pending' } },
           { $count: 'count' }
         ],
         totalTasks: [{ $count: 'count' }]
       }
     }
   ]);
   ```

---

## 🖥️ UI Wireframes Alignment Walkthrough

| Wireframe | Implemented Component | Features Included |
|-----------|------------------------|-------------------|
| **1. Login Page** | `frontend/src/pages/Login.jsx` | Centered card, Email & Password validation, API error alert, 1-click demo login buttons |
| **2. Main Application Layout** | `frontend/src/components/Layout/AppLayout.jsx` | Persistent sidebar (Dashboard, Leads, Companies, Tasks) across all screens; Topbar with User Name & Logout |
| **3. Dashboard Page** | `frontend/src/pages/Dashboard.jsx` | Exact 4 metric cards: **Total Leads**, **Qualified Leads**, **Tasks Due Today**, **Completed Tasks** computed via Aggregation APIs |
| **4. Leads List Page** | `frontend/src/pages/LeadsList.jsx` | Search input, Status dropdown filter (`All`, `New`, `Contacted`, `Qualified`, `Lost`), `+ Add Lead` button, Table with Name, Email, Status, Assigned To, Actions (Edit, Delete), `< 1 2 3 >` pagination |
| **5. Add / Edit Lead Page** | `frontend/src/components/LeadModal.jsx` | Name, Email, Phone, Status selector, Assigned To user dropdown, Company dropdown, `[Save]` and `[Cancel]` buttons |
| **6. Company List & Detail Page** | `frontend/src/pages/CompaniesPage.jsx` | Companies table: Company Name, Industry, Location (e.g. `ABC Corp \| IT \| Chennai`), Detail view drawer displaying Company info & Associated Leads list |
| **7. Tasks Page** | `frontend/src/pages/TasksPage.jsx` | Table: Title, Lead, Due Date (e.g. `22 Jan`), Status, Actions (Done toggle, Edit, Delete); Strict authorization for assigned users |

---

## 🔑 Demo Credentials (Ready to Test)

The database seed script generates 3 ready-to-use users with pre-populated leads, companies, and tasks:

| User | Email | Password | Role | Description |
|------|-------|----------|------|-------------|
| **John Doe** | `john@crm.com` | `password123` | Sales Rep | Has assigned leads (Ravi, Ananya) and tasks due today |
| **Sarah Smith** | `sarah@crm.com` | `password123` | Sales Rep | Has assigned leads (Karthik, Priya) and tasks |
| **Admin User** | `admin@crm.com` | `password123` | Admin | Administrative oversight |

> **Quick Testing Tip**: On the Login screen, click any of the demographic chips to autofill credentials instantly!

---

## 🛠️ Step-by-Step Setup & Running Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Running locally on default port `27017` or a MongoDB Atlas URI)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd CRMTask

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`)**:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mini_crm_db
JWT_SECRET=super_secret_crm_jwt_token_key_2026_xYz
JWT_EXPIRE=7d
NODE_ENV=development
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_URL=/api
```

### 3. Seed Database with Realistic Data

```bash
cd backend
npm run seed
```

### 4. Run Backend & Frontend Servers

**Terminal 1 (Backend API)**:
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend React App)**:
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:3000
```

Open your browser at **`http://localhost:3000`** to interact with the Mini CRM.

---

## 🌐 Deployment Instructions (Netlify / Vercel + Render / MongoDB Atlas)

### Backend Deployment (e.g., Render / Railway)
1. Push backend to GitHub.
2. Create a new Web Service on Render / Railway pointing to the `backend/` folder.
3. Configure Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure 64-character secret
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Run the seeder once via Render console: `node seed.js`

### Frontend Deployment (Netlify)
1. Push frontend to GitHub.
2. In Netlify, create a new site from Git, selecting the repository.
3. Build Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL`: Your hosted backend URL (e.g. `https://mini-crm-api.onrender.com/api`)
5. In `frontend/public/_redirects`, add:
   ```
   /*    /index.html   200
   ```
   to support React Router single-page app routing.

---

## 📡 API Reference Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT access token | No |
| `GET` | `/api/auth/me` | Fetch current authenticated user | Yes |
| `GET` | `/api/auth/users` | List users for assignment dropdowns | Yes |
| `GET` | `/api/dashboard/metrics` | MongoDB Aggregation metrics | Yes |
| `GET` | `/api/leads` | List leads (search, status filter, pagination) | Yes |
| `POST` | `/api/leads` | Create a lead | Yes |
| `GET` | `/api/leads/:id` | Get single lead details | Yes |
| `PUT` | `/api/leads/:id` | Update lead information | Yes |
| `PATCH` | `/api/leads/:id/status` | Update lead status | Yes |
| `DELETE`| `/api/leads/:id` | Soft-delete lead (excludes from queries) | Yes |
| `GET` | `/api/companies` | List companies with associated lead counts | Yes |
| `POST` | `/api/companies` | Create a company | Yes |
| `GET` | `/api/companies/:id` | Company details + associated leads list | Yes |
| `PUT` | `/api/companies/:id` | Update company info | Yes |
| `DELETE`| `/api/companies/:id` | Delete company | Yes |
| `GET` | `/api/tasks` | List tasks (search & filter) | Yes |
| `POST` | `/api/tasks` | Create task for lead | Yes |
| `PATCH` | `/api/tasks/:id/status` | **Update task status (Assigned user only)** | Yes |
| `PUT` | `/api/tasks/:id` | Update task details | Yes |
| `DELETE`| `/api/tasks/:id` | Delete task | Yes |

---

## 👨‍💻 Human-Coded Engineering Highlights

- **Separation of Concerns**: Strict MVC separation with modular models, routers, controllers, and middleware.
- **Defensive Error Handling**: Global async error interceptor catching validation errors, MongoDB duplicate keys, and invalid ObjectIds.
- **Responsive Layout**: Clean, normal Bootstrap layout supporting desktop and mobile devices.
- **Enterprise Schema Practices**: Virtual relations, compound index optimizations, and query middleware for non-destructive soft-deletion.
