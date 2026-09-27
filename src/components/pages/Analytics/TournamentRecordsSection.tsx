"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconTrophy,
  IconFlame,
  IconClockPlay,
  IconHourglassEmpty,
  IconSkull,
  IconCoins,
  IconSwords,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { TournamentRecords } from "interfaces/analytics";
import { formatSpanishCompact } from "helpers/dota";

interface TournamentRecordsSectionProps {
  records: TournamentRecords;
}

export function TournamentRecordsSection({ records }: TournamentRecordsSectionProps) {
  return (
    <section id="records" className="mt-14 sm:mt-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2d261e]">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#2e9df0]">
            <IconTrophy size={16} className="text-[#2e9df0]" />
            <span>HAZAÑAS HISTÓRICAS</span>
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            RÉCORDS DEL <span className="text-[#2e9df0]">COLISEO</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Las marcas más memorables, partidos extremos e hitos individuales registrados en el torneo.
          </p>
        </div>
      </div>

      {/* 6 Record Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Record 1: Partida Más Rápida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-5 hover:border-[#2e9df0]/70 hover:shadow-[0_0_20px_rgba(46,157,240,0.15)] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-[#6cc4ff]">
                <IconClockPlay size={16} className="text-[#2e9df0]" />
                Victoria Más Rápida
              </span>
              <span className="font-mono text-xs text-[#8e857b]">Match Record</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-cinzel text-3xl sm:text-4xl font-black text-white group-hover:text-[#2e9df0] transition-colors">
                {records.fastest_game.duration_formatted}
              </span>
              <span className="font-chakra text-xs text-[#8e857b]">
                ({records.fastest_game.duration_seconds}s)
              </span>
            </div>

            <p className="mt-2 font-chakra text-xs text-[#a89f91] leading-relaxed">
              La victoria más contundente y veloz de toda la fase, asegurando el trono en tiempo récord.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17] flex items-center justify-between">
            <Link
              href={`/game/${encodeURIComponent(records.fastest_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#2e9df0] hover:text-white transition-colors"
            >
              <span>Ver Partida</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Record 2: Partida Más Larga */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-5 hover:border-[#d8b467]/70 hover:shadow-[0_0_20px_rgba(216,180,103,0.15)] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-[#f0d38f]">
                <IconHourglassEmpty size={16} className="text-[#d8b467]" />
                Guerra de Desgaste
              </span>
              <span className="font-mono text-xs text-[#8e857b]">Match Record</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-cinzel text-3xl sm:text-4xl font-black text-white group-hover:text-[#f0d38f] transition-colors">
                {records.longest_game.duration_formatted}
              </span>
              <span className="font-chakra text-xs text-[#8e857b]">
                ({records.longest_game.duration_seconds}s)
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {records.longest_game.winner_logo_url && (
                <picture className="shrink-0">
                  <img
                    src={records.longest_game.winner_logo_url}
                    alt={records.longest_game.winner_name || "Winner"}
                    className="h-4 w-4 object-contain"
                  />
                </picture>
              )}
              <span className="font-chakra text-xs text-[#c7bcab]">
                Ganador: <strong className="text-white">{records.longest_game.winner_name}</strong>
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17] flex items-center justify-between">
            <Link
              href={`/game/${encodeURIComponent(records.longest_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#d8b467] hover:text-white transition-colors"
            >
              <span>Ver Partida Épica</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Record 3: Partida Más Sangrienta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="relative flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-5 hover:border-[#e51b24]/70 hover:shadow-[0_0_20px_rgba(229,27,36,0.15)] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-[#ff7373]">
                <IconSkull size={16} className="text-[#e51b24]" />
                Baño de Sangre Total
              </span>
              <span className="font-mono text-xs text-[#8e857b]">Match Record</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-cinzel text-3xl sm:text-4xl font-black text-[#e51b24]">
                {records.bloodiest_game.total_kills}
              </span>
              <span className="font-chakra text-xs text-[#8e857b]">Bajas Totales</span>
            </div>

            <div className="mt-2 flex items-center gap-3 font-chakra text-xs text-[#c7bcab]">
              <span className="text-[#2e9df0] font-bold">
                Radiant: {records.bloodiest_game.radiant_kills}
              </span>
              <span>vs</span>
              <span className="text-[#e51b24] font-bold">
                Dire: {records.bloodiest_game.dire_kills}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17] flex items-center justify-between">
            <Link
              href={`/game/${encodeURIComponent(records.bloodiest_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#ff7373] hover:text-white transition-colors"
            >
              <span>Ver Masacre</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Record 4: Más Kills en una Sola Partida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="relative flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-5 hover:border-[#e51b24]/70 hover:shadow-[0_0_20px_rgba(229,27,36,0.15)] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-[#ff7373]">
                <IconSwords size={16} className="text-[#e51b24]" />
                Más Kills Individuales
              </span>
              <span className="font-mono text-xs text-[#8e857b]">Jugador</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="font-cinzel text-3xl sm:text-4xl font-black text-white">
                  {records.most_kills_single_game.kills}{" "}
                  <span className="text-lg font-chakra text-[#ff7373]">Kills</span>
                </div>
                <Link
                  href={`/players/${encodeURIComponent(records.most_kills_single_game.player_slug)}`}
                  className="mt-1 font-chakra text-sm font-bold text-[#f0d38f] hover:text-white transition-colors block"
                >
                  {records.most_kills_single_game.nickname}
                </Link>
              </div>

              {/* Hero Portrait */}
              <div className="relative w-12 h-16 border border-[#2d261e] overflow-hidden bg-black/60 shrink-0">
                <picture>
                  <img
                    src={records.most_kills_single_game.hero.image_url}
                    alt={records.most_kills_single_game.hero.hero_name}
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17] flex items-center justify-between">
            <span className="font-chakra text-[11px] text-[#8e857b]">
              {records.most_kills_single_game.hero.hero_name}
            </span>
            <Link
              href={`/game/${encodeURIComponent(records.most_kills_single_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#ff7373] hover:text-white transition-colors"
            >
              <span>Ver Partida</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Record 5: Mayor GPM en una Sola Partida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="relative flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-5 hover:border-[#d8b467]/70 hover:shadow-[0_0_20px_rgba(216,180,103,0.15)] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-[#f0d38f]">
                <IconCoins size={16} className="text-[#d8b467]" />
                Máximo GPM (Oro/Min)
              </span>
              <span className="font-mono text-xs text-[#8e857b]">Jugador</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="font-cinzel text-3xl sm:text-4xl font-black text-[#f0d38f]">
                  {records.highest_gpm_single_game.gpm}{" "}
                  <span className="text-lg font-chakra text-[#d8b467]">GPM</span>
                </div>
                <Link
                  href={`/players/${encodeURIComponent(records.highest_gpm_single_game.player_slug)}`}
                  className="mt-1 font-chakra text-sm font-bold text-white hover:text-[#d8b467] transition-colors block"
                >
                  {records.highest_gpm_single_game.nickname}
                </Link>
              </div>

              {/* Hero Portrait */}
              <div className="relative w-12 h-16 border border-[#2d261e] overflow-hidden bg-black/60 shrink-0">
                <picture>
                  <img
                    src={records.highest_gpm_single_game.hero.image_url}
                    alt={records.highest_gpm_single_game.hero.hero_name}
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17] flex items-center justify-between">
            <span className="font-chakra text-[11px] text-[#8e857b]">
              {records.highest_gpm_single_game.hero.hero_name}
            </span>
            <Link
              href={`/game/${encodeURIComponent(records.highest_gpm_single_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#d8b467] hover:text-white transition-colors"
            >
              <span>Ver Partida</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Record 6: Mayor Daño a Héroes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="relative flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-5 hover:border-[#00c8f8]/70 hover:shadow-[0_0_20px_rgba(0,200,248,0.15)] transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-[#6cc4ff]">
                <IconFlame size={16} className="text-[#00c8f8]" />
                Mayor Daño a Héroes
              </span>
              <span className="font-mono text-xs text-[#8e857b]">Jugador</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="font-cinzel text-3xl sm:text-4xl font-black text-white group-hover:text-[#00c8f8] transition-colors">
                  {formatSpanishCompact(records.highest_damage_single_game.hero_damage)}
                </div>
                <Link
                  href={`/players/${encodeURIComponent(records.highest_damage_single_game.player_slug)}`}
                  className="mt-1 font-chakra text-sm font-bold text-[#f0d38f] hover:text-white transition-colors block"
                >
                  {records.highest_damage_single_game.nickname}
                </Link>
              </div>

              {/* Hero Portrait */}
              <div className="relative w-12 h-16 border border-[#2d261e] overflow-hidden bg-black/60 shrink-0">
                <picture>
                  <img
                    src={records.highest_damage_single_game.hero.image_url}
                    alt={records.highest_damage_single_game.hero.hero_name}
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17] flex items-center justify-between">
            <span className="font-chakra text-[11px] text-[#8e857b]">
              {records.highest_damage_single_game.hero.hero_name} ({records.highest_damage_single_game.hero_damage?.toLocaleString("es-ES")} dmg)
            </span>
            <Link
              href={`/game/${encodeURIComponent(records.highest_damage_single_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#00c8f8] hover:text-white transition-colors"
            >
              <span>Ver Partida</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
