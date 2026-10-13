import itertools
def build_instance_plans(entities,instances):
 plans={};pending=list(entities)
 while pending:
  progress=False
  for e in list(pending):
   targets=sorted({d['target'] for d in e['dependencies']})
   if not all(t in plans for t in targets):continue
   if targets:
    tuples=itertools.product(*[plans[t] for t in targets])
    combinations=[dict(zip(targets,[p['id'] for p in pair])) for pair in tuples]
   else:combinations=[{} for _ in range(instances)]
   if len(combinations)>4096:raise SystemExit('Dependency expansion exceeds explicit 4096-instance budget')
   plans[e['name']]=[{'id':e['name']+'_'+str(i+1),'fixture_index':i+1,'bindings':bindings} for i,bindings in enumerate(combinations)]
   pending.remove(e);progress=True
  if not progress:raise SystemExit('Unresolved cyclic creation dependencies: '+str([e['name'] for e in pending]))
 return plans
