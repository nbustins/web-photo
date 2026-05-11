# Specs — Spec-Driven Design

Source of truth for features before code. Every non-trivial change starts here.

## Flow

1. **Draft** → new folder under `specs/active/` numbered `NNN-kebab-name/`.
2. **Spec** → copy `template.md` to `spec.md` inside that folder. Fill it.
3. **Review** → align with stakeholder (commit spec to a branch, discuss).
4. **Approve** → merge spec to `main`. Spec is now frozen baseline.
5. **Implement** → code against spec. Deviations must update spec first.
6. **Done** → move folder from `specs/active/` to `specs/done/` once merged.

## Folder layout

```
specs/
  README.md                 # this file
  template.md               # blank spec template
  active/                   # specs being designed or implemented
    NNN-feature-slug/
      spec.md
      assets/               # diagrams, mockups, sample payloads (optional)
  done/                     # archived specs (kept for history)
```

## Naming

- Folder: `NNN-verb-noun-detail` (e.g. `001-update-workshop-permanent-service`).
- `NNN` is a zero-padded incrementing id, never reused.
- Verbs: `add`, `update`, `remove`, `refactor`, `migrate`.

## Rules

- Spec is the contract. Code matches the spec, not the other way around.
- If implementation reveals spec is wrong → update spec first, then code.
- Spec describes **what** and **why**, not **how** (low-level code lives in the repo).
- Keep specs short. One feature per spec. Split if scope creeps.
