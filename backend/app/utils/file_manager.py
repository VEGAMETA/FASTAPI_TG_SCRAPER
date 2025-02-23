import uuid
import shutil
import patoolib
import multiprocessing

from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional


ARCHIVE_ALLOWED_EXTENSIONS = {"zip", "tgz", "gz", "rar", "7zip", "7z"}
MAX_FILE_SIZE_MB = 500

async def validate_file(_file: UploadFile, allowed_extensions: Optional[set[str]]) -> Path:
    ext = _file.filename.split(".", 1)[-1]
    if ext not in allowed_extensions:
        raise HTTPException(400, "Invalid file type")
    size = 0
    temp_file_path = Path(f"./temp/{uuid.uuid4()}.{ext}")
    
    with open(temp_file_path, "wb") as temp_file:
        while chunk := await _file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(400, "File too large")
            temp_file.write(chunk)
    await _file.seek(0)
    return temp_file_path

async def validate_archive_file(_file: UploadFile) -> Path:
    return await validate_file(_file, ARCHIVE_ALLOWED_EXTENSIONS)

def unarchive_tdata(arch_path: Path, username: str) -> None:
    tdata_dest = Path(f"./temp/tdatas/{username}")
    safe_extract(str(arch_path), str(tdata_dest))
    arch_path.unlink()
    posible_tdata = tdata_dest / "tdata"
    if not posible_tdata.exists(): return
    shutil.copytree(posible_tdata, tdata_dest, dirs_exist_ok=True)
    shutil.rmtree(posible_tdata)

def delete_session_file(username: str) -> None:
    session_file = Path(f"./session/{username}.session")
    if not session_file.exists(): return
    session_file.unlink()


def safe_extract(file_path, extract_path):
    p = multiprocessing.Process(target=patoolib.extract_archive, args=(file_path, -1, extract_path))
    p.start()
    p.join(timeout=10)

    if not p.is_alive(): return
    p.terminate()
    raise ValueError("Распаковка заняла слишком много времени")
