"""Estimate the carbon footprint of claude.ai usage from a data export.

Reads conversations.json (or the conversations-000.zip, or a folder holding
either) and prints the input and output token counts to paste into the
"AI Claude input tokens" and "AI Claude output tokens" columns of the carbon
spreadsheet. Worst-case assumptions throughout, no LLM involved.

Usage:
    python tools/claude_footprint.py [PATH] [--since YYYY-MM-DD] [--until YYYY-MM-DD]

PATH defaults to ./claude-conversations (git-ignored drop folder).
Without --since/--until, every message in the export is counted.
"""

import argparse
import json
import sys
import zipfile
from datetime import date, datetime
from pathlib import Path

# Worst-case factors (kg eqCO2 per token, as in the spreadsheet), see SOURCE_LINE
KG_PER_OUTPUT_TOKEN = 4.13e-6
KG_PER_INPUT_TOKEN = 1.95e-7
CHARS_PER_TOKEN = 3.5          # lower ratio = more tokens
HIDDEN_TOKENS_PER_CALL = 30000  # system prompt + tool definitions, absent from the export

SOURCE_LINE = (
    "Factors: Claude 3.7 Sonnet measured at ~826 gCO2eq/M output and ~39 gCO2eq/M input tokens "
    "(Jegham et al. 2025, arXiv:2505.09598, PUE included, grid 0.287 kgCO2e/kWh AWS average), "
    "via G. Wittebolle's claude-carbon analysis; scaled x5 for Opus (upper end of 1.7-5x band) "
    "-> 4.13 g/1k output, 0.195 g/1k input. No caching discount; 30k hidden tokens per model call. "
    "Cross-check: EcoLogits Sonnet band 565-1,385 g/M output."
)

DEFAULT_DROP = Path(__file__).resolve().parent.parent / "claude-conversations"


def tokens(text):
    return len(text) / CHARS_PER_TOKEN if text else 0.0


def load_conversations(path):
    path = Path(path)
    if path.is_dir():
        candidates = list(path.glob("**/conversations.json")) + list(path.glob("**/conversations*.zip"))
        if not candidates:
            sys.exit(f"No conversations.json or conversations*.zip found in {path}")
        path = max(candidates, key=lambda p: p.stat().st_mtime)
    if path.suffix == ".zip":
        with zipfile.ZipFile(path) as archive:
            name = next((n for n in archive.namelist() if n.endswith("conversations.json")), None)
            if name is None:
                sys.exit(f"No conversations.json inside {path}")
            return json.loads(archive.read(name).decode("utf-8")), path
    with open(path, encoding="utf-8") as f:
        return json.load(f), path


def message_date(message):
    return datetime.fromisoformat(message["created_at"].replace("Z", "+00:00")).date()


def tool_result_text(block):
    content = block.get("content")
    if isinstance(content, str):
        return content
    return "".join(part.get("text", "") for part in content or [] if isinstance(part, dict))


def estimate(conversations, since=None, until=None):
    """Walk every conversation in order; each model call re-reads the whole context so far."""
    totals = {"conversations": 0, "calls": 0, "input": 0.0, "output": 0.0, "first": None, "last": None}

    for conversation in conversations:
        context = 0.0
        counted = False
        messages = sorted(conversation.get("chat_messages", []), key=lambda m: m["created_at"])

        for message in messages:
            day = message_date(message)
            in_range = (since is None or day >= since) and (until is None or day <= until)
            blocks = message.get("content") or [{"type": "text", "text": message.get("text", "")}]

            for attachment in message.get("attachments") or []:
                context += tokens(attachment.get("extracted_content", ""))

            if message.get("sender") != "assistant":
                for block in blocks:
                    if block.get("type") == "text":
                        context += tokens(block.get("text", ""))
                    elif block.get("type") == "injected_prompt_block":
                        context += tokens(block.get("prompt", ""))
                    elif block.get("type") == "tool_result":
                        context += tokens(tool_result_text(block))
                continue

            # One call per assistant reply, plus one after each tool result
            calls_input = [context]
            for block in blocks:
                kind = block.get("type")
                produced = 0.0
                if kind == "text":
                    produced = tokens(block.get("text", ""))
                elif kind == "thinking":
                    produced = tokens(block.get("thinking", ""))
                elif kind == "tool_use":
                    produced = tokens(json.dumps(block.get("input", {}), ensure_ascii=False))
                elif kind == "tool_result":
                    context += tokens(tool_result_text(block))
                    calls_input.append(context)
                    continue
                elif kind == "injected_prompt_block":
                    context += tokens(block.get("prompt", ""))
                    continue
                if in_range:
                    totals["output"] += produced
                context += produced

            if in_range:
                counted = True
                totals["calls"] += len(calls_input)
                totals["input"] += sum(c + HIDDEN_TOKENS_PER_CALL for c in calls_input)
                totals["first"] = min(filter(None, [totals["first"], day]))
                totals["last"] = max(filter(None, [totals["last"], day]))

        totals["conversations"] += counted

    totals["kg"] = totals["output"] * KG_PER_OUTPUT_TOKEN + totals["input"] * KG_PER_INPUT_TOKEN
    return totals


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path", nargs="?", default=DEFAULT_DROP, help="conversations.json, export zip, or folder")
    parser.add_argument("--since", type=date.fromisoformat, help="first day counted (inclusive)")
    parser.add_argument("--until", type=date.fromisoformat, help="last day counted (inclusive)")
    args = parser.parse_args()

    conversations, source = load_conversations(args.path)
    t = estimate(conversations, args.since, args.until)

    if not t["calls"]:
        sys.exit("No assistant messages in the selected range.")

    print(f"Source:         {source}")
    print(f"Period:         {t['first']} -> {t['last']}")
    print(f"Conversations:  {t['conversations']}")
    print(f"Model calls:    {t['calls']}")
    print(f"Carbon:         {t['kg']:.4f} kg eqCO2 (check against the spreadsheet)")
    print()
    print(SOURCE_LINE)
    print()
    print("Paste into the spreadsheet (tokens):")
    print(f"  N  AI Claude input tokens:   {t['input']:.0f}")
    print(f"  O  AI Claude output tokens:  {t['output']:.0f}")


if __name__ == "__main__":
    main()
