"""Offline replay for preserved OpenAPI-generated verifier evidence ZIPs."""
import argparse
import importlib.util
import json
import tempfile
import zipfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--evaluator', required=True)
    parser.add_argument('--evidence', nargs='+', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location('generic_verifier', args.evaluator)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    rows = []
    for filename in args.evidence:
        item = {'file': str(filename), 'status': 'UNSUPPORTED_EVIDENCE_FORMAT'}
        try:
            with zipfile.ZipFile(filename) as archive:
                names = set(archive.namelist())
                needed = {'http-trace.jsonl', 'verification-manifest.gitea.json'}
                if not needed <= names:
                    candidates = [n for n in names if n.startswith('verification-manifest.') and n.endswith('.json')]
                    needed = {'http-trace.jsonl', candidates[0]} if len(candidates) == 1 else needed
                if not needed <= names:
                    item['missing'] = sorted(needed - names)
                    rows.append(item)
                    continue
                manifest_name = next(n for n in needed if n != 'http-trace.jsonl')
                with tempfile.TemporaryDirectory() as temp:
                    trace = Path(temp) / 'trace.jsonl'
                    trace.write_bytes(archive.read('http-trace.jsonl'))
                    current = mod.evaluate(mod.load_jsonl(trace), json.loads(archive.read(manifest_name)))
                item.update(status='REPLAYED', result=current['run_status'],
                            layer_counts=current['layer_counts'],
                            semantic_violations=sorted((w.get('oracle_id'), w.get('reason'))
                                for w in current['witnesses'] if w['result'] == 'VIOLATED'
                                and w['kind'] != 'response-contract'))
                if 'generated-verifier-evaluation.json' in names:
                    old = json.loads(archive.read('generated-verifier-evaluation.json'))
                    baseline = sorted((w.get('oracle_id'), w.get('reason'))
                        for w in old.get('witnesses', []) if w.get('result') == 'VIOLATED'
                        and w.get('kind') != 'response-contract')
                    item['semantic_regression'] = baseline != item['semantic_violations']
                    item['baseline_semantic_violations'] = baseline
        except Exception as exc:
            item.update(status='REPLAY_ERROR', error=str(exc))
        rows.append(item)
    Path(args.output).write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    for row in rows:
        print(Path(row['file']).name, row['status'], row.get('result', ''),
              'semantic_regression=' + str(row.get('semantic_regression', 'unknown')))
    return 2 if any(row['status'] != 'REPLAYED' or row.get('semantic_regression') for row in rows) else 0


if __name__ == '__main__':
    raise SystemExit(main())
