#!/usr/bin/env python3
"""Stage a real REST schedule from generated oracles and empirical fixture evidence.

Sampling chooses requests. Only REST callbacks during a real run bind server
identifiers and validate responses. Sampling never supplies fabricated results.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess


KINDS = ("same-field-one-successful-value-visible", "noop-versus-change",
         "disjoint-put-serial-outcomes")


def q(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def choose(plan, controls):
    if len(controls.get("fields", [])) < 2:
        raise ValueError("two empirically controlled fields required")
    f1, f2 = controls["fields"][:2]
    if not all(re.fullmatch(r"[A-Za-z_][A-Za-z_0-9]*", name) for name in (f1, f2)):
        raise ValueError("field names must be simple identifiers")
    operation = "put:" + controls["generated_oracle_reference"].split("::put:", 1)[1]
    result = {}
    for oracle in plan["oracles"]:
        kind = oracle.get("kind")
        if kind not in KINDS or oracle.get("operation_id") != operation:
            continue
        if not oracle.get("runtime", {}).get("ready"):
            continue
        names = [f.get("name") for f in oracle.get("fields", [])]
        if kind == KINDS[0] and names != [f1]:
            continue
        if kind == KINDS[1] and f1 not in names:
            continue
        if kind == KINDS[2] and names != [f1, f2]:
            continue
        result[kind] = oracle
    if set(result) != set(KINDS):
        raise ValueError("generated runtime-ready oracles do not cover the three selected families")
    return result


def render(plan, controls, *, prefix_rounds=8, instances=3, realm_suffix="trial"):
    if not 1 <= prefix_rounds <= 16 or not 1 <= instances <= 8:
        raise ValueError("prefix rounds must be 1..16, instances must be 1..8")
    chosen = choose(plan, controls)
    f1, f2 = controls["fields"][:2]
    template = chosen[KINDS[0]]["path_template"]
    # These are Keycloak fixture bindings established by the separate live
    # gate, not guessed from OpenAPI. Every other value comes from the plan.
    if template != "/admin/realms/{realm}/users/{user-id}":
        raise ValueError("this fixture adapter requires the verified realm/user path")
    lines = [
        "// Real REST action schedule. Sample has no HTTP responses.",
        "// @provengo summon rest",
        "// @provengo summon rtv",
        'const sbtService = new RESTSession("http://127.0.0.1:9938", "sbt-runtime",',
        '  {headers:{"Content-Type":"application/json","Authorization":"Bearer @{getEnv(\'KC_STAGE2_ACCESS_TOKEN\')}"}});',
        'function sbtBodyObject(r){var b=typeof r.body==="string"?JSON.parse(r.body):r.body;'
        'if(!b||typeof b!=="object")throw Error("response body is not an object");return b;}',
        'function sbtBodyText(r){return typeof r.body==="string"?r.body:JSON.stringify(r.body);}',
        'bthread("choose-generated-oracle",function(){',
        ' var kind=select("oracle-kind").from(' + ",".join(q(k) for k in KINDS) + ');',
        ' var instance=select("instance-index").from(' + ",".join(map(str, range(1, instances + 1))) + ');',
        ' var first=select("first-serial-order").from("AB","BA");',
        ' sync({request:Event("SBT:ScheduleChosen",{kind:kind,instance:instance,first:first})});',
        '});',
    ]

    def request(method, path, body=None, code=200, callback=None):
        opts = []
        if body is not None:
            opts.append("body:" + q(body))
        opts.append("expectedResponseCodes:[" + str(code) + "]")
        if callback is None:
            callback = ('if(r.code!==' + str(code) +
                        '){pvg.fail("unexpected HTTP "+r.code);}else{pvg.success("HTTP '+str(code)+'");}')
        opts.append("callback:function(r){" + callback + "}")
        return "sbtService." + method + "(" + q(path) + ",{" + ",".join(opts) + "});"

    def updated_body(var, field, value, code):
        return ('if(r.code!=='+str(code)+'){pvg.fail("cannot bind update body");return;}'
                'var b;try{b=sbtBodyObject(r);}'
                'catch(ex){pvg.fail("update body JSON parse failed");return;}'
                'b['+q(field)+']='+q(value)+';'
                'try{pvg.rtv.set('+q(var)+',JSON.stringify(b));}'
                'catch(ex){pvg.fail("update body runtime binding failed");return;}'
                'pvg.success("body bound");')

    for n in range(1, instances + 1):
        realm = "sbt-rb-" + realm_suffix + "-" + str(n)
        rv, uid = "sbt_realm_" + str(n), "sbt_user_id_" + str(n)
        path = template.replace("{realm}", "@{" + rv + "}").replace("{user-id}", "@{" + uid + "}")
        collection = "/admin/realms/@{" + rv + "}/users"
        lines += [
            'bthread("fixture-and-controls:'+str(n)+'",function(){',
            ' var picked=sync({waitFor:EventSet("pick:'+str(n)+'",function(e){return e.name==="SBT:ScheduleChosen" && e.data && e.data.instance==='+str(n)+';})});',
            ' rtv.doStore('+q(rv)+','+q(realm)+');',
            ' '+request("post", "/admin/realms", q({"realm": realm, "enabled": True}), 201),
            ' '+request("get", "/admin/realms/@{"+rv+"}", code=200),
            ' '+request("post", collection,
                      q({"username": "sbt-user-"+realm, "enabled": True,
                         "firstName": "Initial", "lastName": "Pilot"}), 201,
                      ('if(r.code!==201){pvg.fail("user create failed");return;}'
                       'pvg.success("user created; awaiting readback ID");')),
            ' '+request("get", collection+"?username=sbt-user-"+realm+"&exact=true", code=200,
                      callback=(
                          'if(r.code!==200){pvg.fail("user lookup failed");return;}'
                          'var users;'
                          'try{users=typeof r.body==="string"?JSON.parse(r.body):r.body;}'
                          'catch(ex){pvg.fail("user lookup JSON parse failed");return;}'
                          'if(!users||typeof users.length!=="number")'
                          '{pvg.fail("user lookup response is not an array");return;}'
                          'var match=null,count=0;'
                          'for(var i=0;i<users.length;i++){var u=users[i];'
                          'if(u&&u.username==='+q("sbt-user-"+realm)+'){match=u;count++;}}'
                          'if(count!==1||typeof match.id!=="string"||'
                          '!/^[A-Za-z0-9-]+$/.test(match.id))'
                          '{pvg.fail("user lookup missing or ambiguous");return;}'
                          'try{pvg.rtv.set('+q(uid)+',match.id);}'
                          'catch(ex){pvg.fail("user lookup runtime binding failed");return;}'
                          'pvg.success("user ID bound from exact readback");')),

            ' '+request("get", path, code=200, callback=(
                'if(r.code!==200){pvg.fail("created user not readable");return;}'
                'var user;try{user=sbtBodyObject(r);}'
                'catch(ex){pvg.fail("read user JSON parse failed");return;}'
                'if(typeof user.id!=="string"||!user.id)'
                '{pvg.fail("user ID missing");return;}'
                'pvg.success("user readable");')),
        ]
        for round_index in range(1, prefix_rounds + 1):
            # Each step chooses which state field to update. The history of
            # firstName/lastName mutations changes the final race baseline.
            variant = "sbt_prefix_field_" + str(n) + "_" + str(round_index)
            lines.append(' var '+variant+'=select('+q('prefix-field:'+str(n)+':'+str(round_index))+
                         ').from("a","b");')
            for option in ("a", "b"):
                body_var = "sbt_prefix_body_" + str(n) + "_" + str(round_index) + "_" + option
                target = f1 if option == "a" else f2
                expected = "sbt-prefix-" + str(round_index)
                lines += [
                    ' if('+variant+'==='+q(option)+'){',
                    "  " + request("get", path, callback=updated_body(body_var, target, expected, 200)),
                    "  " + request("put", path, "@{"+body_var+"}", code=204),
                    "  " + request("get", path, code=200, callback=(
                        'if(r.code!==200){pvg.fail("prefix read failed");return;}'
                        'var body;try{body=sbtBodyObject(r);}'
                        'catch(ex){pvg.fail("prefix JSON parse failed");return;}'
                        'if(body['+q(target)+']!=='+q(expected)+')'
                        '{pvg.fail("prefix value mismatch");return;}'
                        'pvg.success("prefix round observed");')),
                    ' }',
                ]
            lines.append(' sync({request:Event("SBT:PrefixRoundScheduled",{round:'+str(round_index)+
                         ',instance:'+str(n)+',status:"NOT_OBSERVED_IN_SAMPLE"})});')
        # Both serial orders run against the same snapshot, with an observed
        # read and restore separating them. Bodies are built from real GETs.
        baseline_var = "sbt_baseline_" + str(n)
        lines.append(" " + request("get", path, callback=(
            'if(r.code!==200){pvg.fail("baseline GET failed");return;}'
            'pvg.rtv.set('+q(baseline_var)+',sbtBodyText(r));pvg.success("baseline captured");')))
        for kind_index, kind in enumerate(KINDS, 1):
            lines.append(" if(picked.data.kind==="+q(kind)+"){")
            for first in ("AB", "BA"):
                lines.append("  if(picked.data.first==="+q(first)+"){")
                for order in (first, first[::-1]):
                    for label in order:
                        target = (f1 if kind != KINDS[2] or label == "A" else f2)
                        value = ("sbt-"+label if kind != KINDS[1] else
                                 ("sbt-change" if label == "B" else None))
                        body_var = ("sbt_control_body_" + str(n) + "_" +
                                    str(kind_index) + "_" + first + "_" + order + "_" + label)
                        if value is None:
                            cb = ('if(r.code!==200){pvg.fail("noop read failed");return;}'
                                  'pvg.rtv.set('+q(body_var)+',sbtBodyText(r));pvg.success("noop body bound");')
                        else:
                            cb = updated_body(body_var, target, value, 200)
                        lines.append("   " + request("get", path, callback=cb))
                        lines.append("   " + request("put", path, "@{"+body_var+"}", code=204))
                        lines.append("   " + request("get", path))
                    lines.append('   sync({request:Event("SBT:SerialOrderScheduled",{kind:'+q(kind)+
                                 ',order:'+q(order)+',instance:'+str(n)+
                                 ',status:"NOT_OBSERVED_IN_SAMPLE"})});')
                    lines.append("   " + request("put", path, "@{"+baseline_var+"}", code=204))
                    lines.append("   " + request("get", path))
                lines.append("  }")
            lines.append(" }")
        for kind in KINDS:
            lines.append(" if(picked.data.kind==="+q(kind)+"){")
            for label in ("A", "B"):
                target = f1 if kind != KINDS[2] or label == "A" else f2
                value = ("sbt-race-"+label if kind != KINDS[1] else
                         ("sbt-race-change" if label == "B" else None))
                var = "sbt_race_"+label+"_"+str(n)
                if value is None:
                    cb = ('if(r.code!==200){pvg.fail("noop baseline GET failed");return;}'
                          'pvg.rtv.set('+q(var)+',sbtBodyText(r));pvg.success("noop bound");')
                else:
                    cb = updated_body(var, target, value, 200)
                lines.append("  " + request("get", path, callback=cb))
            lines.append(" }")
        lines += [
            ' sync({request:Event("SBT:RaceStart",{kind:picked.data.kind,instance:'+str(n)+
            ',actual_overlap:"NOT_MEASURED_IN_SAMPLE"})});',
            ' '+request("post", "/__sbt_race", '{"path":'+q(path)+
                      ',"A":@{sbt_race_A_'+str(n)+'},"B":@{sbt_race_B_'+str(n)+'}}',
                      code=200, callback=(
                          'if(r.code!==200){pvg.fail("race dispatch failed");return;}'
                          'var result;try{result=sbtBodyObject(r);}'
                          'catch(ex){pvg.fail("race dispatch response invalid");return;}'
                          'if(result.A!==204||result.B!==204)'
                          '{pvg.fail("race PUT status mismatch");return;}'
                          'if(result.overlap!==true)'
                          '{pvg.fail("race PUT intervals did not overlap");return;}'
                          'pvg.success("parallel PUT pair observed");')),
            ' sync({request:Event("SBT:ConcurrentWriteScheduled",{instance:'+str(n)+
            ',operation:"A",kind:picked.data.kind,actual_overlap:"MEASURED_BY_RELAY"})});',
            ' sync({request:Event("SBT:ConcurrentWriteScheduled",{instance:'+str(n)+
            ',operation:"B",kind:picked.data.kind,actual_overlap:"MEASURED_BY_RELAY"})});',
            ' '+request("get", path, code=200, callback=(
                'if(r.code!==200){pvg.fail("post-join read failed");return;}'
                'pvg.rtv.set("sbt_post_join_'+str(n)+'",sbtBodyText(r));'
                'pvg.success("post-join state captured");')),
            '});',
        ]
    return "\n".join(lines)+"\n", chosen


def prepare(plan_path, controls_path, output, executable, rounds, instances):
    if output.exists():
        raise ValueError("output already exists")
    plan_raw, controls_raw = plan_path.read_bytes(), controls_path.read_bytes()
    suffix = hashlib.sha256(str(output.resolve()).encode()).hexdigest()[:8]
    code, chosen = render(json.loads(plan_raw), json.loads(controls_raw),
                          prefix_rounds=rounds, instances=instances, realm_suffix=suffix)
    output.mkdir(parents=True)
    project = output / "provengo_project"
    with (output / "provengo-create.log").open("w", encoding="utf-8") as log:
        result = subprocess.run([executable, "--batch-mode", "create", str(project)],
                                stdout=log, stderr=subprocess.STDOUT, timeout=90)
    if result.returncode or not (project / "config/provengo.yml").exists():
        raise RuntimeError("Provengo create failed; inspect provengo-create.log")
    js = project / "spec/js"
    (js / "hello-world.js").unlink(missing_ok=True)
    (js / "runtime-bound.generated.js").write_text(code, encoding="utf-8")
    manifest = {
        "schema_version": 1,
        "plan_sha256": hashlib.sha256(plan_raw).hexdigest(),
        "controls_sha256": hashlib.sha256(controls_raw).hexdigest(),
        "selected_oracles": {k: v["oracle_id"] for k, v in chosen.items()},
        "model": "REST_EVENTS_AND_RUNTIME_CALLBACKS",
        "instance_choices": instances, "prefix_rounds": rounds,
        "runtime_status": "NOT_RUN", "actual_overlap": "NOT_MEASURED",
        "warnings": [
            "Keycloak fixture adapter with empirical realm/user binding; not a generic OpenAPI constructor",
            "REST bearer token must be supplied to Provengo runtime before a live run",
            "Sample shows request schedules only: no observed HTTP, prefix verdict or overlap",
            "Two PUT requests are scheduled from separate bthreads; check relay interval trace before counting overlap",
            "Create identifier is bound by an exact user-list readback after POST 201",
            "Serial controls are scheduled for both orders; comparison of observed states is separate",
        ],
    }
    (output / "runtime-bound-manifest.json").write_text(q(manifest)+"\n", encoding="utf-8")
    return project


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", required=True, type=Path)
    parser.add_argument("--controls", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--prefix-rounds", type=int, default=8)
    parser.add_argument("--instances-per-entity", type=int, default=3)
    args = parser.parse_args()
    executable = shutil.which("provengo")
    if not executable:
        parser.error("provengo executable is missing")
    try:
        project = prepare(args.plan, args.controls, args.out, executable,
                          args.prefix_rounds, args.instances_per_entity)
    except (ValueError, OSError, RuntimeError, subprocess.TimeoutExpired) as error:
        parser.error(str(error))
    print("SBT_RUNTIME_BOUND_SAMPLE_PROJECT_READY", project)


if __name__ == "__main__":
    main()
