import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  city: string;
  description: string;
}

interface Attraction {
  name: string;
  icon: string;
  description?: string;
}

const CurrentEventBadge = () => (
  <div className="flex items-center gap-1.5 mt-2">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
    </span>
    <span className="text-xs font-medium text-green-600">Today</span>
  </div>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate);

  const isCurrentEvent = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const end = event.endDate ? new Date(event.endDate) : new Date(start);
    end.setHours(23, 59, 59, 999);
    
    return now >= start && now <= end;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-teal-700 dark:text-teal-400">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-teal-700 dark:text-teal-400" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              {isCurrentEvent() && <CurrentEventBadge />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AttractionButton: React.FC<{ attraction: Attraction }> = ({ attraction }) => (
  <Dialog>
    <DialogTrigger>
      <button className="serviceButton">
        <span className="text-2xl mb-2">{attraction.icon}</span>
        <span className="serviceText text-teal-700 dark:text-teal-400">
          {attraction.name}
        </span>
      </button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{attraction.name}</DialogTitle>
        <DialogDescription>
          {attraction.description || "Coming soon..."}
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

const MolaDiBari: React.FC = () => {
  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#0d9488'); // Teal-600
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
    };
  }, []);

  const molaEvents: Event[] = [
    {
      id: '1',
      title: 'La Sagra del Polpo',
      startDate: new Date(),
      city: 'Mola di Bari',
      description: 'Traditional octopus festival'
    },
    // Add more events specific to Mola di Bari
  ];

  const attractions: Attraction[] = [
    { name: 'Lungomare', icon: '🌅' },
    { name: 'Chiesa Matrice', icon: '⛪' },
    { name: 'Castello', icon: '🏰' },
    { name: 'Piazza XX Settembre', icon: '⛲' },
    { name: 'Chiesa Maddalena', icon: '🕍' },
    { name: 'Palazzo Roberti', icon: '🏛️' },
    { name: 'Teatro Van Westerhout', icon: '🎭' },
    { name: 'Centro Storico', icon: '🏘️' }
  ];

  const scrollToRef = React.useRef<HTMLDivElement>(null);
  
  const handleExploreClick = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-grow overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-teal-600 dark:bg-teal-900 text-white py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-4">
            Mola di Bari
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            A charming coastal town in southern Italy, known for its picturesque seafront, fresh seafood, and vibrant local culture. With its historic architecture and warm hospitality, it's the perfect destination for a relaxing escape.
          </p>
          <Button 
            onClick={handleExploreClick}
            variant="outline" 
            className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-teal-600 transition-colors"
          >
            Explore the City
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
            className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-6"
          >
            Upcoming Events
          </motion.h2>
          <div className="grid gap-4">
            {molaEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Attractions Section */}
        <section ref={scrollToRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-6 text-center"
          >
            Explore the City
          </motion.h2>
          <div className="grid grid-cols-4 gap-4">
            {attractions.map((attraction) => (
              <AttractionButton key={attraction.name} attraction={attraction} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MolaDiBari;
