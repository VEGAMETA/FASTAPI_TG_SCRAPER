from fastapi import APIRouter
from .endpoints import auth, worker, proxy, bot


api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(worker.router, prefix="/worker", tags=["worker"])
api_v1_router.include_router(proxy.router, prefix="/proxy", tags=["proxy"])
api_v1_router.include_router(bot.router, prefix="/bot", tags=["bot"])
