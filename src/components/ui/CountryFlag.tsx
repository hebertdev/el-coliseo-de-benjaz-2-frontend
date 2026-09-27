"use client";

interface CountryFlagProps {
  countryCode?: string | null;
  className?: string;
  showCode?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

/**
 * Convierte un código de país ISO 2 letras en emoji o bandera visual.
 */
export function getCountryFlagEmoji(countryCode?: string | null): string {
  if (!countryCode || countryCode.trim().length !== 2) return "🌐";
  const code = countryCode.toUpperCase().trim();
  const codePoints = [...code].map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

export function CountryFlag({
  countryCode,
  className = "",
  showCode = false,
  size = "sm",
}: CountryFlagProps) {
  if (!countryCode) return null;

  const code = countryCode.trim().toUpperCase();
  const lowerCode = code.toLowerCase();

  const imgDimensions = {
    xs: "w-3.5 h-2.5",
    sm: "w-4 h-3",
    md: "w-5 h-3.5",
    lg: "w-6 h-4",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle select-none ${className}`}
      title={`País: ${code}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w40/${lowerCode}.png`}
        alt={code}
        className={`inline-block rounded-[1.5px] object-cover shadow-sm border border-black/40 shrink-0 ${imgDimensions}`}
        loading="lazy"
      />
      {showCode && (
        <span className="font-mono text-[10px] uppercase font-bold text-[#d8d2c7]">
          {code}
        </span>
      )}
    </span>
  );
}
