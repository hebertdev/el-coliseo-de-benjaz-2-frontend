export const revalidate = 30;

import { getTeamsAPI } from "services/teams";
import { getStageBySlugAPI, getPlayoffsStageAPI } from "services/stages";
import { getPlayerOfTheDayAPI } from "services/playerOfTheDay";
import type { TeamRosterMemberData } from "interfaces/teams";
import type { SwissStageData, PlayoffStageData } from "interfaces/stages";
import type { PlayerOfTheDayResponse } from "interfaces/playerOfTheDay";

// Home Components
import {
  Banner,
  FormatSection,
  TeamsSection,
  SwissStageSection,
  PlayoffsSection,
  PrizePoolSection,
} from "components/pages/Home";

export default async function Home() {
  let initialTeams = undefined;
  let initialRosters = undefined;
  let initialSwissData: SwissStageData | null = null;
  let initialPlayoffsData: PlayoffStageData | null = null;
  let initialPlayerOfTheDay: PlayerOfTheDayResponse | null = null;

  try {
    const [teamsRes, swissRes, playoffsRes, potdRes] = await Promise.allSettled([
      getTeamsAPI("el-gran-coliseo-ii", true),
      getStageBySlugAPI("fase-suiza"),
      getPlayoffsStageAPI("playoffs"),
      getPlayerOfTheDayAPI("el-gran-coliseo-ii"),
    ]);

    if (teamsRes.status === "fulfilled" && teamsRes.value?.results) {
      initialTeams = teamsRes.value.results;
      const rosterMap: Record<string, TeamRosterMemberData[]> = {};
      initialTeams.forEach((t) => {
        if (t.roster) {
          rosterMap[t.slug] = t.roster;
        }
      });
      initialRosters = rosterMap;
    }

    if (swissRes.status === "fulfilled" && swissRes.value) {
      initialSwissData = swissRes.value;
    }

    if (playoffsRes.status === "fulfilled" && playoffsRes.value) {
      initialPlayoffsData = playoffsRes.value;
    }

    if (potdRes.status === "fulfilled" && potdRes.value) {
      initialPlayerOfTheDay = potdRes.value;
    }
  } catch {
    // fallback
  }

  return (
    <div className="w-full min-h-screen bg-[#120f0a] text-white selection:bg-[#00c8f8]/30 selection:text-white">
      <main className="flex flex-col w-full">
        <Banner initialPlayerOfTheDay={initialPlayerOfTheDay} />
        <FormatSection />
        <TeamsSection
          initialTeams={initialTeams}
          initialRosters={initialRosters}
          initialStandings={initialSwissData?.standings || []}
        />
        <SwissStageSection initialData={initialSwissData} />
        <PlayoffsSection initialData={initialPlayoffsData} />
        <PrizePoolSection initialPlayoffsData={initialPlayoffsData} />
      </main>
    </div>
  );
}

