import { createUser, getUserByEmail, getUserByUsername } from "@/db/repository/userRepository";
import bcrypt from "bcrypt";

// This function used to register a new user
export async function POST(req: Request) {
  try {

    // Retrive the user data from the request body
    const {
      userId,
      userName,
      email,
      password,
    } = await req.json();

    // Check if the user already exist by email
    const userExistByEmail = await getUserByEmail(email)

    if (userExistByEmail) {
      return Response.json({
        success: false,
        message: "This email is already exist"
      }, {status: 409})
    }

    // Check if the user already exist by username
    const userExistByUsername = await getUserByUsername(userName)

    if (userExistByUsername) {
      return Response.json({
        success: false,
        message: "This user name is aledy exist"
      }, {status: 409})
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creating a new user
    const newUser = await createUser({
      id: userId,
      email,
      userName,
      password: hashedPassword
    })
  
    // Check if the new user is created
    if (!newUser) {
      return Response.json({
        success: false,
        message: "Error while creating new user"
      }, {status: 500})
    }

    // Returning the success message
    return Response.json({
        success: true,
        message: "User created successfully."
      }, {status: 201})

  } catch (error: any) {
    console.error(error);

    // Returning the error message
    return Response.json({
      success: false,
      message: "Error while creating new user"
    }, {status: 500})
  }
}