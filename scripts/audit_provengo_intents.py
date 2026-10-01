#!/usr/bin/env python3
"""Audit only chosen scheduling intents in a Provengo sample run source."""
import argparse
from collections import Counter
import json
from pathlib import Path


def audit(document):
    if isinstance(document, list): scenarios = document
    elif isinstance(document, dict):
        keys = [k for k in ('scenarios', 'runs', 'samples') if isinstance(document.get(k), list)]
        if len(keys) != 1: raise ValueError('unknown scenario container')
        scenarios = document[keys[0]]
    else: raise ValueError('unknown run source')
    report = {'schema_version':1, 'basis':'symbolic plan intents; no SUT execution',
              'scenarios':len(scenarios), 'oracle_ids':Counter(), 'kinds':Counter(),
              'prefix_lengths':Counter(), 'instance_numbers':Counter(),
              'control_orders':Counter(), 'complete_intent_scenarios':0,
              'actual_overlap':'NOT_MEASURED', 'oracle_verdicts':'NOT_EVALUATED'}
    for scenario in scenarios:
        events = scenario if isinstance(scenario,list) else scenario.get('events',scenario.get('scenario'))
        if not isinstance(events,list): raise ValueError('unknown scenario event list')
        seen = set()
        for ev in events:
            if isinstance(ev,str): name,data=ev,{}
            elif isinstance(ev,dict):
                name = next((ev[k] for k in ('name','eventName','event') if isinstance(ev.get(k),str)), '')
                data = next((ev[k] for k in ('data','payload') if isinstance(ev.get(k),dict)), {})
            else: raise ValueError('unknown event')
            if name.startswith('SBT:Plan'): seen.add(name)
            if name == 'SBT:PlanConcurrencyIntent':
                report['oracle_ids'][data.get('oracle_id','UNNAMED')] += 1
                report['kinds'][data.get('kind','UNNAMED')] += 1
            elif name == 'SBT:PlanSerialControlsIntent': report['control_orders'][data.get('order','UNNAMED')] += 1
            elif name == 'SBT:PlanCreateIntent': report['instance_numbers'][str(data.get('instance'))] += 1
            elif name == 'SBT:PlanPrefixIntent':
                if data.get('round') is not None: report['prefix_lengths'][str(data['round'])] += 1
        if {'SBT:PlanCreateIntent','SBT:PlanPrefixIntent','SBT:PlanSerialControlsIntent',
            'SBT:PlanConcurrencyIntent'}.issubset(seen): report['complete_intent_scenarios'] += 1
    for key in ('oracle_ids','kinds','prefix_lengths','instance_numbers','control_orders'):
        report[key] = dict(sorted(report[key].items()))
    return report


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    result=audit(json.loads(a.input.read_text(encoding='utf-8')))
    a.out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('SBT_INTENT_AUDIT scenarios=',result['scenarios'],'complete=',result['complete_intent_scenarios'],
          'oracles=',len(result['oracle_ids']),'HTTP=NOT_RUN')


if __name__=='__main__': main()
