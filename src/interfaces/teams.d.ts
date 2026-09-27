export interface TeamData {
    name:              string;
    slug:              string;
    tag:               string;
    logo:              string | null;
    region:            string;
    region_display:    string;
    country:           string;
    city:              string;
    status:            string;
    status_display:    string;
    opendota_team_id:  number | null;
    steam_id?:         string | null;
    created_at:        string;
    updated_at:        string;
    roster?:           TeamRosterMemberData[];
}


export interface TeamsData {
    count:    number;
    next:     string | null;
    previous: string | null;
    results:  TeamData[];
}

export interface PlayerData {
    slug:       string;
    nickname:   string;
    avatar:     string | null;
    steam_id:   string | null;
    account_id: number | null;
    region:     string;
    country:    string;
    city:       string;
}

export interface TeamRosterMemberData {
    player:                PlayerData;
    tournament_slug:       string;
    tournament_name:       string;
    role:                  string; // "PLAYER" | "CAPTAIN" | "COACH" | "STANDIN"
    role_display:          string; // "Player" | "Captain" | "Coach" | "Stand-in"
    competitive_position:  number | null; // 1 | 2 | 3 | 4 | 5 | null
    position_display:      string | null; // e.g. "Position 1 - Carry"
    is_active:             boolean;
    joined_at:             string | null;
    left_at:               string | null;
}
