"use client";

import { useState } from "react";
import { Menu, Avatar } from "@mantine/core";
import { IconChevronDown, IconLogout, IconBrandSteam } from "@tabler/icons-react";
import { useUser } from "contexts/UserContext";
import type { UserData } from "interfaces/users";

interface UserMenuProps {
  user: UserData;
  compact?: boolean;
}

export function UserMenu({ user, compact = false }: UserMenuProps) {
  const { logout } = useUser();
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);

  const displayName = user.first_name || user.username;
  const avatarUrl = user.profile?.avatar ?? undefined;

  async function handleLogout() {
    setLoading(true);
    await logout();
  }

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      shadow="xl"
      width={220}
      position="bottom-end"
      offset={6}
      withArrow
      arrowPosition="side"
      withinPortal
    >
      <Menu.Target>
        {compact ? (
          <button
            type="button"
            className="group relative flex items-center justify-center rounded-full border border-[#d8b467]/60 bg-[#1a1611]/90 p-0.5 transition-all duration-200 hover:border-[#ffd700] hover:shadow-[0_0_10px_rgba(216,180,103,0.4)] cursor-pointer select-none focus:outline-none active:scale-95 shrink-0"
            title={displayName}
            aria-label={`Menú de usuario: ${displayName}`}
          >
            <Avatar
              src={avatarUrl}
              alt={displayName}
              radius="xl"
              size={28}
              color="brand"
              className="border border-[#d8b467]/50 shrink-0"
            >
              {displayName.slice(0, 2).toUpperCase()}
            </Avatar>
          </button>
        ) : (
          <button
            type="button"
            className="group relative flex items-center gap-2.5 rounded-sm border border-[#3d3328] bg-[#1a1611]/90 px-2.5 py-1.5 transition-all duration-200 hover:border-[#d8b467]/70 hover:bg-[#241e17] cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#d8b467]/50"
          >
            <Avatar
              src={avatarUrl}
              alt={displayName}
              radius="xl"
              size={24}
              color="brand"
              className="border border-[#d8b467]/40 shrink-0"
            >
              {displayName.slice(0, 2).toUpperCase()}
            </Avatar>

            <span className="font-chakra text-xs font-semibold tracking-wider text-[#e0deda] group-hover:text-white truncate max-w-32">
              {displayName}
            </span>

            <IconChevronDown
              size={14}
              className={`text-[#8e857b] transition-transform duration-200 group-hover:text-[#d8b467] ${
                opened ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </Menu.Target>

      <Menu.Dropdown className="!bg-[#14100c] !border !border-[#3d3328] !p-1.5 !shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {/* User Info Header */}
        <div className="px-3 py-2 border-b border-[#241e17] mb-1">
          <p className="font-chakra text-xs font-bold text-[#f0d38f] truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <IconBrandSteam size={12} className="text-[#00c8f8]" />
            <span className="font-mono text-[10px] text-[#8e857b] uppercase tracking-wider">
              {user.player_profile ? "Jugador Competitivo" : "Gladiador Oficial"}
            </span>
          </div>
        </div>

        {/* Logout Action */}
        <Menu.Item
          color="red"
          disabled={loading}
          leftSection={<IconLogout size={15} className="text-red-400" />}
          onClick={handleLogout}
          className="!font-chakra !text-xs !font-bold !uppercase !tracking-wider !text-red-400 hover:!bg-red-950/40 hover:!text-red-300 transition-colors"
        >
          {loading ? "Cerrando sesión..." : "Cerrar sesión"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
