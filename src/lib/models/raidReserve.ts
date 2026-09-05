import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from "sequelize";
import { sequelize } from "@/lib/db";
import type { ReserveItem } from "@/lib/models/reserveItem";

// Mirrors the GoodBot bot's models/raidReserve.js -- same table, same columns.
export class RaidReserve extends Model<InferAttributes<RaidReserve>, InferCreationAttributes<RaidReserve>> {
  declare id: CreationOptional<number>;
  declare raidID: string;
  declare reserveItemID: number;
  declare signupID: number;
  declare memberID: string;

  declare item?: NonAttribute<ReserveItem>;
}

RaidReserve.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    raidID: { type: DataTypes.BIGINT, allowNull: false },
    reserveItemID: { type: DataTypes.INTEGER, allowNull: false },
    signupID: { type: DataTypes.INTEGER, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
  },
  { sequelize, modelName: "raid_reserve", tableName: "raid_reserves" }
);
