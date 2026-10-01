/* Only model events are ranked. No inference about observed HTTP overlap. */
function sbtResearchRanking(ensemble) {
  var families = {}, oracles = {}, totalPrefix = 0, useful = 0, complete = 0;
  var patterns = [
    ["same-record", /same.field|same.record/i],
    ["disjoint-fields", /disjoint/i],
    ["no-op", /noop|no.op/i],
    ["update-delete", /update.delete/i],
    ["cross-entity", /cross.entity/i]
  ];
  for (var i = 0; i < ensemble.length; i++) {
    var scenario = ensemble[i], prefix = 0, ready = false, begin = false, end = false;
    var mentioned = {};
    for (var j = 0; j < scenario.length; j++) {
      var event = scenario[j], name = String(event.name || "");
      var value = JSON.stringify(event.data || {});
      if (name.indexOf("PrefixVerified") >= 0) prefix++;
      if (name.indexOf("ConcurrencyReady") >= 0) ready = true;
      if (/EpochStart|EpochStarted/.test(name)) begin = true;
      if (/EpochFinished|EpochClosed/.test(name)) end = true;
      var text = name + " " + value;
      for (var k = 0; k < patterns.length; k++) {
        if (patterns[k][1].test(text)) mentioned[patterns[k][0]] = true;
      }
      var oracle = event.data && (event.data.oracle_id || event.data.oracleId);
      if (typeof oracle === "string") oracles[oracle] = true;
    }
    if (prefix > 0 && ready) useful++;
    if (begin && end) complete++;
    totalPrefix += Math.min(prefix, 12);
    for (var family in mentioned) if (mentioned.hasOwnProperty(family)) families[family] = true;
  }
  var familyCount = Object.keys(families).length;
  var oracleCount = Object.keys(oracles).length;
  // Diversity dominates repetitions; prefixes and complete model epochs break ties.
  return 1000 * familyCount + 100 * oracleCount +
         30 * complete + 10 * useful + totalPrefix;
}
