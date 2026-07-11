"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfDay } from "date-fns";
import { Clock, Calendar as CalendarIcon, Loader2, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppointmentForm } from "./appointment-input";
import api from "@/lib/api";

const ALL_TIME_SLOTS = [
  { label: "9:00 AM - 10:00 AM", value: "09:00" },
  { label: "10:00 AM - 11:00 AM", value: "10:00" },
  { label: "11:00 AM - 12:00 PM", value: "11:00" },
  { label: "12:00 PM - 1:00 PM", value: "12:00" },
  { label: "1:00 PM - 2:00 PM", value: "13:00" },
  { label: "2:00 PM - 3:00 PM", value: "14:00" },
  { label: "3:00 PM - 4:00 PM", value: "15:00" },
];

type Step = "calendar" | "details";

export function CalendarBookedDates() {
  const [step, setStep] = useState<Step>("calendar");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<Date[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const timeSectionRef = useRef<HTMLDivElement>(null);

  const today = startOfDay(new Date());

  useEffect(() => {
    const fetchFullyBookedDates = async () => {
      try {
        setLoadingDates(true);

        const response = await api.get<{ fullyBookedDates: string[] }>(
          "/appointments/fully-booked-dates",
          {
            params: {
              month: format(currentMonth, "yyyy-MM"),
            },
          },
        );

        const dates: Date[] = response.data.fullyBookedDates.map(
          (d: string) => new Date(d),
        );
        setFullyBookedDates(dates);
      } catch (error) {
        console.error("Failed to fetch fully booked dates:", error);
        setFullyBookedDates([]);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchFullyBookedDates();
  }, [currentMonth]);

  useEffect(() => {
    if (!date) return;

    const fetchBookedSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedTime(undefined);
        setBookedSlots([]);

        const response = await api.get<{ bookedSlots: string[] }>(
          "/appointments/booked-slots",
          {
            params: {
              date: format(date, "yyyy-MM-dd"),
            },
          },
        );

        setBookedSlots(response.data.bookedSlots);
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [date]);

  // Auto-scroll to the time-slot section on smaller screens once a date is
  // picked, so the next action is never missed below the fold.
  useEffect(() => {
    if (!date) return;
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;

    const timer = setTimeout(() => {
      timeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [date]);

  const availableSlots = ALL_TIME_SLOTS.filter(
    (slot) => !bookedSlots.includes(slot.value),
  );

  const canProceed = Boolean(date && selectedTime);
  const selectedTimeLabel = ALL_TIME_SLOTS.find(
    (s) => s.value === selectedTime,
  )?.label;

  if (step === "details" && date && selectedTime) {
    return (
      <div className="flex flex-col items-center gap-6 p-4 md:p-6">
        <AppointmentForm
          date={date}
          time={selectedTime}
          timeLabel={selectedTimeLabel ?? ""}
          onBack={() => setStep("calendar")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 pb-28 md:p-6 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-6 text-center lg:text-left">
        <h1 className="flex items-center justify-center gap-2 text-xl font-semibold md:text-2xl lg:justify-start">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book an Appointment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an available date, then choose a time slot
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Step 1 — Calendar */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                Choose a date
              </CardTitle>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="text-xs text-muted-foreground">
                    Fully booked
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">
                    Selected
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex justify-center p-4 pt-0 lg:justify-start">
            {loadingDates ? (
              <div className="flex w-full items-center justify-center gap-2 py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm">Loading calendar...</p>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={[{ before: today }, ...fullyBookedDates]}
                modifiers={{
                  fullyBooked: fullyBookedDates,
                }}
                modifiersClassNames={{
                  fullyBooked: "opacity-40 line-through text-destructive",
                }}
                className={cn(
                  "[&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-cell]:p-1",
                  "[&_.rdp-head_th]:w-11 [&_.rdp-day]:h-11 [&_.rdp-day]:w-11 [&_.rdp-button]:h-11 [&_.rdp-button]:w-11 [&_.rdp-button]:text-sm",
                  "sm:[&_.rdp-head_th]:w-12 sm:[&_.rdp-day]:h-12 sm:[&_.rdp-day]:w-12 sm:[&_.rdp-button]:h-12 sm:[&_.rdp-button]:w-12 sm:[&_.rdp-button]:text-base",
                  "lg:[&_.rdp-head_th]:w-14 lg:[&_.rdp-day]:h-14 lg:[&_.rdp-day]:w-14 lg:[&_.rdp-button]:h-14 lg:[&_.rdp-button]:w-14",
                  "[&_.rdp-button]:transition-colors [&_.rdp-button:hover:not(:disabled)]:bg-accent",
                  "[&_.rdp-button:focus-visible]:outline-none [&_.rdp-button:focus-visible]:ring-2 [&_.rdp-button:focus-visible]:ring-ring",
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Step 2 — Time slot */}
        <div ref={timeSectionRef} className="scroll-mt-6 lg:sticky lg:top-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    date
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Clock className="h-4 w-4" />
                </span>
                Choose a time
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {date
                  ? format(date, "EEEE, MMMM d, yyyy")
                  : "Pick a date to see available times"}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {!date ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No date selected yet
                  </p>
                </div>
              ) : loadingSlots ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Checking available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-destructive">
                    No available slots for this date
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Please select a different date
                  </p>
                </div>
              ) : (
                <>
                  <Select onValueChange={setSelectedTime} value={selectedTime}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Choose a time slot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {canProceed && (
                    <div className="flex items-start gap-2 rounded-lg bg-accent p-3">
                      <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm">
                        <span className="font-medium">
                          {format(date, "MMM d, yyyy")}
                        </span>{" "}
                        <span className="text-muted-foreground">at</span>{" "}
                        <span className="font-medium">
                          {selectedTimeLabel}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Desktop / tablet action — hidden on mobile, replaced by sticky bar */}
                  <Button
                    className="hidden h-11 w-full lg:flex"
                    disabled={!canProceed}
                    onClick={() => setStep("details")}
                  >
                    Next
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky mobile summary + action bar */}
      {canProceed && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {date && format(date, "EEE, MMM d")} · {selectedTimeLabel}
              </p>
              <p className="text-xs text-muted-foreground">Ready to continue</p>
            </div>
            <Button
              className="h-11 shrink-0 px-6"
              onClick={() => setStep("details")}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}