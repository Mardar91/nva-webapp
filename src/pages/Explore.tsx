import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, MapPin, building-2, TreePalm, Ship, Buildings } from "lucide-react";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  city: string;
  description: string;
}

// Badge Component for Current Events
const CurrentEventBadge = () => (
  <div className="absolute -top-2 -right-2">
    <div className="relative">
      <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-25"></div>
      <div className="relative rounded-full bg-green-500 px-2 py-1 text-xs text-white">
        Today
      </div>
    </div>
  </div>
);

// Componente EventCard
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate);

  const isCurrentEvent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventStart = new Date(event.startDate);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
    eventEnd.setHours(23, 59, 59, 999);
    
    return today >= eventStart && today <= eventEnd;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        {isCurrentEvent() && <CurrentEventBadge />}
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-[#1e3a8a] dark:text-[#60A5FA]">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-[#1e3a8a] dark:text-[#60A5FA]" />
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente CityButton
const CityButton: React.FC<{ 
  city: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
}> = ({ city, icon, onClick, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <button 
        onClick={onClick}
        className="heroButton"
      >
        <span className="heroIcon">{icon}</span>
        <span className="heroText">{city}</span>
      </button>
    </motion.div>
  );
};

const Explore: React.FC = () => {
  const navigate = useNavigate();

  const scrollToRef = React.useRef<HTMLDivElement>(null);
  
  const handleScrollToCities = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Eventi di esempio
  const events: Event[] = [
    {
      id: '1',
      title: 'La Sagra del Polpo',
      startDate: new Date(),
      city: 'Mola di Bari',
      description: 'Traditional octopus festival'
    },
    {
      id: '2',
      title: 'San Michele',
      startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      city: 'Polignano a Mare',
      description: 'Religious celebration'
    },
    {
      id: '3',
      title: 'La Festa del Mare',
      startDate: new Date(new Date().setDate(new Date().getDate() + 12)),
      city: 'Monopoli',
      description: 'Sea festival'
    },
    {
      id: '4',
      title: 'Giro in Ruota',
      startDate: new Date(new Date().setDate(new Date().getDate() + 31)),
      city: 'Bari',
      description: 'Ferris wheel event'
    }
  ];

  const cities = [
    { name: 'Mola di Bari', path: '/cities/mola-di-bari', icon: <Building2 size={32} color="#60A5FA" /> },
    { name: 'Polignano a Mare', path: '/cities/polignano-a-mare', icon: <Palm size={32} color="#60A5FA" /> },
    { name: 'Monopoli', path: '/cities/monopoli', icon: <Ship size={32} color="#60A5FA" /> },
    { name: 'Bari', path: '/cities/bari', icon: <Buildings size={32} color="#60A5FA" /> }
  ];

  return (
    <div className="flex-grow overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-[#1e3a8a] dark:bg-gray-900 text-white py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-4">
            Explore Puglia
          </h1>
          <p className="text-gray-200 text-lg mb-8">
            Discover magnificent cultural cities and unforgettable events in the surroundings.
          </p>
          <Button 
            onClick={handleScrollToCities}
            variant="outline" 
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#1e3a8a] transition-colors"
          >
            Go to Cities
          </Button>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Upcoming Events Section */}
        <section className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] mb-6"
          >
            Upcoming Events
          </motion.h2>
          <div className="grid gap-4">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Cities Grid */}
        <div ref={scrollToRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cities.map((city, index) => (
            <CityButton
              key={city.name}
              city={city.name}
              icon={city.icon}
              onClick={() => navigate(city.path)}
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
