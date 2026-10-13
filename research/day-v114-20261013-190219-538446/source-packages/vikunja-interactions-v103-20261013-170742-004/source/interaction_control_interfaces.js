function checkpointInteraction(group){
 awaitBothSessions();
 requestRest("POST","/__sbt/interaction/checkpoint/"+group.id,undefined,[200],{action:"interaction_checkpoint",logicalId:group.logical_id,session:"A",groupId:group.id},callbackFromSource("if(response.body)JSON.parse(response.body);"));
 request(bp.Event("SessionsInvalidated",{}));awaitBothSessions();
}
function restoreInteraction(group){
 requestRest("POST","/__sbt/interaction/restore/"+group.id,undefined,[200],{action:"interaction_restore",logicalId:group.logical_id,session:"A",groupId:group.id},callbackFromSource("if(response.body)JSON.parse(response.body);"));
 request(bp.Event("SessionsInvalidated",{}));awaitBothSessions();
 requestRest("GET","/__sbt/interaction/outcome/"+group.id,undefined,[200],{action:"interaction_outcome",logicalId:group.logical_id,session:"A",groupId:group.id},callbackFromSource("var value=JSON.parse(response.body);bp.log.info('INTERACTION_RESTORE_CHECK '+JSON.stringify({groupId:value.group_id,storage_equal:value.storage_equal,api_prefix_equal:value.api_prefix_equal,safe_to_continue:value.safe_to_continue,group_protocol_valid:value.group_protocol_valid,oracle_authority:value.oracle_authority}));if(!value.safe_to_continue||!value.group_protocol_valid)pvg.fail('Interaction restoration not verified '+value.group_id);"));
}
