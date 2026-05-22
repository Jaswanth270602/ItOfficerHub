# ItOfficerHub — Claude quiz generator (copy-paste daily)

Use **one prompt per day**. Paste into [Claude.ai](https://claude.ai) → copy JSON output → Admin **Import Mock**.

---

## Copy this entire block into Claude (customize title/topics only)

```
You are a senior IBPS Specialist Officer (IT Officer) content author building mocks for ItOfficerHub.

TASK: Generate exactly 20 MCQs as ONE JSON object. No markdown fences, no commentary before/after — only valid JSON starting with { and ending with }.

MOCK SETTINGS (edit these 3 lines only):
- title: "IBPS SO IT Officer — Networking & Security Mock 1"
- difficulty: MEDIUM
- topics (spread evenly, 2–4 Q each): NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES

EXAM RULES:
- 4 options A–D per question; exactly ONE correct (correctOption: "A"|"B"|"C"|"D")
- IBPS SO IT syllabus style; practical traps; no duplicate stems
- orderIndex 1 through 20

EXPLANATION QUALITY (mandatory for every question):
- Minimum 4 lines of teaching text in "explanation" (use \n for line breaks)
- Structure with bullet points using lines starting with "• " (at least 4 bullets)
- Include: why correct option wins, why others fail, exam tip, memory hook
- Add a mini ASCII diagram OR Mermaid flowchart inside explanation (3–8 lines), e.g.:
  Flow: Client → Firewall → Load Balancer → App Server → DB
- End explanation with "References:" line listing 1–2 real sources (RFC number, Oracle/MySQL doc, OWASP, NPTEL unit, official IBPS syllabus topic name)

OPTIONAL VISUAL:
- If a diagram helps, set "solutionImageUrl" to a public HTTPS image URL (diagram/flowchart). Leave null if none.

JSON SCHEMA (follow exactly):

{
  "title": "...",
  "description": "One-line mock subtitle",
  "difficulty": "MEDIUM",
  "mockCategory": "FULL",
  "examTarget": "IBPS_SO_IT",
  "seriesDay": null,
  "questions": [
    {
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "C",
      "explanation": "• Point one...\n• Point two...\n• Point three...\n• Point four...\n\nASCII diagram:\n  A --> B --> C\n\nReferences: RFC 7231; IBPS SO IT — Networking",
      "solutionImageUrl": null,
      "topic": "NETWORKING",
      "orderIndex": 1
    }
  ]
}

VALID topic values (uppercase): NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES, COMPUTER_ORGANIZATION, SOFTWARE_ENGINEERING, CLOUD_COMPUTING, DIGITAL_ELECTRONICS

VALID difficulty: EASY, MEDIUM, HARD

Before you output, self-check: 20 questions, each explanation ≥4 lines with • bullets, diagram present, References line present, valid JSON only.
```

---

## Admin import steps

1. Login `/admin` → `admin@itofficerhub.com` / `Admin@123`
2. **Import Mock (Paste JSON)** → paste Claude output (fences auto-stripped)
3. **Manage** mock → verify solutions render with line breaks
4. **Publish** when 20 questions ready

## API

`POST /api/admin/mocks/import` with the same JSON body (Bearer admin JWT).

## Field reference

| Field | Required | Notes |
|-------|----------|-------|
| title | Yes | Shown on dashboard |
| difficulty | Yes | EASY, MEDIUM, HARD |
| questions | Yes | 20 recommended |
| explanation | Strongly required | Multi-line + bullets + diagram + references |
| solutionImageUrl | No | HTTPS URL to diagram image |
| topic | No | From list above |
| mockCategory | No | FULL, SECTIONAL, PYQ, CHALLENGE (30-day plan uses CHALLENGE + seriesDay) |
| examTarget | No | IBPS_SO_IT, NIACL_IT, LIC_IT, GIC_IT, RBI_IT, PSU_IT_GENERAL, MIXED |
| seriesDay | No | 1–30 when mockCategory is CHALLENGE |
| timeLimitMinutes | No | Defaults to app setting (15) |
| questionCount | No | Defaults to 20 |

## Common fixes

| Problem | Fix |
|---------|-----|
| Claude wrapped JSON in ``` | Modal strips fences; or delete fences manually |
| Short explanations | Re-run prompt; emphasize "minimum 4 lines + bullets" |
| Invalid topic | Use uppercase values from list |
| Publish fails | Ensure question count matches mock setting (usually 20) |

---

## Short link for frontend

Public copy file: `/claude-quiz-prompt.txt` (same prompt text for browser copy button).
