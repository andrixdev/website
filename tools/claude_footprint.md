# claude_footprint.py

Estimates the weekly claude.ai token usage from a data export, as two values to paste into the carbon spreadsheet:

| Column | Metric | Unit | Factor (kg eqCO2 per token) |
| :--- | :--- | :--- | :--- |
| N | AI Claude input tokens | tokens | 1.95E-07 |
| O | AI Claude output tokens | tokens | 4.13E-06 |

## Weekly routine

1. On claude.ai: Settings → Privacy → Export data. From the email, download `conversations-000.zip` (it contains `conversations.json`).
2. Put the zip or the json in `claude-conversations/` at the repo root (git-ignored), or pass its path.
3. Run:

   ```
   python tools/claude_footprint.py
   python tools/claude_footprint.py path/to/conversations.json
   ```

4. Copy the two printed token counts into columns N and O.

## Choosing the period: --since / --until

Without these options, every message in the export is counted. Use them when the export covers more than the week you want. Both dates are inclusive, in `YYYY-MM-DD` format, and apply to each message's date (UTC).

```
python tools/claude_footprint.py --since 2026-10-19 --until 2026-10-25
python tools/claude_footprint.py --since 2026-10-19
```

Earlier messages are not counted, but they still count as context for the replies inside the period: a long conversation started last week costs more to continue this week.

Check the `Period:` line in the output: it shows the first and last day actually found.

## Output

A summary (period, conversations, model calls, carbon in kg eqCO2 to check against the spreadsheet), the source line for the emission factors, then the two token counts to paste.

## Method (worst case)

- Tokens = characters / 3.5.
- One model call per assistant reply, plus one after each tool result.
- Each call re-reads the whole conversation so far, plus 30,000 hidden tokens (system prompt, tool definitions), with no caching discount.
- 4.13E-06 kg eqCO2 per output token, 1.95E-07 per input token (Claude 3.7 Sonnet measured by Jegham et al. 2025, scaled ×5 for Opus).
- Hidden reasoning and images are absent from the export, so they are not counted.

Raw exports contain the full chat history: never commit them.
