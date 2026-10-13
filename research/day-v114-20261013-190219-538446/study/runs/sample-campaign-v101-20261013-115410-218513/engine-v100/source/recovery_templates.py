"""Opt-in recovery-aware interface/oracle templates; disabled profile is unchanged."""
import json

def replace_required(text,old,new):
 if old not in text:raise ValueError('Recovery renderer contract changed; required template fragment absent')
 return text.replace(old,new)

def recovery_negative_templates(interface,dal,stories):
 # Metadata reaches only the local gate; the gate removes it before SUT forwarding.
 interface=replace_required(interface,'{action:"negative_prepare",logicalId:resource.id}', '{action:"negative_prepare",logicalId:resource.id,caseId:caseId}')
 interface=replace_required(interface,'{action:"negative_attempt",logicalId:resource.id}', '{action:"negative_attempt",logicalId:resource.id,caseId:caseId}')
 interface=replace_required(interface,'{action:"negative_readback",logicalId:pending.logicalId}', '{action:"negative_readback",logicalId:pending.logicalId,caseId:pending.caseId}')
 interface=replace_required(interface,'var after=JSON.parse(response.body);var before=', 'var recovery=JSON.parse(response.body);var after=recovery.observed_after;var before=')
 interface=replace_required(interface,"if(!pass)pvg.fail('Negative rejection/state mismatch '+result.caseId);", "var recovered=recovery.safe_to_continue===true&&recovery.case_id===result.caseId;result.recovery_verified=recovered;bp.log.info('RECOVERY_CHECK '+JSON.stringify({caseId:result.caseId,oracle_pass:pass,recovery_verified:recovered,snapshot_restored:recovery.snapshot_restored,api_prefix_equal:recovery.api_prefix_equal}));if(!recovered)pvg.fail('Recovery verification failed '+result.caseId);")
 interface=replace_required(interface,'readback_status:Number(response.code)', 'readback_status:Number(recovery.observed_status)')
 interface=replace_required(interface,'var after=recovery.observed_after;', 'var observationAvailable=recovery.observation_available===true;var after=recovery.observed_after||{};')
 interface=replace_required(interface,'var pass=receipt.rejected&&unchanged;', 'var pass=observationAvailable?(receipt.rejected&&unchanged):null;')
 interface=replace_required(interface,'state_projection_unchanged:unchanged,pass:pass', 'state_projection_unchanged:observationAvailable?unchanged:null,observation_available:observationAvailable,observation_error:recovery.observation_error,verdict:observationAvailable?(pass?\'PASS\':\'FINDING\'):\'INCONCLUSIVE\',pass:pass')
 interface=replace_required(interface,'after_projection:projection,changed_fields:changedFields', 'after_projection:observationAvailable?projection:null,changed_fields:observationAvailable?changedFields:null')
 interface=replace_required(interface,'checked_field_after:projection[rule.field]', 'checked_field_after:observationAvailable?projection[rule.field]:null')
 interface=replace_required(interface,'resource_id:after.id', 'resource_id:recovery.verified_after.id')
 interface=replace_required(interface,'readback_status:Number(recovery.observed_status)', 'readback_status:recovery.observed_status===null?null:Number(recovery.observed_status)')
 # Add an independently checked restored projection; original after-state stays in evidence.
 interface=replace_required(interface,'var recovered=recovery.safe_to_continue===true', 'var restoredProjection={};fields.forEach(function(f){restoredProjection[f]={present:Object.prototype.hasOwnProperty.call(recovery.verified_after,f),value:recovery.verified_after[f]};});var restoredMatches=JSON.stringify(beforeProjection)===JSON.stringify(restoredProjection);var recovered=restoredMatches&&recovery.safe_to_continue===true')
 # Use gateway outcome only for negative readback. Normal independent resource GETs remain real SUT requests.
 import re
 pattern=r'(requestRest\("GET",)([^\n]+)(,undefined,\[[^\n]*?\],\n?\s*\{action:"negative_readback")'
 # Generated function places all arguments on one line; use a specific line transform.
 lines=interface.splitlines();changed=0
 for i,line in enumerate(lines):
  if 'requestRest("GET",' in line and 'action:"negative_readback"' in line:
   at=line.index(',undefined,');lines[i]='requestRest("GET","/__sbt/outcome/"+pending.caseId'+line[at:];changed+=1
 if not changed:raise ValueError('No recovery readback interface generated')
 return '\n'.join(lines)+'\n',dal,stories

def recovery_transport(interface):
 old='        headers: svc.defaultHeaders, parameters: {},'
 new='''        headers: (function(){var h={};Object.keys(svc.defaultHeaders).forEach(function(k){h[k]=svc.defaultHeaders[k];});h["X-SBT-Action"]=semantic.action;h["X-SBT-LogicalId"]=semantic.logicalId||"";h["X-SBT-Type"]=semantic.type||"";if(semantic.caseId)h["X-SBT-CaseId"]=semantic.caseId;return h;})(), parameters: {},'''
 return replace_required(interface,old,new)
