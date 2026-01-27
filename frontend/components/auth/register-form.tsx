"use client";
import { useState } from "react";
import CardWrapper from "./card-wrapper";

import { RegisterSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: "", password: "" },
  });

  const [user, setUser] = useState<RegisterFormValues | null>(null);

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setUser(result);
      alert("Registration successful!");
      console.log("Registration successful", result);
      form.reset();
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center px-5">
      <CardWrapper
        cardTitle="Create an Account"
        cardDescription="Please register to get started"
        cardButtonText="Register"
        footerText="Already have an account?"
        backButtonHref="/login"
      >
        <Form {...form}>
          <form
            className="space-y-5 w-full"
            onSubmit={form.handleSubmit(handleRegister)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="john.doe@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Password"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.password?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button className="w-full">Register</Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};

export default RegisterForm;
