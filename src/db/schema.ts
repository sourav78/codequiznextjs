import { boolean, date, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


// This is the schema for the users table
export const users = pgTable("users", {

  // Primary key
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  // User fields
  userName: varchar("name", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 50 }),

  // Verification fields
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationCode: varchar("verification_code", { length: 6 }),

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
  userId: uuid("user_id").unique().notNull().references(() => users.id),

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

export const User = typeof users.$inferSelect;
export const UserInsert = typeof users.$inferInsert;

export const UserInfo = typeof userInfo.$inferSelect;
export const UserInfoInsert = typeof userInfo.$inferInsert;