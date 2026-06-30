"use client";

import { useState, useEffect } from "react";
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
import { Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const today = startOfDay(new Date());

  useEffect(() => {
    const fetchFullyBookedDates = async () => {
      try {
        setLoadingDates(true);

        const response = await api.get("/appointments/fully-booked-dates", {
          params: {
            month: format(currentMonth, "yyyy-MM"),
          },
        });

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

        const response = await api.get("/appointments/booked-slots", {
          params: {
            date: format(date, "yyyy-MM-dd"),
          },
        });

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

  const availableSlots = ALL_TIME_SLOTS.filter(
    (slot) => !bookedSlots.includes(slot.value),
  );

  const canProceed = date && selectedTime;

  if (step === "details" && date && selectedTime) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <AppointmentForm
          date={date}
          time={selectedTime}
          timeLabel={
            ALL_TIME_SLOTS.find((s) => s.value === selectedTime)?.label ?? ""
          }
          onBack={() => setStep("calendar")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <Card className="w-fit shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Book an Appointment
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Select an available date then choose a time slot
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="text-xs text-muted-foreground">
                Fully booked
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Selected</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {loadingDates ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
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
              className="[&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-cell]:p-1 [&_.rdp-head_th]:w-12 [&_.rdp-day]:h-12 [&_.rdp-day]:w-12 [&_.rdp-button]:h-12 [&_.rdp-button]:w-12 [&_.rdp-button]:text-base"
            />
          )}
        </CardContent>
      </Card>

      {date && (
        <Card className="w-full max-w-sm shadow-md">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Select a Time Slot</p>
                <p className="text-sm text-muted-foreground">
                  {format(date, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Checking available slots...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm font-medium text-destructive">
                  No available slots for this date
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please select a different date
                </p>
              </div>
            ) : (
              <Select onValueChange={setSelectedTime} value={selectedTime}>
                <SelectTrigger className="w-full h-11">
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
            )}

            <Button
              className="w-full h-11"
              disabled={!canProceed || loadingSlots}
              onClick={() => setStep("details")}
            >
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {!date && (
        <p className="text-sm text-muted-foreground">
          Click on an available date to see time slots
        </p>
      )}
    </div>
  );
}
