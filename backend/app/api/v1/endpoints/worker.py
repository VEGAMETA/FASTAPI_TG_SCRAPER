from fastapi import APIRouter, Depends, Request, HTTPException

from ....services.worker import WorkerService

from ....schemas.pyrogram import PyrogramData

router = APIRouter()

# USE DOCKER
# GET WORKERS, RUN WORKER, CHECK WORKER, CREATE WORKER, DELETE WORKER
# GET WORKER DATA, GET WORKER STATUS, GET WORKER LOGS

@router.post("/work!")
async def get_user_workers(request: Request):
    pass

@router.post("/init_worker")
async def init_worker(request: Request, data: PyrogramData):
    pass