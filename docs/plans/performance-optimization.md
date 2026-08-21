---
title: Performance Optimization Plan (FPPPy Game)
description: Targeted fixes for the four medium-priority issues identified in the game's forecasting simulation and React rendering layer.
created: 2026-08-21
priority: medium
status: plan
---

# Forecast Frontier — Performance Optimization Plan

## 1. Scope

This plan addresses exactly the four items currently listed under "Optimization Priorities (Action Required)" in `AGENTS.md`. No new features, no refactoring beyond what's necessary for each fix, and no changes to game content or scoring behavior.

### Priority List

| # | Priority | Location | What to fix |
|---|----------|----------|-------------|
| A | 🟠 Medium | `game-model.ts` lines 352-358: `evaluate()` calls `makeSeries()` at most once now; the remaining work is the call to `seasonalNaive()` which itself also calls `makeSeries()`. Cache the baseline result inside `evaluate()` so it is also memoized alongside the forecast. |
| B | 🟡 Medium | `game-model.ts` lines 367-404: `bestAchievableScore()` recalculates on every call; add per-mission caching with early-exit at perfect score (already partially implemented via `BEST_SCORE_CACHE`). Verify that the cache is effective and the early-exit triggers. |
| C | 🟠 Medium | `App.tsx` line 66: `ForecastChart` draw function called on every render; memoize with `useCallback` and only update on actual data changes. |
| D | 🟡 Medium | `App.tsx` lines 96-97, 112: Memoize target formatting and feedback computation with `useMemo`. Replace inline onChange handlers in `<ControlSlider>` (lines 200-201) with memoized callbacks already defined as `handlePrimaryChange` / `handleSecondaryChange`. |

## 2. Detailed Implementation

### Item A — Cache the seasonal-baseline result in `evaluate()`

**File:** `src/game-model.ts`
**Current behavior (lines 351-378):**

```typescript
export function evaluate(mission: Mission, primary: number, secondary: number) {
  const cacheKey = `${mission.id}:${primary}:${secondary}`;
  let cached = FORECAST_CACHE.get(cacheKey);

  // Single makeSeries call — reused for both model and target entries
  if (!cached) {
    const series = makeSeries(mission);       // ← first call
    const actual = series.slice(TRAIN_LENGTH);
    cached = { forecast: makeForecast(mission, primary, secondary), actual };
    FORECAST_CACHE.set(cacheKey, cached);
  }

  // Target comparison also reuses the same series (once per cache miss)
  const targetCacheKey = `${mission.id}:target`;
  let targetCached = FORECAST_CACHE.get(targetCacheKey);
  if (!targetCached) {
    const actual = cached ? cached.actual : makeSeries(mission).slice(TRAIN_LENGTH);
    targetCached = { forecast: makeForecast(mission, mission.target[0], mission.target[1]), actual };
    FORECAST_CACHE.set(targetCacheKey, targetCached);
  }

  const modelRmse   = rmse(cached.actual, cached.forecast);
  const bestRmse     = rmse(targetCached.actual, targetCached.forecast);
  const baselineRmse = rmse(cached.actual, seasonalNaive(mission));  // ← makes a THIRD makeSeries() call per evaluation
  const score = Math.max(0, Math.min(100, Math.round((bestRmse / modelRmse) * 100)));
  const skill = Math.round((1 - modelRmse / baselineRmse) * 100);
  return { forecast: cached.forecast, rmse: modelRmse, baselineRmse, skill, score, passed: score >= PASS_SCORE };
}
```

**Problem:** `seasonalNaive(mission)` (in `game-model.ts` line 342) also calls `makeSeries(mission)`, so for a given mission this results in three invocations of the series generator on a cache miss. This matters because the chart re-evaluates whenever slider values change rapidly.

**Change:** Cache the baseline result alongside the model forecast using a second map key per mission:

```typescript
const BASELINE_CACHE_KEY = "__baseline__";

export function evaluate(mission: Mission, primary: number, secondary: number) {
  const cacheKey = `${mission.id}:${primary}:${secondary}`;
  let cached = FORECAST_CACHE.get(cacheKey);

  if (!cached) {
    const series = makeSeries(mission);
    const actual = series.slice(TRAIN_LENGTH);
    cached = { forecast: makeForecast(mission, primary, secondary), actual };
    FORECAST_CACHE.set(cacheKey, cached);
  }

  const targetCacheKey = `${mission.id}:target`;
  let targetCached = FORECAST_CACHE.get(targetCacheKey);
  if (!targetCached) {
    const actual = cached ? cached.actual : makeSeries(mission).slice(TRAIN_LENGTH);
    targetCached = { forecast: makeForecast(mission, mission.target[0], mission.target[1]), actual };
    FORECAST_CACHE.set(targetCacheKey, targetCached);
  }

  // Cache the baseline so seasonalNaive() doesn't re-generate the series.
  const baselineKey = `${mission.id}:${BASELINE_CACHE_KEY}`;
  let baselineCached = FORECAST_CACHE.get(baselineKey) as number[] | undefined;
  if (!baselineCached) {
    baselineCached = seasonalNaive(mission);
    FORECAST_CACHE.set(baselineKey, baselineCached);
  }

  const modelRmse   = rmse(cached.actual, cached.forecast);
  const bestRmse     = rmse(targetCached.actual, targetCached.forecast);
  const baselineRmse = rmse(cached.actual, baselineCached);
  // ... rest unchanged
}
```

**Validation:** `npm test` must still pass 4/4. Manual slider-churning with Chrome DevTools Performance panel should show no additional `makeSeries()` calls per tick.

---

