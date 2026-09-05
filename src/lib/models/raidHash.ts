import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/raidHash.js -- same table, same columns.
export class RaidHash extends Model<InferAttributes<RaidHash>, InferCreationAttributes<RaidHash>> {
  declare id: CreationOptional<number>;
  declare hash: string;
  declare guildID: string;
  declare memberID: string;
}

RaidHash.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    hash: { type: DataTypes.STRING, allowNull: false },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
  },
  { sequelize, modelName: "raid_hash", tableName: "raid_hashes" }
);
