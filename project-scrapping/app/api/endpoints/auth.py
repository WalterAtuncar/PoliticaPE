from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
import bcrypt

from app.database import get_db
from app.api.deps import create_access_token, get_current_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[dict] = None
    message: str

class RegisterResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    message: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    tenant_id: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password"""
    try:
        result = db.execute(
            text("""
                SELECT u.id, u.email, u.name, u.password_hash, u.is_active, u.tenant_id,
                       COALESCE(r.name, 'analyst') as role_name
                FROM identity.users u
                LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
                LEFT JOIN identity.roles r ON ur.role_id = r.id
                WHERE u.email = :email
            """),
            {"email": request.email}
        ).fetchone()
        
        if not result:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
        user_id, email, name, password_hash, is_active, tenant_id, role_name = result
        
        if not is_active:
            raise HTTPException(status_code=401, detail="Usuario inactivo")
        
        if not verify_password(request.password, password_hash):
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")
        
        db.execute(
            text("UPDATE identity.users SET last_login_at = NOW() WHERE id = :id"),
            {"id": user_id}
        )
        db.commit()

        access_token = create_access_token(data={
            "sub": str(user_id),
            "email": email,
        })

        return LoginResponse(
            success=True,
            token=access_token,
            user={
                "id": str(user_id),
                "email": email,
                "name": name or "Usuario",
                "role": role_name or "analyst",
                "tenant_id": str(tenant_id) if tenant_id else None
            },
            message="Login exitoso"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de autenticación: {str(e)}")

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        existing = db.execute(
            text("SELECT id FROM identity.users WHERE email = :email"),
            {"email": request.email}
        ).fetchone()
        
        if existing:
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
        if len(request.password) < 6:
            raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
        
        password_hash = hash_password(request.password)
        
        default_tenant = db.execute(
            text("SELECT id FROM identity.tenants LIMIT 1")
        ).fetchone()
        tenant_id = default_tenant[0] if default_tenant else None
        
        result = db.execute(
            text("""
                INSERT INTO identity.users (email, name, password_hash, tenant_id, is_active, created_at)
                VALUES (:email, :name, :password_hash, :tenant_id, true, NOW())
                RETURNING id, email, name
            """),
            {
                "email": request.email,
                "name": request.name,
                "password_hash": password_hash,
                "tenant_id": tenant_id
            }
        ).fetchone()
        
        user_id = result[0]
        
        analyst_role = db.execute(
            text("SELECT id FROM identity.roles WHERE name = 'analyst' LIMIT 1")
        ).fetchone()
        
        if analyst_role and tenant_id:
            db.execute(
                text("INSERT INTO identity.user_roles (user_id, role_id, tenant_id) VALUES (:user_id, :role_id, :tenant_id)"),
                {"user_id": user_id, "role_id": analyst_role[0], "tenant_id": tenant_id}
            )
        
        db.commit()
        
        return RegisterResponse(
            success=True,
            user={
                "id": str(user_id),
                "email": result[1],
                "name": result[2],
                "role": "analyst"
            },
            message="Usuario registrado exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar: {str(e)}")

@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user info (requires JWT token)"""
    user_id = current_user["user_id"]
    result = db.execute(
        text("""
            SELECT u.id, u.email, u.name, u.tenant_id,
                   COALESCE(r.name, 'analyst') as role_name
            FROM identity.users u
            LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
            LEFT JOIN identity.roles r ON ur.role_id = r.id
            WHERE u.id = :id::uuid
        """),
        {"id": user_id}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    uid, email, name, tenant_id, role_name = result

    return {
        "id": str(uid),
        "email": email,
        "name": name or "Usuario",
        "role": role_name or "analyst",
        "tenant_id": str(tenant_id) if tenant_id else None
    }
