from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid
import shutil

app = FastAPI(title="Acme Corp Employee Portal", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configuration
SECRET_KEY = "acme-corp-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
UPLOAD_DIR = "/tmp/uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# In-memory database
users_db = {
    "admin@acmecorp.com": {
        "id": 1,
        "email": "admin@acmecorp.com",
        "password": pwd_context.hash("admin123"),
        "full_name": "System Administrator",
        "role": "admin",
        "department": "IT",
        "employee_id": "EMP001",
        "created_at": datetime.now().isoformat(),
        "is_active": True
    },
    "john.doe@acmecorp.com": {
        "id": 2,
        "email": "john.doe@acmecorp.com",
        "password": pwd_context.hash("password123"),
        "full_name": "John Doe",
        "role": "employee",
        "department": "Engineering",
        "employee_id": "EMP002",
        "created_at": datetime.now().isoformat(),
        "is_active": True
    },
    "jane.smith@acmecorp.com": {
        "id": 3,
        "email": "jane.smith@acmecorp.com",
        "password": pwd_context.hash("password123"),
        "full_name": "Jane Smith",
        "role": "manager",
        "department": "HR",
        "employee_id": "EMP003",
        "created_at": datetime.now().isoformat(),
        "is_active": True
    }
}

announcements_db = [
    {
        "id": 1,
        "title": "Welcome to Acme Corp Portal",
        "content": "We are excited to launch our new employee portal. Please update your profile information.",
        "author": "System Administrator",
        "created_at": datetime.now().isoformat(),
        "priority": "high"
    },
    {
        "id": 2,
        "title": "Q4 Performance Reviews",
        "content": "Performance reviews will begin next week. Please prepare your self-assessments.",
        "author": "HR Department",
        "created_at": datetime.now().isoformat(),
        "priority": "medium"
    }
]

files_db = []
support_tickets_db = []
audit_logs = []

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    department: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: str
    employee_id: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "medium"

class SupportTicket(BaseModel):
    subject: str
    description: str
    priority: str = "medium"

class PasswordReset(BaseModel):
    email: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(email: str):
    if email in users_db:
        return users_db[email]
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(email)
    if user is None:
        raise credentials_exception
    return user

def log_action(user_email: str, action: str, details: str = ""):
    audit_logs.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_email,
        "action": action,
        "details": details
    })

# Health check
@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Authentication endpoints
@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        log_action(form_data.username, "LOGIN_FAILED", "Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    log_action(user["email"], "LOGIN_SUCCESS", "")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register")
async def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_id = max([u["id"] for u in users_db.values()]) + 1
    employee_id = f"EMP{str(new_id).zfill(3)}"
    
    users_db[user.email] = {
        "id": new_id,
        "email": user.email,
        "password": get_password_hash(user.password),
        "full_name": user.full_name,
        "role": "employee",
        "department": user.department,
        "employee_id": employee_id,
        "created_at": datetime.now().isoformat(),
        "is_active": True
    }
    log_action(user.email, "USER_REGISTERED", f"New user registered: {user.full_name}")
    return {"message": "User registered successfully", "employee_id": employee_id}

@app.post("/api/auth/password-reset")
async def request_password_reset(data: PasswordReset):
    user = get_user(data.email)
    if user:
        # In production, this would send an email
        reset_token = create_access_token({"sub": data.email, "type": "reset"}, timedelta(hours=1))
        log_action(data.email, "PASSWORD_RESET_REQUESTED", "")
        return {"message": "Password reset link sent to email", "debug_token": reset_token}
    return {"message": "If the email exists, a reset link will be sent"}

@app.post("/api/auth/change-password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    users_db[current_user["email"]]["password"] = get_password_hash(data.new_password)
    log_action(current_user["email"], "PASSWORD_CHANGED", "")
    return {"message": "Password changed successfully"}

# User profile endpoints
@app.get("/api/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        department=current_user["department"],
        employee_id=current_user["employee_id"],
        is_active=current_user["is_active"]
    )

@app.put("/api/users/me")
async def update_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    if update.full_name:
        users_db[current_user["email"]]["full_name"] = update.full_name
    if update.department:
        users_db[current_user["email"]]["department"] = update.department
    log_action(current_user["email"], "PROFILE_UPDATED", "")
    return {"message": "Profile updated successfully"}

# Admin endpoints
@app.get("/api/admin/users")
async def list_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return [
        {
            "id": u["id"],
            "email": u["email"],
            "full_name": u["full_name"],
            "role": u["role"],
            "department": u["department"],
            "employee_id": u["employee_id"],
            "is_active": u["is_active"]
        }
        for u in users_db.values()
    ]

@app.get("/api/admin/users/{user_id}")
async def get_user_by_id(user_id: int, current_user: dict = Depends(get_current_user)):
    for user in users_db.values():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "department": user["department"],
                "employee_id": user["employee_id"],
                "is_active": user["is_active"],
                "created_at": user["created_at"]
            }
    raise HTTPException(status_code=404, detail="User not found")

