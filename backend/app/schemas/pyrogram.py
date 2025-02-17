from typing import Optional
from pydantic import BaseModel


class PyrogramProxy(BaseModel):
    scheme: str
    hostname: str
    port: int
    username: Optional[str]
    password: Optional[str]

class PyrogramData(BaseModel):
    api_id: int
    api_hash: str
    username: str
    phone_number: str
    proxy: PyrogramProxy

class TData(BaseModel):
    username: str
    proxy: PyrogramProxy

class SessionStatus(BaseModel):
    status: bool
    message: str

class CodeData(BaseModel):
    code: str
