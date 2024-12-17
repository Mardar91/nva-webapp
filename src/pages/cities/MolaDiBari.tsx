import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight
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

// Tutorial component for swipe gestures
const SwipeTutorial: React.FC = () => (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ 
        duration: 2,
        times: [0, 0.2, 0.8, 1],
      }}
      className="text-white text-center"
    >
      <div className="flex items-center justify-center gap-4">
        <ChevronLeft size={24} />
        <span>Swipe to navigate attractions</span>
        <ChevronRight size={24} />
      </div>
    </motion.div>
  </div>
);

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
  imageUrl?: string;
  mapUrl?: string;
  bookingNumber?: string;
  eventsUrl?: string;
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

const AttractionButton: React.FC<{ 
  attraction: Attraction;
  attractions: Attraction[];
  onOpen: (index: number) => void;
  index: number;
}> = ({ attraction, attractions, onOpen, index }) => (
  <Dialog>
    <DialogTrigger>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full aspect-square"
      >
        <button 
          onClick={() => onOpen(index)}
          className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-[#60A5FA]">{attraction.icon}</span>
          <span className="text-teal-700 dark:text-teal-400 font-medium text-sm">{attraction.name}</span>
        </button>
      </motion.div>
    </DialogTrigger>
  </Dialog>
);

const AttractionModal: React.FC<{
  attraction: Attraction;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ attraction, isOpen, onClose, onPrevious, onNext }) => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [dragStart, setDragStart] = useState<number>(0);
  const dragThreshold = 50;

  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if ('touches' in event) {
      setDragStart(event.touches[0].clientX);
    } else {
      setDragStart(event.clientX);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.x;
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        onPrevious();
      } else {
        onNext();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="relative"
        >
          {showTutorial && <SwipeTutorial />}
          <DialogHeader>
            <DialogTitle>{attraction.name}</DialogTitle>
            {attraction.imageUrl && (
              <img
                src={attraction.imageUrl}
                alt={attraction.name}
                className="w-full h-auto rounded-md mb-4"
              />
            )}
            <DialogDescription>
              {attraction.description || "Coming soon..."}
            </DialogDescription>
            {attraction.mapUrl && (
              <div className="mt-4">
                <Button 
                  asChild
                  className="bg-[#0d9488] hover:bg-[#0d9488]/90 text-white"
                >
                  <a href={attraction.mapUrl} target="_blank" rel="noopener noreferrer">
                    View on Map
                  </a>
                </Button>
              </div>
            )}
            {attraction.bookingNumber && (
              <div className="mt-2">
                <Button asChild variant="outline">
                  <a href={`tel:${attraction.bookingNumber}`}>
                    Call to Book: {attraction.bookingNumber}
                  </a>
                </Button>
              </div>
            )}
            {attraction.eventsUrl && (
              <div className="mt-2">
                <Button asChild variant="secondary">
                  <a href={attraction.eventsUrl} target="_blank" rel="noopener noreferrer">
                    View Events
                  </a>
                </Button>
              </div>
            )}
          </DialogHeader>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
const MolaDiBari: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttractionIndex, setSelectedAttractionIndex] = useState<number | null>(null);
  const scrollToRef = useRef<HTMLDivElement>(null);

  const attractions: Attraction[] = [
    {
      name: 'Lungomare',
      icon: '🌅',
      description: "The promenade of Mola di Bari is a vibrant coastal gem that showcases the town's maritime culture. Overlooking the Adriatic Sea, it offers picturesque views, lively pedestrian areas, and proximity to the historic Angioino-Aragonese Castle. Known for its charming combination of modern amenities and traditional character, the seafront is lined with restaurants, cafés, and spaces for leisure. It's a great spot to enjoy the fresh catch of the day or relax amidst stunning sea breezes while soaking in Mola's timeless charm",
      imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/09/09/12/photo1jpg.jpg?w=700&h=-1&s=1',
      mapUrl: 'https://maps.app.goo.gl/ggfSTa9DQGa5zsZb7'
    },
    {
      name: 'Chiesa Matrice',
      icon: '⛪',
      description: "The Chiesa Matrice in Mola di Bari is a stunning Renaissance church, noted for its architectural beauty and historical significance. Originally constructed between 1545 and 1564 by masters of Levantine origin, the church combines elegance with historical charm. Its main façade features three levels adorned with detailed elements, while the lateral façade boasts lesenes and an architraved portal. Inside, three naves divided by columns and arches create an atmosphere of grandeur, complemented by exquisite Renaissance sculptures and paintings, including a statue of St. Michael by Stefano da Putignano.",
      imageUrl: 'https://www.barinedita.it/public/foto_news_upload/chiesa%20matrice%20san%20nicola%20mola%20di%20bari.jpg',
      mapUrl: 'https://maps.app.goo.gl/5Vru9zj6nWKqLrNY8'
    },
    {
      name: 'Castello Angioino',
      icon: '🏰',
      description: "The Angevin Castle in Mola di Bari is a historic fortress built between 1277 and 1279 by order of Charles I of Anjou. Designed by royal carpenters Pierre d'Angicourt and Jean from Toul, the castle was constructed to defend the coast against pirate incursions. In the early 16th century, following significant damage during the Venetian siege of 1508, the castle underwent a major restoration led by architect Evangelista Menga. This renovation introduced the current star-shaped polygonal layout, enhancing its defensive capabilities.",
      imageUrl: 'https://www.divento.com/23351/castello-mola-di-bari-puglia.jpg',
      mapUrl: 'https://maps.app.goo.gl/CFdnaj3e5w4Q8XSG6',
      bookingNumber: '+390804738227'
    },
    {
      name: 'Piazza XX Settembre',
      icon: '⛲',
      description: "Piazza XX Settembre is the vibrant heart of Mola di Bari, serving as a central hub for social and cultural activities. The square is renowned for its Monumental Fountain, a significant landmark that adds to its charm. Recently renovated, the piazza has become a popular gathering spot for both locals and visitors.",
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Mola_di_Bari_-_piazza_XX_Settembre.jpg',
      mapUrl: 'https://maps.app.goo.gl/rrtq8izWn3VYSwMR8'
    },
    {
      name: 'Chiesa Maddalena',
      icon: '🕍',
      description: "The Chiesa di Santa Maria Maddalena, located in Mola di Bari's Piazza XX Settembre, is a significant religious and cultural landmark. This church serves as the main place of worship for the local community, hosting various religious events and ceremonies throughout the year.",
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mola_di_Bari_-_chiesa_della_Maddalena_-_202209111340.jpg/800px-Mola_di_Bari_-_chiesa_della_Maddalena_-_202209111340.jpg',
      mapUrl: 'https://maps.app.goo.gl/79Vf8FFu3Cqg9XKL8'
    },
    {
      name: 'Palazzo Roberti',
      icon: '🏛️',
      description: "Palazzo Roberti, also known as Palazzo Roberti-Alberotanza, is a prominent example of Neapolitan Baroque architecture in Mola di Bari. Constructed between 1760 and 1770 by Giambattista Roberti, the palace features a symmetrical façade and an impressive courtyard with a double-ramp staircase.",
      imageUrl: 'https://i0.wp.com/www.puglialive.net/wp-content/uploads/2023/12/2-5.jpg?resize=500%2C333&ssl=1',
      mapUrl: 'https://maps.app.goo.gl/iXLZ75VVpRjqkiQz5'
    },
    {
      name: 'Teatro Van Westerhout',
      icon: '🎭',
      description: "The Teatro Van Westerhout, located in Mola di Bari, is a historic theater built in 1888. Named after the composer Niccolò van Westerhout, it stands as one of the oldest theaters in Puglia.",
      imageUrl: 'https://www.barinedita.it/public/foto_galleria/2541-teatro%20van%20westerhout%20mola%20(41).jpg',
      mapUrl: 'https://maps.app.goo.gl/RfQCjsWfyZJGcfmy9',
      eventsUrl: 'https://www.baritoday.it/eventi/location/Teatro%20Van%20Westerhout/'
    },
    {
      name: 'Centro Storico',
      icon: '🏘️',
      description: "The historic center of Mola di Bari is a captivating blend of medieval architecture and Adriatic charm. Enclosed by ancient defensive walls and towers, this area features narrow, cobblestone streets and historic squares that reflect the town's rich maritime heritage.",
      imageUrl: 'https://www.barinedita.it/public/foto_galleria/2582-Mola%20di%20Bari%20centro%20storico%20-%202%20(10).jpg',
      mapUrl: 'https://maps.app.goo.gl/1n3yf6sCGdhZxy637'
    }
  ];

