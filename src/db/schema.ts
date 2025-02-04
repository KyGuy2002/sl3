import { int, sqliteTable, text, primaryKey, blob, uniqueKeyName, unique } from "drizzle-orm/sqlite-core";

export const serversTable = sqliteTable("servers", {
  id: text().notNull().primaryKey(),
  name: text().notNull().unique(),
  desc: text().notNull(),
  ip: text().notNull(),
  onlinePlayers: int().notNull(),
  versionStart: text().notNull(),
  versionEnd: text().notNull(),
  created: int().notNull(),
  lastUpdated: int().notNull(),
  online: int({ mode: 'boolean' }).notNull(),

  logoUrl: text(),
  bannerUrl: text(),
});


export const serverModesTable = sqliteTable("server_modes", {
  serverId: text().notNull().references(() => serversTable.id),
  modeId: text().notNull().references(() => allModesTable.id),
  tags: text({ mode: "json" }).notNull(),
  cardDesc: text().notNull(),
  fullDesc: text().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.serverId, table.modeId] })
  };
});


export const allTagsTable = sqliteTable("all_tags", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  desc: text().notNull(),
  modeId: text().notNull().references(() => allModesTable.id),
  type: text().notNull(),
  aka: text({ mode: "json" }).notNull(),
}, (table) => {
  return {
    uk: unique("name-mode").on(table.name, table.modeId)
  };
});


export const allModesTable = sqliteTable("all_modes", {
  id: text().notNull().primaryKey(),
  name: text().notNull().unique(),
  desc: text().notNull(),
  aka: text({ mode: "json" }).notNull(),
});


export const accountsTable = sqliteTable("accounts", {
  id: text().notNull().primaryKey(),
  username: text().notNull(),
  createdAt: int().notNull()
});


export const passkeysTable = sqliteTable("passkeys", {
  id: text().notNull().references(() => accountsTable.id),
  credId: text().notNull().primaryKey(),
  credPublicKey: blob().notNull(),
  transports: text({ mode: "json" }).notNull(),
  counter: int().notNull(),
  deviceType: text().notNull(),
  backedUp: int({ mode: 'boolean' }).notNull(),
  createdAt: int().notNull(),
  lastUsed: int(),
});


export const passkeyChallengesTable = sqliteTable("passkey_challenges", {
  challenge: text().notNull().primaryKey(),
  expires: int().notNull(),
});


export const embedCache = sqliteTable("embed_cache", {
  hash: text().notNull().primaryKey(),
  vector: text({ mode: "json" }).notNull(),
});