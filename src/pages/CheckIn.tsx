import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { format } from "date-fns";

const CheckIn = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
      setDate(newDate);
      setDateSelected(true);
    }
  };

  const handleConfirm = () => {
    if (date && validateDate(date)) {
      setShowForm(true);
    } else {
      alert(
        "Check-in is only available 3 days before your stay date. Please try again closer to your stay date."
      );
    }
  };

  if (showForm) {
    return (
      <iframe
        src="https://form.jotform.com/221524504539049"
        className="w-full h-screen"
        title="Check-in Form"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Please select your check-in date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </CardContent>
        {dateSelected && (
          <CardFooter className="flex justify-end">
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
