import { Raid } from "@/lib/models/raid";
import { Signup } from "@/lib/models/signup";
import { RaidReserve } from "@/lib/models/raidReserve";
import { ReserveItem } from "@/lib/models/reserveItem";
import { Character } from "@/lib/models/character";
import { Settings } from "@/lib/models/settings";
import { RaidCategory } from "@/lib/models/raidCategory";
import { RaidHash } from "@/lib/models/raidHash";
import { Log } from "@/lib/models/log";
import { Guild } from "@/lib/models/guild";

Signup.hasOne(RaidReserve, { as: "reserve", sourceKey: "id", foreignKey: "signupID" });
RaidReserve.belongsTo(Signup, { foreignKey: "signupID" });

RaidReserve.belongsTo(ReserveItem, { as: "item", targetKey: "id", foreignKey: "reserveItemID" });

Signup.belongsTo(Character, { as: "character", targetKey: "id", foreignKey: "characterID" });

export { Raid, Signup, RaidReserve, ReserveItem, Character, Settings, RaidCategory, RaidHash, Log, Guild };
