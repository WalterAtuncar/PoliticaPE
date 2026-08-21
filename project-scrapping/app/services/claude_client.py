import os

import anthropic

_client = None


def get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY del entorno
    return _client


def has_key() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def model(kind: str = "default") -> str:
    if kind == "classifier":
        return os.getenv("CLAUDE_MODEL_CLASSIFIER") or os.getenv("CLAUDE_MODEL", "claude-opus-5")
    return os.getenv("CLAUDE_MODEL", "claude-opus-5")
