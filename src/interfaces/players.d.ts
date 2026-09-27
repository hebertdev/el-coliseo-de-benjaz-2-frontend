export interface PlayerMembershipTeamData {
  name: string;
  slug: string;
  tag: string;
  logo: string | null;
  region: string;
  region_display: string;
  country: string;
  city: string;
  status: string;
}

export interface PlayerMembershipData {
  team: PlayerMembershipTeamData;
  tournament_slug: string;
  tournament_name: string;
  role: string; // "PLAYER" | "CAPTAIN" | "COACH" | "STANDIN"
  role_display: string;
  competitive_position: number | null; // 1 | 2 | 3 | 4 | 5 | null
  position_display: string | null;
  is_active: boolean;
  joined_at: string | null;
  left_at: string | null;
}

export interface PlayerDetailData {
  slug: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  kick_url: string;
  twitch_url: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  steam_id: string | null;
  account_id: number | null;
  region: string;
  region_display: string;
  country: string;
  city: string;
  memberships: PlayerMembershipData[];
  created_at: string;
  updated_at: string;
}
