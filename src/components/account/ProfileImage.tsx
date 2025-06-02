import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react'
import { CameraIcon } from 'lucide-react'
import Image from 'next/image'
import React, { Dispatch, useState } from 'react'
import Cropper from "react-easy-crop";

const ProfileImage = ({setImageContainer}:{setImageContainer:Dispatch<React.SetStateAction<File | null>>}) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loadedImage, setLoadedImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('https://ik.imagekit.io/spaceship/codequiz/user/profile_image/9440461.jpg?updatedAt=1748865130986')

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1 / 1);

  const handleImageChange = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);
      console.log(event.target.files[0]);
      

      reader.onload = (e) => {
        setLoadedImage(reader.result as string);
        onOpen()
      };
    }
  };

  const onCropComplete = (_croppedAreaPercent: any,
    croppedAreaPixels: { x: number; y: number; width: number; height: number}) => {
    setCroppedArea(croppedAreaPixels)
  };

  const onCropDone = (imgCropedArea: any) => {

    if (!croppedArea || !loadedImage) {
      // If user never dragged or no image loaded, just return
      console.log("not done");
      
      return;
    }

    const canvasEle = document.createElement("canvas");
    canvasEle.width = imgCropedArea.width;
    canvasEle.height = imgCropedArea.height;

    const context = canvasEle.getContext("2d");

    let imageObj = new window.Image();

    imageObj.src = loadedImage as string;
    imageObj.onload = () => {
      context?.drawImage(
        imageObj,
        imgCropedArea.x,
        imgCropedArea.y,
        imgCropedArea.width,
        imgCropedArea.height,
        0,
        0,
        imgCropedArea.width,
        imgCropedArea.height
      );

      canvasEle.toBlob((blob) => {
        const blobToImageFile = new File([blob!], "destination.jpg", {
          type: "image/jpeg",
        });

        console.log(blobToImageFile);

        setImageContainer(blobToImageFile); // Setting the Blob in state

      }, "image/jpeg");

      const dataUrl = canvasEle.toDataURL("image/jpeg");
      setImageUrl(dataUrl);

      setLoadedImage(null)
      onClose()
    };
  };

  const onCropCancel = () => {
    onClose()
    setLoadedImage(null)
  };

  return (
    <div>
      <div className="p-3 flex justify-center">
        <div className="relative">
          <span
            className='rounded-full overflow-hidden '
          >
            <img
              src={imageUrl}
              alt='profile iamge'
              width={150}
              height={150}
              className='rounded-full border-gray-500 border-2'
            />
          </span>

          <label
            htmlFor='profImage'
            className='absolute right-2 bottom-2 bg-primary w-8 h-8 rounded-full border-2 flex justify-center items-center cursor-pointer hover:bg-blue-600 transition-all'
          >
            <CameraIcon className='text-white w-4 h-4' />
          </label>
          <input
            id='profImage'
            type="file"
            className='hidden'
            onChange={handleImageChange}
            accept=".png,.jpg,.jpeg,.webp" // Accepts only png, jpeg, and webp images
          />
        </div>
      </div>
      <Modal isOpen={isOpen} size={"xl"} onClose={onClose}
        className='font-poppins'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
              <ModalBody>
                <div className="h-[400px] relative">

                  <Cropper
                    image={loadedImage!}
                    aspect={aspectRatio}
                    crop={crop}
                    zoom={zoom}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{
                      containerStyle: {
                        width: "100%",
                        height: "400px",
                        backgroundColor: "white",
                        position: "absolute",
                        top: "0"
                      },
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onCropCancel}>
                  Close
                </Button>
                <Button color="primary" onPress={() => onCropDone(croppedArea)}>
                  Crop
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ProfileImage