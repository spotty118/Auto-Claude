"""
Path Validators - Path Traversal Protection
============================================

Security utilities to prevent path traversal attacks (CWE-22) and
TOCTOU race conditions (CWE-367).

Used to validate file paths from untrusted sources (AI-generated paths,
user input, external APIs) before filesystem operations.

OMNI-AURORA Grimoire Entry:
- context: CODING | risk:R2 | domain:security
- trigger: AI-generated file paths used without validation
- root_cause: Trust boundary violation - AI output treated as trusted
- countermeasure: Always validate paths against allowed base directory

SECURITY FEATURES:
- Path traversal prevention via canonicalization
- TOCTOU mitigation via O_NOFOLLOW atomic operations
- Symlink attack prevention
"""

from __future__ import annotations

import errno
import os
from contextlib import contextmanager
from pathlib import Path
from typing import IO, NamedTuple


class PathValidationResult(NamedTuple):
    """Result of path validation."""

    is_valid: bool
    resolved_path: Path | None
    error: str | None


@contextmanager
def safe_open(
    path: str | Path,
    mode: str = "r",
    base_dir: Path | None = None,
) -> IO:
    """
    Safely opens a file with TOCTOU mitigation.
    
    Uses O_NOFOLLOW to prevent symlink attacks by atomically checking
    and opening the file in a single system call.
    
    Args:
        path: Path to the file to open
        mode: File mode ('r', 'rb', 'w', 'wb', 'a', 'ab')
        base_dir: Optional base directory for path validation
        
    Yields:
        File handle for the opened file
        
    Raises:
        ValueError: If path is a symlink or escapes base_dir
        OSError: For other file-related errors
        
    Example:
        >>> with safe_open("/project/data.txt", "r", base_dir=Path("/project")) as f:
        ...     content = f.read()
    """
    # Convert to Path if needed
    if isinstance(path, str):
        path = Path(path)
    
    # Validate against base_dir if provided
    if base_dir is not None:
        result = validate_path_within_base(path, base_dir)
        if not result.is_valid:
            raise ValueError(f"Path validation failed: {result.error}")
        # Use the resolved path for opening
        path = result.resolved_path
    
    # Map high-level modes to low-level os.open flags
    mode_flags = {
        "r": os.O_RDONLY,
        "rb": os.O_RDONLY,
        "w": os.O_WRONLY | os.O_CREAT | os.O_TRUNC,
        "wb": os.O_WRONLY | os.O_CREAT | os.O_TRUNC,
        "a": os.O_WRONLY | os.O_CREAT | os.O_APPEND,
        "ab": os.O_WRONLY | os.O_CREAT | os.O_APPEND,
    }
    
    if mode not in mode_flags:
        raise ValueError(f"Unsupported mode for safe_open: '{mode}'")
    
    flags = mode_flags[mode]
    creation_perms = 0o644  # rw-r--r-- for new files
    
    # Try to open with O_NOFOLLOW for atomic symlink rejection
    try:
        # O_NOFOLLOW prevents opening symlinks - atomic TOCTOU mitigation
        secure_flags = flags | getattr(os, "O_NOFOLLOW", 0)
        fd = os.open(str(path), secure_flags, creation_perms)
    except OSError as e:
        # O_NOFOLLOW causes ELOOP on symlinks
        if e.errno == errno.ELOOP:
            raise ValueError(f"Symlink not allowed: {path}") from e
        # EMLINK on some systems for symlinks
        if e.errno == getattr(errno, "EMLINK", None):
            raise ValueError(f"Symlink not allowed: {path}") from e
        raise
    except AttributeError:
        # O_NOFOLLOW not available (non-POSIX platform)
        # Fall back to explicit check (vulnerable to TOCTOU but best effort)
        if path.is_symlink():
            raise ValueError(f"Symlink not allowed (platform lacks O_NOFOLLOW): {path}")
        fd = os.open(str(path), flags, creation_perms)
    
    try:
        # Wrap file descriptor in Python file object
        with open(fd, mode) as f:
            yield f
    except Exception:
        # Ensure fd is closed on error (open() takes ownership normally)
        try:
            os.close(fd)
        except OSError:
            pass
        raise


