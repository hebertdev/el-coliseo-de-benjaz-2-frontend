export interface UserLoginCredentials {
    email?:    string;
    password:  string;
}

export interface UserSignupCredentials {
    email:                  string;
    username:               string;
    first_name:             string;
    last_name:              string;
    password:               string;
    password_confirmation:  string;
}

export interface UserSignupResponse {
    user:    UserData;
    message: string;
}

export interface UserVerifyCredentials {
    email: string;
    code:  string;
}

export interface UserForgotPasswordCredentials {
    email: string;
}

export interface UserResetPasswordCredentials {
    uid: string;
    token: string;
    password: string;
    password_confirmation: string;
}

export interface UserLoginData {
    user:    UserData;
    refresh: string;
    access:  string;
}

export interface UsersData {
    count:    number;
    next:     string | null;
    previous: string | null;
    results:  UserData[];
}

export interface UserData {
    username:        string;
    email:           string | null;
    first_name:      string;
    last_name:       string;
    profile:         ProfileData;
    player_profile?: {
        slug: string;
        nickname: string;
        region: string;
        account_id: number;
    } | null;
}

export interface ProfileData {
    avatar: string | null;
    bio:    string;
    link:   string;
}

