// interfaces
import { TeamData, TeamsData, TeamRosterMemberData } from "interfaces/teams";
import { TeamSeriesHistoryResponse } from "interfaces/matches";
import teamsIndexData from "data/static/teams/index.json";

export async function getTeamsAPI(
  _tournamentSlug: string = "el-gran-coliseo-ii",
  _includeRoster: boolean = false
): Promise<TeamsData> {
  void _tournamentSlug;
  void _includeRoster;
  return teamsIndexData as unknown as TeamsData;
}

export async function getTeamBySlugAPI(slug: string): Promise<TeamData> {
  try {
    const mod = await import(`data/static/teams/${slug}/detail.json`);
    return (mod.default || mod) as unknown as TeamData;
  } catch {
    // Fallback search in index
    const teamsList = Array.isArray(teamsIndexData)
      ? teamsIndexData
      : (teamsIndexData as { results?: TeamData[]; teams?: TeamData[] })?.results || [];
    const found = teamsList.find((t: TeamData) => t.slug === slug);
    return found as TeamData;
  }
}

export async function getTeamRosterAPI(
  slug: string,
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<TeamRosterMemberData[]> {
  void _tournamentSlug;
  try {
    const mod = await import(`data/static/teams/${slug}/roster.json`);
    return (mod.default || mod) as unknown as TeamRosterMemberData[];
  } catch {
    return [];
  }
}

export async function getTeamMatchesAPI(
  slug: string,
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<TeamSeriesHistoryResponse> {
  void _tournamentSlug;
  try {
    const mod = await import(`data/static/teams/${slug}/matches.json`);
    return (mod.default || mod) as unknown as TeamSeriesHistoryResponse;
  } catch {
    return { count: 0, series: [] } as unknown as TeamSeriesHistoryResponse;
  }
}
