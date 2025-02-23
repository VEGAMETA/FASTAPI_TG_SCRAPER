import multiprocessing

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
