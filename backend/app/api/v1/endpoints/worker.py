from fastapi import APIRouter, Cookie, Depends, Request, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ....core.logging import logger
from ....services.worker import WorkerService
from ....schemas.worker import WorkerData
from ....db.session import get_db
from .auth import check_auth

router = APIRouter()


@router.post("/start")
async def run_worker(request: Request, data: WorkerData, session: AsyncSession = Depends(get_db), _ = Depends(check_auth), session_token = Cookie(...)):
    if not await WorkerService(session).start_worker(data, session_token):
        raise HTTPException(status_code=400, detail="Unable to start worker!")
    return {"message": "Worker started!"}

@router.get("/results")
async def get_results(request: Request, session: AsyncSession = Depends(get_db), _ = Depends(check_auth), session_token = Cookie(...)):
    results = await WorkerService(session).get_results(session_token)
    return {"results": results}

@router.get("/results/{filename}")
async def get_reuslt_file(request: Request, filename: str, session: AsyncSession = Depends(get_db), _ = Depends(check_auth), session_token = Cookie(...)):
    path = await WorkerService(session).get_file(filename, session_token)
    if not path: raise HTTPException(status_code=404, detail="File not found!")
    return FileResponse(path, media_type='application/octet-stream', filename=filename)
