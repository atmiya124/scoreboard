const STORAGE_KEY = "scoreboard-teams";

export type TeamNames = {
  team1Name: string;
  team2Name: string;
};

const defaults: TeamNames = {
  team1Name: "Team",
  team2Name: "Team",
};

export function getTeamNames(): TeamNames {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<TeamNames>;
    return {
      team1Name: parsed.team1Name ?? defaults.team1Name,
      team2Name: parsed.team2Name ?? defaults.team2Name,
    };
  } catch {
    return defaults;
  }
}

export function setTeamNames(names: TeamNames): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    // ignore
  }
}
