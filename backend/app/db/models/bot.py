from sqlalchemy import UUID, Column, ForeignKey, String, Boolean, func
from sqlalchemy.orm import relationship

from ..base import Base

class Bot(Base):
    __tablename__ = "bots"
    uuid = Column(UUID, server_default=func.gen_random_uuid(), primary_key=True)
    username = Column(String, index=True)
    proxy_uuid = Column(UUID, ForeignKey("proxies.uuid"))
    session_file = Column(String)
    keyword_file = Column(String, nullable=True)
    chats_file = Column(String, nullable=True)
    busy = Column(Boolean, default=False)
