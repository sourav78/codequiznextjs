import { boolean, date, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


// This is the schema for the users table
export const users = pgTable("users", {

  // Primary key
  id: varchar("id", { length: 50 }).primaryKey().notNull(),

  // User fields
  userName: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }),

  // Verification fields
  isAdmin: boolean("is_admin").default(false).notNull(),

  // timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


// This is the schema for the user_info table
// This table contains additional information about the user
export const userInfo = pgTable("user_info", {

  // Primary key
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  // Foreign key
  // This is a reference to the users table
  userId: varchar("user_id", { length: 50 }).unique().notNull().references(() => users.id),

  // User info fields
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }),

  // Optional fields
  bio: text("bio"),
  profilePic: varchar("profile_picture", { length: 255 }),
  dob: date("dob"),
  country: varchar("country", { length: 50 }),

  // timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const userRelations = relations(users, ({ one }) => ({
  userInfo: one(userInfo),
}));



// 

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type UserInfo = typeof userInfo.$inferSelect;
export type UserInfoInsert = typeof userInfo.$inferInsert;