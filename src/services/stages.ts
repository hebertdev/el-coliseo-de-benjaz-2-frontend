// interfaces
import { SwissStageData, PlayoffStageData, StageStandingsResponse } from "interfaces/stages";
import swissStageData from "data/static/stages/fase-suiza.json";
import playoffStageData from "data/static/stages/playoffs.json";
import standingsData from "data/static/stages/standings.json";

export async function getStageBySlugAPI(
  stageSlug: string = "fase-suiza",
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<SwissStageData> {
  void _tournamentSlug;
  if (stageSlug === "playoffs") {
    return playoffStageData as unknown as SwissStageData;
  }
  return swissStageData as unknown as SwissStageData;
}

export async function getPlayoffsStageAPI(
  _stageSlug: string = "playoffs",
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<PlayoffStageData> {
  void _stageSlug;
  void _tournamentSlug;
  return playoffStageData as unknown as PlayoffStageData;
}

export async function getStageStandingsAPI(
  _stageSlug: string = "fase-suiza",
  _tournamentSlug: string = "el-gran-coliseo-ii"
): Promise<StageStandingsResponse> {
  void _stageSlug;
  void _tournamentSlug;
  return standingsData as unknown as StageStandingsResponse;
}

export const getStageBySlugClientAPI = getStageBySlugAPI;
export const getPlayoffsStageClientAPI = getPlayoffsStageAPI;
