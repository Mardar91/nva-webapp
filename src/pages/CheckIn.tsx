import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { format, differenceInDays } from "date-fns";

// Custom hook per gestire il salvataggio della data
const usePersistedDate = (key: string) => {
  const [value, setValue] = useState<Date | null>(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      const date = new Date(saved);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  });

  useEffect(() => {
    if (value) {
      localStorage.setItem(key, value.toISOString());
    }
  }, [key, value]);

  return [value, setValue] as const;
};

const CountdownDisplay = ({ checkInDate }: { checkInDate: Date }) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = differenceInDays(checkInDate, today);
      setDaysLeft(days);
    };

    calculateDaysLeft();
    // Aggiorna il conteggio ogni giorno a mezzanotte
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, [checkInDate]);

  if (daysLeft < 0) return null;

  return (
    <div className="flex justify-center mt-4 mb-6">
      <div 
        className="px-4 py-2 rounded-full bg-[#ecfdf5] animate-pulse"
        style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
      >
        <span className="text-[#059669] font-semibold">
          {daysLeft === 0 
            ? "Your stay at Nonna Vittoria Apartments starts today!" 
            : `Your stay at Nonna Vittoria Apartments in just ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`}
        </span>
      </div>
    </div>
  );
};

const CheckIn = () => {
  const [savedDate, setSavedDate] = usePersistedDate('check-in-date');
  const [showForm, setShowForm] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);

  const validateDate = (selectedDate: Date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSavedDate(newDate);
      setDateSelected(true);
    }
  };

  const handleConfirm = () => {
    if (savedDate && validateDate(savedDate)) {
      setShowForm(true);
    } else {
      alert(
        "Check-in is only available 3 days before your stay date. Please try again closer to your stay date."
      );
    }
  };

  if (showForm) {
    return (
      <div className="iframe-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: '88px',
        overflow: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        <iframe
          src="https://form.jotform.com/221524504539049"
          title="Check-in Form"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          scrolling="yes"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {savedDate && <CountdownDisplay checkInDate={savedDate} />}
      <Card className="mb-24">
        <CardHeader>
          <CardTitle>Please select your check-in date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={savedDate || undefined}
            onSelect={handleDateSelect}
            className="rounded-md border"
            styles={{
              head_cell: {
                width: "100%",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "capitalize",
                color: "#1e3a8a"
              },
              caption: {
                color: "#1e3a8a",
                fontSize: "0.875rem",
                padding: "1rem",
                fontWeight: 500
              },
              nav_button_previous: {
                color: "#1e3a8a !important"
              },
              nav_button_next: {
                color: "#1e3a8a !important"
              },
              day: {
                color: "#1e3a8a"
              },
              selected: {
                backgroundColor: "#1e3a8a !important"
              }
            }}
          />
        </CardContent>
        {dateSelected && (
          <CardFooter className="flex justify-end pb-6">
            <Button 
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Check-in Date
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default CheckIn;
