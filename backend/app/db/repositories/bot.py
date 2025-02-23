from typing import Optional, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import UUID, delete, select

from ..base_repository import BaseRepository
from ..models.bot import Bot
from ..models.session import Session
from ..models.user import User


class BotRepository(BaseRepository[Bot]):
    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[Bot]:
        result = await db.execute(select(self.model).where(self.model.username == username))
        return result.scalars().first()

    async def delete_bot_by_username(self, db: AsyncSession, username: str) -> None:
        await db.execute(delete(self.model).where(self.model.username == username))
        await db.commit()

    async def get_usernames_by_uuids(self, db: AsyncSession, uuids: list[UUID]) -> list[str]:
        result = await db.execute(select(self.model).where(self.model.uuid.in_(uuids)))
        return [bot.username for bot in result.scalars().all()]
