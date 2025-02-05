from pydantic import BaseModel

class CheckSessionRequest(BaseModel):
    session_token: str

class LogInRequest(BaseModel):
    username: str
    password: str

class SignUpRequest(BaseModel):
    username: str
    password: str
    invite_token: str
