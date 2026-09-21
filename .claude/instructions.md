# CapTrack Development Instructions for Claude

## Project Context
- **Name:** CapTrack - Personal Expense Tracker MVP
- **Status:** Phase 2 Frontend implementation in progress
- **Backend:** Complete (auth, CRUD, WebSocket, tests)
- **Frontend:** Building phases 2-5 with small commits per PLAN.md

## Workflow Rules

### Before Starting Any Work
1. Read PLAN.md section for current phase
2. Check git log for recent commits
3. Verify backend is not being modified during frontend phases
4. Ask user approval before any major changes

### During Implementation
1. **One commit = one feature** (< 500 LOC)
2. **Test after each commit** (npm run dev, manual browser check)
3. **Follow SOLID principles** (CLAUDE.md, ARCHITECTURE.md)
4. **Small components** (< 50 LOC each)
5. **Dependency injection** (no hard-coded dependencies)

### After Each Commit
1. Run tests if backend modified: `npm run test -w server`
2. Verify in browser per PLAN.md manual test steps
3. Check git log to confirm small commit size
4. Report status to user

## Architecture Principles (From CLAUDE.md)
- **S:** Single Responsibility - one reason to change
- **O:** Open/Closed - extend without modifying
- **D:** Dependency Inversion - inject, don't hard-code

## Frontend Structure (From CLAUDE.md)
```
client/src/
├── pages/          Containers (use hooks, pass data to components)
├── components/     Reusable UI (props in, JSX out)
├── hooks/          Data fetching & state (useQuery, useMutation)
├── api/            Thin HTTP wrappers
├── types/          Shared TypeScript interfaces
├── validation/     Zod schemas (mirrored from backend)
├── ws/             WebSocket client
└── styles/         Global CSS + variables
```

## Key Files
- **PLAN.md** - Current phase breakdown with manual test steps
- **CLAUDE.md** - Code guidelines and patterns
- **ARCHITECTURE.md** - Design patterns with examples
- **README.md** - Setup and running the app
- **.claude/settings.json** - Allow git/npm commands

## Git Workflow
1. **Small commits:** `git add <specific files>` (not `git add -A`)
2. **Clear messages:** Imperative mood, explain WHY
3. **Verify before pushing:** `git status`, `git diff`
4. **Atomic commits:** One feature per commit

## Phase 2 Commits (Current)
1. ✅ Base structure + entry point
2. ✅ Router + AuthPage
3. 🚀 API client + useMe hook (IN PROGRESS)
4. ProtectedRoute + AppShell
5. Global styles + theme
6. Common UI components
7. Dashboard skeleton + manual test

## Testing Rules
- **Backend:** `npm run test -w server` after changes
- **Frontend:** Manual browser testing per PLAN.md
- **Manual steps:** Each commit has "Test:" section in PLAN.md

## Common Commands
```bash
npm run dev          # Start backend + frontend
npm run test -w server  # Run backend tests
git log --oneline    # See recent commits
git status          # Check what's staged
git diff            # See exact changes
```

## Things to Avoid
- ❌ Hard-coded dependencies
- ❌ Large files (> 50 LOC for components, > 30 for functions)
- ❌ Prop drilling (use hooks/context)
- ❌ Breaking backend API
- ❌ Uncommitted changes when starting new commit
- ❌ `git add -A` (add specific files instead)

## When Blocked
1. Check PLAN.md for current phase scope
2. Read CLAUDE.md or ARCHITECTURE.md for pattern examples
3. Verify backend API matches expectations
4. Ask user for clarification or approval

## Current Focus
Implementing Phase 2 (Frontend Core):
- Small commits (one feature per commit)
- Manual testing per PLAN.md
- Following SOLID principles
- Building toward Phase 3
