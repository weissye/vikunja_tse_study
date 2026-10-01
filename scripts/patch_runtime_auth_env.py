#!/usr/bin/env python3
"""Set runtime-only Keycloak bearer lookup before sampling the model."""
import argparse
from pathlib import Path

OLD = 'Bearer @{sbt_access_token}'
NEW = "Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"


def patch(project):
    path = project / 'spec/js/runtime-bound.generated.js'
    code = path.read_text(encoding='utf-8')
    if NEW in code and OLD not in code:
        return path
    if code.count(OLD) != 1:
        raise ValueError('unexpected token template; model unchanged')
    path.write_text(code.replace(OLD, NEW), encoding='utf-8')
    return path


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True, type=Path)
    args = parser.parse_args()
    print('KEYCLOAK_RUNTIME_AUTH_READY', patch(args.project))
