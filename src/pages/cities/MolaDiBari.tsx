import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Landmark
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
const SwipeTutorial: React.FC = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center"
      style={{ margin: '-24px' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-center px-4"
      >
        <motion.div
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            times: [0, 0.2, 0.8, 1],
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <ChevronLeft size={24} />
            <span className="text-lg font-medium">{t('cities.swipeToNavigate')}</span>
            <ChevronRight size={24} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Next City Components
interface NextCityToastProps {
  show: boolean;
}

const NextCityToast: React.FC<NextCityToastProps> = ({ show }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 right-16 z-50 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
        >
          <span className="text-sm font-medium whitespace-nowrap">{t('cities.goToNextCity')}</span>
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
};

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
    const { t } = useTranslation();
    let color = "bg-green-500";
    let text = t('common.today');

    if (type === 'tomorrow') {
        color = "bg-orange-500";
        text = t('common.tomorrow');
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
  const { t, i18n } = useTranslation();
  const formattedDate = event.startDate ? new Intl.DateTimeFormat(i18n.language === 'it' ? 'it-IT' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(event.startDate) : t('common.notAvailable');

  const isCurrentEvent = () => {
    if (!event.startDate) return null;

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all duration-200">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold">{formattedDate}</span>
            </div>
            {currentEventType && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentEventType === 'today' ? 'bg-green-500' : 'bg-orange-500'}`}>
                {/* Live ping effect */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-white text-xs font-bold">
                  {currentEventType === 'today' ? t('common.today') : t('common.tomorrow')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
            <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
            </div>
            <span className="text-sm">{event.city}</span>
          </div>
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-600 font-medium"
            >
              {t('common.moreInfo')}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AttractionButton: React.FC<{
  attraction: Attraction;
  attractions: Attraction[];
  onOpen: (index: number) => void;
  index: number;
}> = ({ attraction, attractions, onOpen, index }) => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="w-full"
        >
          <button
            onClick={() => onOpen(index)}
            className="group w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-lg">{attraction.icon}</span>
                </div>
                <span className="text-white font-semibold text-sm truncate">{attraction.name}</span>
              </div>
            </div>
            {/* Card Body */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 text-xs">{t('cities.tapToExplore')}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-teal-500 transition-colors" />
            </div>
          </button>
        </motion.div>
      </DialogTrigger>
    </Dialog>
  );
};

const AttractionModal: React.FC<{
  attraction: Attraction;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ attraction, isOpen, onClose, onPrevious, onNext }) => {
  const { t } = useTranslation();
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
        <div className="relative">
          {showTutorial && <SwipeTutorial />}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
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
                {attraction.description || t('cities.comingSoon')}
              </DialogDescription>
              {attraction.mapUrl && (
                <div className="mt-4">
                  <Button
                    asChild
                    className="bg-[#0d9488] hover:bg-[#0d9488]/90 text-white"
                  >
                    <a href={attraction.mapUrl} target="_blank" rel="noopener noreferrer">
                      {t('cities.viewOnMap')}
                    </a>
                  </Button>
                </div>
              )}
              {attraction.bookingNumber && (
                <div className="mt-2">
                  <Button asChild variant="outline">
                    <a href={`tel:${attraction.bookingNumber}`}>
                      {t('cities.callToBook')}: {attraction.bookingNumber}
                    </a>
                  </Button>
                </div>
              )}
              {attraction.eventsUrl && (
                <div className="mt-2">
                  <Button asChild variant="secondary">
                    <a href={attraction.eventsUrl} target="_blank" rel="noopener noreferrer">
                      {t('cities.viewEvents')}
                    </a>
                  </Button>
                </div>
              )}
            </DialogHeader>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MolaDiBari: React.FC = () => {
  const { t } = useTranslation();
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
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
      ref={mainRef}
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

      <button
        onClick={() => navigate('/explore')}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
      >
        <ArrowLeft className="h-6 w-6 text-teal-600 dark:text-teal-400" />
      </button>

      <NextCityButton nextCityPath="/cities/polignano-a-mare" />

      {/* Modern Hero Section */}
      <div
        className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-hidden"
        style={{ marginBottom: '1.5rem' }}
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/09/09/12/photo1jpg.jpg?w=1200&h=-1&s=1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-800/70 to-emerald-900/80" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center max-w-3xl mx-auto px-5 py-12 pt-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Compass className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Coastal Gem of Puglia</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Mola di Bari
          </h1>
          <p className="text-white/80 text-base mb-6">
            A charming coastal town known for its picturesque seafront, fresh seafood, and vibrant local culture.
          </p>
          <button
            onClick={handleExploreClick}
            className="shimmer-button inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
          >
            <Landmark className="h-5 w-5" />
            {t('cities.exploreAttractions')}
          </button>
        </motion.div>
      </div>

      <div className="px-5 pb-8">
        {/* Events Section */}
        <section className="mb-8">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('cities.upcomingEvents')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('cities.eventsInCity', { count: events.length, city: 'Mola di Bari' })}</p>
            </div>
          </div>

          {loading && <p className="text-gray-600 dark:text-gray-400 mb-4">{t('explore.loadingEvents')}</p>}
          {error && <p className="text-red-600 mb-4">{t('common.error')}: {error}</p>}
          {!loading && !error && events.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('cities.noEvents')}</p>
          )}
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Attractions Section */}
        <section ref={scrollToRef} className="mb-8">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('cities.exploreTheCity')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('cities.discoverAttractions')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {attractions.map((attraction, index) => (
              <AttractionButton
                key={attraction.name}
                attraction={attraction}
                attractions={attractions}
                onOpen={(idx) => setSelectedAttractionIndex(idx)}
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

