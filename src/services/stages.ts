// interfaces
import { SwissStageData, PlayoffStageData, StageStandingsResponse } from "interfaces/stages";

export async function getStageBySlugAPI(
  stageSlug: string = "fase-suiza",
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<SwissStageData> {
  void _tournamentSlug;
  if (stageSlug === "playoffs") {
    return await getPlayoffsStageAPI() as unknown as SwissStageData;
  }
  const { default: data } = await import("data/static/stages/fase-suiza.json");
  return data as unknown as SwissStageData;
}

export async function getPlayoffsStageAPI(
  _stageSlug: string = "playoffs",
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<PlayoffStageData> {
  void _stageSlug;
  void _tournamentSlug;
  const { default: data } = await import("data/static/stages/playoffs.json");
  return data as unknown as PlayoffStageData;
}

export async function getStageStandingsAPI(
  _stageSlug: string = "fase-suiza",
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<StageStandingsResponse> {
  void _stageSlug;
  void _tournamentSlug;
  const { default: data } = await import("data/static/stages/standings.json");
  return data as unknown as StageStandingsResponse;
}

export const getStageBySlugClientAPI = getStageBySlugAPI;
export const getPlayoffsStageClientAPI = getPlayoffsStageAPI;
