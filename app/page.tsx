import Scoreboard from "./components/Scoreboard";

export default function ScoreboardPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="w-full max-w-4xl px-4 md:px-8">
        <header className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold uppercase tracking-wide text-amber-400/95 md:text-3xl [font-family:var(--font-montserrat)]">
            Atmiya Badminton 2026
          </h2>
          <h1 className="text-xl font-bold uppercase tracking-[0.4em] text-amber-400/90 [font-family:var(--font-montserrat)]">
            Live Scoreboard
          </h1>
        </header>
        <Scoreboard
          team1Name="Team"
          team2Name="Team"
          team1Score={0}
          team2Score={0}
          periodLabel="Quarter"
          gameClock="12:00"
        />
        </div>
      </div>
    </div>
  );
}
