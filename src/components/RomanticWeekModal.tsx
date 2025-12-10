import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Heart, Moon, Clock, Wine, Ticket, Coffee, Wifi, Tv, Wind, CheckCircle2, Calendar, ArrowLeft, Send, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface RomanticWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RomanticWeekModal: React.FC<RomanticWeekModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const initialFormData = {
    name: '',
    surname: '',
    email: '',
    phone: '',
    checkIn: null as Date | null,
    message: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const calculateCheckout = (checkIn: Date) => {
    const checkout = new Date(checkIn);
    checkout.setDate(checkout.getDate() + 6);
    return checkout;
  };

  const isDateSelectable = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const isInFirstPeriod =
      (month === 1 && day >= 2) ||
      (month === 2) ||
      (month === 3) ||
      (month === 4 && day <= 15);

    const isInSecondPeriod =
      (month === 9 && day >= 15) ||
      (month === 10) ||
      (month === 11) ||
      (month === 12 && day <= 15);

    return isInFirstPeriod || isInSecondPeriod;
  };

  const handleDateChange = (date: Date) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        checkIn: date
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setStep(1);
    setError('');
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const checkOut = formData.checkIn ? calculateCheckout(formData.checkIn) : null;

      if (!formData.checkIn || !checkOut) {
        throw new Error('Please select a check-in date');
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          checkIn: formData.checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
        resetForm();
        onClose();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: Moon, text: "6-night stay for two", color: "text-indigo-500" },
    { icon: Clock, text: "Early check-in from 12:00 PM", color: "text-blue-500" },
    { icon: Wine, text: "Welcome wine or Prosecco", color: "text-rose-500" },
    { icon: Ticket, text: "VIP ticket with 10% discount", color: "text-amber-500" },
    { icon: Clock, text: "Late check-out until 11:00 AM", color: "text-emerald-500" },
    { icon: Coffee, text: "12 premium coffee pads", color: "text-orange-500" },
  ];

  const amenities = [
    { icon: Wind, text: "Air conditioning" },
    { icon: Tv, text: "42\" Smart TV" },
    { icon: Wifi, text: "High-speed WiFi" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 w-[95vw] sm:max-w-[500px]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform hover:scale-110"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>

        {showSuccessMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 z-50 rounded-3xl">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Request Sent Successfully!
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                We will respond as soon as possible.
              </p>
            </div>
          </div>
        )}

        {step === 1 ? (
          <>
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 p-6 pt-8 rounded-t-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white fill-white/50" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Romantic Week</h2>
                <p className="text-white/80 text-sm">Exclusive offer for couples</p>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mt-4">
                  <span className="text-white font-bold text-lg">Only €380</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  What's Included
                </h3>
                <div className="space-y-3">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${feature.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Apartment Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{amenity.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-14 rounded-xl font-semibold text-base bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Request to Book
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2 Header */}
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Book Your Stay</h2>
                  <p className="text-sm text-gray-500">Fill in your details</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-in Date</label>
                <DatePicker
                  selected={formData.checkIn}
                  onChange={handleDateChange}
                  filterDate={isDateSelectable}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  placeholderText="Select check-in date"
                  className="w-full h-12 border border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {formData.checkIn && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    Check-out: {calculateCheckout(formData.checkIn).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Surname</label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                    placeholder="Your surname"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 123 456 7890"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message (Optional)</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any special requests?"
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl font-semibold text-base bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RomanticWeekModal;
