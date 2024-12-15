import React, { useEffect, useRef, useState, useCallback } from "react";
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
        className="fixed top-4 right-16 z-50 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
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
        className="fixed top-4 right-4 z-50 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-all group"
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

const CurrentEventBadge: React.FC<{ type: 'today' | 'tomorrow' }> = ({ type }) => {
    let color = "bg-green-500";
    let text = "Today";

    if (type === 'tomorrow') {
        color = "bg-orange-500";
        text = "Tomorrow";
    }

    return (
        <div className="flex items-center gap-1.5 mt-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`}></span>
            </span>
            <span className="text-xs font-medium" style={{ color: type === 'today' ? '#22c55e' : '#f97316' }}>{text}</span>
        </div>
    );
};


const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const formattedDate = event.startDate ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(event.startDate) : 'Data non disponibile';
   const isCurrentEvent = () => {
        if(!event.startDate) return null;

    const now = new Date();
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const end = event.endDate ? new Date(event.endDate) : new Date(start);
    end.setHours(23, 59, 59, 999);

     const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
     const isToday = now >= start && now <= end;


     const isTomorrow =
      start.getDate() === tomorrow.getDate() &&
      start.getMonth() === tomorrow.getMonth() &&
      start.getFullYear() === tomorrow.getFullYear();

     if (isToday) return 'today';
     if (isTomorrow) return 'tomorrow';
    return null;
  };

  const currentEventType = isCurrentEvent();


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
                {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 mt-1 block">
                    More info
                  </a>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-teal-700 dark:text-teal-400" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              {currentEventType && <CurrentEventBadge type={currentEventType} />}
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
            <span className="text-center text-sm font-medium text-teal-700 dark:text-teal-400">
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

const MolaDiBari: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
    const mainRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        // Prima impostiamo il filtro per 0km
        await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/index.php?md=Gateway&az=setDintorni&val=0')}`);
        
        // Aspettiamo un momento per assicurarci che il filtro sia applicato
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Poi prendiamo i risultati filtrati
        const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/mola-di-bari/')}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Mappa dei mesi italiani
        const monthsIT: { [key: string]: number } = {
            'gennaio': 0, 'febbraio': 1, 'marzo': 2, 'aprile': 3,
            'maggio': 4, 'giugno': 5, 'luglio': 6, 'agosto': 7,
            'settembre': 8, 'ottobre': 9, 'novembre': 10, 'dicembre': 11
        };

        const uniqueEvents = new Map();

        $('.evento-featured').each((_, element) => {
            const titleElement = $(element).find('.titolo.blocco-locali h2 a');
            const title = titleElement.text().trim();
            const link = titleElement.attr('href');
            const dateText = $(element).find('.testa').text().trim();
            const location = $(element).find('.evento-data a').text().trim() || 'Mola di Bari';
            const description = $(element).find('.evento-corpo').text().trim();

            let startDate: Date | undefined;
            let endDate: Date | undefined;

            // Gestione formato "dal 13 al 20 dicembre 2024"
            const rangeDateMatch = dateText.match(/dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
            // Gestione formato "Domenica 15 dicembre 2024"
            const singleDateMatch = dateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);

            if (rangeDateMatch) {
                const startDay = parseInt(rangeDateMatch[1]);
                const endDay = parseInt(rangeDateMatch[2]);
                const monthStr = rangeDateMatch[3].toLowerCase();
                const year = parseInt(rangeDateMatch[4]);
                
                if (monthsIT.hasOwnProperty(monthStr)) {
                    startDate = new Date(year, monthsIT[monthStr], startDay);
                    endDate = new Date(year, monthsIT[monthStr], endDay);
                }
            } else if (singleDateMatch) {
                const day = parseInt(singleDateMatch[1]);
                const monthStr = singleDateMatch[2].toLowerCase();
                const year = parseInt(singleDateMatch[3]);
                
                if (monthsIT.hasOwnProperty(monthStr)) {
                    startDate = new Date(year, monthsIT[monthStr], day);
                }
            }

            if (title && startDate && !isNaN(startDate.getTime())) {
                const eventKey = `${title}-${startDate.getTime()}`;
                if (!uniqueEvents.has(eventKey)) {
                    uniqueEvents.set(eventKey, {
                        id: Date.now().toString() + Math.random().toString(),
                        title,
                        startDate,
                        endDate,
                        city: 'Mola di Bari',
                        description,
                        link
                    });
                }
            }
        });

        // Converti la Map in array e filtra gli eventi
        const extractedEvents = Array.from(uniqueEvents.values());
        extractedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        // Filtra solo gli eventi futuri o in corso
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const futureEvents = extractedEvents.filter(event => {
            const eventEndDate = event.endDate || event.startDate;
            return eventEndDate >= now;
        }).slice(0, 4);

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
}, []);


  useEffect(() => {
      fetchEvents();

    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000); //ogni 10 minuti
    
    window.scrollTo(0, 0);
      mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#0d9488'); // teal-600
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
      clearInterval(intervalId);
    };
  }, [location, fetchEvents]);


  const handleBackClick = () => {
    navigate('/explore');
  };

  const attractions: Attraction[] = [
    { name: 'Lungomare', icon: '🌅' },
    { name: 'Chiesa Matrice', icon: '⛪' },
    { name: 'Castello Angioino', icon: '🏰' },
    { name: 'Piazza XX Settembre', icon: '⛲' },
    { name: 'Chiesa Maddalena', icon: '🕍' },
    { name: 'Palazzo Roberti', icon: '🏛️' },
    { name: 'Teatro Van Westerhout', icon: '🎭' },
    { name: 'Centro Storico', icon: '🏘️' }
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
        <ArrowLeft className="h-6 w-6 text-teal-600 dark:text-teal-400" />
      </button>

      {/* Next City Button */}
      <NextCityButton nextCityPath="/cities/polignano-a-mare" />

      {/* Hero Section */}
      <div
        className="bg-teal-600 dark:bg-teal-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
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
        Upcoming Events ({events.length})
    </motion.h2>
    {loading && <p className="text-gray-600 mb-4">Loading events...</p>}
    {error && <p className="text-red-600 mb-4">Error: {error}</p>}
    {!loading && !error && events.length === 0 && (
        <p className="text-gray-600 mb-4">No upcoming events found</p>
    )}
    <div className="grid gap-4">
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
            className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-6 text-center"
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

export default MolaDiBari;
