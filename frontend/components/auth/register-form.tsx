"use client";
import { useState } from "react";
import CardWrapper from "./card-wrapper";
import { Info } from "lucide-react";
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
import { useRouter } from "next/navigation";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: "", password: "" },
  });

  const [user, setUser] = useState<RegisterFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setUser(result);
      alert("Registration successful!");
      router.push("/login");
      console.log("Registration successful", result);
      form.reset();
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: "Network error. Please check your connection",
      });
      console.error("Registration failed", error);
    } finally {
      setIsLoading(false);
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
            {form.formState.errors.root && (
              <div className="flex justify-center items-center gap-x-3  text-red-600 px-4 py-3 rounded bg-red-200 ">
                <Info className="text-red" size={20} />
                {form.formState.errors.root.message}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};

export default RegisterForm;
