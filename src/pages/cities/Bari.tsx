import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
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
import * as cheerio from 'cheerio';


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
  description?: string;
    link?: string;
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
  const formattedDate = event.startDate ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate) : 'Data non disponibile';

  const isCurrentEvent = () => {
        if(!event.startDate) return false
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
              <h3 className="font-semibold text-lg text-rose-800 dark:text-rose-400">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{event.city}</span>
              </div>
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 mt-1 block">
                  More info
                </a>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-rose-800 dark:text-rose-400" />
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
          <span className="text-center text-sm font-medium text-rose-800 dark:text-rose-400">
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

const Bari: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/proxy?url=https://iltaccodibacco.it/bari/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            const extractedEvents: Event[] = [];

           $('.evento-featured').each((_, element) => {
              const titleElement = $(element).find('.titolo.blocco-locali h2 a');
              const title = titleElement.text().trim();
              const link = titleElement.attr('href') || undefined;
               const dateText = $(element).find('.testa').text().trim();
               const location = $(element).find('.evento-data a').text().trim() || 'Bari'; // fallback
                 const description = $(element).find('.evento-corpo').text().trim();

         const dateMatch = dateText.match(/dal\s*(\d{1,2})\s*al\s*(\d{1,2})\s*(\w+)\s*(\d{4})?/) ||
                                  dateText.match(/(\w+)\s*(\d{1,2})\s*(\w+)\s*(\d{4})?/);


           let startDate: Date | undefined;
          if (dateMatch) {
             let dayStart: number;
            let monthStart: string;
            let year = new Date().getFullYear();


            if (dateMatch[1] && dateMatch[2]) { // Gestisci date del tipo: dal gg al gg mese
                dayStart = parseInt(dateMatch[1], 10);
                monthStart = dateMatch[3];
                if(dateMatch[4]){
                  year=parseInt(dateMatch[4],10)
                }

              }
            else {
              dayStart=parseInt(dateMatch[2],10)
              monthStart= dateMatch[3];

              if (dateMatch[4]) {
                year = parseInt(dateMatch[4], 10);

               }
            }
              const month = new Date(`${monthStart} 1, 2024`).getMonth();
            startDate = new Date(year, month, dayStart);

          }
           
            const eventData = {
            title,
            link,
            dateText,
            location,
            description,
             startDate,
          };

           if (title && startDate) {
             extractedEvents.push({
                    id: Date.now().toString() + Math.random().toString(),
                  title,
                  startDate,
                    city: 'Bari',
                 description,
                   link
              });
          }
               
            });


            extractedEvents.sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime());


      // Get the next 4 events
      const now = new Date();
      const futureEvents = extractedEvents.filter(event => event.startDate! >= now).slice(0, 4)
           setEvents(futureEvents);


        } catch (err) {
           if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
        } finally {
            setLoading(false);
        }
    };


  useEffect(() => {
    fetchEvents();

    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000); //ogni 10 minuti

    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeColor.setAttribute('content', isDarkMode ? '#9f1239' : '#9f1239');
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
      clearInterval(intervalId)
    };
  }, [location]);

  const handleBackClick = () => {
    navigate('/explore');
  };

  const attractions: Attraction[] = [
    { name: 'Basilica San Nicola', icon: '⛪' },
    { name: 'Città Vecchia', icon: '🏛️' },
    { name: 'Lungomare', icon: '🌊' },
    { name: 'Cattedrale San Sabino', icon: '🕍' },
    { name: 'Teatro Petruzzelli', icon: '🎭' },
    { name: 'Piazza Ferrarese', icon: '🏛️' },
    { name: 'Strada delle Orecchiette', icon: '🍝' },
    { name: 'Castello Svevo', icon: '🏰' },
    { name: 'Succorpo della Cattedrale', icon: '⛪' },
    { name: 'Porto Vecchio', icon: '⚓' },
    { name: 'Palazzo Mincuzzi', icon: '🏛️' },
    { name: 'Pinacoteca C. Giaquinto', icon: '🎨' }
  ];

  const scrollToRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      ref={mainRef}
    >
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
            transparent 40%,
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
        <ArrowLeft className="h-6 w-6 text-rose-800 dark:text-rose-400" />
      </button>

      {/* Next City Button */}
      <NextCityButton nextCityPath="/cities/mola-di-bari" />

      {/* Hero Section */}
      <div
        className="bg-rose-800 dark:bg-rose-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
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
          className="text-center max-w-3xl mx-auto px-4 pt-8"
        >
          <h1 className="text-3xl font-bold mb-4">
            Bari
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            A vibrant city in southern Italy, blending historic charm with modern energy. Known for its stunning old town, beautiful seafront, and delicious cuisine, it offers an unforgettable mix of culture, history, and coastal beauty.
          </p>
          <Button
            onClick={handleExploreClick}
            variant="outline"
            className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-rose-800 transition-colors"
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
            className="text-2xl font-bold text-rose-800 dark:text-rose-400 mb-6"
          >
            Upcoming Events
          </motion.h2>
          {loading && <p>Loading events...</p>}
          {error && <p>Error: {error}</p>}
          
           
          
          <div className="grid gap-4">
           {console.log("Rendering events:", events)}
            {events.map((event) => (
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
            className="text-2xl font-bold text-rose-800 dark:text-rose-400 mb-6 text-center"
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

export default Bari;
