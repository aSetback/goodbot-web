// Mirrors RaidController::getRaids() -- the raid types available when
// creating/editing a raid, grouped by expansion.
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

const RAID_TYPE_NAMES: Record<string, string> = Object.fromEntries(
  Object.values(RAIDS_CATALOG).flatMap((raids) => Object.entries(raids))
);

export function raidTypeName(raidKey: string): string {
  return RAID_TYPE_NAMES[raidKey.toLowerCase()] ?? raidKey;
}
