"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Info, FileText, Tag, AlertCircle, CheckCircle } from "lucide-react";
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
    } catch (error) {
      console.error("Failed to create appointment:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to create appointment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const description = form.watch("description") ?? "";
  const title = form.watch("title") ?? "";

  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Appointment Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in the details for your appointment
        </p>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary">
              {format(date, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">{timeLabel}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {form.formState.errors.root && (
              <div className="flex items-center gap-3 text-red-600 px-4 py-3 rounded bg-red-50 border border-red-200">
                <Info className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{form.formState.errors.root.message}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Academic advising session"
                      disabled={isLoading}
                      className="h-10"
                      maxLength={100}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <p className="text-xs text-muted-foreground ml-auto">
                      {title.length} / 100
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
                  <FormLabel className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Concern
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a concern..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {concerns.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
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
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Description{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your concern in detail..."
                      className="min-h-[120px] resize-none"
                      disabled={isLoading}
                      maxLength={500}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <p className="text-xs text-muted-foreground ml-auto">
                      {description.length} / 500
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Appointment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
