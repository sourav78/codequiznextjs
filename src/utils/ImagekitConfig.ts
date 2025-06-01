import ImageKit from "imagekit";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import IKResponse from "imagekit/dist/libs/interfaces/IKResponse";
import CustomErrorHandler from "./ErrorHandler";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

/**
 * Uploads a file to ImageKit.
 * 
 * @param {Object} params - The parameters for the upload.
 * @param {string} params.folderPath - The folder path in ImageKit where the file will be uploaded.
 * @param {File} params.file - The file to be uploaded.
 * @param {string} params.fileName - The name of the file to be uploaded.
 * @returns {Promise<IKResponse<UploadResponse>>} - A promise that resolves to the upload response from ImageKit.
 */
export const UploadToImagekit = async ( 
    {
      folderPath, 
      file, 
      fileName
    }:{
      folderPath:string, 
      file: File, 
      fileName:string
    }
  ):Promise<IKResponse<UploadResponse>> => {
  try{

    // Convert the file to a Buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload the file to ImageKit
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folderPath,
      useUniqueFileName: false,
    })

    //
    if(!uploadResponse || !uploadResponse.url) {
      throw new CustomErrorHandler("Image upload failed", 500);
    }

    // Return the upload response
    return uploadResponse;

  }catch(error:any){

    
    // Log the error for debugging
    console.error("Error uploading image to ImageKit:", error);

    // If the error is an instance of CustomErrorHandler, rethrow it
    if (error instanceof CustomErrorHandler) {
      throw error;
    }

    // Throw a custom error with a message
    throw new CustomErrorHandler("Error while uploading image")
  }
}