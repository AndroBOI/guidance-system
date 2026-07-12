"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardHeader } from "../ui/card";
import { Info, CalendarIcon, User, Phone, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { ProfileSchema } from "@/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ProfileFormValues = z.infer<typeof ProfileSchema>;

const TOTAL_STEPS = 2;

export const ProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      address: "",
      birthDate: new Date(),
      gender: "MALE",
    },
  });

  // Prevent Enter-key implicit submission from firing before the final step.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && step < TOTAL_STEPS) {
      e.preventDefault();
    }
  };

  const nextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fields =
      step === 1
        ? ["firstName", "lastName", "middleName", "phoneNumber"]
        : ["address", "birthDate", "gender"];

    const isValid = await form.trigger(fields as any);
    if (isValid) setStep((prev) => prev + 1);
  };

  const prevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    // Extra safety net: never let a submit through unless we're on the last step.
    if (step < TOTAL_STEPS) return;

    setIsLoading(true);

    try {
      await api.post<ProfileFormValues>("/profile/create", {
        ...data,
        birthDate: data.birthDate.toISOString(),
      });

      router.push("/profile/dashboard");
    } catch (error: any) {
      form.setError("root", {
        type: "manual",
        message: error.response?.data?.message || "Failed to create profile",
      });

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-y-6 bg-gradient-to-br from-background to-muted/20 px-4 py-10 sm:gap-y-8 sm:px-6">
      <div className="space-y-2 text-center sm:space-y-3">
        <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent sm:h-16 sm:w-16">
          <User className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <h1 className="px-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Complete Your Profile
        </h1>
      </div>

      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-4 px-4 pb-2 sm:px-6">
          {/* Step progress */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i + 1 <= step ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>

          <div className="space-y-1 text-center">
            <CardTitle className="text-lg sm:text-xl">
              Step {step} of {TOTAL_STEPS} ·{" "}
              {step === 1 ? "Personal Info" : "Additional Details"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === 1
                ? "Let's start with your basic information"
                : "Just a few more details to complete your profile"}
            </p>
          </div>
        </CardHeader>

        <div className="px-4 pb-5 pt-2 sm:px-6 sm:pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={handleKeyDown}
              className="space-y-5"
            >
              {form.formState.errors.root && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    {form.formState.errors.root.message}
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="Juan"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="Dela Cruz"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Middle Name
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="Santos"
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="09123456789"
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="123 Main St, Barangay..."
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            Date of Birth
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "h-11 w-full justify-start pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto max-w-[calc(100vw-2rem)] p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Gender
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 w-full">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="h-11 flex-1"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                )}

                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-11 flex-1"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="h-11 flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
};