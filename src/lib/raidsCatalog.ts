// Mirrors the instance names in the GoodBot bot's functions/embed.js,
// grouped by expansion so the raid-type dropdown can be scoped to whatever
// a guild's Settings.expansion says they're currently raiding.
export const EXPANSION_RAIDS: Record<string, Record<string, string>> = {
  classic: {
    mc: "Molten Core",
    ony: "Onyxia",
    bwl: "Blackwing Lair",
    zg: "Zul'Gurub",
    aq40: "Temple of Ahn'Qiraj",
    aq20: "Ruins of Ahn'Qiraj",
    naxx: "Naxxramas",
  },
  tbc: {
    kara: "Karazhan",
    gl: "Gruul's Lair",
    ssc: "Serpentshrine Cavern",
    tk: "Tempest Keep",
    bt: "Black Temple",
    sw: "Sunwell",
  },
  wotlk: {
    voa: "Vault of Archavon",
    os: "Obsidian Sanctum",
    eoe: "Eye of Eternity",
    uld: "Ulduar",
    toc: "Trial of the Crusader",
    icc: "Icecrown Citadel",
  },
  cata: {
    bwd: "Blackwing Descent",
    bot: "The Bastion of Twilight",
    tofw: "Throne of the Four Winds",
    bh: "Baradin Hold",
    fl: "Firelands",
    ds: "Dragon Soul",
  },
};

// Options for the dashboard settings page's Expansion field. Deliberately
// omits "Battle for Azeroth"/"Shadowlands" (options the old setup wizard
// offered) -- the bot has no raid content past Cataclysm, so picking either
// would leave the raid-type dropdown empty.
export const EXPANSION_LABELS: Record<string, string> = {
  classic: "Classic",
  tbc: "Burning Crusade",
  wotlk: "Wrath of the Lich King",
  cata: "Cataclysm",
};

const ALL_RAID_NAMES: Record<string, string> = Object.assign(
  { ny: "Ny'alotha" }, // a leftover in embed.js's own map that doesn't fit any tier above
  ...Object.values(EXPANSION_RAIDS)
);

export function raidTypeName(raidKey: string): string {
  const key = raidKey.toLowerCase();
  if (ALL_RAID_NAMES[key]) return ALL_RAID_NAMES[key];
  return raidKey.charAt(0).toUpperCase() + raidKey.slice(1).toLowerCase();
}

export type RaidTypeOption = { value: string; label: string };

// The raid types to offer for a guild's configured expansion -- every raid
// across all tiers if the expansion isn't set (or isn't one we recognize),
// so nothing regresses to an empty dropdown for guilds that haven't set one.
export function raidOptionsForExpansion(expansion: string | null | undefined): RaidTypeOption[] {
  const key = expansion?.toLowerCase().trim();
  const raids = (key && EXPANSION_RAIDS[key]) || Object.assign({}, ...Object.values(EXPANSION_RAIDS));
  return Object.entries(raids as Record<string, string>).map(([value, label]) => ({ value, label }));
}

// Mirrors the raid-type abbreviation aliases in the bot's /raid modal
// handler (slashcommands/raid/raid.js) -- applied to whatever the user
// typed before it's stored, so e.g. "Karazhan" and "KZ" both end up as
// the "kara" key the rest of the app (including raidTypeName above) expects.
const RAID_TYPE_ALIASES: Record<string, string> = {
  KZ: "KARA",
  KARAZHAN: "KARA",
  GRUUL: "GL",
  MAG: "ML",
  HYJAL: "MH",
};

export function normalizeRaidType(raidType: string): string {
  const upper = raidType.trim().toUpperCase();
  return (RAID_TYPE_ALIASES[upper] ?? upper).toLowerCase();
}
