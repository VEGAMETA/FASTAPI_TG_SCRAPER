from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.pyrogram import PyrogramProxy
from ..db.models.proxy import Proxy
from ..db.repositories.proxy import ProxyRepository
from ..utils.proxy_checker import ProxyChecker

class ProxyService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.proxy_repository = ProxyRepository(Proxy)

    async def check_proxy(self, proxy: PyrogramProxy) -> bool:
        _proxy: Proxy = await self.proxy_repository.get(self.db, proxy) if proxy.username and proxy.password else await self.proxy_repository.get_by_ip_port(self.db, proxy.hostname, proxy.port) 
        if not ProxyChecker.check_proxy(proxy):
            if _proxy: await self.proxy_repository.delete(self.db, _proxy)
            raise HTTPException(status_code=400, detail="Bad Proxy!")
        else:
            if _proxy and _proxy.busy: raise HTTPException(status_code=400, detail="Proxy is busy!")
            if not _proxy: _proxy = await self.proxy_repository.create(self.db, {
                    "protocol": proxy.scheme,
                    "ip": proxy.hostname,
                    "port": proxy.port,
                    "username": proxy.username,
                    "password": proxy.password,
                }
            )
            if not _proxy: raise HTTPException(status_code=400, detail="Bad Proxy!")
        return True
