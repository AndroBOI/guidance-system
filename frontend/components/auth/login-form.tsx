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
import { useAuth } from "@/contexts/AuthContext";

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      console.log("Submitting login form...");
      const loggedInUser = await login(data.email, data.password);
      console.log("Login complete, user:", loggedInUser);

      if (loggedInUser) {
        console.log("User loaded, redirecting based on role...");

        if (loggedInUser.role === "ADMIN") {
          window.location.href = "/admin/dashboard";
        } else if (!loggedInUser.hasProfile) {
          window.location.href = "/create/info";
        } else {
          window.location.href = "/profile/dashboard";
        }
      } else {
        throw new Error("Login succeeded but user not loaded");
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      form.setError("root", {
        type: "manual",
        message:
          error instanceof Error ? error.message : "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh justify-center items-center px-5">
      <CardWrapper
        cardTitle="Welcome Back"
        cardDescription="Please sign in to your account"
        cardButtonText="Login"
        footerText="Don't have an account?"
        backButtonHref="/register"
      >
        <Form {...form}>
          <form
            className="space-y-5 sm:space-y-6 lg:space-y-8 w-full"
            onSubmit={form.handleSubmit(handleLogin)}
          >
            {form.formState.errors.root && (
              <div className="flex justify-center items-center gap-x-3 text-red-600 px-4 py-3 rounded bg-red-50 border border-red-200">
                <Info className="text-red-600" size={20} />
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="john.doe@example.com"
                      type="email"
                      disabled={isLoading}
                      className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
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
                  <FormLabel className="text-sm sm:text-base">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Password"
                      type="password"
                      disabled={isLoading}
                      className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
