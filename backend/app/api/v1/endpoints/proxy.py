from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ....services.auth import AuthService
from ....services.proxy import ProxyService
from ....db.session import get_db
from ....schemas.pyrogram import PyrogramData, PyrogramProxy
from ....core.logging import logger
from .auth import check_auth

router = APIRouter()


@router.post("/check_proxy")
async def check_proxy(request: Request, proxy: PyrogramProxy, session: AsyncSession = Depends(get_db), _ = Depends(check_auth)):
    if not await ProxyService(session).check_proxy(proxy): raise HTTPException(status_code=400, detail="Bad Proxy!")
    return {"message": "Proxy is ok!"}
