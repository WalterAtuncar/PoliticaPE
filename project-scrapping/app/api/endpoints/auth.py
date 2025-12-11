from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
import bcrypt

from app.database import get_db

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
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
        
        return LoginResponse(
            success=True,
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

@router.get("/me")
async def get_current_user(user_id: str, db: Session = Depends(get_db)):
    """Get current user info"""
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
    
    user_id, email, name, tenant_id, role_name = result
    
    return {
        "id": str(user_id),
        "email": email,
        "name": name or "Usuario",
        "role": role_name or "analyst",
        "tenant_id": str(tenant_id) if tenant_id else None
    }
