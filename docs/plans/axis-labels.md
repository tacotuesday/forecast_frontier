# Axis Labels: Immersive, Periodicity-Revealing X and Domain-Specific Y Axes

## Objective

Add labeled X- and Y-axes to all 13 mission plot canvases so users can infer the underlying data's periodicity from date labels and understand the domain context through immersion units.

## Key Design Decisions

### X-Axis: Periodicity-Revealing Date Labels
- **Start span**: Jan 2023 → Dec 2026 (4 years) for most missions; 2019-2026 (8 years) for ETS annual data.
- **Monthly period (mission.period = 12)**: Year labels only at January positions ("2023", "2024", "2025", "2026").
- **Quarterly period (mission.period = 4)**: Year labels only; add periodicity note in mission text ("Data is quarterly").
- **Annual/weekly-daily period (8 or 7)**: Spaced year labels for ETS (every other year); compact day-initial labels (`"M" "T" "W"...`) in 9px font for daily data.
- **Sub-daily period (half-hourly)**: `"0h"`, `"6h"`, `"12h"`, `"18h"` abbreviated time labels at 6-hour intervals (no leading zeros).

### Y-Axis: Domain-Specific Immersive Units
Each mission gets a curated Y-axis label based on FPPPy datasets and domain conventions:

| Mission ID | Data Title | Y-Axis Label | Period Type | X-Labels |
|------------|-----------|--------------|-------------|----------|
| graphics | Monthly visitor arrivals | Visitors (000s) | monthly | Years only |
| decomposition | Quarterly retail turnover | Turnover ($M) | quarterly | Years only |
| features | Regional tourism demand | Tourism Index | quarterly | Years only |
| toolbox | Quarterly beer production | Production (hl) | quarterly | Years only |
| regression | Daily electricity demand | Load (MW) | weekly_daily | M T W T F S (repeated) |
| ets | Annual internet usage | Users (millions) | yearly (8-yr span) | Every 2 years |
| arima | Monthly exports index | Index (base 100) | monthly | Years only |
| dynamic | Weekly promotion demand | Demand units | sub-daily | Same as foundation |
| hierarchy | National & regional sales | Sales ($M) | quarterly | Years only |
| advanced | Half-hourly electricity load | Load (MW) | sub-daily | 0h, 6h, 12h, 18h |
| practical | Daily pharmacy sales | Sales count | weekly_daily | M T W T F S (repeated) |
| neural | Monthly air passengers | Passengers (000s) | monthly | Years only |
| foundation | Cross-domain electricity prices | Price ($/MWh) | sub-daily | 0h, 6h, 12h, 18h |

### Disclaimer Text
Every plot renders the same disclaimer below the X-axis:

> "This plot visualizes a simulated time series approximating the domain depicted. Results should not be extrapolated to infer real-world patterns or magnitudes."

### Visual Styling
- **Font stack**: `'Inter', 'SF Pro Display', Arial, sans-serif` (system-ui fallback)
- **X-axis date color**: `rgba(12,38,54,.6)` (muted gray)
- **Y-axis unit text**: `rgba(12,38,54,.95)` (near black), bold 11px
- **Disclaimer**: `rgba(12,38,54,.5)` at 9px
- **Rotation**: Y-axis text rotated -90°; X-axis day-initial labels kept horizontal in 9px to avoid clutter

---

## Implementation Plan

### 1. `game-model.ts` — New Exported Functions

After line 308 (before existing exports), add:

```typescript
// Frequency types
export type SeriesPeriodType = 'monthly' | 'quarterly' | 'yearly' | 'weekly_daily' | 'sub-daily';

// Period + start date detection
export function getTimeSeriesInfo(mission: Mission): {
  periodType: SeriesPeriodType;
  startDate: Date;
} {
  const freqMap: Record<string, SeriesPeriodType> = {
    '12': 'monthly',
    '4': 'quarterly',
    '8': mission.id === 'ets' ? 'yearly' : 'sub-daily',
    '7': 'weekly_daily',
  };
  // ... logic to map mission.period to periodType
}

// X-axis tick computation
export function getXAxisTicks(mission: Mission): { positions: number[]; labels: string[] }

// Y-axis domain unit + disclaimer
export function getDomainLabel(mission: Mission): { label: string; disclaimer: string }
```

### 2. `game-model.ts` — Mission Text Edits

- **ETS** (line ~61): Append to `fieldNote`: "Annual data spans eight years (2019–2026)."
- **Quarterly missions** (lines ~45, 49, 53, 73): Add "Data is quarterly" note to relevant text.

### 3. `App.tsx` — Canvas Drawing Updates

In `ForecastChart.draw()` callback (after line 66), insert:
1. **X-axis** loop through tick positions, render using muted gray text.
2. **Y-axis** label rotated -90° in the left margin area.
3. **Disclaimer** horizontal text below plot at bottom padding + 8px.

---

## Files to Modify (Summary)

| File | Scope | Change Type |
|------|-------|-------------|
| `src/game-model.ts` | After line 308, ~61, ~45-73 | Add 3 functions; edit mission text |
| `src/App.tsx` | `draw()` callback in `ForecastChart` | Insert axis rendering logic |

---

## Testing Checklist

- [ ] All plots render with X-axis date labels matching the expected frequency pattern.
- [ ] Y-axis labels are legible, non-overlapping, and correctly rotated.
- [ ] Disclaimer text does not overflow bottom padding.
- [ ] ETS mission text mentions 8-year data span in `fieldNote`.
- [ ] Quarterly missions include periodicity note in descriptions.
- [ ] Sub-daily plots show abbreviated hour labels without leading zeros.
- [ ] Daily/weekly plots use compact day-initial labels.
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
