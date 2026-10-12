"""Upstream description-derived value domains; inference provenance is explicit."""
import re

def annotate(ir):
 out={}
 for entity in ir['entities']:
  fields={}
  for field,schema in entity.get('update_schema',{}).get('properties',{}).items():
   text=schema.get('description','');kind=None
   if schema.get('type')=='string':
    if re.search(r'\bhex(?:adecimal)?\b',text,re.I):kind='hex_rgb'
    elif re.search(r'\bidentifier\b.*\bbased on\b',text,re.I):kind='derived_observation'
    elif re.search(r'\bunique\b.*\bidentifier\b',text,re.I):kind='unique_short_identifier'
   if kind:
    fields[field]={'kind':kind,'authority':'DESCRIPTION_INFERENCE','source_description':text,'source_pointer':next((case['source_pointer'].rsplit('/',1)[0]+'/description' for case in ir['negative_catalog']['cases'] if case['resource']==entity['name'] and case['field']==field),None),'rule':'DESCRIPTION_DOMAIN_'+kind.upper(),'formal_schema_constraint':False}
  if fields:out[entity['name']]=fields
 ir['value_domains']=out
 return ir
