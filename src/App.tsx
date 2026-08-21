"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chapterBriefs, evaluate, formatControl, makeSeries, masteryGuides, missions, PASS_SCORE, TRAIN_LENGTH, type Control, type Mission, type MissionId } from "./game-model";

type Result = ReturnType<typeof evaluate>;

const acts = [
  { id: 1, label: "EXPLORE", detail: "Ch. 2–4" },
  { id: 2, label: "BENCHMARK", detail: "Ch. 5" },
  { id: 3, label: "MODEL", detail: "Ch. 7–10" },
  { id: 4, label: "SCALE", detail: "Ch. 11–13" },
  { id: 5, label: "ADAPT", detail: "Ch. 14–15" },
];

function ForecastChart({ mission, result }: { mission: Mission; result: Result | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data, min, max } = useMemo(() => {
    const data = makeSeries(mission);
    return { data, min: Math.min(...data) - 8, max: Math.max(...data) + 8 };
  }, [mission]);

  const { x, y } = useMemo(() => {
    const pad = { left: 40, right: 22, top: 22, bottom: 30 };
    const innerW = (canvasRef.current?.getBoundingClientRect().width || 0) - pad.left - pad.right;
    const innerH = (canvasRef.current?.getBoundingClientRect().height || 0) - pad.top - pad.bottom;
    return {
      x: (i: number) => pad.left + (i / (data.length - 1)) * innerW,
      y: (v: number) => pad.top + ((max - v) / (max - min)) * innerH,
    };
  }, [data, min, max]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    const width = rect.width;
    const height = rect.height;
    const pad = { left: 40, right: 22, top: 22, bottom: 30 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(12,38,54,.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const gy = pad.top + (innerH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(width - pad.right, gy); ctx.stroke();
    }
    const boundary = x(TRAIN_LENGTH - .5);
    ctx.fillStyle = "rgba(255,107,74,.055)";
    ctx.fillRect(boundary, pad.top, width - pad.right - boundary, innerH);
    ctx.setLineDash([4, 5]); ctx.strokeStyle = "rgba(12,38,54,.22)";
    ctx.beginPath(); ctx.moveTo(boundary, pad.top); ctx.lineTo(boundary, height - pad.bottom); ctx.stroke(); ctx.setLineDash([]);

    const line = (values: number[], start: number, color: string, dashed = false, lineWidth = 2.5) => {
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.setLineDash(dashed ? [5, 6] : []); ctx.beginPath();
      values.forEach((value, index) => { const px = x(start + index); const py = y(value); if (!index) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    line(data.slice(0, TRAIN_LENGTH), 0, "#0b2637");
    if (result) {
      line(data.slice(TRAIN_LENGTH - 1), TRAIN_LENGTH - 1, "rgba(11,38,55,.28)", true, 2);
      line([data[TRAIN_LENGTH - 1], ...result.forecast], TRAIN_LENGTH - 1, "#ff6b4a", false, 3.5);
    }
    ctx.fillStyle = "rgba(12,38,54,.48)"; ctx.font = "600 10px Arial"; ctx.fillText("TRAINING DATA", pad.left, height - 9);
    ctx.fillStyle = "#d94f35"; ctx.fillText(result ? "HOLDOUT REVEALED →" : "HIDDEN HOLDOUT →", boundary + 9, height - 9);
  }, [data, min, max, mission, result, x, y]);

  useEffect(() => { draw(); const observer = new ResizeObserver(draw); if (canvasRef.current) observer.observe(canvasRef.current); return () => observer.disconnect(); }, [draw]);
  return <canvas ref={canvasRef} className="forecast-canvas" aria-label="Historical time series, hidden holdout, and model forecast" />;
}

function ResultBar({ result, feedback }: { result: Result | null; feedback: string }) {
  if (!result) return (
    <div className="result-bar">
      <div className="result-copy">
        <span>MASTERY GATE · SCORE {PASS_SCORE}+</span>
        <p>{feedback}</p>
      </div>
      <div className="metrics">
        <div><span>RMSE</span><strong>—</strong></div>
        <div><span>VS S.NAÏVE</span><strong>—</strong></div>
        <div className="score"><span>MODEL SCORE</span><strong>{PASS_SCORE}<small>/100</small></strong></div>
      </div>
    </div>
  );

  return (
    <div className={`result-bar ${result.passed ? "result-success" : ""}`}>
      <div className="result-copy">
        <span>{result.passed ? "MISSION MASTERED" : "MODEL DIAGNOSTIC"}</span>
        <p>{feedback}</p>
        <small className="gate-note">Score is calibrated against the best achievable settings in this mission.</small>
      </div>
      <div className="metrics">
        <div><span>RMSE</span><strong>{result.rmse.toFixed(2)}</strong></div>
        <div><span>VS S.NAÏVE</span><strong className={result.skill > 0 ? "metric-positive" : ""}>{result.skill > 0 ? "+" : ""}{result.skill}%</strong></div>
        <div className="score"><span>MODEL SCORE</span><strong>{result.score}<small>/100</small></strong></div>
      </div>
    </div>
  );
}

function ControlSlider({ control, value, onChange, id }: { control: Control; value: number; onChange: (value: number) => void; id: string }) {
  return <div className="control-block">
    <label htmlFor={id}>{control.label}<strong>{formatControl(control, value)}</strong></label>
    <input id={id} type="range" min={control.min} max={control.max} step={control.step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    <div className="range-ends"><span>{formatControl(control, control.min)}</span><span>{formatControl(control, control.max)}</span></div>
  </div>;
}

function MissionNode({ mission, active, complete, onClick }: { mission: Mission; active: boolean; complete: boolean; onClick: () => void }) {
  return <button className={`mission-node ${active ? "node-active" : ""} ${complete ? "node-complete" : ""}`} onClick={onClick} aria-label={`Open mission ${mission.step}: ${mission.title}`}>
    <span className="node-gem" style={{ "--node-color": mission.color } as React.CSSProperties}><i /></span>
    <span className="node-copy"><small>CH {mission.chapter}</small><strong>{mission.shortTitle}</strong></span>
    {complete && <b className="node-check">✓</b>}
  </button>;
}

export default function Home() {
  const [activeId, setActiveId] = useState<MissionId>("graphics");
  const active = missions.find((mission) => mission.id === activeId)!;
  const [primary, setPrimary] = useState(active.defaults[0]);
  const [secondary, setSecondary] = useState(active.defaults[1]);
  const [result, setResult] = useState<Result | null>(null);
  const [completed, setCompleted] = useState<MissionId[]>([]);
  const [attempts, setAttempts] = useState(0);
  const masteryGuide = masteryGuides[activeId];
  const chapterBrief = chapterBriefs[activeId];

  const [targetPrimary, targetSecondary] = useMemo(() => 
    [formatControl(active.primary, active.target[0]), formatControl(active.secondary, active.target[1])],
    [active.primary, active.secondary, active.target]
  );

  const selectMission = useCallback((mission: Mission) => {
    setActiveId(mission.id); setPrimary(mission.defaults[0]); setSecondary(mission.defaults[1]); setResult(null);
    requestAnimationFrame(() => document.getElementById("mission-lab")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const runForecast = useCallback(() => {
    const next = evaluate(active, primary, secondary);
    setResult(next); setAttempts((value) => value + 1);
    if (next.passed && !completed.includes(active.id)) setCompleted((value) => [...value, active.id]);
  }, [active, primary, secondary, completed]);

  const nextMission = useCallback(() => {
    const next = missions[(active.step) % missions.length];
    selectMission(next);
  }, [active, selectMission]);

  const feedback = useMemo(() => 
    !result ? "Run the model to reveal the holdout data. Then tune one decision at a time." : 
      result.passed ? active.success : 
        result.score >= 60 ? "Promising, but the holdout error is still above the mastery gate. Use the field note and make one focused adjustment." : 
          "This configuration is underperforming the best available model. Revisit the chapter clue before adding complexity.",
    [result, active.success]
  );

  const handlePrimaryChange = useCallback((value: number) => { setPrimary(value); setResult(null); }, []);
  const handleSecondaryChange = useCallback((value: number) => { setSecondary(value); setResult(null); }, []);

  return <main className="game-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Forecast Frontier home"><span className="brand-mark"><i /><i /><i /></span><span><strong>FORECAST</strong><b>FRONTIER</b></span></a>
      <div className="progress-wrap" aria-label={`${completed.length} of ${missions.length} missions mastered`}><span>EXPEDITION PROGRESS</span><div className="progress-track"><i style={{ width: `${completed.length / missions.length * 100}%` }} /></div><strong>{completed.length}/{missions.length}</strong></div>
      <div className="xp"><span>◆</span><strong>{completed.length * 120 + attempts * 10}</strong><small> XP</small></div>
    </header>

    <section className="world" id="top">
      <div className="world-copy">
        <p className="kicker">A 13-MISSION FORECASTING EXPEDITION</p>
        <h1>Learn the signal.<br /><em>Predict what’s next.</em></h1>
        <p>Follow the practical progression of <a href="https://otexts.com/fpppy/" target="_blank" rel="noreferrer">Forecasting: Principles and Practice, the Pythonic Way</a>—from seeing patterns to adapting pretrained models.</p>
        <div className="world-key"><span><i className="key-history" /> real holdout scoring</span><span><i className="key-forecast" /> mastery at {PASS_SCORE}+</span></div>
      </div>
      <div className="campaign-map" aria-label="Thirteen-mission campaign map">
        {acts.map((act) => <section className="act" key={act.id}>
          <div className="act-label"><span>ACT {act.id}</span><strong>{act.label}</strong><small>{act.detail}</small></div>
          <div className="act-route">{missions.filter((mission) => mission.act === act.id).map((mission) => <MissionNode key={mission.id} mission={mission} active={active.id === mission.id} complete={completed.includes(mission.id)} onClick={() => selectMission(mission)} />)}</div>
        </section>)}
      </div>
    </section>

    <section className="mission-stage" id="mission-lab" aria-live="polite">
      <aside className="mission-brief">
        <div className="mission-index">MISSION {String(active.step).padStart(2, "0")} · BOOK CHAPTER {active.chapter}<span style={{ background: active.color }} /></div>
        <p className="mission-eyebrow">{active.eyebrow}</p><h2>{active.title}</h2><p className="objective">{active.objective}</p>
        <div className="chapter-brief"><span>CHAPTER {active.chapter} IN 90 SECONDS</span>{chapterBrief.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="learn-card"><span>YOU’LL LEARN</span><strong>{active.concept}</strong><p>{active.learn}</p></div>
        <div className="field-note"><span>FIELD NOTE</span><p>{active.fieldNote}</p></div>
        <a className="chapter-link" href={masteryGuide.chapterUrl} target="_blank" rel="noreferrer">READ THE MATCHING CHAPTER ↗</a>
      </aside>

      <div className="lab">
        <div className="lab-head"><div><span>OUT-OF-SAMPLE DATA LAB</span><h3>{active.dataTitle}</h3></div><div className="status-chip"><i /> 40 TRAIN · 8 HOLDOUT</div></div>
        <ForecastChart mission={active} result={result} />
        <div className="chart-legend"><span><i className="legend-actual" /> observed</span><span><i className="legend-hidden" /> holdout actual</span><span><i className="legend-prediction" /> model forecast</span></div>
        <div className="controls-row">
          <ControlSlider id="primary-control" control={active.primary} value={primary} onChange={(value) => { setPrimary(value); setResult(null); }} />
          <ControlSlider id="secondary-control" control={active.secondary} value={secondary} onChange={(value) => { setSecondary(value); setResult(null); }} />
          <button className="run-button" onClick={runForecast}><span>▶</span> RUN HOLDOUT</button>
        </div>
        <ResultBar result={result} feedback={feedback} />
        {result?.passed && <section className="mastery-debrief">
          <div className="debrief-head"><span>{result.score === 100 ? "WHY YOUR MODEL WON" : "WHY THIS MODEL PASSED"}</span><strong>Transfer the lesson</strong></div>
          <div className="chosen-settings"><span>{active.primary.label}: <b>{formatControl(active.primary, primary)}</b></span><span>{active.secondary.label}: <b>{formatControl(active.secondary, secondary)}</b></span></div>
          <p className="mastery-context">{result.score === 100 ? "You found the 100-point reference configuration. Here is why both choices fit the structure in this series—and how to repeat the reasoning elsewhere." : `Your ${result.score}-point configuration is close enough to clear mastery, but it is not the best available in this simulation. The 100-point reference uses ${active.primary.label.toLowerCase()} ${targetPrimary} and ${active.secondary.label.toLowerCase()} ${targetSecondary}; compare that one-step adjustment with your choices above.`}</p>
          <div className="debrief-copy">{masteryGuide.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph.replaceAll("{primary}", targetPrimary).replaceAll("{secondary}", targetSecondary)}</p>)}</div>
          <div className="debrief-reading"><span>CORROBORATE IN FPPPy</span><div>{masteryGuide.reading.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a>)}</div></div>
        </section>}
        {result?.passed && <button className="next-button" onClick={nextMission}>{active.step === missions.length ? "REPLAY FROM THE START" : `NEXT: ${missions[active.step].shortTitle.toUpperCase()}`} →</button>}
      </div>
    </section>
    <footer><span>FORECAST FRONTIER</span><p>Curriculum aligned to FPPPy · Game simulations are educational, not production forecasts.</p><span>13 MISSIONS · 5 ACTS</span></footer>
  </main>;
}

