from sqlalchemy import ARRAY, UUID, Column, ForeignKey, String, func

from ..base import Base

class Session(Base):
    __tablename__ = "sessions"
    uuid = Column(UUID, server_default=func.gen_random_uuid(), primary_key=True, unique=True)
    user_uuid = Column(UUID, ForeignKey("users.uuid"))
    token = Column(String, index=True)
    bots = Column(ARRAY(UUID))
