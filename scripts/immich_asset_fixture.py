"""Optional research fixture: upload a tiny unique PNG and verify its item GET.

Bytes are an explicit experiment input. OpenAPI describes the multipart shape,
but cannot supply valid image content; this module is outside inference.
"""
import hashlib
import json
import struct
import urllib.error
import urllib.request
import uuid
import zlib
from datetime import datetime, timezone


def png_bytes(color):
    def chunk(label, body):
        return (struct.pack('>I', len(body)) + label + body +
                struct.pack('>I', zlib.crc32(label + body) & 0xffffffff))
    raw = b''.join(b'\x00' + bytes(color) * 16 for _ in range(16))
    return (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('>2I5B', 16, 16, 8, 2, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b''))


def multipart_asset(color, filename):
    boundary = 'sbt-' + uuid.uuid4().hex
    stamp = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
    fields = [('fileCreatedAt', stamp), ('fileModifiedAt', stamp), ('filename', filename)]
    body = bytearray()
    for field, value in fields:
        body.extend(('--' + boundary + '\r\nContent-Disposition: form-data; name="' +
                     field + '"\r\n\r\n' + value + '\r\n').encode('utf-8'))
    body.extend(('--' + boundary + '\r\nContent-Disposition: form-data; name="assetData"; filename="' +
                 filename + '"\r\nContent-Type: image/png\r\n\r\n').encode('utf-8'))
    body.extend(png_bytes(color))
    body.extend(('\r\n--' + boundary + '--\r\n').encode('utf-8'))
    return bytes(body), 'multipart/form-data; boundary=' + boundary


def create_verified_asset(base, token, seed, call):
    marker = uuid.uuid4().hex
    color = hashlib.sha256((marker + str(seed)).encode('ascii')).digest()[:3]
    body, content_type = multipart_asset(color, 'sbt-fixture-' + marker + '.png')
    request = urllib.request.Request(base.rstrip('/') + '/api/assets', data=body,
        headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/json',
                 'Content-Type': content_type}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=65) as response:
            status, payload = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, payload = error.code, error.read()
    result = json.loads(payload) if payload else None
    asset_id = result.get('id') if isinstance(result, dict) else None
    if status != 201 or not isinstance(asset_id, str):
        raise RuntimeError('Fixture asset upload failed: HTTP %s' % status)
    observed = call(base, 'GET', '/assets/' + asset_id, token=token)
    if (observed['status'] != 200 or not isinstance(observed['body'], dict) or
            observed['body'].get('id') != asset_id):
        raise RuntimeError('Fixture asset read after upload failed: HTTP %s' % observed['status'])
    return {'id': asset_id, 'upload_status': status, 'read_status': observed['status'],
            'fixture_sha256': hashlib.sha256(body).hexdigest()}
