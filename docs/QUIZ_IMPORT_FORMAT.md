# ItOfficerHub — Claude quiz generator (copy-paste daily)

Use **one prompt per day**. Paste into [Claude.ai](https://claude.ai) → copy JSON output → Admin **Import Mock**.

---

## Copy this entire block into Claude (customize title/topics only)

```
You are a senior IBPS Specialist Officer (IT Officer) content author building mocks for ItOfficerHub.

TASK: Generate exactly 25 MCQs as ONE JSON object. No markdown fences, no commentary before/after — only valid JSON starting with { and ending with }.

MOCK SETTINGS (edit these 3 lines only):
- title: "IBPS SO IT Officer — Networking & Security Mock 1"
- difficulty: MEDIUM
- topics (spread evenly): NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES

EXAM RULES:
- 4 options A–D per question; exactly ONE correct (correctOption: "A"|"B"|"C"|"D")
- IBPS SO IT syllabus style; practical traps; no duplicate stems
- orderIndex 1 through 25
- Every question MUST have "topic" AND "topicTag" (2–6 words)

EXPLANATION (keep it simple — no flowcharts / Mermaid / References):
- "explanation": 1–3 sentences why the correct answer is right
- "explainA", "explainB", "explainC", "explainD": one short sentence each (why that option is right or wrong)

JSON SCHEMA (follow exactly):

{
  "title": "...",
  "description": "One-line mock subtitle",
  "difficulty": "MEDIUM",
  "mockCategory": "FULL",
  "examTarget": "IBPS_SO_IT",
  "seriesDay": null,
  "questionCount": 25,
  "timeLimitMinutes": 20,
  "questions": [
    {
      "questionText": "Which normal form removes partial dependency?",
      "optionA": "1NF",
      "optionB": "2NF",
      "optionC": "3NF",
      "optionD": "BCNF",
      "correctOption": "B",
      "explanation": "2NF requires non-key attributes to depend on the whole composite key, which removes partial dependency.",
      "explainA": "1NF only ensures atomic values / removes repeating groups.",
      "explainB": "Correct — 2NF eliminates partial dependency on part of a composite key.",
      "explainC": "3NF removes transitive dependency, not partial dependency.",
      "explainD": "BCNF is stricter than 3NF; it is not the form that introduces partial-dependency removal.",
      "topic": "DBMS",
      "topicTag": "Normalization & Keys",
      "orderIndex": 1
    }
  ]
}

VALID topic values (uppercase): NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES, COMPUTER_ORGANIZATION, SOFTWARE_ENGINEERING, CLOUD_COMPUTING, DIGITAL_ELECTRONICS

VALID difficulty: EASY, MEDIUM, HARD

Before you output, self-check: 25 questions; each has topic, topicTag, explanation, explainA–D; valid JSON only.
```

---

## Admin import steps

1. Login `/admin`
2. **Import Mock (Paste JSON)** → paste Claude output (fences auto-stripped)
3. **Manage** mock → verify solutions render cleanly
4. **Publish** when 25 questions ready

## API

`POST /api/admin/mocks/import` with the same JSON body (Bearer admin JWT).  
Prefer `POST /api/admin/mocks/import-safe` with `{ "payload": "<base64 JSON>" }` when WAF blocks plain bodies.

## Field reference

| Field | Required | Notes |
|-------|----------|-------|
| title | Yes | Shown on dashboard |
| difficulty | Yes | EASY, MEDIUM, HARD |
| questions | Yes | 25 recommended (PK section pattern) |
| explanation | Yes | Short why-correct (1–3 sentences) |
| explainA–explainD | Yes | One short reason per option |
| topic | **Yes** | Syllabus chapter for analytics |
| topicTag | Recommended | Specific sub-topic |
| mockCategory | No | FULL, SECTIONAL, PYQ, CHALLENGE |
| examTarget | No | IBPS_SO_IT, NIACL_IT, … |
| seriesDay | No | 1–30 when mockCategory is CHALLENGE |
| timeLimitMinutes | No | Defaults to 20 |
| questionCount | No | Defaults to 25 |

## Common fixes

| Problem | Fix |
|---------|-----|
| Claude wrapped JSON in ``` | Modal strips fences; or delete fences manually |
| Missing option reasons | Add explainA, explainB, explainC, explainD |
| Import rejected on topic | Set `topic` on every question from the valid list |
| Publish fails | Ensure question count matches mock setting (usually 25) |

---

## Short link for frontend

Public copy file: `/claude-quiz-prompt.txt` (same prompt text for browser copy button).
