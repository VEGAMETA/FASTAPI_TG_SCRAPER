from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select


from ..base_repository import BaseRepository
from ..models.session import Session
from ..models.bot import Bot
from ..models.result import Result

class ResultRepository(BaseRepository[Result]):
    def get_all_by_user_uuid(self, db: AsyncSession, uuid: str) -> Optional[Result]:
        result = db.execute(select(self.model).where(self.model.user_uuid == uuid))
        return result.scalars().all()
    
    def set_end_time(self, db: AsyncSession, uuid: str, end_time: datetime):
        self.update(db, uuid, {"time_end": end_time})
