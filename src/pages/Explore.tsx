import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  date: Date;
  city: string;
  description: string;
}

// Componente EventCard
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
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
  onClick: () => void;
  delay: number;
}> = ({ city, onClick, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Button 
        onClick={onClick}
        className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1e3a8a] dark:text-[#60A5FA] border border-gray-200 dark:border-gray-700 h-24 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        variant="ghost"
      >
        <span className="text-lg font-semibold">{city}</span>
      </Button>
    </motion.div>
  );
};

const Explore: React.FC = () => {
  const navigate = useNavigate();

  // Eventi di esempio
  const events: Event[] = [
    {
      id: '1',
      title: 'La Sagra del Polpo',
      date: new Date(2024, 6, 3),
      city: 'Mola di Bari',
      description: 'Traditional octopus festival'
    },
    {
      id: '2',
      title: 'San Michele',
      date: new Date(2024, 6, 4),
      city: 'Polignano a Mare',
      description: 'Religious celebration'
    },
    {
      id: '3',
      title: 'La Festa del Mare',
      date: new Date(2024, 6, 15),
      city: 'Monopoli',
      description: 'Sea festival'
    },
    {
      id: '4',
      title: 'Giro in Ruota',
      date: new Date(2024, 7, 3),
      city: 'Bari',
      description: 'Ferris wheel event'
    }
  ];

  const cities = [
    { name: 'Mola di Bari', path: '/cities/mola-di-bari' },
    { name: 'Polignano a Mare', path: '/cities/polignano-a-mare' },
    { name: 'Monopoli', path: '/cities/monopoli' },
    { name: 'Bari', path: '/cities/bari' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] mb-4">
          Explore Puglia
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Discover magnificent cultural cities and unforgettable events in the surroundings.
        </p>
      </motion.div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cities.map((city, index) => (
          <CityButton
            key={city.name}
            city={city.name}
            onClick={() => navigate(city.path)}
            delay={0.1 * index}
          />
        ))}
      </div>
    </div>
  );
};

export default Explore;
