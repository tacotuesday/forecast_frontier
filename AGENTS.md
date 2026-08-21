# Forecast Frontier - Agent Instructions

## Quick Start
- **Read sequence**: `README.md` → `package.json` → `src/App.tsx`, `src/game-model.ts` → `tests/scoring.test.mjs`
- **Dev server**: `npm run dev` (Vite, port 5173)
- **Build**: `npm run build` (TypeScript typecheck + Vite production bundle)
- **Test**: `npm test` (runs scoring validation against curriculum)

## Core Architecture
- **Single-page React app** targeting ES2022 browser targets
- Two main files: `App.tsx` (UI), `game-model.ts` (curriculum data + evaluation logic)
- No external dependencies beyond React; game content is configuration-driven via `missions` array

## Common Commands
```bash
npm run dev          # Start dev server with HMR
npm run build        # Typecheck + production build to dist/
npm run preview      # Preview production build locally
npm test             # Validate mission scoring and curriculum consistency
```

## Optimization Priorities (Action Required)
### 🔴 Critical: Performance Bugs
- **Line 367** `game-model.ts`: `bestAchievableScore()` recalculates entire control space on every call - add caching with early exit at perfect score
- **Lines 352-358** `game-model.ts`: `evaluate()` calls `makeSeries()` 3x per invocation - compute once and reuse

### 🟠 High Priority: React Performance
- **Line 66** `App.tsx`: `ForecastChart` draw function called on every render - memoize with `useCallback` and only update on actual data changes
- **Lines 96-97, 112**: Memoize target formatting and feedback computation with `useMemo`
- **Lines 151, 153**: Replace inline onChange handlers with memoized callbacks

### 🟡 Medium Priority: Code Quality
- Extract result display into dedicated `<ResultBar />` component for isolated re-renders
- Precompute mission-specific constants (e.g., `mission.step * 0.39`) in forecast generation

## Testing Notes
- Scoring tests validate that all missions pass/fail correctly against expected thresholds
- Tests must pass before updating any mission parameters or target values
- Run `npm test` after curriculum changes to ensure no regressions

## Common Pitfalls
- ❌ Don't modify `game-model.ts` functions like `rmse()` without understanding their impact on scoring
- ✅ Mission configuration data (missions array) is safe to modify for content updates
- ⚠️ Production builds output to `dist/`; the folder contains large assets (~2MB image)

## Dependencies
- React 19.2.x (latest stable)
- TypeScript + Vite as bundler/dev server
- Node.js >=22.13.0 required for build pipeline
