import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace


SCRIPT = Path(__file__).parents[2] / "scripts" / "prepare_library_sequence_traces.py"
SPEC = importlib.util.spec_from_file_location("prepare_library_sequence_traces", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_saved_evomaster_test_can_import_sibling_helper(tmp_path):
    source_dir = tmp_path / "saved"
    source_dir.mkdir()
    (source_dir / "EvoMasterTestUtils.py").write_text(
        "def expected_value():\n    return 42\n", encoding="utf-8"
    )
    source = source_dir / "EvoMaster_successes_Test.py"
    source.write_text(
        "from EvoMasterTestUtils import expected_value\n"
        "class EvoMasterTest:\n"
        "    baseUrlOfSut = 'http://127.0.0.1:5000'\n"
        "    def test_0(self):\n"
        "        assert expected_value() == 42\n",
        encoding="utf-8",
    )
    work = tmp_path / "work"
    work.mkdir()

    completed = MODULE.run_one_python_test(
        SimpleNamespace(python=sys.executable, replay_timeout=10),
        source,
        "EvoMasterTest",
        "test_0",
        54321,
        work,
    )

    assert completed.returncode == 0, completed.stdout
    assert "http://127.0.0.1:54321" in (work / source.name).read_text(encoding="utf-8")


def test_restler_header_is_not_a_sequence_boundary(tmp_path):
    log_dir = tmp_path / "logs"
    log_dir.mkdir()
    (log_dir / "network.testing.1.txt").write_text(
        "Generation-1: Rendering Sequence-1\n"
        "    Request: 1 (Remaining candidate combinations: 2)\n"
        "2026-09-16 12:00:00: Sending: 'POST /holds HTTP/1.1\\r\\n"
        "x-restler-sequence-id: abc-123\\r\\n\\r\\n"
        "{\"bookId\":1,\"userId\":7}'\n"
        "2026-09-16 12:00:01: Received: 'HTTP/1.1 201 CREATED\\r\\n\\r\\n{}'\n"
        "Generation-1: Rendering Sequence-2\n"
        "2026-09-16 12:00:02: Sending: 'GET /books HTTP/1.1\\r\\n"
        "x-restler-sequence-id: def-456\\r\\n\\r\\n'\n"
        "2026-09-16 12:00:03: Received: 'HTTP/1.1 200 OK\\r\\n\\r\\n[]'\n"
        "Generation-2: Rendering Sequence-1\n"
        "2026-09-16 12:00:04: Sending: 'GET /stores/a b HTTP/1.1\\r\\n\\r\\n'\n"
        "2026-09-16 12:00:05: Received: 'HTTP/1.1 400 BAD REQUEST\\r\\n\\r\\n'\n"
        "2026-09-16 12:00:05: Received: '{\"error\":\"bad request\"}'\n",
        encoding="utf-8",
    )

    logs, sequences = MODULE.parse_restler_native_sequences(tmp_path)

    assert len(logs) == 1
    assert [item["id"] for item in sequences] == [
        "network.testing.1.txt:generation-1:sequence-1",
        "network.testing.1.txt:generation-1:sequence-2",
        "network.testing.1.txt:generation-2:sequence-1",
    ]
    assert [len(item["requests"]) for item in sequences] == [1, 1, 1]
    assert sequences[2]["requests"][0]["path"] == "/stores/a b"
    assert all(item["unmatched"] == 0 for item in sequences)
