//@provengo summon rest
var __sbtMembershipAdapter = new RESTSession("http://127.0.0.1:61905", 'sbt-membership-adapter', {headers:{'Content-Type':'application/json'}});
bthread('sbt:album-asset-verified-epoch', function () {
  var __album = getAlbumInfo(undefined, undefined, undefined, undefined, undefined, undefined, "b1b19c9a-9e14-4a86-b2bf-e737a9d94e7b", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
  if (!__album || __album.code !== 200 || !__album.body || __album.body.id !== "b1b19c9a-9e14-4a86-b2bf-e737a9d94e7b") return;
  sync({request:Event('SBT:AlbumAssetFixtureAccepted', {epoch_id:"immich-membership-bf03927f8a6b"})});
  __sbtMembershipAdapter.post('/epochs', {body:JSON.stringify({"epoch_id": "immich-membership-bf03927f8a6b", "scenario": "disjoint-album-membership-openapi-delete-body", "operations": [{"operation_id": "immich-membership-bf03927f8a6b-op-0", "method": "DELETE", "path": "/albums/b1b19c9a-9e14-4a86-b2bf-e737a9d94e7b/assets", "body": {"ids": ["9d6b0579-7960-4135-a226-2e5d2718e542"]}, "headers": {"Content-Type": "application/json"}}, {"operation_id": "immich-membership-bf03927f8a6b-op-1", "method": "PUT", "path": "/albums/b1b19c9a-9e14-4a86-b2bf-e737a9d94e7b/assets", "body": {"ids": ["b00af219-68d1-4e17-ba22-c82e2f92665f"]}, "headers": {"Content-Type": "application/json"}}]}), expectedResponseCodes:[200]});
  svc.get("/albums/b1b19c9a-9e14-4a86-b2bf-e737a9d94e7b", {headers:{'X-Provengo-Epoch-Id':"immich-membership-bf03927f8a6b",'X-Provengo-Operation-Id':"immich-membership-bf03927f8a6b-observe"}, expectedResponseCodes:[200]});
  sync({request:Event('SBT:AlbumAssetEpochClosed', {epoch_id:"immich-membership-bf03927f8a6b"})});
});
