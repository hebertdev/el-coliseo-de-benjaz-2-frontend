export interface StageTeamData {
    name:     string;
    slug:     string;
    tag:      string;
    logo_url: string | null;
    region:   string;
    country:  string;
    city:     string;
}

export interface StageTournamentData {
    name:    string;
    slug:    string;
    edition: number;
}

export interface StageGameHeroData {
    has_hero:   boolean;
    hero_id:    number | null;
    hero_name:  string | null;
    image_url:  string | null;
}

export interface StageGameData {
    slug?:             string;
    game_number:       number;
    status:            string; // "COMPLETED" | "SCHEDULED" | "ONGOING"
    opendota_match_id: number | string | null;
    radiant_team:      StageTeamData | null;
    dire_team:         StageTeamData | null;
    radiant_picks?:    number[];
    dire_picks?:       number[];
    radiant_heroes?:   StageGameHeroData[];
    dire_heroes?:      StageGameHeroData[];
    winner_slug:       string | null;
    duration_seconds:  number | null;
    started_at:        string | null;
    ended_at:          string | null;
}

export interface StageMatchData {
    slug?:        string;
    match_number: number;
    best_of:      string; // e.g. "BO1" | "BO3" | "BO5"
    score_a:      number;
    score_b:      number;
    status:       string; // "SCHEDULED" | "ONGOING" | "COMPLETED" | "PAUSED"
    winner_slug:  string | null;
    team_a:       StageTeamData | null;
    team_b:       StageTeamData | null;
    scheduled_at: string | null;
    games?:       StageGameData[];
    identifier?:  string;
    node_type?:   string;
}

export interface StageRoundData {
    round_number:            number;
    name:                    string;
    status:                  string; // "PENDING" | "ONGOING" | "FINISHED"
    default_format:          string;
    is_elimination_round:    boolean;
    is_qualification_round:  boolean;
    matches:                 StageMatchData[];
}

export interface StageStandingData {
    position:     number;
    playoff_seed?: number | null;
    team:         StageTeamData;
    wins:         number;
    losses:       number;
    games_won:    number;
    games_lost:   number;
    buchholz:     number;
    status:       string; // "ONGOING" | "QUALIFIED" | "ELIMINATED"
}

export interface StageStandingsResponse {
    tournament: StageTournamentData;
    stage_name: string;
    stage_slug: string;
    standings:  StageStandingData[];
}

export interface SwissStageData {
    name:                 string;
    slug:                 string;
    stage_type:           string;
    order:                number;
    status:               string;
    max_teams:            number;
    teams_advancing:      number;
    tournament:           StageTournamentData;
    current_round_number: number | null;
    rounds:               StageRoundData[] | null;
    standings:            StageStandingData[] | null;
    bracket?:             PlayoffBracketRound[] | null;
    third_place_match?:   PlayoffThirdPlaceMatch | null;
}

export interface PlayoffBracketSlot {
    seed?:        number | null;
    placeholder?: string | null;
    team:        StageTeamData | null;
    score:       number | null;
}

export interface PlayoffBracketMatch {
    slug?:        string;
    identifier:   string; // e.g. "QF1", "SF1", "GF"
    node_type?:   string; // "QF" | "SF" | "GF"
    best_of:      string; // "BO3" | "BO5"
    status:       string; // "PENDING" | "ONGOING" | "FINISHED" | "COMPLETED" | "SCHEDULED"
    winner_slug?: string | null;
    scheduled_at?: string | null;
    slot_a:       PlayoffBracketSlot;
    slot_b:       PlayoffBracketSlot;
    games?:       StageGameData[];
}

export interface PlayoffThirdPlaceMatch {
    slug?:        string;
    identifier:   string; // e.g. "3RD"
    match_name?:  string; // "Batalla por el Honor (3er Puesto)"
    best_of:      string; // "BO3"
    status:       string; // "SCHEDULED" | "ONGOING" | "COMPLETED" | "FINISHED"
    winner_slug?: string | null;
    scheduled_at?: string | null;
    slot_a:       PlayoffBracketSlot;
    slot_b:       PlayoffBracketSlot;
    games?:       StageGameData[];
}

export interface PlayoffBracketRound {
    round_number: number;
    round_name:   string; // "Cuartos de Final" | "Semifinales" | "Gran Final"
    best_of:      string;
    matches:      PlayoffBracketMatch[];
}

export interface PlayoffStageData {
    name:                 string;
    slug:                 string;
    stage_type:           string;
    order:                number;
    status:               string;
    max_teams:            number;
    teams_advancing:      number;
    tournament:           StageTournamentData;
    current_round_number: number | null;
    rounds:               StageRoundData[] | null;
    standings:            StageStandingData[] | null;
    bracket:              PlayoffBracketRound[] | null;
    third_place_match?:   PlayoffThirdPlaceMatch | null;
}

