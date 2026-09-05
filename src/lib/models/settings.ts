import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/settings.js -- same table, same columns.
export class Settings extends Model<InferAttributes<Settings>, InferCreationAttributes<Settings>> {
  declare id: CreationOptional<number>;
  declare guildID: string;
  declare faction: CreationOptional<string | null>;
  declare server: CreationOptional<string | null>;
  declare multifaction: CreationOptional<boolean | null>;
  declare classrole: CreationOptional<boolean | null>;
  declare completerole: CreationOptional<string | null>;
  declare sheet: CreationOptional<string | null>;
  declare warcraftlogskey: CreationOptional<string | null>;
  declare expansion: CreationOptional<string | null>;
  declare raidcategory: CreationOptional<string | null>;
  declare welcomeMessage: CreationOptional<string | null>;
}

Settings.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    guildID: { type: DataTypes.BIGINT, allowNull: false },
    faction: { type: DataTypes.STRING, allowNull: true },
    server: { type: DataTypes.STRING, allowNull: true },
    multifaction: { type: DataTypes.BOOLEAN, allowNull: true },
    classrole: { type: DataTypes.BOOLEAN, allowNull: true },
    completerole: { type: DataTypes.STRING, allowNull: true },
    sheet: { type: DataTypes.STRING, allowNull: true },
    warcraftlogskey: { type: DataTypes.STRING, allowNull: true },
    expansion: { type: DataTypes.STRING, allowNull: true },
    raidcategory: { type: DataTypes.STRING, allowNull: true },
    welcomeMessage: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "settings", tableName: "settings" }
);
