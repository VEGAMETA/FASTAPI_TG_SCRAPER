from fastapi import APIRouter, File, Form, UploadFile, WebSocket, WebSocketDisconnect, Depends, Request, HTTPException, Cookie
from sqlalchemy.ext.asyncio import AsyncSession


from ....services.auth import AuthService
from ....services.bot import BotService
from ....services.proxy import ProxyService
from ....db.session import get_db
from ....core.logging import logger
from ....schemas.pyrogram import PyrogramData, SessionStatus, TData, PyrogramProxy, CodeData
from ....schemas.status import Status
from .auth import check_auth
from ....utils.file_manager import validate_archive_file, unarchive_tdata, delete_tdata

router = APIRouter()

@router.get("/fetch_bots")
async def fetch_bots(session: AsyncSession = Depends(get_db), _ = Depends(check_auth), session_token = Cookie(...)):
    bots = await BotService(session).fetch_bots_usernames(session_token)
    return {"bots": bots}

@router.post("/create/tdata")
async def create_tdata(
    tdata_archive_file: UploadFile = File(...), 
    username: str = Form(...), 
    proxy_scheme: str = Form(...),  
    proxy_hostname: str = Form(...),  
    proxy_port: str = Form(...),  
    proxy_username: str | None = Form(...),  
    proxy_password: str | None = Form(...),  
    session: AsyncSession = Depends(get_db), 
    _ = Depends(check_auth),
    session_token = Cookie(...)
    ):
    data = TData(
        username=username, 
        proxy=PyrogramProxy(
            scheme=proxy_scheme, 
            hostname=proxy_hostname, 
            port=int(proxy_port), 
            username=proxy_username, 
            password=proxy_password
        )
    )
    if not await ProxyService(session).check_proxy(data.proxy): raise HTTPException(status_code=400, detail="Bad Proxy!") 
    
    data.proxy.scheme = "socks5" if data.proxy.scheme == "http" else data.proxy.scheme
    bot = await BotService(session).get_by_bot_username(data.username)
    check_bot: SessionStatus
    
    if bot:
        check_bot = await BotService(session).check_pyrogram_session(data.username)
        if not check_bot.status:
            await BotService(session).delete_bot_by_username(data.username)
            raise HTTPException(status_code=300, detail=f"Try again, {check_bot.message}")
        if await BotService(session).check_bot_in_session_by_session_token(session_token, bot):
            return {"message": "Bot already exists"}
        raise HTTPException(status_code=400, detail="Bot already exists")
    try:
        tdata_archive_file = await validate_archive_file(tdata_archive_file)
        unarchive_tdata(tdata_archive_file, data.username)
        session_file = await BotService(session).create_session_from_tdata(data.username)
        check_bot = await BotService(session).check_pyrogram_session(data.username)
        if not check_bot.status:
            raise HTTPException(status_code=500, detail=check_bot.message)
        await BotService(session).create_bot(
            data.username, 
            session_file, 
            data.proxy, 
            session_token
        )
        
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        delete_tdata(data.username)
    return {"message": "Bot created"}

@router.websocket("/create/credentials")
async def create_credentials(websocket: WebSocket, session: AsyncSession = Depends(get_db), session_token: str = Cookie(...)):
    if not await AuthService(session).check_auth(session_token):
        raise HTTPException(status_code=401, detail="Not authenticated!")

    await websocket.accept()

    try:
        data = PyrogramData(**(await websocket.receive_json()))
    except:
        await websocket.send_json({"status": Status.FAIL, "message": "Bot Not Created. Bad Credentials!"})
        return await websocket.close()

    if not await ProxyService(session).check_proxy(data.proxy): 
        await websocket.send_json({"status": Status.FAIL, "message": "Bot Not Created. Bad Proxy!"})
        return await websocket.close()
    
    data.proxy.scheme = "socks5" if data.proxy.scheme == "http" else data.proxy.scheme
    bot = await BotService(session).get_by_bot_username(data.username)
    if bot:
        status = Status.SUCCESS if await BotService(session).check_bot_in_session_by_session_token(session_token, bot) else Status.FAIL
        await websocket.send_json({"status": status, "message": "Bot Already Exists."})
        return await websocket.close()
    
    try: 
        bot_session = await BotService(session).init_session_with_credentials(data)
    except:
        await websocket.send_json({"status": Status.FAIL, "message": "Bot Not Created. Bad Bot Credentials!"})
        return await websocket.close()
    await websocket.send_json({"status": Status.AWAITING, "message": "Send Telegram Code."})
    
    try:
        code_data = CodeData(**(await websocket.receive_json()))
        await BotService(session).confirm_sign_in_with_code(bot_session, code_data.code)
        await BotService(session).create_bot(
            bot_session.app.name,
            bot_session.session_filepath.as_posix(),
            data.proxy,
            session_token
        )
        await websocket.send_json({"status": Status.SUCCESS, "message": "Bot Created."})
    except Exception as e:
        logger.error(e)
        await websocket.send_json({"status": Status.FAIL, "message": "Bot Not Created."})
    await websocket.close()
