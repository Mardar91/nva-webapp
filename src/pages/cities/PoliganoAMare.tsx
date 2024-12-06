import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";

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
              <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-blue-700 dark:text-blue-400" />
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
      <div className="w-full aspect-square p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow">
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">{attraction.icon}</span>
          <span className="text-center text-sm font-medium text-blue-700 dark:text-blue-400">
            {attraction.name}
          </span>
        </div>
      </div>
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

const PoliganoAMare: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  window.scrollTo(0, 0);
  mainRef.current?.scrollIntoView({ behavior: 'auto' });

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    // Usiamo lo stesso blu della hero section
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeColor.setAttribute('content', isDarkMode ? '#1e3a91' : '#1d4ed8'); // blue-900 : blue-700
  }
  return () => {
    if (themeColor) {
      themeColor.setAttribute('content', '#ffffff');
    }
  };
}, [location]);

  const handleBackClick = () => {
    navigate('/explore');
  };

  const poliganoEvents: Event[] = [
    {
      id: '1',
      title: 'Red Bull Cliff Diving',
      startDate: new Date(),
      city: 'Polignano a Mare',
      description: 'International diving competition'
    },
    {
      id: '2',
      title: 'Festival of the Sea',
      startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      city: 'Polignano a Mare',
      description: 'Traditional maritime celebration'
    },
    {
      id: '3',
      title: 'Jazz Festival',
      startDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      city: 'Polignano a Mare',
      description: 'International jazz music festival'
    },
    {
      id: '4',
      title: 'Christmas in the Caves',
      startDate: new Date(new Date().setDate(new Date().getDate() + 25)),
      city: 'Polignano a Mare',
      description: 'Unique Christmas celebration in the caves'
    }
  ];

  const attractions: Attraction[] = [
    { name: 'Centro Storico', icon: '🏛️' },
    { name: 'Lama Monachile', icon: '🏖️' },
    { name: 'Statua di Domenico Modugno', icon: '🎭' },
    { name: 'Ponte Borbonico', icon: '🌉' },
    { name: 'Cala Paura', icon: '⛱️' },
    { name: 'Abbazia San Vito', icon: '⛪' },
    { name: "Piazza dell'Orologio", icon: '🕰️' },
    { name: 'Chiesa Madre', icon: '🏺' }
  ];

  const scrollToRef = useRef<HTMLDivElement>(null);
  
  const handleExploreClick = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-grow" ref={mainRef}>
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { left: -100% }
          100% { left: 200% }
        }
      `}</style>

      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
      >
        <ArrowLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </button>

      {/* Hero Section */}
      <div className="bg-blue-700 dark:bg-blue-900 text-white py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto pt-8"
        >
          <h1 className="text-3xl font-bold mb-4">
            Polignano a Mare
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            A breathtaking seaside town in southern Italy, famous for its dramatic cliffs, crystal-clear waters, and charming historic center. Known as the "Pearl of the Adriatic," it's a must-visit destination for stunning views and authentic Italian experiences.
          </p>
          <Button 
            onClick={handleExploreClick}
            variant="outline" 
            className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-blue-700 transition-colors"
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
            className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6"
          >
            Upcoming Events
          </motion.h2>
          <div className="grid gap-4">
            {poliganoEvents.map((event) => (
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
            className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 text-center"
          >
            Explore the City
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {attractions.map((attraction) => (
              <AttractionButton key={attraction.name} attraction={attraction} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PoliganoAMare;
