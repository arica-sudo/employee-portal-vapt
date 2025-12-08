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

# AWS Hosting Guide

This guide explains how to deploy the Employee Portal on AWS.

## Architecture Overview

- **Backend**: EC2 instance running FastAPI with Uvicorn
- **Frontend**: S3 bucket with CloudFront distribution (or EC2)
- **Database**: In-memory (for demo) or RDS PostgreSQL (for production)

---

## Option 1: EC2 Deployment (Recommended for Testing)

### Prerequisites

- AWS Account with EC2 access
- SSH key pair created in AWS
- Security group allowing ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8000 (API)

### Step 1: Launch EC2 Instance

1. Go to AWS Console > EC2 > Launch Instance
2. Choose **Ubuntu Server 22.04 LTS** AMI
3. Select instance type: **t2.medium** (minimum recommended)
4. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (8000) - Anywhere (for API)
   - Custom TCP (5173) - Anywhere (for frontend dev)
5. Launch with your SSH key pair

### Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.12
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Add Poetry to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 4: Clone Repository

```bash
cd ~
git clone https://github.com/<YOUR-USERNAME>/employee-portal.git
cd employee-portal
```

### Step 5: Setup Backend

```bash
cd ~/employee-portal/backend

# Install dependencies
poetry install

# Create environment file (optional)
echo 'SECRET_KEY=your-production-secret-key-here' > .env

# Test the backend
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
# Press Ctrl+C to stop after testing
```

### Step 6: Setup Frontend

```bash
cd ~/employee-portal/frontend

# Install dependencies
npm install

# Create environment file with your EC2 public IP
echo "VITE_API_URL=http://<EC2-PUBLIC-IP>:8000" > .env

# Build for production
npm run build
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/employee-portal
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/employee-portal/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /healthz {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/employee-portal /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Create Systemd Service for Backend

```bash
sudo nano /etc/systemd/system/employee-portal-api.service
```

Add:

```ini
[Unit]
Description=Employee Portal API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/employee-portal/backend
Environment="PATH=/home/ubuntu/.local/bin:/usr/bin"
ExecStart=/home/ubuntu/.local/bin/poetry run uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable employee-portal-api
sudo systemctl start employee-portal-api
sudo systemctl status employee-portal-api
```

### Step 9: Access the Application

Open your browser and navigate to:
- Frontend: `http://<EC2-PUBLIC-IP>`
- API Docs: `http://<EC2-PUBLIC-IP>/api/docs`

---

## Option 2: S3 + CloudFront (Frontend) + EC2 (Backend)

For production, you may want to serve the frontend from S3 with CloudFront.

### Frontend on S3

1. Create S3 bucket with static website hosting enabled
2. Upload the `frontend/dist` folder contents
3. Create CloudFront distribution pointing to S3
4. Update VITE_API_URL to point to your backend EC2

### Backend on EC2

Follow Steps 1-5 and 8 from Option 1.

---

## Option 3: Elastic Beanstalk

### Backend

1. Create `Procfile` in backend directory:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. Create Elastic Beanstalk environment with Python platform
3. Deploy using EB CLI or console

### Frontend

1. Build frontend: `npm run build`
2. Deploy to S3 or Amplify

---

## Security Considerations

For production deployment, consider:

1. **HTTPS**: Use AWS Certificate Manager with CloudFront or Let's Encrypt with Nginx
2. **Environment Variables**: Store secrets in AWS Secrets Manager or Parameter Store
3. **Database**: Use RDS PostgreSQL instead of in-memory storage
4. **WAF**: Enable AWS WAF for additional protection
5. **VPC**: Deploy in a private VPC with proper security groups

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
sudo journalctl -u employee-portal-api -f

# Check if port is in use
sudo lsof -i :8000
```

### Frontend not loading
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build files exist
ls -la ~/employee-portal/frontend/dist
```

### CORS issues
Ensure the backend CORS settings allow your frontend domain.

---

## Local Development

### Backend
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET | /api/users/me | Get current user |
| GET | /api/announcements | List announcements |
| POST | /api/files/upload | Upload file |
| GET | /api/support/tickets | List support tickets |
| GET | /api/admin/users | List all users (admin) |
| GET | /api/admin/audit-logs | View audit logs (admin) |

Full API documentation available at `/docs` when running the backend.
