from fastapi import APIRouter, Cookie, Request, HTTPException, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ....services.auth import AuthService
from ....db.session import get_db
from ....core.logging import logger
from ....schemas.auth import *


router = APIRouter()

@router.post("/signup")
async def signup(request: Request, signup_data: SignUpRequest, session: AsyncSession = Depends(get_db)):
    if not (session_token := await AuthService(session).signup(signup_data.username, signup_data.password, request.client.host, signup_data.invite_token)):
        raise HTTPException(status_code=400, detail="Unable to signup!")
    response = Response("Signup successful", status_code=200)
    response.set_cookie(key="session_token", value=session_token, httponly=True, samesite="Lax")
    return response

@router.post("/login")
async def login(request: Request, login_data: LogInRequest, session: AsyncSession = Depends(get_db)):
    if not (session_token := await AuthService(session).login(login_data.username, login_data.password)):
        raise HTTPException(status_code=401, detail="Incorrect username or password!")
    response = Response("Login successful", status_code=200)
    response.set_cookie(key="session_token", value=session_token, httponly=True, samesite="Lax")
    return response

@router.get("/check_auth")
async def check_auth(request: Request, session: AsyncSession = Depends(get_db), session_token = Cookie(None)):
    if not await AuthService(session).check_auth(session_token):
        raise HTTPException(status_code=401, detail="Not authenticated!")
    return {"message": "Authenticated"}

@router.post("/logout")
async def logout(request: Request):
    response: Response = Response("Logout successful", status_code=200)
    response.delete_cookie("session_token")
    return response

@router.get("/invite_token")
async def invite_token(request: Request, session: AsyncSession = Depends(get_db)):
    if not await AuthService(session).check_auth(request.cookies.get("session_token")):
        raise HTTPException(status_code=401, detail="Not authenticated!")
    invite_token = await AuthService(session).invite_token()
    response: Response = Response("Invite token: " + invite_token, status_code=200)
    return response
