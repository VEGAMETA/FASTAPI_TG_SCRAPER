import multiprocessing
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.bot import Bot
from ..db.models.session import Session
from ..db.models.result import Result
from ..db.models.proxy import Proxy
from ..db.repositories.bot import BotRepository
from ..db.repositories.session import SessionRepository
from ..db.repositories.result import ResultRepository
from ..db.repositories.proxy import ProxyRepository
from ..utils.worker import Worker
from ..utils.file_manager import is_file_in_folder
from ..schemas.worker import WorkerData


def worker_process(username: str, session: str, proxy: dict, keywords: set[str], chats: set[str]):
    Worker(
        username=username,
        session=session,
        proxy=proxy,
        keywords=keywords,
        chats=chats
    ).run()

class WorkerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bot_repo = BotRepository(Bot)
        self.session_repo = SessionRepository(Session)
        self.result_repo = ResultRepository(Result)
        self.proxy_repo = ProxyRepository(Proxy)


    async def get_worker(self, username: str, session_token: str):
        for bot in await self.session_repo.get_bots_by_token(self.db, session_token):
            _bot = await self.bot_repo.get(self.db, bot)
            if _bot.username == username: return _bot

    async def get_usernames(self, session_token: str) -> list[str]:
        bots = await self.session_repo.get_bots_by_token(self.db, session_token)
        if not bots: return []
        return await self.bot_repo.get_usernames_by_uuids(self.db, bots)
    
    async def start_worker(self, data: WorkerData, session_token: str):
        bot: Bot = await self.get_worker(data.username, session_token)
        if not bot: return
        proxy: Proxy = await self.proxy_repo.get(self.db, bot.proxy_uuid)
        if not proxy: return
        await self.proxy_repo.occupy(self.db, proxy)

        multiprocessing.Process(target=worker_process, args=(
            data.username,
            bot.session_file,
            {
                "scheme":  "socks5" if proxy.protocol == "http" else proxy.protocol,
                "hostname": proxy.ip,
                "port": proxy.port,
                "username": proxy.username,
                "password": proxy.password
            },
            data.keywords,
            data.chats
        )).start()
        return True

    async def get_results(self, session_token: str) -> list[str]:
        usernames = await self.get_usernames(session_token)
        files = Path("./out").glob(f"*{usernames}.xlsx")
        files = sorted(files,key=lambda file: Path(file).lstat().st_mtime)[::-1]
        if not files: return []
        return [str(_file.name) for _file in files]
    
    async def get_file(self, filename: str, session_token: str) -> Path | None:
        usernames = await self.get_usernames(session_token)
        for username in usernames:
            if filename.endswith(f"{username}.xlsx"): break
        else: return
        path = Path(Path("out") / Path(filename)).absolute()
        if not path.exists(): return
        if not path.is_file(): return
        if not is_file_in_folder(path): return
        return path
