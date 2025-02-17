import asyncio
import shutil

from typing import Optional
from pathlib import Path
from pyrogram import Client, errors, enums, types
from TGConvertor import SessionManager

from ..schemas.pyrogram import PyrogramData, SessionStatus


class PyrogramSessionManager:
    def __init__(self, data: PyrogramData):
        self.app: Client = Client(
            data.username,
            api_id=data.api_id,
            api_hash=data.api_hash,
            phone_number=data.phone_number,
            proxy=data.proxy.model_dump(),
            workdir="./sessions",
        )

    async def send_code(self) -> tuple[str, str]:
        sent_code = await self.app.send_code(self.app.phone_number)
        sent_code_descriptions = {
            enums.SentCodeType.APP: "Telegram app",
            enums.SentCodeType.SMS: "SMS",
            enums.SentCodeType.CALL: "phone call",
            enums.SentCodeType.FLASH_CALL: "phone flash call",
            enums.SentCodeType.FRAGMENT_SMS: "Fragment SMS",
            enums.SentCodeType.EMAIL_CODE: "email code"
        }
        self.phone_code_hash = sent_code.phone_code_hash
        return f"The confirmation code has been sent via {sent_code_descriptions[sent_code.type]}"
        

    async def sign_in(self, phone_code: str) -> Optional[str]:
        try:
            signed_in = await self.app.sign_in(self.app.phone_number, self.phone_code_hash, phone_code)
            if isinstance(signed_in, types.TermsOfService):
                await self.accept_terms_of_service(signed_in.id)
        except (
            errors.BadRequest,
            errors.SessionPasswordNeeded
        ) as e: return e.MESSAGE

    @classmethod
    async def check_pyrogram_session(cls, username: str) -> SessionStatus:
        app = Client(username, workdir="./sessions")
        try:
            await asyncio.wait_for(app.connect(), 7) # 4 server sent transport error: 404 (auth key not found)
        except AttributeError: return SessionStatus(status=False, message="Session not found")
        except TimeoutError: return SessionStatus(status=False, message="Server sent transport error: 404 (auth key not found)")
        
        try:
            await app.get_me()
        except (
            errors.ActiveUserRequired,
            errors.AuthKeyInvalid,
            errors.AuthKeyPermEmpty,
            errors.AuthKeyUnregistered,
            errors.AuthKeyDuplicated,
            errors.SessionExpired,
            errors.SessionPasswordNeeded,
            errors.SessionRevoked,
            errors.UserDeactivated,
            errors.UserDeactivatedBan,
        ) as e: return SessionStatus(status=False, message=e.MESSAGE)
        finally: await app.disconnect()
        return SessionStatus(status=True, message="Session is valid")

    @classmethod
    async def create_pyrogram_session_from_tdata(cls, username:str) -> None:
        tdata_path = Path(f'./temp/tdatas/{username}')
        session = SessionManager.from_tdata_folder(tdata_path)
        session_file = Path(f'./sessions/{username}.session')
        if session_file.exists(): session_file.unlink()
        await session.to_pyrogram_file(session_file)
        shutil.rmtree(tdata_path, ignore_errors=True)
