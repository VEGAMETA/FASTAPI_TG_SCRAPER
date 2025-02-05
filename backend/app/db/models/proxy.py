from sqlalchemy import UUID, Boolean, Column, Integer, String, func
from sqlalchemy.orm import relationship

from ..base import Base

class Proxy(Base):
    __tablename__ = "proxies"
    uuid = Column(UUID, server_default=func.gen_random_uuid(), primary_key=True)
    protocol = Column(String)
    ip = Column(String)
    port = Column(Integer)
    username = Column(String)
    password = Column(String)
    busy = Column(Boolean, default=False)
