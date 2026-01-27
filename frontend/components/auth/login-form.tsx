"use client";

import { useState } from "react";
import { LoginSchema } from "@/schemas";
import CardWrapper from "./card-wrapper";
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

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [user, setUser] = useState<LoginFormValues | null>(null);

  const handleLogin = async (data: LoginFormValues) => {
    try {
      const response = await fetch("http://localhost:5000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setUser(result.data);
      alert("Login successful!");
      console.log("Login successful", result);
      form.reset();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center px-5">
      <CardWrapper
        cardTitle="Welcome Back"
        cardDescription="Please sign in to your account"
        cardButtonText="Login"
        footerText="Don't have an account?"
        backButtonHref="/register"
      >
        <Form {...form}>
          <form
            className="space-y-5 w-full"
            onSubmit={form.handleSubmit(handleLogin)}
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

            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
