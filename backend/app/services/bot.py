from pathlib import Path
from pyrogram import errors
from typing import Optional
from fastapi import HTTPException
from sqlalchemy import ARRAY, UUID, cast, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models.bot import Bot
from ..db.models.session import Session
from ..db.models.proxy import Proxy
from ..db.repositories.session import SessionRepository
from ..db.repositories.bot import BotRepository
from ..db.repositories.proxy import ProxyRepository
from ..utils.pyrogram_session_manager import PyrogramSessionManager
from ..utils.file_manager import delete_session_file
from ..schemas.pyrogram import PyrogramData, PyrogramProxy

class BotService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bot_repo = BotRepository(Bot)
        self.proxy_repo = ProxyRepository(Proxy)
        self.session_repo = SessionRepository(Session)

    async def create_session_from_tdata(self, username: str) -> Path:
        await PyrogramSessionManager.create_pyrogram_session_from_tdata(username)
        return Path(f"./sessions/{username}.session")

    async def check_pyrogram_session(self, username: str) -> bool:
        checked_session = await PyrogramSessionManager.check_pyrogram_session(username)
        if checked_session: return True
        delete_session_file(username)
        return False

    async def delete_bot_by_username(self, username: str) -> None:
        await self.bot_repo.delete_bot_by_username(self.db, username)

    async def check_bot_in_session_by_session_token(self, session_token: str, bot: Bot) -> bool:
        session: Session = await self.session_repo.get_by_token(self.db, session_token)
        if not session: return False
        if not session.bots: return False
        return bot.uuid in session.bots

    async def init_session_with_credentials(self, data: PyrogramData) -> PyrogramSessionManager:
        session_manager = PyrogramSessionManager(data)
        await session_manager.app.connect()
        try: await session_manager.send_code()
        except errors.exceptions.flood_420.FloodWait:
            raise HTTPException(status_code=429, detail="Flood wait")
        return session_manager

    async def confirm_sign_in_with_code(self, session_manager: PyrogramSessionManager, code: str) -> None:
        await session_manager.sign_in(code)
        session_manager.session_filepath = Path(f"./sessions/{session_manager.app.name}.session")
        if not await session_manager.check_pyrogram_session(session_manager.app.name):
            session_manager.session_filepath.unlink()
            raise HTTPException(status_code=400, detail="Session not created")

    async def create_bot(self, username: str, session_file: Path, proxy: PyrogramProxy, session_token: str) -> None:
        bot: Bot = await self.bot_repo.create(self.db, {
            "username": username,
            "session_file": str(session_file),
            "proxy_uuid": (await self.proxy_repo.get_no_scheme(self.db, proxy)).uuid
        })
        session = await self.session_repo.get_by_token(self.db, session_token)
        await self.session_repo.update(self.db, session.uuid, {"bots": func.array_append(func.coalesce(session.bots, cast([], ARRAY(UUID))), bot.uuid)})

    async def get_by_bot_username(self, username: str) -> Optional[Bot]:
        return await self.bot_repo.get_by_username(self.db, username)

    async def get_by_uuid(self, uuid: str) -> Optional[Bot]:
        return await self.bot_repo.get_by_uuid(self.db, uuid)

    async def get_all_by_session_uuid(self, uuid: str) -> Optional[Bot]:
        return await self.bot_repo.get_all_by_session_uuid(self.db, uuid)