@app.put("/api/admin/users/{user_id}")
async def admin_update_user(user_id: int, update: UserUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    for email, user in users_db.items():
        if user["id"] == user_id:
            if update.full_name:
                users_db[email]["full_name"] = update.full_name
            if update.department:
                users_db[email]["department"] = update.department
            if update.role:
                users_db[email]["role"] = update.role
            log_action(current_user["email"], "ADMIN_USER_UPDATE", f"Updated user {user_id}")
            return {"message": "User updated successfully"}
    raise HTTPException(status_code=404, detail="User not found")

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    for email, user in users_db.items():
        if user["id"] == user_id:
            users_db[email]["is_active"] = False
            log_action(current_user["email"], "USER_DEACTIVATED", f"Deactivated user {user_id}")
            return {"message": "User deactivated successfully"}
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/admin/audit-logs")
async def get_audit_logs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return audit_logs

# Announcements endpoints
@app.get("/api/announcements")
async def get_announcements(current_user: dict = Depends(get_current_user)):
    return announcements_db

@app.post("/api/announcements")
async def create_announcement(announcement: AnnouncementCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to create announcements")
    
    new_id = max([a["id"] for a in announcements_db]) + 1 if announcements_db else 1
    new_announcement = {
        "id": new_id,
        "title": announcement.title,
        "content": announcement.content,
        "author": current_user["full_name"],
        "created_at": datetime.now().isoformat(),
        "priority": announcement.priority
    }
    announcements_db.append(new_announcement)
    log_action(current_user["email"], "ANNOUNCEMENT_CREATED", f"Created: {announcement.title}")
    return new_announcement

@app.delete("/api/announcements/{announcement_id}")
async def delete_announcement(announcement_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for i, ann in enumerate(announcements_db):
        if ann["id"] == announcement_id:
            announcements_db.pop(i)
            log_action(current_user["email"], "ANNOUNCEMENT_DELETED", f"Deleted announcement {announcement_id}")
            return {"message": "Announcement deleted"}
    raise HTTPException(status_code=404, detail="Announcement not found")

# File management endpoints
@app.post("/api/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_record = {
        "id": file_id,
        "filename": file.filename,
        "original_name": file.filename,
        "path": file_path,
        "size": os.path.getsize(file_path),
        "uploaded_by": current_user["email"],
        "uploaded_at": datetime.now().isoformat(),
        "description": description,
        "content_type": file.content_type
    }
    files_db.append(file_record)
    log_action(current_user["email"], "FILE_UPLOADED", f"Uploaded: {file.filename}")
    return {"message": "File uploaded successfully", "file_id": file_id}

@app.get("/api/files")
async def list_files(current_user: dict = Depends(get_current_user)):
    return [
        {
            "id": f["id"],
            "filename": f["filename"],
            "size": f["size"],
            "uploaded_by": f["uploaded_by"],
            "uploaded_at": f["uploaded_at"],
            "description": f["description"]
        }
        for f in files_db
    ]

@app.get("/api/files/download/{file_id}")
async def download_file(file_id: str, current_user: dict = Depends(get_current_user)):
    for f in files_db:
        if f["id"] == file_id:
            if os.path.exists(f["path"]):
                log_action(current_user["email"], "FILE_DOWNLOADED", f"Downloaded: {f['filename']}")
                return FileResponse(f["path"], filename=f["original_name"])
            raise HTTPException(status_code=404, detail="File not found on disk")
    raise HTTPException(status_code=404, detail="File not found")

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    for i, f in enumerate(files_db):
        if f["id"] == file_id:
            if f["uploaded_by"] != current_user["email"] and current_user["role"] != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to delete this file")
            if os.path.exists(f["path"]):
                os.remove(f["path"])
            files_db.pop(i)
            log_action(current_user["email"], "FILE_DELETED", f"Deleted: {f['filename']}")
            return {"message": "File deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")

# Support ticket endpoints
@app.post("/api/support/tickets")
async def create_ticket(ticket: SupportTicket, current_user: dict = Depends(get_current_user)):
    ticket_id = len(support_tickets_db) + 1
    new_ticket = {
        "id": ticket_id,
        "subject": ticket.subject,
        "description": ticket.description,
        "priority": ticket.priority,
        "status": "open",
        "created_by": current_user["email"],
        "created_at": datetime.now().isoformat(),
        "assigned_to": None,
        "comments": []
    }
    support_tickets_db.append(new_ticket)
    log_action(current_user["email"], "TICKET_CREATED", f"Created ticket: {ticket.subject}")
    return new_ticket

@app.get("/api/support/tickets")
async def list_tickets(current_user: dict = Depends(get_current_user)):
    if current_user["role"] in ["admin", "manager"]:
        return support_tickets_db
    return [t for t in support_tickets_db if t["created_by"] == current_user["email"]]

@app.get("/api/support/tickets/{ticket_id}")
async def get_ticket(ticket_id: int, current_user: dict = Depends(get_current_user)):
    for ticket in support_tickets_db:
        if ticket["id"] == ticket_id:
            if current_user["role"] in ["admin", "manager"] or ticket["created_by"] == current_user["email"]:
                return ticket
            raise HTTPException(status_code=403, detail="Not authorized")
    raise HTTPException(status_code=404, detail="Ticket not found")

@app.put("/api/support/tickets/{ticket_id}")
async def update_ticket(ticket_id: int, status: str = Query(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for ticket in support_tickets_db:
        if ticket["id"] == ticket_id:
            ticket["status"] = status
            log_action(current_user["email"], "TICKET_UPDATED", f"Updated ticket {ticket_id} status to {status}")
            return ticket
    raise HTTPException(status_code=404, detail="Ticket not found")

# Search endpoint
@app.get("/api/search")
async def search(q: str = Query(...), current_user: dict = Depends(get_current_user)):
    results = {
        "users": [],
        "announcements": [],
        "files": [],
        "tickets": []
    }
    
    q_lower = q.lower()
    
    # Search users (admin/manager only)
    if current_user["role"] in ["admin", "manager"]:
        for user in users_db.values():
            if q_lower in user["full_name"].lower() or q_lower in user["email"].lower():
                results["users"].append({
                    "id": user["id"],
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "department": user["department"]
                })
    
    # Search announcements
    for ann in announcements_db:
        if q_lower in ann["title"].lower() or q_lower in ann["content"].lower():
            results["announcements"].append(ann)
    
    # Search files
    for f in files_db:
        if q_lower in f["filename"].lower() or q_lower in f.get("description", "").lower():
            results["files"].append({
                "id": f["id"],
                "filename": f["filename"],
                "uploaded_by": f["uploaded_by"]
            })
    
    return results

# Dashboard stats
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    stats = {
        "total_announcements": len(announcements_db),
        "total_files": len(files_db),
        "my_tickets": len([t for t in support_tickets_db if t["created_by"] == current_user["email"]]),
        "open_tickets": len([t for t in support_tickets_db if t["status"] == "open"])
    }
    
    if current_user["role"] in ["admin", "manager"]:
        stats["total_users"] = len(users_db)
        stats["active_users"] = len([u for u in users_db.values() if u["is_active"]])
        stats["total_tickets"] = len(support_tickets_db)
    
    return stats

# Export endpoint (admin only)
@app.get("/api/admin/export")
async def export_data(data_type: str = Query(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if data_type == "users":
        return {"data": [
            {k: v for k, v in u.items() if k != "password"} 
            for u in users_db.values()
        ]}
    elif data_type == "audit":
        return {"data": audit_logs}
    elif data_type == "tickets":
        return {"data": support_tickets_db}
    else:
        raise HTTPException(status_code=400, detail="Invalid data type")

# Debug endpoint (should be disabled in production)
@app.get("/api/debug/info")
async def debug_info():
    return {
        "app_version": "1.0.0",
        "environment": "development",
        "upload_dir": UPLOAD_DIR,
        "total_users": len(users_db),
        "jwt_algorithm": ALGORITHM
    }
