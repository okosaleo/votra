import { object, string } from "zod";
import { z } from 'zod';

const getPasswordSchema = (type: "password" | "confirmPassword") =>
  string({ required_error: `${type} is required` })
    .min(8, `${type} must be at least 8 characters`)
    .max(32, `${type} cannot exceed 32 characters`);

const getEmailSchema = () =>
  string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email");

const getNameSchema = () =>
  string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters");


export const signUpSchema = object({
  name: getNameSchema(),
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
  confirmPassword: getPasswordSchema("confirmPassword"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export const signInSchema = object({
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
});


export const CreateRoomSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  options: z.array(
    z.object({
      value: z.string().min(1, "Option cannot be empty").max(100)
    })
  ).min(2, "At least 2 options required")
   .max(5, "Maximum 5 options allowed"),
  votingDeadline: z.date().refine(
    date => date > new Date(), 
    "Deadline must be in the future"
  ),
  settings: z.object({
    allowGuestVoting: z.boolean(),
    allowDiscussion: z.boolean(),
    allowVoteJustification: z.boolean(),
    showLiveResults: z.boolean()
  })
});