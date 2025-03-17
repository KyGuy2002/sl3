import type { ServerLinkType } from "@/pages/api/server/utils";
import { int, sqliteTable, text, primaryKey, blob, uniqueKeyName, unique } from "drizzle-orm/sqlite-core";

export const serversTable = sqliteTable("servers", {
  id: text().notNull().primaryKey(),
  name: text().notNull().unique(),
  desc: text().notNull(),
  javaIp: text().unique(),
  bedrockIp: text().unique(),
  onlinePlayers: int().notNull(),
  versionStart: text().notNull(),
  versionEnd: text(),
  created: int().notNull(),
  lastUpdated: int().notNull(),
  online: int({ mode: 'boolean' }).notNull(),
  logoUrl: text(),
  bannerUrl: text(),
  ipVisible: int({ mode: "boolean" }).notNull(),
  links: text({ mode: "json" }).notNull().$type<ServerLinkType[]>(),

  scrapedSource: text(),
  scrapedTime: int(),
  scrapedId: text({ mode: "json" }).unique()

});


export const serverModesTable = sqliteTable("server_modes", {
  serverId: text().notNull().references(() => serversTable.id),
  modeId: text().notNull().references(() => allModesTable.id),
  cardDesc: text().notNull(),
  fullDesc: text().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.serverId, table.modeId] })
  };
});


export const serverModesTagsTable = sqliteTable("server_modes_tags", {
  serverId: text().notNull().references(() => serversTable.id),
  modeId: text().notNull().references(() => allModesTable.id),
  tagId: text().notNull().references(() => allTagsTable.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.serverId, table.modeId, table.tagId] })
  };
});


export const allTagsTable = sqliteTable("all_tags", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  desc: text().notNull(),
  modeId: text().notNull().references(() => allModesTable.id),
  type: text().notNull(),
  aka: text({ mode: "json" }).notNull().$type<string[]>(),
}, (table) => {
  return {
    uk: unique("name-mode").on(table.name, table.modeId)
  };
});


export const allModesTable = sqliteTable("all_modes", {
  id: text().notNull().primaryKey(),
  name: text().notNull().unique(),
  desc: text().notNull(),
  aka: text({ mode: "json" }).notNull().$type<string[]>(),
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


/**
 * This is a one to many relationship.
 * For each foreign tag, we can have multiple of our tags.
 * If there are multiple of our tags for a single foreign tag,
 * it means that the foreign tag is ambiguous and CAN map to multiple of our tags.
 * The scraping logic will ONLY include these tags if their parent mode is already found another way.
 * If there is only one, then it is a direct mapping and the parent mode will be added additionally if not already found.
 * <br/>
 * This is stored as a row for each of these relationships.
 */
export const foreignTagMap = sqliteTable("foreign_tag_map", {
  ourId: text().notNull().references(() => allTagsTable.id),
  theirId: text().notNull(),
  website: text().notNull()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.ourId, table.theirId] })
  };
});


/**
 * This is a one to one relationship.
 * For each foreign mode, we can have one of our modes.
 */
export const foreignModeMap = sqliteTable("foreign_mode_map", {
  ourId: text().notNull().references(() => allModesTable.id),
  theirId: text().notNull().primaryKey(),
  website: text().notNull()
});