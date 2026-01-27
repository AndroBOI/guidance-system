import * as z from "zod"

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, {
        message: "Password is required"
    })
})

export const RegisterSchema = z.object({
    email: z.email(),
    password: z.string().min(6, {
        message: "Mininum password length is 6 characters"
    }),
    name: z.string().min(1, {
        message: "Name is required"
    })
})