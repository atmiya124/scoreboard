"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTeamNames, setTeamNames } from "@/lib/team-store";

function parseClock(clock: string): number {
  const parts = clock.trim().split(":");
  const mins = parseInt(parts[0] || "0", 10);
  const secs = parseInt(parts[1] || "0", 10);
  return Math.max(0, mins * 60 + secs);
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type ScoreboardProps = {
  team1Name?: string;
  team2Name?: string;
  team1Score?: number;
  team2Score?: number;
  periodLabel?: string;
  gameClock?: string;
};

export default function Scoreboard({
  team1Name = "Team",
  team2Name = "Team",
  team1Score = 0,
  team2Score = 0,
  periodLabel = "Quarter",
  gameClock = "12:00",
}: ScoreboardProps) {
  const [displayTeam1, setDisplayTeam1] = useState(team1Name);
  const [displayTeam2, setDisplayTeam2] = useState(team2Name);
  const [score1, setScore1] = useState(team1Score);
  const [score2, setScore2] = useState(team2Score);
  const [clock, setClock] = useState(gameClock);
  const [periodLabelDisplay, setPeriodLabelDisplay] = useState(periodLabel);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = getTeamNames();
    setDisplayTeam1(stored.team1Name);
    setDisplayTeam2(stored.team2Name);
  }, []);

  function saveTeamNames(t1: string, t2: string) {
    const names = { team1Name: t1 || "Team", team2Name: t2 || "Team" };
    setTeamNames(names);
  }

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
    setScore1(0);
    setScore2(0);
    setClock("12:00");
    setPeriodLabelDisplay("Quarter");
    setDisplayTeam1("Team");
    setDisplayTeam2("Team");
    setTeamNames({ team1Name: "Team", team2Name: "Team" });
  }, []);

  const toggleTimer = useCallback(() => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setIsTimerRunning(false);
      return;
    }
    let totalSeconds = parseClock(clock);
    if (totalSeconds <= 0) {
      totalSeconds = 12 * 60;
      setClock("12:00");
    }
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      totalSeconds -= 1;
      setClock(formatClock(totalSeconds));
      if (totalSeconds <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsTimerRunning(false);
      }
    }, 1000);
  }, [isTimerRunning, clock]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setScore1((s) => s + 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          setScore1((s) => Math.max(0, s - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setScore2((s) => s + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setScore2((s) => Math.max(0, s - 1));
          break;
        case " ":
          e.preventDefault();
          toggleTimer();
          break;
        case "0":
          e.preventDefault();
          handleReset();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTimer, handleReset]);

  return (
    <>
    <div className="scoreboard relative w-full max-w-4xl overflow-hidden rounded-2xl border-4 border-amber-500/40 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-black/50">
      {/* Subtle scan-line effect */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] opacity-50" />

      <div className="relative px-8 py-6 md:px-12 md:py-8">
        {/* Period & clock bar */}
        <div className="mb-6 flex items-center justify-between border-b border-amber-500/30 pb-4">
          <div className="text-left">
            <input
              type="text"
              value={periodLabelDisplay}
              onChange={(e) => setPeriodLabelDisplay(e.target.value)}
              className="w-full max-w-[10rem] border-0 border-b border-transparent bg-transparent text-left text-xs font-bold uppercase tracking-[0.35em] text-amber-400/90 outline-none placeholder:text-amber-400/50 focus:border-amber-500/50"
              placeholder="Quarter"
            />
          </div>
          <div className="flex flex-col items-start">
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-amber-400/90">
              TIME
            </div>
            <div
              className={`mt-1 font-mono text-4xl font-bold tabular-nums md:text-5xl ${
                parseClock(clock) <= 60 ? "text-red-500 animate-pulse" : "text-white"
              }`}
            >
              {clock}
            </div>
          </div>
        </div>

        {/* Teams & scores */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4 md:gap-8">
          {/* Team 1 */}
          <div className="flex flex-col items-start text-center">
            <input
              type="text"
              value={displayTeam1}
              onChange={(e) => setDisplayTeam1(e.target.value)}
              onBlur={() => saveTeamNames(displayTeam1, displayTeam2)}
              className="w-full max-w-[12rem] border-0 border-b border-transparent bg-transparent font-bold uppercase tracking-widest text-slate-300 outline-none placeholder:text-slate-500 focus:border-amber-500/50 md:max-w-none md:text-center md:text-lg"
              placeholder="Team"
            />
            <div className="mt-2 w-full text-center font-mono text-7xl font-bold tabular-nums text-white drop-shadow-lg md:mt-3 md:text-8xl lg:text-9xl">
              {score1}
            </div>
          </div>

          {/* Vertical line - gradient, only center visible, 2px */}
          <div
            className="w-[2px] self-stretch shrink-0"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(251, 191, 36, 0.5) 25%, rgba(251, 191, 36, 0.5) 75%, transparent 100%)",
            }}
          />

          {/* Team 2 */}
          <div className="flex flex-col items-end text-center">
            <input
              type="text"
              value={displayTeam2}
              onChange={(e) => setDisplayTeam2(e.target.value)}
              onBlur={() => saveTeamNames(displayTeam1, displayTeam2)}
              className="w-full max-w-[12rem] border-0 border-b border-transparent bg-transparent font-bold uppercase tracking-widest text-slate-300 outline-none placeholder:text-slate-500 focus:border-amber-500/50 md:max-w-none md:text-center md:text-lg"
              placeholder="Team"
            />
            <div className="mt-2 w-full text-center font-mono text-7xl font-bold tabular-nums text-white drop-shadow-lg md:mt-3 md:text-8xl lg:text-9xl">
              {score2}
            </div>
          </div>
        </div>
      </div>

      {/* Control strip for demo */}
      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-amber-500/30 bg-black/30 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-slate-400">
            Team
          </span>
          <button
            type="button"
            onClick={() => setScore1((s) => s + 1)}
            className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => setScore1((s) => Math.max(0, s - 1))}
            className="rounded bg-slate-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-slate-500"
          >
            −1
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-slate-400">
            Team
          </span>
          <button
            type="button"
            onClick={() => setScore2((s) => s + 1)}
            className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => setScore2((s) => Math.max(0, s - 1))}
            className="rounded bg-slate-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-slate-500"
          >
            −1
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-slate-400">
            Clock
          </span>
          <input
            type="text"
            value={clock}
            onChange={(e) => setClock(e.target.value)}
            className="w-24 rounded bg-slate-700 px-2 py-1.5 font-mono text-sm text-white"
            placeholder="12:00"
          />
        </div>
      </div>
    </div>

    {/* Floating controls - bottom right */}
    <div className="fixed bottom-6 right-6 z-10 flex items-center gap-3">
      <button
        type="button"
        onClick={toggleTimer}
        className={`flex h-12 items-center gap-2 rounded-full border px-4 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
          isTimerRunning
            ? "border-amber-500/60 bg-amber-500/20 text-amber-400"
            : "border-amber-500/40 bg-slate-800/95 text-amber-400 hover:bg-slate-700 hover:text-amber-300"
        }`}
        aria-label={isTimerRunning ? "Pause timer" : "Start timer"}
      >
        {isTimerRunning ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <span className="text-sm font-semibold">Pause</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-sm font-semibold">Start timer</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-slate-800/95 text-amber-400 shadow-lg transition hover:bg-slate-700 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        aria-label="Reset scoreboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
    </>
  );
}
