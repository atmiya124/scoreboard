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
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] opacity-50" />

      <div className="relative px-8 py-8 md:px-14 md:py-10">
        <div className="mb-8 flex items-center justify-between border-b border-amber-500/30 pb-5">
          <div className="text-left">
            <input
              type="text"
              value={periodLabelDisplay}
              onChange={(e) => setPeriodLabelDisplay(e.target.value)}
              className="w-full max-w-[14rem] border-0 border-b-2 border-transparent bg-transparent py-1.5 text-left text-sm font-bold uppercase tracking-[0.35em] text-amber-400/90 outline-none placeholder:text-amber-400/50 focus:border-amber-500/50 md:text-base"
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

        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-6 md:gap-10">
          <div className="flex flex-col items-start text-center">
            <input
              type="text"
              value={displayTeam1}
              onChange={(e) => setDisplayTeam1(e.target.value)}
              onBlur={() => saveTeamNames(displayTeam1, displayTeam2)}
              className="w-full max-w-[14rem] border-0 border-b-2 border-transparent bg-transparent py-2 font-bold uppercase tracking-widest text-slate-300 outline-none placeholder:text-slate-500 focus:border-amber-500/50 md:max-w-none md:text-center md:text-xl"
              placeholder="Team"
            />
            <div className="mt-2 w-full text-center font-mono text-9xl font-bold tabular-nums text-white drop-shadow-lg md:mt-3 md:text-[10rem] lg:text-[12rem]">
              {score1}
            </div>
          </div>

          <div
            className="w-[2px] self-stretch shrink-0"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(251, 191, 36, 0.5) 25%, rgba(251, 191, 36, 0.5) 75%, transparent 100%)",
            }}
          />

          <div className="flex flex-col items-end text-center">
            <input
              type="text"
              value={displayTeam2}
              onChange={(e) => setDisplayTeam2(e.target.value)}
              onBlur={() => saveTeamNames(displayTeam1, displayTeam2)}
              className="w-full max-w-[14rem] border-0 border-b-2 border-transparent bg-transparent py-2 font-bold uppercase tracking-widest text-slate-300 outline-none placeholder:text-slate-500 focus:border-amber-500/50 md:max-w-none md:text-center md:text-xl"
              placeholder="Team"
            />
            <div className="mt-2 w-full text-center font-mono text-9xl font-bold tabular-nums text-white drop-shadow-lg md:mt-3 md:text-[10rem] lg:text-[12rem]">
              {score2}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end border-t border-slate-700/50 bg-black/20 px-6 py-2">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Clock</span>
          <input
            type="text"
            value={clock}
            onChange={(e) => setClock(e.target.value)}
            className="w-16 rounded border-0 bg-slate-800/60 px-1.5 py-0.5 font-mono text-xs text-slate-400 outline-none placeholder:text-slate-600 focus:opacity-100"
            placeholder="12:00"
          />
        </div>
      </div>
    </div>

    <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100 focus-within:opacity-100">
      <button
        type="button"
        onClick={toggleTimer}
        className={`flex h-8 items-center gap-1.5 rounded border px-2.5 transition focus:outline-none focus:ring-1 focus:ring-slate-500 ${
          isTimerRunning
            ? "border-slate-600 bg-slate-700/80 text-slate-400"
            : "border-slate-700 bg-slate-800/60 text-slate-500 hover:border-slate-600 hover:text-slate-400"
        }`}
        aria-label={isTimerRunning ? "Pause timer" : "Start timer"}
      >
        {isTimerRunning ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Pause</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Start</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-800/60 text-slate-500 transition hover:border-slate-600 hover:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
        aria-label="Reset scoreboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
    </>
  );
}
