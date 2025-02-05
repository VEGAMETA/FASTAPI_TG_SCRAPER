from fastapi import APIRouter
from .endpoints import home


web_router = APIRouter()

web_router.include_router(home.router, tags=["web"])
