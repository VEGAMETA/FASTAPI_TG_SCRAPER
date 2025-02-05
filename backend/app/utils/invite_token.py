import asyncio

from uuid import uuid4

from ..core.logging import logger

INVITE_TOKEN = ""
lock = asyncio.Lock()


def get_invite_token() -> str:
    return INVITE_TOKEN

def is_valid_token(token: str) -> bool:
    return token == INVITE_TOKEN

async def regenerate_token() -> None:
    global INVITE_TOKEN
    
    while True:
        async with lock:
            INVITE_TOKEN = uuid4().hex + uuid4().hex + uuid4().hex
        logger.info(f"Regenerated token: {INVITE_TOKEN}")
        await asyncio.sleep(36000)
