import { int, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

export const serversTable = sqliteTable("servers", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  desc: text().notNull(),
  ip: text().notNull(),
  onlinePlayers: int().notNull(),
  versionStart: text().notNull(),
  versionEnd: text().notNull(),
  created: int().notNull(),
  lastUpdated: int().notNull(),
  online: int({ mode: 'boolean' }).notNull(),
});


export const modesTable = sqliteTable("server_modes", {
  id: text().notNull().references(() => serversTable.id),
  mode: text().notNull(),
  tags: text({ mode: "json" }).notNull(),
  cardDesc: text().notNull(),
  fullDesc: text().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.id, table.mode] })
  };
});


export const allTagsTable = sqliteTable("all_tags", {
  name: text().notNull(),
  tooltipDesc: text().notNull(),
  mode: text(),
  isMode: int({ mode: 'boolean' }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.name, table.mode] })
  };
});


export const accountsTable = sqliteTable("accounts", {
  id: text().notNull().primaryKey(),
  
});