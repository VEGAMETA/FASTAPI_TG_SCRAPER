from sqlalchemy import UUID, Column, ForeignKey, String, func

from ..base import Base

class User(Base):
    __tablename__ = "users"
    uuid = Column(UUID, server_default=func.gen_random_uuid(), primary_key=True, unique=True)
    ip = Column(String)
    username = Column(String, index=True)
    password_hash = Column(String)
    session_uuid = Column(UUID, ForeignKey("sessions.uuid"), nullable=True)