### Item B — Cache `bestAchievableScore()` (already partially done)

**File:** `src/game-model.ts`
**Current behavior (lines 380-404):**

The existing code already uses `BEST_SCORE_CACHE`:

```typescript
const BEST_SCORE_CACHE = new Map<MissionId, number>();

export function bestAchievableScore(mission: Mission) {
  const cached = BEST_SCORE_CACHE.get(mission.id);
  if (cached !== undefined) return cached;          // ← caching is already here
  let maxScore = -Infinity;
  for (const p of enumerateValues(mission.primary)) {
    for (const s of enumerateValues(mission.secondary)) {
      const score = evaluate(mission, p, s).score;
      if (score > maxScore) maxScore = score;
      if (maxScore === 100) break;                  // ← early-exit is already here
    }
    if (maxScore === 100) break;
  }
  BEST_SCORE_CACHE.set(mission.id, maxScore);
  return maxScore;
}
```

**Status:** This item was resolved during the `perf/consolidate-evaluate-and-drain-resultbar` merge. Verified via commit `a060737`. No changes needed.

---

### Item C — Memoize the `ForecastChart` draw callback

**File:** `src/App.tsx`
**Current behavior (line 69):**

```typescript
useEffect(() => { draw(); const observer = new ResizeObserver(draw); if (canvasRef.current) observer.observe(canvasRef.current); return () => observer.disconnect(); }, [draw]);
```

The current `draw` is already wrapped in `useCallback`, but the dependency array includes `mission` which changes every time the parent re-selects a mission. Since the canvas data also changes with the mission, this is actually correct — but the chart is redrawn on **every** slider change because `data` (via `useMemo` at line 19) is derived from `makeSeries(mission)` and will be equal-reference across renders of the same mission as long as only slider values differ.

**Change:** Ensure the draw callback's dependency array explicitly lists only data-driven deps (which it already does), and confirm that `draw` itself is correctly memoized by adding an explicit comparison:

```typescript
const draw = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  // ... existing drawing code ...
  ctx.fillStyle = "rgba(12,38,54,.48)"; ctx.font = "600 10px Arial"; ctx.fillText("TRAINING DATA", pad.left, height - 9);
  ctx.fillStyle = "#d94f35"; ctx.fillText(result ? "HOLDOUT REVEALED →" : "HIDDEN HOLDOUT →", boundary + 9, height - 9);
}, [data, min, max, result]);
```

Note: removed `mission` from the dependency array since `data`, `min`, and `max` already capture everything `draw` needs from it. The data-derived values come through `makeSeries(mission)` in the parent `useMemo`, which is stable across renders of the same mission.

**Validation:** Sliding controls while a result exists should trigger canvas draws only when the visible forecast line changes (i.e., when slider values shift), not merely because the React tree re-renders.

---

### Item D — Memoize formatting / feedback and fix inline handlers in `<ControlSlider>`

**File:** `src/App.tsx`

#### Part 1 — Target formatting is already memoized

The existing code at lines 131-134 already wraps target formatting in `useMemo`:

```typescript
const [targetPrimary, targetSecondary] = useMemo(() => 
  [formatControl(active.primary, active.target[0]), formatControl(active.secondary, active.target[1])],
  [active.primary, active.secondary, active.target]
);
```

**Status:** Already done. No changes needed.

#### Part 2 — Feedback is already memoized

The existing code at lines 152-158 wraps feedback in `useMemo`:

```typescript
const feedback = useMemo(() => 
  !result ? "Run the model to reveal the holdout data..." : ...
    result.passed ? active.success : ...
  , [result, active.success]
);
```

**Status:** Already done. No changes needed.

#### Part 3 — Pass memoized callbacks to `<ControlSlider>` inline handlers

**Current behavior (lines 200-201):**

```jsx
<ControlSlider id="primary-control" control={active.primary} value={primary} onChange={(value) => { setPrimary(value); setResult(null); }} />
<ControlSlider id="secondary-control" control={active.secondary} value={secondary} onChange={(value) => { setSecondary(value); setResult(null); }} />
```

These inline arrow functions allocate a new function on every render. The same pattern was already fixed for the chart legend (lines 160-161). This is a consistency fix:

```jsx
<ControlSlider id="primary-control" control={active.primary} value={primary} onChange={handlePrimaryChange} />
<ControlSlider id="secondary-control" control={active.secondary} value={secondary} onChange={handleSecondaryChange} />
```

**Validation:** No new tests needed for this change; `npm test` must still pass 4/4. React DevTools Profiler should show zero new allocation in the slider controls per render tick.

---

## 3. Summary of Required Changes

| Item | File | Lines | Change type |
|------|------|-------|-------------|
| A | `src/game-model.ts` | ~351-378 | Add `BASELINE_CACHE_KEY` and baseline map-caching logic per mission |
| B | — | — | Already resolved (merged commit a060737) |
| C | `src/App.tsx` | ~66-69 | Remove `mission` from draw callback deps; rely on `data`/`min`/`max`/`result` |
| D1 | `src/App.tsx` | ~131-134 | Already done |
| D2 | `src/App.tsx` | ~152-158 | Already done |
| D3 | `src/App.tsx` | 200-201 | Replace inline lambdas with `handlePrimaryChange` / `handleSecondaryChange` |

## 4. Validation Checklist

After implementation:

- [ ] `npm test` — all 4 scoring tests pass (no regressions to scoring logic or curriculum data)
- [ ] `npm run build` — TypeScript typecheck + Vite production build succeeds
- [ ] Manual slider churn in DevTools Performance panel shows reduced allocations / no redundant `makeSeries()` calls
