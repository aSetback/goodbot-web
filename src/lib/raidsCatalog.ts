// Mirrors RaidController::getRaids() -- the raid types offered in the
// /raids/new dropdown (Classic + TBC only, same as the PHP site).
export const RAIDS_CATALOG: Record<string, Record<string, string>> = {
  Classic: {
    mc: "Molten Core",
    ony: "Onyxia",
    bwl: "Blackwing Lair",
    zg: "Zul'Gurub",
    aq40: "Temple of Ahn'Qiraj",
    aq20: "Ruins of Ahn'Qiraj",
    naxx: "Naxxramas",
  },
  "Burning Crusade": {
    kara: "Karazhan",
    gl: "Gruul's Lair",
    ssc: "Serpentshrine Cavern",
    tk: "Tempest Keep",
    bt: "Black Temple",
    sw: "Sunwell",
  },
};

// Mirrors the (larger, all-expansion) instance name map in the GoodBot bot's
// functions/embed.js -- used just for display, since raids created via the
// bot's free-text /raid modal aren't limited to the dropdown list above.
const INSTANCE_NAMES: Record<string, string> = {
  mc: "Molten Core",
  ony: "Onyxia",
  aq40: "Temple of Ahn'Qiraj",
  aq20: "Ruins of Ahn'Qiraj",
  naxx: "Naxxramas",
  bwl: "Blackwing Lair",
  zg: "Zul'Gurub",
  kz: "Karazhan",
  kara: "Karazhan",
  gruul: "Gruul's Lair",
  gl: "Gruul's Lair",
  ssc: "Serpentshrine Cavern",
  tk: "Tempest Keep",
  sw: "Sunwell",
  bt: "Black Temple",
  voa: "Vault of Archavon",
  os: "Obsidian Sanctum",
  eoe: "Eye of Eternity",
  uld: "Ulduar",
  toc: "Trial of the Crusader",
  icc: "Icecrown Citadel",
  ny: "Ny'alotha",
  bwd: "Blackwing Descent",
  bot: "The Bastion of Twilight",
  tofw: "Throne of the Four Winds",
  bh: "Baradin Hold",
  fl: "Firelands",
  ds: "Dragon Soul",
};

export function raidTypeName(raidKey: string): string {
  const key = raidKey.toLowerCase();
  if (INSTANCE_NAMES[key]) return INSTANCE_NAMES[key];
  return raidKey.charAt(0).toUpperCase() + raidKey.slice(1).toLowerCase();
}

// Mirrors the raid-type abbreviation aliases in the bot's /raid modal
// handler (slashcommands/raid/raid.js) -- applied to whatever the user
// typed before it's stored, so e.g. "Karazhan" and "KZ" both end up as
// the "kara" key the rest of the app (including INSTANCE_NAMES above)
// expects.
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
