"""Smoke tests for preview revision JSON parsing fallbacks."""

from tool_creator import parse_revise_preview_response


def test_malformed_json_extracts_tool_code():
    tool_body = "def run(): return True\n" + "# comment\n" * 100
    # Valid-looking start, then broken JSON property name (like column 10681 errors)
    raw = (
        '{"tool_code": "'
        + tool_body.replace('"', '\\"')
        + '", "test_code": "importlib\\nassert True", '
        + '"manifest": {"kind": "interactive", bad_key: 1}}'
    )
    tool, test, manifest = parse_revise_preview_response(
        raw,
        fallback_tool="fallback",
        fallback_test="fallback",
        fallback_manifest={"kind": "interactive"},
    )
    assert "def run()" in tool
    assert "importlib" in test
    assert manifest is not None
    assert manifest.get("kind") == "interactive"


if __name__ == "__main__":
    test_malformed_json_extracts_tool_code()
    print("ok")
