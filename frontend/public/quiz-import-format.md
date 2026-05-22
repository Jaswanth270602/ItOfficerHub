# Quiz Import Format

See the full reference in the project repo: `docs/QUIZ_IMPORT_FORMAT.md`

Quick shape to paste in Admin → **Import Mock**:

```json
{
  "title": "IBPS SO IT Officer - Mock Title",
  "description": "Optional",
  "difficulty": "MEDIUM",
  "questions": [
    {
      "questionText": "Your question?",
      "optionA": "Option 1",
      "optionB": "Option 2",
      "optionC": "Option 3",
      "optionD": "Option 4",
      "correctOption": "B",
      "explanation": "Why B is correct",
      "topic": "NETWORKING",
      "orderIndex": 1
    }
  ]
}
```

**difficulty:** `EASY` | `MEDIUM` | `HARD`  
**correctOption:** `A` | `B` | `C` | `D`  
**topic (optional):** `NETWORKING`, `DBMS`, `OPERATING_SYSTEMS`, `SECURITY`, `WEB_TECHNOLOGIES`, `DATA_STRUCTURES`, `COMPUTER_ORGANIZATION`, `SOFTWARE_ENGINEERING`, `CLOUD_COMPUTING`, `DIGITAL_ELECTRONICS`

Use 20 questions per mock for the standard exam pattern.
