"""Recover the isolated pilot login after a recorded update to its email address.

Read local trial evidence and prove the candidate against the running server
before updating the private credentials file. Never print a password or token.
"""
import json
import os
import tempfile
from pathlib import Path


def candidates(root):
    traces = sorted((root / 'runs').glob('research-fit-immich-generated-*/seed-*/http-trace.jsonl'),
                    reverse=True)
    seen = set()
    for path in traces:
        # A later successful profile update supersedes an earlier one.
        try:
            events = [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]
        except (ValueError, OSError):
            continue
        for event in reversed(events):
            request, response = event.get('request'), event.get('response')
            if (event.get('model_path') != '/users/me' or
                event.get('method') not in ('PUT', 'PATCH') or
                not isinstance(event.get('status'), int) or
                not 200 <= event['status'] < 300 or
                not isinstance(request, dict) or not isinstance(response, dict)):
                continue
            email, user_id = request.get('email'), response.get('id')
            if (not isinstance(email, str) or not email or
                response.get('email') != email or not isinstance(user_id, str) or
                response.get('isAdmin') is not True or (email, user_id) in seen):
                continue
            seen.add((email, user_id))
            yield email, user_id


def recover_identity(root, credentials_file, base):
    """Return True only after successful login and independent identity read."""
    from run_immich_album_serial import call
    if not credentials_file.is_file():
        return False
    try:
        credentials = json.loads(credentials_file.read_text(encoding='utf-8'))
    except (ValueError, OSError):
        return False
    password = credentials.get('password')
    if not isinstance(password, str) or not password:
        return False
    for email, expected_id in candidates(root):
        if email == credentials.get('email'):
            continue
        try:
            result = call(base, 'POST', '/auth/login',
                          {'email': email, 'password': password})
            token = result.get('body', {}).get('accessToken') if isinstance(result.get('body'), dict) else None
            if result.get('status') != 201 or not isinstance(token, str) or not token:
                continue
            observed = call(base, 'GET', '/users/me', token=token)
            body = observed.get('body')
            if (observed.get('status') != 200 or not isinstance(body, dict) or
                    body.get('id') != expected_id or body.get('email') != email or
                    body.get('isAdmin') is not True):
                continue
            updated = dict(credentials)
            updated['email'] = email
            temp = None
            try:
                with tempfile.NamedTemporaryFile('w', encoding='utf-8',
                        dir=credentials_file.parent, prefix='immich-credentials-',
                        suffix='.tmp', delete=False) as handle:
                    temp = Path(handle.name)
                    json.dump(updated, handle)
                os.replace(temp, credentials_file)
            finally:
                if temp is not None and temp.exists():
                    temp.unlink()
            return True
        except (OSError, ValueError, TypeError):
            continue
    return False
