import { UserData } from "interfaces/users";

interface UserCardProps {
  user: UserData;
}

export function UserCard({ user }: UserCardProps) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const displayName = fullName || user.username;
  const initial = (user.first_name ? user.first_name.charAt(0) : user.username.charAt(0)).toUpperCase();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-lg font-bold uppercase text-black/60">
          {initial}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-black/90">{displayName}</h3>
          <p className="text-sm text-black/50">{user.email}</p>
        </div>
      </div>
      
      {user.profile && (
        <div className="mt-2 border-t border-black/5 pt-4 text-sm text-black/70">
          {user.profile.bio ? (
            <p className="line-clamp-2">{user.profile.bio}</p>
          ) : (
            <p className="italic text-black/40">Sin biografía</p>
          )}
        </div>
      )}
    </div>
  );
}