const handlePreviousAttraction = () => {
  if (selectedAttractionIndex === null) return;
  setSelectedAttractionIndex((prev) => 
    prev !== null ? (prev === 0 ? attractions.length - 1 : prev - 1) : 0
  );
};

const handleNextAttraction = () => {
  if (selectedAttractionIndex === null) return;
  setSelectedAttractionIndex((prev) => 
    prev !== null ? (prev === attractions.length - 1 ? 0 : prev + 1) : 0
  );
};

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/index.php?md=Gateway&az=setDintorni&val=0')}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/mola-di-bari/')}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
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

            const rangeDateMatch = dateText.match(/dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
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

        const extractedEvents = Array.from(uniqueEvents.values());
        extractedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

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

  const handleExploreClick = () => {
    scrollToRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchEvents();
    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000);
    
    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#0d9488');
    }
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', '#ffffff');
      }
      clearInterval(intervalId);
    };
  }, [location, fetchEvents]);

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

      <button
        onClick={() => navigate('/explore')}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
      >
        <ArrowLeft className="h-6 w-6 text-teal-600 dark:text-teal-400" />
      </button>

      <NextCityButton nextCityPath="/cities/polignano-a-mare" />

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
            {attractions.map((attraction, index) => (
              <AttractionButton
                key={attraction.name}
                attraction={attraction}
                attractions={attractions}
                onOpen={(index) => setSelectedAttractionIndex(index)}
                index={index}
              />
            ))}
          </div>
        </section>
      </div>

      {selectedAttractionIndex !== null && (
        <AttractionModal
          attraction={attractions[selectedAttractionIndex]}
          isOpen={selectedAttractionIndex !== null}
          onClose={() => setSelectedAttractionIndex(null)}
          onPrevious={handlePreviousAttraction}
          onNext={handleNextAttraction}
        />
      )}
    </div>
  );
};

export default MolaDiBari;

