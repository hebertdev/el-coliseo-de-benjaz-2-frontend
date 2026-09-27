"use client";

import React, { useState } from "react";
import type { TournamentAnalyticsResponse } from "interfaces/analytics";
import { AnalyticsHero } from "./AnalyticsHero";
import { TournamentMvpSection } from "./TournamentMvpSection";
import { DreamTeamSection } from "./DreamTeamSection";
import { TournamentRecordsSection } from "./TournamentRecordsSection";
import { IndividualLeadersSection } from "./IndividualLeadersSection";
import { PositionRankingsSection } from "./PositionRankingsSection";
import { HeroMetaSection } from "./HeroMetaSection";
import { TeamPerformanceSection } from "./TeamPerformanceSection";
import { CommunityHighlightsSection } from "./CommunityHighlightsSection";
import { AnalyticsFollowModal } from "./AnalyticsFollowModal";

interface AnalyticsProps {
  initialData: TournamentAnalyticsResponse;
}

export function Analytics({ initialData }: AnalyticsProps) {
  const [activeSection, setActiveSection] = useState<string>("dream-team");
  const [isFollowModalOpen, setIsFollowModalOpen] = useState<boolean>(false);

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#120f0a] text-[#f3f3f5] selection:bg-[#00c8f8]/30 selection:text-white">
      {/* Background ambient texture */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2d261e_1px,transparent_1px)] bg-size-[24px_24px] opacity-30" />

        {/* Master Container */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Hero Banner & KPI summary */}
          <AnalyticsHero
            tournament={initialData.tournament}
            summary={initialData.summary}
            activeSection={activeSection}
            onNavigateSection={handleNavigateSection}
            onOpenFollowModal={() => setIsFollowModalOpen(true)}
          />

          {/* MVP Oficial / Líder Provisorio del Torneo - Todo el largo arriba de Dream Team */}
          {initialData.tournament_mvp && (
            <TournamentMvpSection mvp={initialData.tournament_mvp} />
          )}

          {/* Dream Team (Alineación Ideal) */}
          <DreamTeamSection
            dreamTeam={initialData.dream_team}
            dreamTeamSecondary={initialData.dream_team_secondary}
          />

          {/* Tournament Records */}
          <TournamentRecordsSection records={initialData.tournament_records} />

          {/* Individual Leaders Top 5 */}
          <IndividualLeadersSection leaders={initialData.individual_leaders} />

          {/* Position Rankings Full Table */}
          <PositionRankingsSection playersByPosition={initialData.players_by_position} />

          {/* Hero Meta Trends */}
          <HeroMetaSection
            heroMeta={initialData.hero_meta}
            lowestWinrateHeroes={initialData.community_highlights.lowest_winrate_heroes}
          />

          {/* Team Performance Table */}
          <TeamPerformanceSection teams={initialData.team_performance} />

          {/* Community & Fun Highlights */}
          <CommunityHighlightsSection highlights={initialData.community_highlights} />
        </div>
      </div>

      {/* Follow & Data Collection Support Modal */}
      <AnalyticsFollowModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
      />
    </div>
  );
}
