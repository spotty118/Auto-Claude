import os
import sys
from pathlib import Path

# Add backend and its subdirectories to path
backend_dir = Path("/Users/justinadams/Downloads/Auto-Claude-2.7.1/apps/backend")
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "analysis"))
sys.path.insert(0, str(backend_dir / "security"))

from parser import extract_commands
from project_analyzer import BASE_COMMANDS


def test_bypass(command):
    extracted = extract_commands(command)
    allowed = all(cmd in BASE_COMMANDS for cmd in extracted)
    print(f"Command: {command}")
    print(f"Extracted: {extracted}")
    print(f"Allowed: {allowed}")
    print("-" * 20)


test_bypass("sh -c 'rm -rf /'")
test_bypass("xargs rm -rf")
test_bypass("eval 'rm -rf /'")
test_bypass("sudo rm -rf /")
print(f"Is 'sudo' in BASE_COMMANDS? {'sudo' in BASE_COMMANDS}")
