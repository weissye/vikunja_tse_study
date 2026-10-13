import argparse
import hashlib
import json
import sys
from pathlib import Path
from consistency_extension import render

p = argparse.ArgumentParser()
p.add_argument('--base-package', type=Path, required=True)
p.add_argument('--ir', type=Path, required=True)
p.add_argument('--research-config', type=Path, required=True)
p.add_argument('--audit-config', type=Path, required=True)
p.add_argument('--output', type=Path, required=True)
a = p.parse_args()
sys.path.insert(0, str(a.base_package / 'source'))
from generic_emitter import emit
audit = json.loads(a.audit_config.read_text(encoding='utf-8-sig'))
if set(audit) != {'enabled', 'rounds'} or type(audit['enabled']) is not bool:
    raise ValueError('Invalid audit configuration')
if type(audit['rounds']) is not int or not 1 <= audit['rounds'] <= 10:
    raise ValueError('Invalid audit rounds')
cfg = json.loads(a.research_config.read_text(encoding='utf-8-sig'))
if cfg['actors']['sessions_per_user'] != 2 or cfg['render']['profile'] != 'unified':
    raise ValueError('Requires existing unified two-session profile')
emit(a.ir, a.research_config, a.output)
if audit['enabled']:
    report_path = a.output / 'GENERATION_v071.json'
    generation = json.loads(report_path.read_text())
    extension, report = render(json.loads(a.ir.read_text(encoding='utf-8-sig')), generation, audit['rounds'])
    stories = list((a.output / 'spec/js').glob('stories.*.js'))
    if len(stories) != 1:
        raise ValueError('Expected exactly one Stories file')
    with stories[0].open('a', encoding='utf-8', newline='\n') as f:
        f.write(extension)
    generation['consistency_audits'] = report
    # Refresh the existing report hash using its original relative-key convention.
    for key in generation['file_sha256']:
        if Path(key).name == stories[0].name:
            generation['file_sha256'][key] = hashlib.sha256(stories[0].read_bytes()).hexdigest()
    report_path.write_text(json.dumps(generation, indent=2), encoding='utf-8')
    (a.output / 'consistency-audits-v117.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('V117_STATIC_MODEL_GENERATED; native/live acceptance not performed')
