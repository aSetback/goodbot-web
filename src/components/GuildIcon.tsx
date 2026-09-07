import { guildIconUrl, type DiscordGuild } from "@/lib/discord";

export function GuildIcon({
  guild,
  size = 72,
}: {
  guild: Pick<DiscordGuild, "id" | "icon" | "name">;
  size?: number;
}) {
  const src = guildIconUrl(guild);
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-zinc-200 text-lg font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      >
        {guild.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external Discord CDN, not a local asset
    <img
      src={src}
      alt={`${guild.name} icon`}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}
