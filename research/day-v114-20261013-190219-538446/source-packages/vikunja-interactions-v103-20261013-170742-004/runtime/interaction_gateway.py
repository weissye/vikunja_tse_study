"""Actuation and restoration only; native bthreads choose worker order."""
import json,copy
from native_session_gateway import NativeSessionGateway
from recovery_gateway import fingerprint
class InteractionSessionGateway(NativeSessionGateway):
 def __init__(self,*args,**kwargs):
  super().__init__(*args,**kwargs);self.interaction_groups={};self.group_current=None;self.group_outcomes=[]
 def _dispatch(self,path,method,body,headers):
  action=headers.get('X-SBT-Action','')
  if not action.startswith('interaction_'):return super()._dispatch(path,method,body,headers)
  gid=headers.get('X-SBT-GroupId','');logical=headers.get('X-SBT-LogicalId','');sid=self.active_session
  if gid not in self.interaction_groups or logical!=self.interaction_groups[gid]['logical_id']:raise ValueError('Unknown/mismatched interaction binding')
  group=self.interaction_groups[gid]
  if action=='interaction_checkpoint':
   if method!='POST' or path!='/__sbt/interaction/checkpoint/'+gid or self.group_current:raise ValueError('Invalid group checkpoint')
   self.ensure_auth('before-group-checkpoint');prefix=self.observe();snapshot=self.backend.save('interaction-before-'+gid)
   self.group_current={'id':gid,'logical':logical,'prefix':prefix,'snapshot':snapshot,'reads':{},'writes':[],'probes':{}}
   self.record({'category':'interaction-control','group_id':gid,'phase':'checkpoint','prefix_before':prefix,'prefix_sha256':fingerprint(prefix),'hash_scope':'raw API projection; observations compared internally before export redaction','snapshot_hashes':snapshot['hashes']});return 200,b'{}'
  current=self.group_current
  if not current or current['id']!=gid:raise ValueError('Interaction group not active')
  if action in ('interaction_read','interaction_write','interaction_probe'):
   if path!=self.registry[logical]:raise ValueError('Interaction detail route differs from registry')
   wanted='GET' if action!='interaction_write' else group['write_method']
   if method!=wanted:raise ValueError('Interaction method differs from generated IR')
   status,raw=self.request(path,method,body)
   value=json.loads(raw) if status==200 else None
   if action=='interaction_read':
    if sid in current['reads']:raise ValueError('Duplicate session read')
    current['reads'][sid]=value
   elif action=='interaction_write':
    if sid not in current['reads'] or any(x['session']==sid for x in current['writes']):raise ValueError('Write requires unique session-local read')
    current['writes'].append({'session':sid,'input':json.loads(body),'status':status,'response':value})
   else:
    if len(current['writes'])!=2:raise ValueError('Probe before both writes')
    current['probes'][sid]=value
   self.record({'category':'research','action':action,'group_id':gid,'logical_id':logical,'session':sid,'path':path,'method':method,'status':status,'input':json.loads(body) if body else None,'response':raw.decode()})
   return status,raw
  if action=='interaction_restore':
   if method!='POST' or path!='/__sbt/interaction/restore/'+gid:raise ValueError('Invalid group restore')
   observations=[];probes=current['probes'];final=probes.get('A') or {}
   for writer in current['writes']:
    field=group['session_fields'][writer['session']]['field']
    last=next(x for x in reversed(current['writes']) if group['session_fields'][x['session']]['field']==field)
    if last is writer and final.get(field)!=writer['input'].get(field):observations.append({'kind':'desired_field_not_preserved','session':writer['session'],'field':field,'expected_written':writer['input'].get(field),'observed':final.get(field),'authority':'OBSERVATION_ONLY'})
   current['observations']=observations
   if observations:current['observed_snapshot']=self.backend.save('interaction-observed-'+gid)
   self.backend.restore(current['snapshot']);verification=json.loads((self.run/'restore-verification-v010.json').read_text())
   if not verification.get('strict_equality'):raise RuntimeError('Interaction storage restoration differs')
   current['storage_verification']=verification
   self.record({'category':'interaction-control','group_id':gid,'phase':'storage-restored','storage_verification':verification});return 200,b'{}'
  if action=='interaction_outcome':
   if method!='GET' or path!='/__sbt/interaction/outcome/'+gid or 'storage_verification' not in current:raise ValueError('Invalid group outcome')
   self.ensure_auth('after-group-restore');restored=self.observe()
   if restored!=current['prefix']:raise RuntimeError('Interaction whole API prefix differs after restore')
   read_equal=current['reads'].get('A')==current['reads'].get('B')
   protocol=set(current['reads'])=={'A','B'} and len(current['writes'])==2 and set(current['probes'])=={'A','B'} and all(x['status']==200 for x in current['writes']) and (group['profile']=='free_stale_disjoint_fields' or read_equal)
   outcome={'group_id':gid,'logical_id':logical,'profile':group['profile'],'reads':current['reads'],'writes':current['writes'],'probes':current['probes'],'shared_read_baseline_equal':read_equal,'probe_sessions_equal':current['probes'].get('A')==current['probes'].get('B'),'observations':current.get('observations',[]),'oracle_authority':'OBSERVATION_ONLY','confirmed_semantic_bug':False,'group_protocol_valid':protocol,'storage_equal':True,'api_prefix_equal':True,'safe_to_continue':True,'prefix_before':current['prefix'],'prefix_restored':restored,'prefix_before_sha256':fingerprint(current['prefix']),'prefix_restored_sha256':fingerprint(restored),'storage_verification':current['storage_verification'],'snapshot_hashes':current['snapshot']['hashes'],'observed_snapshot_hashes':current.get('observed_snapshot',{}).get('hashes')}
   self.group_outcomes.append(outcome);self.group_current=None
   self.record({'category':'interaction-recovery','group_id':gid,'outcome':outcome});return 200,json.dumps(outcome).encode()
  raise ValueError('Unsupported interaction action')
 def abort_restore(self):
  if self.group_current:
   current=self.group_current;self.backend.restore(current['snapshot'])
   self.record({'category':'interaction-abort','group_id':current['id'],'storage_verification':json.loads((self.run/'restore-verification-v010.json').read_text()),'api_verified':False,'continuation_allowed':False,'reads':current['reads'],'writes':current['writes'],'probes':current['probes']})
