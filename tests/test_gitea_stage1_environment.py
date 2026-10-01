import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COMPOSE = ROOT / "deployment" / "gitea_stage1" / "docker-compose.yml"
PREPARE = ROOT / "scripts" / "Prepare-Gitea-Stage1.ps1"
STOP = ROOT / "scripts" / "Stop-Gitea-Stage1.ps1"


class GiteaStage1EnvironmentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.compose = COMPOSE.read_text(encoding="utf-8")
        cls.prepare = PREPARE.read_text(encoding="utf-8")
        cls.stop = STOP.read_text(encoding="utf-8")

    def test_stack_is_versioned_and_isolated(self):
        self.assertIn("docker.gitea.com/gitea:1.27.3", self.compose)
        self.assertIn("postgres:16-alpine", self.compose)
        self.assertIn("gitea-stage1-server", self.compose)
        self.assertIn("gitea-stage1-db", self.compose)
        self.assertIn('"127.0.0.1:3477:3000"', self.compose)
        self.assertNotIn("vikunja", self.compose.lower())

    def test_no_secret_is_hard_coded(self):
        self.assertIn("${GITEA_STAGE1_POSTGRES_PASSWORD}", self.compose)
        self.assertNotRegex(self.compose, r"POSTGRES_PASSWORD:\s*(?!\$\{)[^\s]+")
        self.assertIn("password_recorded = $false", self.prepare)
        self.assertIn("token_recorded = $false", self.prepare)
        self.assertNotIn("Set-Content $token", self.prepare)

    def test_prepare_captures_instance_spec_and_provenance(self):
        required = [
            "/swagger.v1.json",
            "gitea-1.27.3-swagger.json",
            "openapi_sha256",
            "compose_sha256",
            "repo_digests",
            "GITEA_STAGE1_READY",
            "GITEA_API_TOKEN",
            "Stage 1 executed no generated API test.",
        ]
        for marker in required:
            self.assertIn(marker, self.prepare)

    def test_prepare_uses_non_admin_research_identity(self):
        self.assertRegex(self.prepare, r"--username \$testUsername[\s\S]+?--must-change-password=false")
        regular_create = re.search(
            r"--username \$testUsername[\s\S]+?--must-change-password=false \| Out-Null",
            self.prepare,
        )
        self.assertIsNotNone(regular_create)
        self.assertNotIn("--admin", regular_create.group(0))
        self.assertIn("administrator = $false", self.prepare)
        self.assertIn("--raw", self.prepare)
        self.assertIn("--scopes all", self.prepare)

    def test_reset_and_stop_are_scoped_to_the_compose_project(self):
        for text in (self.prepare, self.stop):
            self.assertIn('$project = "gitea_stage1"', text)
            self.assertIn("-p $project", text)
            self.assertNotIn("docker system prune", text)
        self.assertIn("[switch]$RemoveState", self.stop)
        self.assertIn("down -v --remove-orphans", self.stop)


if __name__ == "__main__":
    unittest.main()
