import { eq } from "drizzle-orm";
import { db } from "..";
import { users, UserInsert, User } from "../schema";


// Creating a new user using drizzle
export async function createUser(user: UserInsert): Promise<User> {
  try {

    // Insert user into database
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();

      // Returning the registerd user
    return newUser;

  } catch (error: any) {

    console.log(error);

    // Cheking if the error type is duplication error
    if (error?.code === "23505") {
      const details: string = error.details ?? ''

      if (details.includes("email")) {
        throw new Error("Email already exists");
      }

      if (details.includes("username")) {
        throw new Error("Username already exists");
      }
    }

    // Throwing the default error message
    throw new Error("Error creating user");
  }
}

// This function used to get user by username
export async function getUserByUsername(userName: string): Promise<User | null> {
  try {

    // Retrive user from database equal to the username
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.userName, userName))

      // Returning the user
    return newUser[0] ?? null
  }catch(error:any){
    // Throwing the error
    throw new Error("Error while retriving user by username")
  }
}

// This function used to get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {

    // Retrive user from database equal to the email
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

      // Returning the user
    return newUser[0] ?? null
  }catch(error:any){
    
    // Throwing the error
    throw new Error("Error while retriving user by email")
  }
}

export async function resetPassword(email: string, newPassword: string) {
  try {
    
    // Update the password in the database
    await db
      .update(users)
      .set({
        password: newPassword
      })
      .where(eq(users.email, email))

  } catch (error: any) {
    console.error(error);
    // Throwing the error
    throw new Error("Error while resetting password")
  }
}