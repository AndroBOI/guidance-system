import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6, {
    message: "Mininum password length is 6 characters",
  }),
});

export const ProfileSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Name is required",
    })
    .max(64, {
      message: "Maximum name length is 64 characters",
    }),

  birthDate: z
    .date({
      message: "Please provide a valid date",
    })
    .refine((date) => date <= new Date(), {
      message: "Birth date cannot be in the future",
    })
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age <= 120;
      },
      {
        message: "Please provide a valid birth date",
      },
    ),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a valid gender",
  }),
});
