import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface RomanticWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RomanticWeekModal: React.FC<RomanticWeekModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    checkIn: null as Date | null,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95vw] sm:max-w-[600px]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                ✨ ROMANTIC WEEK OFFER
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <p className="text-base sm:text-lg">
                🌟 Treat yourself to a memorable escape with our exclusive Romantic Week package:
              </p>

              <div className="space-y-2">
                <p>🌙 <strong>6-night stay</strong> in our superior apartments for two</p>
                <p>⏰ <strong>Early check-in</strong> from 12:00 PM</p>
                <p>🍷 <strong>Welcome bottle</strong> of wine or Prosecco</p>
                <p>🎫 <strong>VIP ticket</strong> with 10% discount</p>
                <p>🕐 <strong>Late check-out</strong> until 11:00 AM</p>
                <p>☕️ <strong>12 premium coffee pads</strong> included</p>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-lg mb-2">🏠 Apartment Features</h3>
                <p className="text-sm leading-relaxed">
                  Includes: <strong>Washing machine</strong> • <strong>Air conditioning</strong> • 
                  <strong>42" Smart TV</strong> • <strong>Full kitchen</strong> • 
                  <strong>High-speed WiFi</strong> • <strong>Hair dryer & toiletries</strong>
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📅 REQUEST TO BOOK
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                📝 Book Your Romantic Week
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Check-in Date</label>
                <DatePicker
                  selected={formData.checkIn}
                  onChange={handleDateChange}
                  filterDate={isDateSelectable}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  placeholderText="Select check-in date"
                  className="w-full border rounded-md px-3 py-2"
                />
                {formData.checkIn && (
                  <p className="text-sm text-gray-600">
                    Check-out: {calculateCheckout(formData.checkIn).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Surname</label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                    placeholder="Your surname"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any special requests?"
                  rows={3}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex gap-4 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RomanticWeekModal;
