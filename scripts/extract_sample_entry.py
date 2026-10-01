#!/usr/bin/env python3
"""Extract only a named Provengo run source, with a free-disk guard."""
import argparse
from pathlib import Path
import shutil
import zipfile


def extract(archive, entry, output):
    if output.exists():
        raise FileExistsError(output)
    with zipfile.ZipFile(archive) as z:
        info = z.getinfo(entry)
        free = shutil.disk_usage(output.parent).free
        if free < info.file_size + 2 * 1024**3:
            raise OSError('need uncompressed entry size plus 2 GiB free space')
        try:
            with z.open(info) as source, output.open('xb') as dest:
                shutil.copyfileobj(source, dest, 1 << 20)
            if output.stat().st_size != info.file_size:
                raise ValueError('extracted file size differs from ZIP entry')
        except Exception:
            output.unlink(missing_ok=True)
            raise
    return info.file_size


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--archive', type=Path, required=True)
    p.add_argument('--entry', required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    print('KEYCLOAK_RUN_SOURCE_READY', a.out, 'bytes=', extract(a.archive, a.entry, a.out))
