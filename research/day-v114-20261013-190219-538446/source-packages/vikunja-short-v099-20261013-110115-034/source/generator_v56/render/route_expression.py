"""One detail-route binding rule for positive and negative interfaces."""
import json,re

def detail_route_expression(entity):
 path=entity['detail']
 child=entity['parameter']
 bound={child}
 template=path.replace('{'+child+'}','PLACEHOLDER')
 expr=json.dumps(template)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}")'
 for dep in entity.get('path_dependencies',[]):
  parameter=dep['parameter']
  if parameter!=child and '{'+parameter+'}' in path:
   expr+='.replace('+json.dumps('{'+parameter+'}')+',"@{PARENT_"+key+"_'+parameter+'}")'
   bound.add(parameter)
 unresolved=set(re.findall(r'\{([^{}]+)\}',path))-bound
 if unresolved:raise ValueError('Unbound detail route parameters: '+','.join(sorted(unresolved)))
 return expr
