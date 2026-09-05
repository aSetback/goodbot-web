import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db";

// Mirrors the GoodBot bot's models/reserveItem.js -- same table, same columns.
export class ReserveItem extends Model<InferAttributes<ReserveItem>, InferCreationAttributes<ReserveItem>> {
  declare id: CreationOptional<number>;
  declare raid: string;
  declare name: string;
  declare itemID: string | null;
}

ReserveItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    raid: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    itemID: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "reserve_item", tableName: "reserve_items" }
);
