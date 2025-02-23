from pydantic import BaseModel

class WorkerData(BaseModel):
    username: str
    chats: set[str] = set()
    keywords: set[str] = set()
