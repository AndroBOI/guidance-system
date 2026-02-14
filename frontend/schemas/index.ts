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
    message: "Minimum password length is 6 characters",
  }),
});

export const ProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, {
      message: "First name is required",
    })
    .max(64, {
      message: "Maximum name length is 64 characters",
    }),

  lastName: z
    .string()
    .min(1, {
      message: "Last name is required",
    })
    .max(64, {
      message: "Maximum name length is 64 characters",
    }),

  middleName: z
    .string()
    .max(64, {
      message: "Maximum name length is 64 characters",
    })
    .optional(),

  phoneNumber: z
    .string()
    .min(10, {
      message: "Please provide a valid phone number",
    })
    .max(15, {
      message: "Phone number is too long",
    }),

  address: z
    .string()
    .min(1, {
      message: "Address is required",
    })
    .max(200, {
      message: "Maximum address length is 200 characters",
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
