"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { userOnboardSchema } from "../../../schemas/userOnboardSchema";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { AuthApiResponse } from "@/types/AuthApiResponse";
import { ErrorToast, SuccessToast } from "../ui/ShowToast";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { Avatar, DatePicker, Select, SelectItem, Textarea } from "@heroui/react";
import { Countries } from "@/utils/StaticContents";
import ProfileImage from "./ProfileImage";
import { useClerk } from "@clerk/nextjs";

type FormValues = z.infer<typeof userOnboardSchema>;

const OnboardingForm = () => {
  const router = useRouter();

  const {signOut} = useClerk()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(userOnboardSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      country: "",
      dob: null, // initialize as null (matching DatePicker's DateValue | null)
    },
  });

  const [cropedProfilePicture, setCropedProfilePicture] =
    useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);


    try {
      const formData = new FormData();
      if (cropedProfilePicture) {
        // Check if the file size is greater than 1MB
        if (cropedProfilePicture.size > (1024 * 1024)) {
          ErrorToast("Profile image size should be less than 1MB");
          return;
        } else {
          formData.append("profileImage", cropedProfilePicture);
        }
      }
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName ?? "");
      formData.append("bio", data.bio);
      // If dob is a Date object or DateValue, convert to ISO string (adjust as needed)
      if (data.dob) {
        formData.append("dob", data.dob);
      }
      formData.append("country", data.country);

      // console.log(formData.get("country"));


      const response = await axios.post<AuthApiResponse>(
        "/api/account/onboarding-user",
        formData
      );

      SuccessToast(response.data.message || "User details saved successfully");
      router.push("/"); // On success, navigate to the home page

    } catch (error: any) {

      console.log(error);

      const responseData = error.response?.data as AuthApiResponse;

      // Check for the specific redirect action from your API
      if (responseData?.action === "redirect" && responseData?.url) {
        ErrorToast(responseData.message);
        signOut({ redirectUrl: "/sign-up" })
      } else {
        // Handle all other API errors
        ErrorToast(
          responseData?.message || "Failed to save the details. Try again"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Card className="bg-white dark:bg-card-dark gap-0 max-w-3xl w-full lg:w-[500px] rounded">
        <CardHeader className="p-0 pt-8 px-4 sm:px-10 w-full">
          <h4 className="font-roboto font-bold text-2xl">Onboarding you</h4>
        </CardHeader>
        <CardBody className="overflow-visible pb-2 px-4 sm:px-10 w-full">

          <div className="">
            <ProfileImage setImageContainer={setCropedProfilePicture} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium text-default-900">
                First Name
              </label>
              <Input
                id="first_name"
                type="text"
                radius="sm"
                variant="bordered"
                isInvalid={!!errors.firstName}
                errorMessage={errors.firstName?.message}
                {...register("firstName")}
                className="w-full mt-1"
                size="lg"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium text-default-900">
                Last Name
              </label>
              <Input
                id="last_name"
                type="text"
                radius="sm"
                variant="bordered"
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName?.message}
                {...register("lastName")}
                className="w-full mt-1"
                size="lg"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-default-900">
                Bio
              </label>
              <Textarea
                id="bio"
                placeholder="Enter your description"
                variant="bordered"
                radius="sm"
                isInvalid={!!errors.bio}
                errorMessage={errors.bio?.message}
                classNames={{
                  input: "border-none focus:outline-none",
                }}
                {...register("bio")}
                className="w-full"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label htmlFor="dob" className="text-sm font-medium text-default-900">
                Birth date
              </label>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="dob"
                    value={field.value}
                    onChange={(newDate) => field.onChange(newDate)}
                    onBlur={field.onBlur}
                    className="w-full"
                    variant="bordered"
                    size="lg"
                    radius="sm"
                    showMonthAndYearPickers
                    classNames={{ calendarContent: "font-poppins dark:bg-black bg-white" }}
                    isInvalid={!!errors.dob}
                    errorMessage={errors.dob?.message as React.ReactNode}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="Country" className="text-sm font-medium text-default-900">
                Country
              </label>
              <Select
                id="Country"
                className="w-full"
                variant="bordered"
                classNames={{ listbox: "font-poppins" }}
                size="lg"
                radius="sm"
                isInvalid={!!errors.country}
                errorMessage={errors.country?.message as React.ReactNode}
                {...register("country")}
                placeholder="Select your country"
              >
                {
                  Object.entries(Countries)
                    // Sort the array alphabetically based on the country name (the value)
                    .sort(([, countryA], [, countryB]) => countryA.localeCompare(countryB))
                    .map(([code, country]) => (
                      <SelectItem
                        key={country}
                        startContent={
                          <Avatar alt={country} className="w-6 h-6" src={`https://flagcdn.com/${code.toLowerCase()}.svg`} />
                        }
                      >
                        {country.charAt(0).toUpperCase() + country.slice(1)}
                      </SelectItem>
                    ))
                }
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              className="w-full mt-4"
              isLoading={isSubmitting}
              size="lg"
              radius="sm"
            >
              {isSubmitting ? "Submitting..." : "Submit Details"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="w-full">
          <div className="w-full py-6 rounded-sm flex justify-center items-center gap-2 bg-blue-500/10 dark:bg-blue-900/10">
            <p className="text-sm text-text dark:text-text-dark">
              Fill all the fields to get best experience
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingForm;
