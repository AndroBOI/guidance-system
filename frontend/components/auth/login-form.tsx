"use client";

import { Info } from "lucide-react";
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
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        form.setError("root", {
          type: "manual",
          message: result.message || "Invalid email or password",
        });
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: "Network error. Please check your connection",
      });
    } finally {
      setIsLoading(false);
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
            {form.formState.errors.root && (
              <div className="flex justify-center items-center gap-x-3  text-red-600 px-4 py-3 rounded bg-red-200 ">
                <Info className="text-red" size={20}/>{form.formState.errors.root.message}
              </div>
            )}

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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
