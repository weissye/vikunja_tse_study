#!/usr/bin/env python3
"""Preserve one audited batch and remove bulky raw JSON only after verification."""
import argparse
import json
from pathlib import Path
import zipfile


def archive(raw, audit, output):
    if output.exists():
        raise FileExistsError(output)
    data = json.loads(audit.read_text(encoding='utf-8'))
    if data['scenarios'] != 50 or data['complete_rest_schedules'] != 50:
        raise ValueError('sample batch is incomplete')
    try:
        with zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED,
                             compresslevel=6, allowZip64=True) as z:
            z.write(raw, 'samples-50.json')
            z.write(audit, 'audit-50.json')
        with zipfile.ZipFile(output) as z:
            if z.testzip() is not None:
                raise ValueError('ZIP integrity check failed')
        raw.unlink()
        audit.unlink()
    except Exception:
        output.unlink(missing_ok=True)
        raise


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--samples', type=Path, required=True)
    p.add_argument('--audit', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    archive(a.samples, a.audit, a.out)
    print('KEYCLOAK_SAMPLE_BATCH_ARCHIVED', a.out)
