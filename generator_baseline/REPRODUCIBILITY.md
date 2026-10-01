# Reproducibility -- V31

The generator remains deterministic under a fixed OpenAPI, seed, and generation parameters. V31 additionally makes the NetBox A2A evidence boundary explicit.

## NetBox UC2 A-2-A -- V31

The canonical 12-operation OpenAPI is byte-preserved from V29 and has SHA-256 `dae055dc0eac76045389286820719f4a8b1fbd3be7d7897c50ba87cdd01d2060`. The version string inside that frozen OpenAPI intentionally still contains `v29`; changing it would violate byte preservation.

`ProvengoComplex` derives generic deep structural families from this OpenAPI only. Release validation checks the generator source for forbidden benchmark class/domain literals and verifies that the materialized families reach A=8, B=6, C=2, D=5, E=5 HTTP operations.

Official semantic evidence is sequence-local. The evaluator unions classes proven by complete independent sequences but never stitches partial prefixes across sequences. The flat campaign trace is retained only as a reachability diagnostic.

EvoMaster saved generated tests are replayed one-by-one on fresh SUT instances to obtain sequence traces. RESTler sequence evidence is accepted only when explicit native sequence boundaries can be parsed; otherwise no official semantic sequence is fabricated.

`experiments/netbox_a2a/check_v31_release.py` performs two independent generated-model builds and requires identical file hashes. `validate_artifact.py` runs that release self-test plus the preserved generator/runtime regression gates.
