from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession


from ..utils.invite_token import is_valid_token, get_invite_token
from ..core.security import create_access_token
from ..db.models.user import User
from ..db.models.session import Session
from ..db.repositories.user import UserRepository
from ..db.repositories.session import SessionRepository



class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(User)
        self.session_repo = SessionRepository(Session)

    async def _check_create_session(self, user: User) -> Optional[Session]:
        if not user: return
        session: Session = await self.session_repo.get_by_user(self.db, user.uuid)
        if session: return session
        session = await self.session_repo.create(self.db, {"user_uuid": user.uuid, "token": create_access_token({"uuid": str(user.uuid)})})
        return session

    async def signup(self, username: str, password:str, ip: str, invite_token: str) -> Optional[User]:
        if not is_valid_token(invite_token): raise HTTPException(status_code=400, detail="Invite token is invalid")
        user: User = await self.user_repo.get_by_username(self.db, username)
        if user: raise HTTPException(status_code=400, detail="User already exists")
        user = await self.user_repo.create(self.db, {"username": username, "password_hash": password, "ip": ip})
        if not user: raise HTTPException(status_code=500, detail="User not created")
        session = await self._check_create_session(user)
        if not session: raise HTTPException(status_code=500, detail="Session not created")
        return session.token

    async def login(self, username: str, password: str) -> Optional[str]:
        user: User = await self.user_repo.get_by_credentials(self.db, username, password)
        session = await self._check_create_session(user)
        if not session: raise HTTPException(status_code=500, detail="Session not created")
        return session.token

    async def check_auth(self, session_token: Optional[str]) -> bool:
        session: Session = await self.session_repo.get_by_token(self.db, session_token)
        if not session: return False
        user: User = await self.user_repo.get_by_uuid(self.db, session.user_uuid)
        return user is not None
    
    async def invite_token(self) -> str:
        return get_invite_token()
