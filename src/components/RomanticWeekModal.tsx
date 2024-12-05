import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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

  // Funzione per calcolare il checkout (6 notti dopo il checkin)
  const calculateCheckout = (checkIn: Date) => {
    const checkout = new Date(checkIn);
    checkout.setDate(checkout.getDate() + 6);
    return checkout;
  };

  // Funzione per verificare se una data è selezionabile
  const isDateSelectable = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Prima periodo: 2 gennaio - 15 aprile
    const isInFirstPeriod = 
      (month === 1 && day >= 2) || 
      (month === 2) || 
      (month === 3) || 
      (month === 4 && day <= 15);

    // Secondo periodo: 15 settembre - 15 dicembre
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

      // Successo
      onClose();
      // Qui puoi aggiungere una notifica di successo se lo desideri
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4">
                ROMANTIC WEEK OFFER
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-left">
              <p className="text-lg mb-6">
                Treat yourself to a memorable escape with our exclusive Romantic Week package:
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p><strong>6-night stay</strong> in one of our superior apartments for two.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p><strong>Early check-in</strong> from 12:00 PM for a relaxed arrival.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>A <strong>welcome bottle</strong> of wine or Prosecco to start your stay in style.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>A <strong>VIP ticket</strong> with a 10% discount on services and partner locations.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p><strong>Late check-out</strong> until 11:00 AM for a leisurely departure.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p><strong>12 premium coffee pads</strong> included for your morning indulgence.</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Superior Apartment Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <p><strong>Washing machine and dryer</strong> (private or shared in the building)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <p><strong>Air conditioning</strong> for your comfort</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <p><strong>Smart TV (42")</strong> with satellite channels and Alexa integration</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <p>Fully equipped <strong>kitchen</strong> with a fridge and freezer</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <p><strong>High-speed WiFi</strong> for seamless connectivity</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <p><strong>Hair dryer</strong> and complimentary toiletries for added convenience</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  REQUEST TO BOOK
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4">
                Book Your Romantic Week
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
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
