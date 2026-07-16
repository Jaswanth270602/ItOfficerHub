# Quiz Import Format

See the full reference: `docs/QUIZ_IMPORT_FORMAT.md`

Quick shape to paste in Admin → **Import Mock**:

```json
{
  "title": "IBPS SO IT Officer - Mock Title",
  "description": "Optional",
  "difficulty": "MEDIUM",
  "questionCount": 25,
  "timeLimitMinutes": 20,
  "questions": [
    {
      "questionText": "Your question?",
      "optionA": "Option 1",
      "optionB": "Option 2",
      "optionC": "Option 3",
      "optionD": "Option 4",
      "correctOption": "B",
      "explanation": "Why B is correct (1–3 sentences).",
      "explainA": "Why A is wrong.",
      "explainB": "Why B is correct.",
      "explainC": "Why C is wrong.",
      "explainD": "Why D is wrong.",
      "topic": "NETWORKING",
      "topicTag": "Subnetting",
      "orderIndex": 1
    }
  ]
}
```

**difficulty:** `EASY` | `MEDIUM` | `HARD`  
**correctOption:** `A` | `B` | `C` | `D`  
**topic (required):** `NETWORKING`, `DBMS`, `OPERATING_SYSTEMS`, `SECURITY`, `WEB_TECHNOLOGIES`, `DATA_STRUCTURES`, `COMPUTER_ORGANIZATION`, `SOFTWARE_ENGINEERING`, `CLOUD_COMPUTING`, `DIGITAL_ELECTRONICS`

Standard mock: **25 questions · 50 marks (+2 each) · 20 minutes · −0.5 wrong**.
