import pycurl
import random

from ..schemas.pyrogram import PyrogramProxy


class ProxyChecker:
    PROXY_JUDGES = [
        'http://proxyjudge.us/azenv.php',
    ]

    @classmethod
    def check_proxy(cls, proxy: PyrogramProxy) -> bool:
        c = pycurl.Curl()
        c.setopt(c.URL, random.choice(cls.PROXY_JUDGES))
        c.setopt(c.TIMEOUT, 5)
        c.setopt(pycurl.WRITEFUNCTION, lambda x: None)
        c.setopt(c.SSL_VERIFYPEER, 0)
        c.setopt(c.SSL_VERIFYHOST, 0)

        if proxy: c.setopt(c.PROXY, f'{proxy.scheme}://{proxy.hostname}:{proxy.port}')
        if proxy.username and proxy.password: c.setopt(c.PROXYUSERPWD, f"{proxy.username}:{proxy.password}")            

        try: c.perform()
        except Exception as e: return False
        if c.getinfo(c.HTTP_CODE) != 200: return False

        return True #{'response': response.getvalue().decode('iso-8859-1')}
