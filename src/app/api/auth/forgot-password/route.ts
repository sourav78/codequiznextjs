import { resetPassword } from "@/db/utils/userUtils";
import bcrypt from "bcrypt";

export async function POST(req: Request){
  try{
    // Retrive the email and password from the request body
    const {email, password} = await req.json();

    // Check if the email and password is provided
    if(!email || !password){
      console.log("Error");
      
      return Response.json({
        success: false,
        message: "Please provide all the required fields."
      }, {status: 400})
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Resetting the password
    await resetPassword(email, hashedPassword)

    // Returning the success message
    return Response.json({
      success: true,
      message: "Password reset successfully."
    }, {status: 200})

  }catch(error: any){
    console.error(error);
    return Response.json({
      success: false,
      message: error?.message ?? "Something went wrong. Please try again later."
    }, {status: 500})
  }
}