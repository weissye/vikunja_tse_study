"""Conservative effects derived from IR dependencies and instance bindings."""
def derive_footprints(entities,plans):
 by_type={e['name']:e for e in entities}
 rows={row['id']:(name,row) for name,items in plans.items() for row in items}
 footprints={};visiting=set()
 def visit(logical):
  if logical in footprints:return footprints[logical]
  if logical in visiting:raise ValueError('Cyclic effect footprint: '+logical)
  if logical not in rows:raise ValueError('Unknown effect binding: '+logical)
  visiting.add(logical);name,row=rows[logical];result={logical}
  declared={dep['target'] for dep in by_type[name]['dependencies']}
  if set(row['bindings'])!=declared:raise ValueError('Dependency binding mismatch: '+logical)
  for target,parent in row['bindings'].items():
   if parent not in rows or rows[parent][0]!=target:raise ValueError('Wrong parent type: '+logical)
   result.update(visit(parent))
  visiting.remove(logical);footprints[logical]=sorted(result);return footprints[logical]
 for logical in sorted(rows):visit(logical)
 return {'authority':'CONSERVATIVE_DEPENDENCY_CLOSURE_FROM_IR','instances':footprints,'provenance':{e['name']:e['dependencies'] for e in entities},'scope':'Potential effects on self and transitive bound parents; dependency is not proof of an actual write side effect. Dynamic undeclared links are outside this derivation.'}
