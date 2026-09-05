import { Raid } from "@/lib/models/raid";
import { Signup } from "@/lib/models/signup";
import { RaidReserve } from "@/lib/models/raidReserve";
import { ReserveItem } from "@/lib/models/reserveItem";
import { Character } from "@/lib/models/character";

Signup.hasOne(RaidReserve, { as: "reserve", sourceKey: "id", foreignKey: "signupID" });
RaidReserve.belongsTo(Signup, { foreignKey: "signupID" });

RaidReserve.belongsTo(ReserveItem, { as: "item", targetKey: "id", foreignKey: "reserveItemID" });

export { Raid, Signup, RaidReserve, ReserveItem, Character };
