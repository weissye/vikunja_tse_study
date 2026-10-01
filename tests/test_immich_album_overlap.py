"""Decision-boundary tests: absence of actual overlap never becomes a finding."""
import importlib.util
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

script_dir = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(script_dir))
if not (script_dir / 'run_immich_album_serial.py').is_file():
    # Local source-tree tests; in the installed project the earlier pilot
    # runner is already beside the new script.
    sys.path.insert(0, str(script_dir.parents[1] / 'immich_live_patch' / 'scripts'))
spec = importlib.util.spec_from_file_location('overlap', script_dir / 'run_immich_album_concurrent.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class OverlapDecisionTests(unittest.TestCase):
    def evidence(self, proxy_overlaps=True):
        start = datetime.now(timezone.utc)
        offset = timedelta(milliseconds=4 if proxy_overlaps else 40)
        writes = [dict(status=200, upstream_started_utc=(start + off).isoformat(),
                       upstream_completed_utc=(start + off + timedelta(milliseconds=20)).isoformat())
                  for off in (timedelta(0), offset)]
        epoch = {'status': 200, 'body': {
            'all_workers_ready_before_release': True, 'overlap_observed': True,
            'operations': [{'operation_id': 'ep-1', 'connection_id': 'conn-1', 'status': 200, 'error': None},
                           {'operation_id': 'ep-2', 'connection_id': 'conn-2', 'status': 200, 'error': None}]}}
        return epoch, writes

    def test_disjoint_persistence_is_pass_when_proxy_confirms_overlap(self):
        epoch, writes = self.evidence()
        self.assertEqual(('PASS', 'both-concurrent-updates-persisted'), mod.classify(
            epoch, {'status': 200, 'body': {'albumName': 'A', 'description': 'B'}},
            True, writes, [dict(status=200)], True, 'A', 'B'))

    def test_missing_field_after_two_successes_is_candidate(self):
        epoch, writes = self.evidence()
        self.assertEqual('SEMANTIC_CANDIDATE', mod.classify(
            epoch, {'status': 200, 'body': {'albumName': 'A', 'description': 'old'}},
            True, writes, [dict(status=200)], True, 'A', 'B')[0])

    def test_client_overlap_without_proxy_overlap_is_inconclusive(self):
        epoch, writes = self.evidence(False)
        self.assertEqual('INCONCLUSIVE', mod.classify(
            epoch, {'status': 200, 'body': {'albumName': 'A', 'description': 'old'}},
            True, writes, [dict(status=200)], True, 'A', 'B')[0])

    def test_interference_or_failed_serial_control_is_inconclusive(self):
        epoch, writes = self.evidence()
        for trace_ok, controls_ok in ((False, True), (True, False)):
            self.assertEqual('INCONCLUSIVE', mod.classify(
                epoch, {'status': 200, 'body': {'albumName': 'A', 'description': 'old'}},
                trace_ok, writes, [dict(status=200)], controls_ok, 'A', 'B')[0])


if __name__ == '__main__':
    unittest.main()
