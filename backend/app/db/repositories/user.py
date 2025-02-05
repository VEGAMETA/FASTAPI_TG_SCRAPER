from typing import Optional, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


from ..base_repository import BaseRepository
from ..models.bot import Bot
from ..models.user import User


class UserRepository(BaseRepository[User]):
    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.uuid == uuid))
        return result.scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.username == username))
        return result.scalars().first()
    
    async def get_by_credentials(self, db: AsyncSession, username: str, password: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.username == username and self.model.password_hash == password))
        return result.scalars().first()

    async def get_by_ip(self, db: AsyncSession, ip: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.ip == ip))
        return result.scalars().first()

    async def get_by_session_uuid(self, db: AsyncSession, session_uuid: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.session_uuid == session_uuid))
        return result.scalars().first()
    
    async def set_session(self, db: AsyncSession, user: User, session_uuid: str) -> None:
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.session_uuid = session_uuid
        await db.commit()
    
    async def get_session_uuid_by_token(self, db: AsyncSession, token: str) -> Optional[str]:
        user = await self.get_by_token(db, token)
        return user.session_uuid if user else None
