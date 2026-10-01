"""Replay generated concurrency evidence from existing review ZIPs, without API calls."""
import argparse
import json
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import _empirical_update_delete_witnesses


def replay(archive: Path) -> dict:
    with zipfile.ZipFile(archive) as z:
        plans = sorted(name for name in z.namelist()
                       if name.endswith('/concurrency-plan.immich.json'))
        if not plans:
            raise ValueError(f'{archive}: no concurrency plan in evidence')
        out = []
        for plan_name in plans:
            trace_name = plan_name.rsplit('/', 1)[0] + '/http-trace.jsonl'
            plan = json.loads(z.read(plan_name))
            # Preserve proxy event positions; trace_proxy writes one JSON event per line.
            events = [json.loads(line) for line in z.read(trace_name).decode('utf-8-sig').splitlines()
                      if line.strip()]
            for index, event in enumerate(events):
                event.setdefault('_index', index)
            witnesses = _empirical_update_delete_witnesses(
                events, {'concurrency_oracles': plan['oracles']})
            out.append({'seed': plan_name.split('/')[0], 'witnesses': [
                {'oracle_id': w['oracle_id'], 'epoch_id': w['epoch_id'],
                 'result': w['result'],
                 **({'server_error_candidate': w['server_error_candidate']}
                    if w.get('server_error_candidate') else {})}
                for w in witnesses]})
    return {'archive': archive.name, 'seeds': out}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('evidence', nargs='+', type=Path, help='Existing review ZIP(s)')
    parser.add_argument('--output', type=Path, help='Optional JSON summary path')
    args = parser.parse_args()
    report = {'schema_version': 1, 'replays': [replay(path) for path in args.evidence]}
    body = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(body + '\n', encoding='utf-8')
    print(body)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
