
import asyncio
import datetime

from ..core.logging import logger
from .xslx import XlsxManager
from pyrogram import Client
from pyrogram.raw import functions, types, base


class Worker:
    CHANNELS_HASH = {}
    COLUMNS = ['ID', 'Username', 'Name', 'Date', 'Keyword', 'Massage', 'Link']

    def __init__(
        self, 
        username: str,
        session: str,
        proxy: dict,
        keywords: set[str], 
        chats: set[str],
    ) -> None:
        self.username = username
        self.session = session
        self.keywords = keywords
        self.chats = chats
        self.lock = None
        self.FILENAME = datetime.datetime.now().strftime(f"./out/%Y-%m-%d_%H-%M-%S_{self.username}.xlsx")
        self.writer = XlsxManager(self.FILENAME, self.COLUMNS)
    
        self.app: Client = Client(
            username,
            workdir="sessions",
            proxy=proxy
        )
        
    async def update_progress(self, value: float) -> None:
        pass

    async def get_messages(self, keyword, peer, count=0) -> types.messages.Messages:
        return await self.app.invoke(
            functions.messages.Search(
                peer=peer,
                q=keyword,
                filter=types.InputMessagesFilterEmpty(),
                min_date=0,
                max_date=0,
                offset_id=0,
                add_offset=0,
                limit=count,
                min_id=0,
                max_id=0,
                hash=0,
            )
        )

    async def resolve_chanel_access_hash(self, channel_name: str) -> str:
        channel_hash = (await self.app.invoke(
                functions.contacts.ResolveUsername(username=channel_name)
            )
        ).chats[0].access_hash
        self.CHANNELS_HASH[channel_name] = channel_hash
        return channel_hash

    async def get_users(self, messages, peer):
        return await self.app.invoke(functions.users.GetUsers(id=[
                    types.InputUserFromMessage(
                        peer=peer,
                        msg_id=message.id,
                        user_id=message.from_id.user_id
                    ) for message in messages
                    ]))

    async def get_message_link(self, message, chat_name):
        if not isinstance(message.peer_id, types.peer_channel.PeerChannel): return ""
        return (await self.app.invoke(
            functions.channels.ExportMessageLink(
                channel=types.InputChannel(
                    channel_id=message.peer_id.channel_id,
                    access_hash=self.CHANNELS_HASH.get(
                        chat_name, 
                        await self.resolve_chanel_access_hash(chat_name)
                    )
                ),
                id=message.id
            )
        )).link
    
    async def form_data_unit(
        self, 
        chat_name: str,
        keyword: str,
        user,
        message: base.message.Message
        ) -> tuple:
        return (
            message.from_id.user_id, 
            user.username, 
            f"{user.first_name if user.first_name else ''} {user.last_name if user.last_name else ''}", 
            datetime.datetime.fromtimestamp(message.date).strftime('%Y-%m-%d %H:%M:%S'), 
            keyword, 
            message.message, 
            await self.get_message_link(message, chat_name)
        )

    async def search_messages(self) -> None:
        while self.chats:
            try: 
                async with self.lock:
                    chat = self.chats.pop()
                    if not chat: continue
            except IndexError: continue
            peer = await self.app.resolve_peer(chat)
            print(f"{peer}")
            valid_messages = []
            for keyword in self.keywords:
                pre_messages = await self.get_messages(keyword, peer)
                if not hasattr(pre_messages, "count") or pre_messages.count == 0: continue
                messages = await self.get_messages(keyword, peer, pre_messages.count)
                valid_messages = [message for message in messages.messages if isinstance(message.from_id, types.PeerUser)]
                logger.info(f"\n{self.username} found {len(valid_messages)} messages in `{chat}` chat by `{keyword}` keyword")
                
                users = {user.id: user for user in await self.get_users(valid_messages, peer)}

                for i, message in enumerate(valid_messages):
                    data = await self.form_data_unit(chat, keyword, users.get(message.from_id.user_id), message)
                    self.writer.add_data(*data)
                    await self.update_progress(i + 1 / pre_messages.count)
                logger.info(f"\nprocessed {len(valid_messages)} messages in `{chat}` chat by `{keyword}` keyword\n")

    def run(self) -> None:
        self.lock = asyncio.Lock()
        self.app.start()
        self.app.run(self.search_messages())
        self.app.stop()
