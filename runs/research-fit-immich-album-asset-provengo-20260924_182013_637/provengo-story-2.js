//@provengo summon rest
var __sbtMembershipAdapter = new RESTSession("http://127.0.0.1:61905", 'sbt-membership-adapter', {headers:{'Content-Type':'application/json'}});
bthread('sbt:album-asset-verified-epoch', function () {
  var __album = getAlbumInfo(undefined, undefined, undefined, undefined, undefined, undefined, "f4382b12-d1e2-4047-8b9c-229e98713233", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
  if (!__album || __album.code !== 200 || !__album.body || __album.body.id !== "f4382b12-d1e2-4047-8b9c-229e98713233") return;
  sync({request:Event('SBT:AlbumAssetFixtureAccepted', {epoch_id:"immich-membership-2eb4db2ce547"})});
  __sbtMembershipAdapter.post('/epochs', {body:JSON.stringify({"epoch_id": "immich-membership-2eb4db2ce547", "scenario": "disjoint-album-membership-openapi-delete-body", "operations": [{"operation_id": "immich-membership-2eb4db2ce547-op-0", "method": "PUT", "path": "/albums/f4382b12-d1e2-4047-8b9c-229e98713233/assets", "body": {"ids": ["385a6df6-ba72-4e34-86e5-c21c90aa70ee"]}, "headers": {"Content-Type": "application/json"}}, {"operation_id": "immich-membership-2eb4db2ce547-op-1", "method": "DELETE", "path": "/albums/f4382b12-d1e2-4047-8b9c-229e98713233/assets", "body": {"ids": ["527dfae8-b3ba-4676-bd2e-38d868e697ee"]}, "headers": {"Content-Type": "application/json"}}]}), expectedResponseCodes:[200]});
  svc.get("/albums/f4382b12-d1e2-4047-8b9c-229e98713233", {headers:{'X-Provengo-Epoch-Id':"immich-membership-2eb4db2ce547",'X-Provengo-Operation-Id':"immich-membership-2eb4db2ce547-observe"}, expectedResponseCodes:[200]});
  sync({request:Event('SBT:AlbumAssetEpochClosed', {epoch_id:"immich-membership-2eb4db2ce547"})});
});
