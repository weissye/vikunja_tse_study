#!/usr/bin/env python3
"""Collect just startup diagnostics from an already preserved Mealie run."""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path

KEYWORDS = re.compile(r'error|exception|syntax|reference|typeerror|unknown|failed|cannot|parse|stack', re.I)
SENSITIVE = re.compile(r'((?:bearer|basic)\s+)[a-z0-9._+-]+|(access_token|refresh_token|token|password|authorization|cookie|api.?key|secret)(\s*[=:]\s*)([^\s,;&]+)', re.I)
MAIL = re.compile(r'\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b')


def redact(line):
    def mask(match):
        return (match.group(1) + '[REDACTED]') if match.group(1) else match.group(2) + match.group(3) + '[REDACTED]'
    return MAIL.sub('[EMAIL]', SENSITIVE.sub(mask, line))


def sample(path):
    if not path.exists():
        return {'present': False}
    # Provengo launch errors may be at the beginning or end; preserve context.
    rows = path.read_text(encoding='utf-8', errors='replace').splitlines()
    selected = set(range(min(25, len(rows)))) | set(range(max(0, len(rows) - 60), len(rows)))
    for n, line in enumerate(rows):
        if KEYWORDS.search(line):
            selected.update(range(max(0, n - 3), min(len(rows), n + 8)))
    return {'present': True, 'source_lines': len(rows), 'selected_lines': [
        {'line_number': i + 1, 'text': redact(rows[i])[:1200]} for i in sorted(selected)[:300]]}


def collect(run):
    campaign = json.loads((run / 'campaign.json').read_text(encoding='utf-8'))
    seed = sorted(run.glob('seed-*'))
    if campaign.get('state') != 'INCOMPLETE' or not seed:
        raise ValueError('Expected preserved incomplete Stage 4 run with a seed directory')
    files = ('generate.log', 'verify-generation.log', 'provengo-create.log',
             'provengo-run.log', 'evaluator.log')
    return {'run_name': run.name, 'campaign_state': campaign['state'],
            'campaign_error': campaign.get('error'), 'summaries': [
            json.loads((p / 'summary.json').read_text(encoding='utf-8'))
            for p in seed if (p / 'summary.json').exists()],
            'logs': {p.name: {name: sample(p / name) for name in files} for p in seed}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--run', type=Path, required=True)
    args = parser.parse_args()
    root, run = args.root.resolve(), args.run.resolve()
    if run.parent != root / 'runs' or not run.name.startswith('research-fit-mealie-stage4-'):
        parser.error('Expected an existing isolated Mealie Stage 4 run under the project root')
    result = collect(run)
    destination = root / 'evidence'
    destination.mkdir(parents=True, exist_ok=True)
    archive = destination / ('mealie-stage4-diagnostics-' + run.name.removeprefix('research-fit-mealie-stage4-') + '.zip')
    data = (json.dumps(result, indent=2, sort_keys=True) + '\n').encode('utf-8')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
        output.writestr('diagnostics.json', data)
    print('MEALIE_STAGE4_DIAGNOSTICS_READY', archive)
    print('ZIP SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
    print('Log source lines:', sum(item.get('source_lines', 0) for group in result['logs'].values() for item in group.values()))


if __name__ == '__main__':
    main()
