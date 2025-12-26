"""
Wrapper Command Validators
==========================

Validators for shell wrapper and interactive commands (sh, bash, eval, xargs, etc.).
These commands are often used to bypass security allowlists.
"""

import shlex
from .validation_models import ValidationResult

# Commands that are forbidden because they allow arbitrary code execution bypass
FORBIDDEN_WRAPPERS = {
    "sh",
    "bash",
    "zsh",
    "eval",
    "exec",
    "source",
    ".",
    "xargs",
}


def validate_wrapper_command(command_string: str) -> ValidationResult:
    """
    Generic validator for shell wrappers - currently blocks them all for safety.

    In the future, this could be enhanced to recursively validate the inner command,
    but for now, it's safer to block them and force the AI to use direct commands.
    """
    try:
        tokens = shlex.split(command_string)
    except ValueError:
        return False, "Could not parse wrapper command"

    if not tokens:
        return False, "Empty wrapper command"

    cmd = tokens[0]

    # Check if it's a call to a shell with -c (common for injection)
    if cmd in ("sh", "bash", "zsh"):
        return (
            False,
            f"Direct shell execution ({cmd}) is blocked for security. Use commands directly.",
        )

    # Block other wrappers
    if cmd in FORBIDDEN_WRAPPERS:
        return False, f"Wrapper command '{cmd}' is blocked to prevent security bypass."

    return True, ""
