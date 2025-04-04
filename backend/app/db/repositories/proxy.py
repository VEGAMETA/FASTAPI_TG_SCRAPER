from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


from ..base_repository import BaseRepository
from ..models.proxy import Proxy
from ...schemas.pyrogram import PyrogramProxy

class ProxyRepository(BaseRepository[Proxy]):
    async def get_by_ip_port(self, db: AsyncSession, ip: str, port: int) -> Optional[Proxy]:
        result = await db.execute(select(self.model).where(self.model.ip == ip, self.model.port == port))
        return result.scalars().first()
    
    async def get_no_scheme(self, db: AsyncSession, proxy: PyrogramProxy) -> Optional[Proxy]:
        proxy_dump = proxy.model_dump()
        result = await db.execute(select(self.model).where(
            self.model.ip == proxy_dump.get("hostname"), 
            self.model.port == proxy_dump.get("port"),
            self.model.username == proxy_dump.get("username", None), 
            self.model.password == proxy_dump.get("password", None)
        ))
        return result.scalars().first()
    
    async def free(self, db: AsyncSession, proxy: Proxy) -> None:
        proxy.busy = False
        await db.commit()

    async def occupy(self, db: AsyncSession, proxy: Proxy) -> None:
        proxy.busy = True
        await db.commit()
