/* Provengo genetic ranking: scores the WHOLE proposed ensemble.
 * The per-test terms reward the observable symbolic schedule. Ensemble terms
 * reward distinct oracle families, target instances, and control orders.
 * An event pair scheduled in the model is NOT proof of HTTP interval overlap.
 */
function rankingFunction(ensemble) {
  var score = 0;
  var families = {};
  var instances = {};
  var controlOrders = {};
  var familyInstancePairs = {};
  var scenarioKeys = {};

  for (var i = 0; i < ensemble.length; i++) {
    var test = ensemble[i];
    var chosen = null;
    var rounds = {};
    var serialOrders = {};
    var concurrentWrites = {};
    var restCount = 0;
    var lastRestMethod = null;
    var raceStart = false;
    var createdUser = false;
    for (var j = 0; j < test.length; j++) {
      var ev = test[j];
      var data = ev.data || {};
      if (ev.name === "SBT:ScheduleChosen") chosen = data;
      if (ev.name === "SBT:PrefixRoundScheduled") rounds[data.round] = true;
      if (ev.name === "SBT:SerialOrderScheduled") serialOrders[data.order] = true;
      if (ev.name === "SBT:ConcurrentWriteScheduled") concurrentWrites[data.operation] = true;
      if (ev.name === "SBT:RaceStart") raceStart = true;
      if (data.lib === "REST") {
        restCount++;
        lastRestMethod = data.method;
        if (data.method === "POST" && String(data.url).indexOf("/users") >= 0)
          createdUser = true;
      }
    }
    if (!chosen || !createdUser || !raceStart || !concurrentWrites.A ||
        !concurrentWrites.B || !serialOrders.AB || !serialOrders.BA ||
        lastRestMethod !== "GET") {
      score -= 1000;
      continue;
    }
    var verifiedRoundCount = 0;
    for (var r = 1; r <= 8; r++) if (rounds[r]) verifiedRoundCount++;
    if (verifiedRoundCount !== 8) {
      score -= 1000;
      continue;
    }
    // Symbolic structural score for a complete long-prefix race schedule.
    score += 40 + 8 * verifiedRoundCount +
             Math.min(restCount, 120) / 4 + Math.min(test.length, 400) / 40;
    var family = String(chosen.kind);
    var instance = String(chosen.instance);
    var order = String(chosen.first);
    families[family] = true;
    instances[instance] = true;
    controlOrders[order] = true;
    familyInstancePairs[family + "|" + instance] = true;
    var key = family + "|" + instance + "|" + order;
    scenarioKeys[key] = (scenarioKeys[key] || 0) + 1;
  }

  // Selection across 15 tests: cover the three families, all three instance
  // choices, both first-control orders, and their combinations.
  score += 200 * Object.keys(families).length;
  score += 60 * Object.keys(instances).length;
  score += 40 * Object.keys(controlOrders).length;
  score += 25 * Object.keys(familyInstancePairs).length;
  for (var key in scenarioKeys)
    if (scenarioKeys[key] > 1) score -= 20 * (scenarioKeys[key] - 1);
  return score;
}
