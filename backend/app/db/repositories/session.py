from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select


from ..base_repository import BaseRepository
from ..models.session import Session


class SessionRepository(BaseRepository[Session]):
    async def get_by_user(self, db: AsyncSession, user_uuid: str) -> Optional[Session]:
        result = await db.execute(select(self.model).where(self.model.user_uuid == user_uuid))
        return result.scalars().first()

    async def get_by_token(self, db: AsyncSession, token: str) -> Optional[Session]:
        result = await db.execute(select(self.model).where(self.model.token == token))
        return result.scalars().first()

