import logging

from .config import settings

# logging_config = {
#     "version": 1,
#     "formatters": {
#         "default": {
#             "format": "%(levelname)s: %(asctime)s - %(name)s -  - %(message)s",
#         },
#     },
#     "handlers": {
#         "console": {
#             "class": "logging.StreamHandler",
#             "formatter": "default",
#             "level": "DEBUG",
#         },
#     },
#     "loggers": {
#         "app": {
#             "handlers": ["console"],
#             "level": settings.LOG_LEVEL,
#         },
#     },
# }

# dictConfig(logging_config)
logging.basicConfig()

logging.getLogger('sqlalchemy.engine.Engine').disabled = True
logging.getLogger('uvicorn.error').disabled = False

logger = logging.getLogger("uvicorn.error")
