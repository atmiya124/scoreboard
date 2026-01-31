import Scoreboard from "./components/Scoreboard";

export default function ScoreboardPage() {
  return (
    <div className="relative min-h-screen">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950" />
      {/* Background image at 20% opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <h2 className="mb-2 text-2xl font-bold tracking-wide text-amber-400/95 md:text-3xl [font-family:var(--font-montserrat)]">
          Atmiya Badminton 2026
        </h2>
        <h1 className="mb-8 text-xl font-bold uppercase tracking-[0.4em] text-amber-400/90 [font-family:var(--font-montserrat)]">
          Live Scoreboard
        </h1>
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
  );
}
