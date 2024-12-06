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
              <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-400">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-indigo-700 dark:text-indigo-400" />
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
          <span className="text-center text-sm font-medium text-indigo-700 dark:text-indigo-400">
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

const Monopoli: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeColor.setAttribute('content', isDarkMode ? '#4338ca' : '#4f46e5'); // indigo-700
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

  const monopoliEvents: Event[] = [
    {
      id: '1',
      title: 'Festival del Mare',
      startDate: new Date(),
      city: 'Monopoli',
      description: 'Traditional maritime festival'
    },
    {
      id: '2',
      title: 'Festa della Madonna della Madia',
      startDate: new Date(new Date().setDate(new Date().getDate() + 8)),
      city: 'Monopoli',
      description: 'Religious celebration'
    },
    {
      id: '3',
      title: 'Summer Night Market',
      startDate: new Date(new Date().setDate(new Date().getDate() + 16)),
      city: 'Monopoli',
      description: 'Artisan and local products market'
    },
    {
      id: '4',
      title: 'Medieval Festival',
      startDate: new Date(new Date().setDate(new Date().getDate() + 23)),
      city: 'Monopoli',
      description: 'Historical reenactment and festivities'
    }
  ];

  const attractions: Attraction[] = [
    { name: 'Centro Storico', icon: '🏛️' },
    { name: 'Basilica Maria SS della Madia', icon: '⛪' },
    { name: 'Castello di Carlo V', icon: '🏰' },
    { name: 'Cala Porta Vecchia', icon: '⛱️' },
    { name: 'Porto Antico', icon: '⚓' },
    { name: 'Porto Marzano Beach', icon: '🏖️' },
    { name: 'Piazza Garibaldi', icon: '🏟️' },
    { name: 'Museo Cripta Romanica', icon: '🗿' }
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
        <ArrowLeft className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </button>

      {/* Hero Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900 text-white py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto pt-8"
        >
          <h1 className="text-3xl font-bold mb-4">
            Monopoli
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            A picturesque coastal town in southern Italy, renowned for its stunning beaches, vibrant harbor, and charming old town. With its historic architecture and welcoming atmosphere, it's the ideal spot for an authentic and relaxing getaway.
          </p>
          <Button 
            onClick={handleExploreClick}
            variant="outline" 
            className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-indigo-600 transition-colors"
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
            className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6"
          >
            Upcoming Events
          </motion.h2>
          <div className="grid gap-4">
            {monopoliEvents.map((event) => (
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
            className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6 text-center"
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

export default Monopoli;
