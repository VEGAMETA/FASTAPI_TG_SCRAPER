from sqlalchemy import ARRAY, UUID, Column, DateTime, ForeignKey, String, func

from ..base import Base

class Result(Base):
    __tablename__ = "results"
    uuid = Column(UUID, server_default=func.gen_random_uuid())
    user_uuid = Column(UUID, ForeignKey("users.uuid"), primary_key=True)
    data_filepath = Column(String)

    time_start = Column(DateTime, server_default=func.now())
    time_end = Column(DateTime, nullable=True)
    bots_uuids = Column(ARRAY(UUID))
    chats = Column(ARRAY(String))
    keywords = Column(ARRAY(String))
    status = Column(String)
