import { addToast } from "@heroui/toast"

export const SuccessToast = (message: string) => {
  addToast({
    title: message,
    color: "success",
    radius: "sm",
  })
}

export const ErrorToast = (message: string) => {
  addToast({
    title: message,
    color: "danger",
    radius: "sm",
  })
}

export const WarningToast = (message: string) => {
  addToast({
    title: message,
    color: "warning",
    radius: "sm",
  })
}

export const InfoToast = (message: string) => {
  addToast({
    title: message,
    color: "primary",
    radius: "sm",
  })
}

export const DefaultToast = (message: string) => {
  addToast({
    title: message,
    color: "default",
    radius: "sm",
  })
}