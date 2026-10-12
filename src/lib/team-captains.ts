import type { TeamData } from "interfaces/teams";

export function getTeamCaptainTags(teams: TeamData[]): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const team of teams) {
    const captain = team.roster?.find(
      (member) => member.role === "CAPTAIN" || (member as { is_captain?: boolean }).is_captain
    );
    const nickname = captain?.player?.nickname?.trim();
    if (nickname) {
      tags[team.slug] = nickname.toLowerCase().startsWith("team ") ? nickname : `Team ${nickname}`;
    } else if (team.tag && team.tag.toLowerCase() !== team.name.toLowerCase()) {
      tags[team.slug] = `Team ${team.tag.replace(/^T-/i, "").replace(/^TEAM\s+/i, "").trim()}`;
    }
  }
  return tags;
}
