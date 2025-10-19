import { createUserDetails, getUserByUserId } from "@/db/utils/userUtils";
import CustomErrorHandler from "@/utils/ErrorHandler";
import { UploadToImagekit } from "@/utils/ImagekitConfig";
import { IMAGEKIT_PROFILE_FOLDERPATH } from "@/utils/StaticContents";
import { validateOnboarding } from "@/utils/Validators/account.validate";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {

    // Cheking the user is authorize or not
    const { userId } = await auth();
    if (!userId) {
      return Response.json({
        success: false,
        message: "Unauthorize user"
      }, { status: 401 });
    }

    // Retrive form data from request
    const formData = await request.formData();

    const profileImage = formData.get("profileImage") as File;
    const firstName = formData.get("firstName") as string
    const lastName = formData.get('lastName') as string
    const bio = formData.get('bio') as string
    const dob = formData.get('dob') as string
    const country = formData.get('country') as string

    // Validate mandatory fields
    validateOnboarding({
      firstName,
      bio,
      country
    })


    /**
     * Before saving user details into database. First we chechk if userId exist in the database or not
     * If not exist then delete the user from clerk system
     */

    const existingUser = await getUserByUserId(userId)

    // If user not exist in the database
    if (!existingUser) {

      // Deleting user from clerk system
      (await clerkClient()).users.deleteUser(userId)

      // Returning the response to signup again
      return Response.json({
        success: false,
        message: "User not registered in the server. Signup again",
        action: 'redirect',
        url: '/sign-up'
      }, { status: 409 });
    }


    let imagekitResponse = null;

    // Check if the file is not null
    if (profileImage && profileImage.name != '') {
      // Check if the file type is image
      if (profileImage.type.startsWith('image')) {
        // Specify the folder path and file name
        const folderPath = IMAGEKIT_PROFILE_FOLDERPATH;
        const fileName = userId || `${Math.floor(Math.random() * 10000000)}`;

        // Upload the image to imagekit
        imagekitResponse = await UploadToImagekit({
          file: profileImage,
          fileName: fileName,
          folderPath: folderPath
        })

      } else {
        return Response.json({
          success: false,
          message: "Invalid file type. Please upload a valid image file."
        }, { status: 401 });
      }
    }

    // Save the user data into the database
    const savedUserDetails = await createUserDetails({
      userId,
      firstName,
      lastName,
      bio,
      dob,
      country,
      profilePic: imagekitResponse?.url
    })

    // Check if the user details are saved successfully
    if (!savedUserDetails) {
      return Response.json({
        success: false,
        message: "An error occurs while saving information."
      }, { status: 500 });
    }

    // Return success response
    return Response.json({
      success: true,
      message: "User Details saved successfully."
    }, { status: 200 });


  } catch (error: any) {

    console.error("Error in onboarding user:", error);
    // Handle custom error
    if (error instanceof CustomErrorHandler) {
      return Response.json({
        success: false,
        message: error.message || "Something went wrong. Please try again",
      },
        { status: error.statusCode || 500 }
      )
    }

    // Handle other errors
    return Response.json({
      success: false,
      message: "Something went wrong. Please try again",
    },
      { status: 500 }
    )
  }
}