from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.bot import Bot
from ..db.models.session import Session
from ..db.models.result import Result
from ..db.repositories.bot import BotRepository
from ..db.repositories.session import SessionRepository
from ..db.repositories.result import ResultRepository


class WorkerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bot_repo = BotRepository(Bot)
        self.session_repo = SessionRepository(Session)
        self.result_repo = ResultRepository(Result)
