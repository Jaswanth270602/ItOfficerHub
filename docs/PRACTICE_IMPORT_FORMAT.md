# Practice Q&A import (topic-wise, one MCQ per subtopic)

Use for **Study Hub** (`/study`) — IndiaBIX-style topic navigation. Separate from full **mock** import.

## Quick steps

1. Open `/admin` → **Import Practice Q&A**
2. Copy prompt from `frontend/public/claude-practice-prompt.txt` into Claude
3. Set `sectionId` + `subtopicSlug` for the topic you are filling
4. Paste JSON → **Import**

## JSON shape

```json
{
  "questions": [
    {
      "sectionId": "networking",
      "subtopicSlug": "osi-tcp-ip",
      "topic": "NETWORKING",
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "C",
      "explanation": "• Point one\n• Point two\n• Exam tip...",
      "solutionImageUrl": null,
      "published": true
    }
  ]
}
```

You may also paste a **single question object** or a **bare array** of questions.

## Validation

| Field | Rule |
|--------|------|
| sectionId / subtopicSlug | Must match catalog in `PracticeCatalog.java` |
| topic | Syllabus enum for the **section** (e.g. `DBMS` for `dbms`), **not** the subtopic title. Omit to auto-fill from section. |
| explanation | ≥ 300 chars, `Option breakdown:` with Options A–D |
| correctOption | `A`, `B`, `C`, or `D` |

### topic by sectionId

| sectionId | topic |
|-----------|--------|
| networking | NETWORKING |
| dbms | DBMS |
| operating-systems | OPERATING_SYSTEMS |
| security | SECURITY |
| web-technologies | WEB_TECHNOLOGIES |
| data-structures | DATA_STRUCTURES |
| computer-organization | COMPUTER_ORGANIZATION |
| software-engineering | SOFTWARE_ENGINEERING |
| cloud-digital | CLOUD_COMPUTING |

## API

`POST /api/admin/practice/import` (admin JWT)

## Launch strategy

- **39 subtopic slots** across 9 IBPS IT sections
- Import **5–10 questions/day** before go-live; empty slots show “Soon”
- Promote **daily full mock** from Study sidebar → `/mocks`
