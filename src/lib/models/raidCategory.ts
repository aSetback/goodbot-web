import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/raidCategory.js -- same table, same columns.
export class RaidCategory extends Model<InferAttributes<RaidCategory>, InferCreationAttributes<RaidCategory>> {
  declare id: CreationOptional<number>;
  declare raid: string;
  declare category: string;
  declare faction: CreationOptional<string | null>;
  declare guildID: string;
  declare memberID: string;
}

RaidCategory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    raid: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    faction: { type: DataTypes.STRING, allowNull: true },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    memberID: { type: DataTypes.BIGINT, allowNull: false },
  },
  { sequelize, modelName: "raid_category", tableName: "raid_categories" }
);
