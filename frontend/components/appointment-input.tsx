"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Tag,
  AlertCircle,
  CalendarCheck2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentSchema } from "@/schemas";

type AppointmentFormValues = z.infer<typeof AppointmentSchema>;

interface AppointmentFormProps {
  date: Date;
  time: string;
  timeLabel: string;
  onBack: () => void;
}

const concerns = [
  { label: "Academic", value: "ACADEMIC" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Health", value: "HEALTH" },
  { label: "Career", value: "CAREER" },
  { label: "Other", value: "OTHER" },
];

export function AppointmentForm({
  date,
  time,
  timeLabel,
  onBack,
}: AppointmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      title: "",
      concern: undefined,
      description: "",
    },
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      setIsLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      await api.post("/appointments/create", {
        title: data.title,
        concern: data.concern,
        description: data.description || undefined,
        date: formattedDate,
        time: time,
      });

      router.push("/profile/history");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to create appointment:", error);
      let message = "Failed to create appointment. Please try again.";
      const backendMessage = error.response?.data?.message;
      if (typeof backendMessage === "string") {
        message = backendMessage;
      } else if (Array.isArray(backendMessage) && backendMessage.length > 0) {
        message = backendMessage[0];
      }
      form.setError("root", {
        type: "manual",
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const description = form.watch("description") ?? "";
  const title = form.watch("title") ?? "";

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader className="space-y-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="-ml-2 flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to calendar
        </button>

        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Appointment Details
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in a few details so we know what to prepare for
          </p>
        </div>

        {/* Confirmed date/time */}
        <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
          <CalendarCheck2 className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {format(date, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">{timeLabel}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {form.formState.errors.root && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Academic advising session"
                      disabled={isLoading}
                      className="h-11"
                      maxLength={100}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <p className="ml-auto text-xs text-muted-foreground">
                      {title.length}/100
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="concern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Concern
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 w-full border-input data-[placeholder]:text-muted-foreground">
                        <SelectValue placeholder="Select what this is about..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {concerns.map((c) => (
                        <SelectItem
                          key={c.value}
                          value={c.value}
                          className="h-10"
                        >
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Description
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Anything you'd like the counselor to know beforehand..."
                      className="min-h-[110px]  resize-none border-gray-200 border-2 placeholder:text-gray-500 font-thin"
                      disabled={isLoading}
                      maxLength={500}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <p className="ml-auto text-xs text-muted-foreground">
                      {description.length}/500
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:flex-1"
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" className="h-11 sm:flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Appointment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}