def validate_path_within_base(
    untrusted_path: str | Path,
    base_dir: Path,
    must_exist: bool = False,
) -> PathValidationResult:
    """
    Validate that a path resolves within the allowed base directory.

    This prevents path traversal attacks where malicious paths like
    '../../../etc/passwd' could escape the intended directory.

    Args:
        untrusted_path: The path to validate (from untrusted source)
        base_dir: The allowed base directory (must be absolute)
        must_exist: If True, also verify the resolved path exists

    Returns:
        PathValidationResult with is_valid, resolved_path, and error

    Security Notes:
        - Uses resolve() to eliminate .. and symlinks
        - Checks is_relative_to() for containment
        - Returns None path on validation failure (fail-safe)

    Example:
        >>> result = validate_path_within_base("../etc/passwd", Path("/project"))
        >>> result.is_valid
        False
        >>> result.error
        'Path escapes base directory'
    """
    if not base_dir.is_absolute():
        return PathValidationResult(
            is_valid=False,
            resolved_path=None,
            error="Base directory must be absolute",
        )

    try:
        # Convert to Path if string
        if isinstance(untrusted_path, str):
            untrusted_path = Path(untrusted_path)

        # Resolve the full path (eliminates .., symlinks)
        # Join with base_dir first if relative
        if untrusted_path.is_absolute():
            resolved = untrusted_path.resolve()
        else:
            resolved = (base_dir / untrusted_path).resolve()

        # Check containment - path must be within base_dir
        base_resolved = base_dir.resolve()

        # Use is_relative_to (Python 3.9+) for safe containment check
        if not resolved.is_relative_to(base_resolved):
            return PathValidationResult(
                is_valid=False,
                resolved_path=None,
                error=f"Path escapes base directory: {untrusted_path}",
            )

        # Optional existence check
        if must_exist and not resolved.exists():
            return PathValidationResult(
                is_valid=False,
                resolved_path=None,
                error=f"Path does not exist: {resolved}",
            )

        return PathValidationResult(
            is_valid=True,
            resolved_path=resolved,
            error=None,
        )

    except (ValueError, OSError) as e:
        return PathValidationResult(
            is_valid=False,
            resolved_path=None,
            error=f"Invalid path: {e}",
        )


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent directory traversal.

    Removes or replaces dangerous characters and patterns.
    Use when you need just the filename component, not a full path.

    Args:
        filename: The filename to sanitize

    Returns:
        Sanitized filename safe for use

    Example:
        >>> sanitize_filename("../../../etc/passwd")
        'etc_passwd'
        >>> sanitize_filename("file.txt")
        'file.txt'
    """
    # Remove any path separators
    filename = filename.replace("/", "_").replace("\\", "_")

    # Remove leading dots to prevent hidden files and traversal
    while filename.startswith("."):
        filename = filename[1:]

    # Replace sequences of dots
    while ".." in filename:
        filename = filename.replace("..", "_")

    # If empty after sanitization, use a safe default
    if not filename:
        filename = "unnamed"

    return filename


def assert_path_within_base(
    untrusted_path: str | Path,
    base_dir: Path,
    context: str = "file operation",
) -> Path:
    """
    Validate path and raise ValueError if invalid.

    Use this when you want exception-based validation.

    Args:
        untrusted_path: The path to validate
        base_dir: The allowed base directory
        context: Description of the operation (for error message)

    Returns:
        The validated, resolved Path

    Raises:
        ValueError: If path validation fails
    """
    result = validate_path_within_base(untrusted_path, base_dir)
    if not result.is_valid:
        raise ValueError(f"Path traversal blocked in {context}: {result.error}")
    assert result.resolved_path is not None  # Guaranteed by is_valid=True
    return result.resolved_path


# Default subprocess timeout (seconds) for git operations
# Prevents hang attacks and resource exhaustion
DEFAULT_SUBPROCESS_TIMEOUT = 300  # 5 minutes for large repos
GIT_SUBPROCESS_TIMEOUT = 60  # 1 minute for simple git commands


__all__ = [
    "PathValidationResult",
    "validate_path_within_base",
    "sanitize_filename",
    "assert_path_within_base",
    "safe_open",
    "DEFAULT_SUBPROCESS_TIMEOUT",
    "GIT_SUBPROCESS_TIMEOUT",
]
