import CustomErrorHandler from "@/utils/helpers/ErrorHandler";
import { UploadToImagekit } from "@/utils/libs/ImagekitConfig";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    console.log(file);
    if (!file.type.startsWith('image')) {
      return Response.json({
        jj: "lol"
      }, { status: 500 })
    }


    const uploadResponse = await UploadToImagekit({
      file: file,
      fileName: 'test_name',
      folderPath: 'folderPath'
    });

    console.log(uploadResponse);

    return Response.json({
      jj: "hello"
    })

  } catch (error: any) {

    if(error instanceof CustomErrorHandler){
      return Response.json({
        jj: error.message ?? "lol"
      }, { status: 500 })
    }

    console.log(error);
    return Response.json({
      jj: "lol"
    }, { status: 500 })
  }

}