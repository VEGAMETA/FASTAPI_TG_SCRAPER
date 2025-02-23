import asyncio
import colorama
import uvloop

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.extension import RateLimitExceeded, _rate_limit_exceeded_handler

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .utils.invite_token import regenerate_token
from .api.v1.routers import api_v1_router
from .web.routers import web_router
from .db.base import Base
from .db.session import engine
from .utils import *


@asynccontextmanager
async def lifespan(app: FastAPI):
    colorama.init()
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    asyncio.get_event_loop().create_task(regenerate_token())
    yield


app = FastAPI(lifespan=lifespan, title="Search Bot API")

app.state.limiter = Limiter(key_func=get_remote_address, default_limits=["3/second"])
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(HTTPSRedirectMiddleware)

app.include_router(api_v1_router, prefix="/api/v1", tags=["api_v1"])
app.include_router(web_router, prefix="", tags=["web"])

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
