# Acme Corp Employee Portal

A full-stack employee portal application built with FastAPI (backend) and React (frontend).

## Features

- User authentication (login, register, password reset)
- Employee dashboard with statistics
- Announcements management
- File upload and management
- Support ticket system
- User management (admin)
- Audit logging (admin)
- Role-based access control (employee, manager, admin)

## Project Structure

```
employee-portal/
├── backend/           # FastAPI backend
│   ├── app/
│   │   └── main.py   # Main application file
│   └── pyproject.toml
├── frontend/          # React frontend
│   ├── src/
│   │   └── App.tsx   # Main React component
│   └── package.json
└── README.md
```

## Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@acmecorp.com | admin123 | Admin |
| john.doe@acmecorp.com | password123 | Employee |
| jane.smith@acmecorp.com | password123 | Manager |

---

# Local Hosting Guide

This guide explains how to run the Employee Portal locally on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.12+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Poetry** (Python package manager) - Install with:
  ```bash
  curl -sSL https://install.python-poetry.org | python3 -
  ```
- **Git** - [Download Git](https://git-scm.com/downloads)

### Verify Installation

```bash
python3 --version    # Should show 3.12 or higher
node --version       # Should show 18 or higher
npm --version        # Should show 9 or higher
poetry --version     # Should show 1.x or higher
git --version        # Should show 2.x or higher
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/arica-sudo/employee-portal-vapt.git
cd employee-portal-vapt
```

---

## Step 2: Setup and Run the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

### Install Python Dependencies

```bash
poetry install
```

This will create a virtual environment and install all required packages.

### Start the Backend Server

```bash
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

The backend will start on `http://localhost:8000`

You can verify it's running by visiting:
- Health check: http://localhost:8000/healthz
- API Documentation: http://localhost:8000/docs

**Keep this terminal open** - the backend needs to keep running.

---

## Step 3: Setup and Run the Frontend

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
```

### Install Node.js Dependencies

```bash
npm install
```

### Configure the API URL

Create a `.env` file in the frontend directory:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Step 4: Access the Application

Open your web browser and navigate to:

**http://localhost:5173**

You should see the Acme Corp Employee Portal login page.

### Login with Test Accounts

Use one of the default accounts to log in:

| Email | Password | Role |
|-------|----------|------|
| admin@acmecorp.com | admin123 | Admin |
| john.doe@acmecorp.com | password123 | Employee |
| jane.smith@acmecorp.com | password123 | Manager |

---

## Running Both Services (Quick Reference)

### Terminal 1 - Backend
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find and kill the process using port 8000
lsof -i :8000
kill -9 <PID>
```

**Poetry not found:**
```bash
# Add Poetry to PATH
export PATH="$HOME/.local/bin:$PATH"
```

**Python version issues:**
```bash
# Check Python version
python3 --version

# If using pyenv, set the correct version
pyenv local 3.12
```

### Frontend Issues

**Port 5173 already in use:**
```bash
# Find and kill the process using port 5173
lsof -i :5173
kill -9 <PID>
```

**Node modules issues:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

**API connection errors:**
- Ensure the backend is running on port 8000
- Check that `.env` file contains `VITE_API_URL=http://localhost:8000`
- Restart the frontend after changing `.env`

### CORS Issues

If you see CORS errors in the browser console, ensure:
1. Backend is running on `http://localhost:8000`
2. Frontend `.env` has the correct `VITE_API_URL`
3. Both services are running

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| POST | /api/auth/password-reset | Request password reset |
| GET | /api/users/me | Get current user profile |
| PUT | /api/users/me | Update current user profile |
| GET | /api/announcements | List all announcements |
| POST | /api/announcements | Create announcement (admin/manager) |
| DELETE | /api/announcements/{id} | Delete announcement (admin/manager) |
| GET | /api/files | List uploaded files |
| POST | /api/files/upload | Upload a file |
| GET | /api/files/download/{id} | Download a file |
| DELETE | /api/files/{id} | Delete a file |
| GET | /api/support/tickets | List support tickets |
| POST | /api/support/tickets | Create support ticket |
| PUT | /api/support/tickets/{id} | Update ticket status (admin/manager) |
| GET | /api/admin/users | List all users (admin/manager) |
| PUT | /api/admin/users/{id} | Update user (admin) |
| DELETE | /api/admin/users/{id} | Deactivate user (admin) |
| GET | /api/admin/audit-logs | View audit logs (admin) |
| GET | /api/admin/export | Export data (admin) |
| GET | /api/dashboard/stats | Get dashboard statistics |
| GET | /api/search | Search across the application |
| GET | /api/debug/info | Debug information |

Full interactive API documentation is available at `http://localhost:8000/docs` when the backend is running.

---

## Building for Production

### Frontend Production Build

```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized static files.

### Backend Production Mode

```bash
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Notes

- The application uses an **in-memory database**, so all data will be reset when the backend restarts
- File uploads are stored in `/tmp/uploads` and will be lost on system restart
- The default JWT secret key is hardcoded for demo purposes
