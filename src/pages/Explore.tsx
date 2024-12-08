import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  ArrowRight,
  Building2,
  TreePalm,
  Ship,
  Church
} from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";

// Next City Components
interface NextCityToastProps {
  show: boolean;
}

const NextCityToast: React.FC<NextCityToastProps> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 right-16 z-50 bg-rose-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
      >
        <span className="text-sm font-medium whitespace-nowrap">Go to the next city</span>
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="ml-2"
        >
          →
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface NextCityButtonProps {
  nextCityPath: string;
}

const NextCityButton: React.FC<NextCityButtonProps> = ({ nextCityPath }) => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <NextCityToast show={showToast} />
      <button
        onClick={() => navigate(nextCityPath)}
        onMouseEnter={() => setShowToast(true)}
        onMouseLeave={() => setShowToast(false)}
        className="fixed top-4 right-4 z-50 bg-rose-800 text-white p-3 rounded-full shadow-lg hover:bg-rose-700 transition-all group"
      >
        <div className="relative flex items-center justify-center">
          <ArrowRight className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </button>
    </>
  );
};

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
  icon: React.ReactNode;
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

// EventCard component remains the same as before...
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
              <h3 className="font-semibold text-lg text-[#1e3a8a] dark:text-[#60A5FA]">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-[#1e3a8a] dark:text-[#60A5FA]" />
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
const CityButton: React.FC<{ 
  city: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
}> = ({ city, icon, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="w-full aspect-square"
  >
    <button 
      onClick={onClick}
      className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="text-[#60A5FA]">{icon}</span>
      <span className="text-[#1e3a8a] dark:text-[#60A5FA] font-medium text-sm">{city}</span>
    </button>
  </motion.div>
);

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const scrollToRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#1e3a8a');
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
    };
  }, []);

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
    { name: 'Mola di Bari', path: '/cities/mola-di-bari', icon: <Building2 size={32} /> },
    { name: 'Polignano a Mare', path: '/cities/polignano-a-mare', icon: <TreePalm size={32} /> },
    { name: 'Monopoli', path: '/cities/monopoli', icon: <Ship size={32} /> },
    { name: 'Bari', path: '/cities/bari', icon: <Church size={32} /> }
  ];

  return (
    <div 
      className="giftCardSection overflow-y-auto pb-24" 
      style={{
        height: 'calc(100vh - 88px)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        position: 'relative',
        zIndex: 1
      }}
    >
      <style>{`
        .shimmer-button {
          position: relative;
          overflow: hidden;
        }
        .shimmer-button::after {
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

      <div 
        className="bg-[#1e3a8a] dark:bg-gray-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
        style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          marginBottom: '2rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto px-4"
        >
          <h1 className="text-3xl font-bold mb-4">
            Explore Puglia
          </h1>
          <p className="text-gray-200 text-lg mb-8">
            Discover magnificent cultural cities and unforgettable events in the surroundings.
          </p>
          <Button 
            onClick={() => scrollToRef.current?.scrollIntoView({ behavior: 'smooth' })}
            variant="outline" 
            className="shimmer-button bg-transparent border-white text-white hover:bg-white hover:text-[#1e3a8a] transition-colors"
          >
            Go to Cities
          </Button>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-8">
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
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section ref={scrollToRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] mb-6 text-center"
          >
            Cities
          </motion.h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
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
        </section>
      </div>
    </div>
  );
};

export default Explore;
