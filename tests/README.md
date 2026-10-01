# Tests in this overlay

`test_mealie_coverage_target.py` replays the confirmed Mealie rule witness through the new gate, then changes its overlap and prefix evidence to assert those degraded histories do not qualify. A frozen ZIP from the earlier fresh trial is necessary for the replay; a missing archive results in `skipped`, not proof of correctness. Live Mealie behavior requires the Windows Docker run described in the root README.
