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
const SwipeTutorial: React.FC = () => {
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
            <span className="text-lg font-medium">Swipe to navigate</span>
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

const NextCityToast: React.FC<NextCityToastProps> = ({ show }) => (
  <>
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 right-16 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
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
  </>
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
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all group"
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
                            <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400">
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
                                <Calendar className="w-4 h-4 mr-1 text-blue-700 dark:text-blue-400" />
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
          <span className="text-blue-700 dark:text-blue-400 font-medium text-sm">{attraction.name}</span>
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
                {attraction.description || "Coming soon..."}
              </DialogDescription>
              {attraction.mapUrl && (
                <div className="mt-4">
                  <Button 
                    asChild
                    className="bg-[#3662e1] hover:bg-[#3662e1]/90 text-white"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PoliganoAMare: React.FC = () => {
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
          name: 'Centro Storico',
          icon: '🏛️',
          description: "The historic center of Polignano a Mare is a charming medieval area characterized by whitewashed houses perched on cliffs overlooking the Adriatic Sea. Visitors can enter through the Arco Marchesale, also known as Porta Grande, which once served as the fortified town’s main entrance. Within the old town, narrow streets lead to picturesque squares such as Piazza Vittorio Emanuele II, home to the historic Palazzo dell’Orologio. The Chiesa Matrice, dedicated to Santa Maria Assunta, is also located here. The historic center offers stunning views of the sea from its terraces and balconies, providing a unique blend of history and natural beauty. Exploring the historic center of Polignano a Mare allows visitors to immerse themselves in the town’s rich history and enjoy its breathtaking coastal scenery.",
          imageUrl: 'https://static2-viaggi.corriereobjects.it/wp-content/uploads/2023/03/Poesie-sui-muri-Polignano-Dario-Raffaele.jpg.webp?v=1679989076',
          mapUrl: 'https://maps.app.goo.gl/TgfLH9qZBXUZePGB8'
      },
    {
      name: 'Lama Monachile',
      icon: '🏖️',
      description: "Lama Monachile, also known as Cala Porto, is a picturesque beach in Polignano a Mare, renowned for its stunning location between high cliffs and crystal-clear waters. The beach is situated within a natural inlet formed by an ancient riverbed, characteristic of Puglia’s karst landscape. Access to the beach is via the historic Roman bridge, which offers panoramic views of the cove and the surrounding cliffs. The pebble beach is a popular spot for both locals and tourists, providing a unique setting for swimming and sunbathing. The transparent waters and dramatic cliffs make it one of the most photographed locations along the Bari coast. Lama Monachile is not only a natural attraction but also a cultural landmark, hosting events such as the Red Bull Cliff Diving World Series, where divers plunge from the cliffs into the Adriatic Sea. Visitors to Polignano a Mare often consider Lama Monachile a must-see destination, offering a blend of natural beauty and historical significance that captures the essence of this coastal town.",
        imageUrl: 'https://www.photohound.co/images/1031855m.jpg',
      mapUrl: 'https://maps.app.goo.gl/5QJvHwJzqXJ4mhEC8'
    },
    {
      name: 'Statua di Domenico Modugno',
      icon: '🎭',
      description: "The Statue of Domenico Modugno in Polignano a Mare honors the renowned Italian singer-songwriter, famous for “Nel blu dipinto di blu” (“Volare”). Born in Polignano a Mare in 1928, Modugno’s legacy is immortalized through this bronze statue, unveiled on May 31, 2009. Standing approximately 3 meters tall, the sculpture was crafted by Argentine artist Hermann Mejer. It depicts Modugno with outstretched arms, symbolizing an embrace of his hometown.",
        imageUrl: 'https://www.adb.puglia.it/wp-content/uploads/2022/08/106180_statua_di_domenico_modugno_polignano_a_mare.jpeg',
      mapUrl: 'https://maps.app.goo.gl/C2bCiC5T93B2rYra7'
    },
      {
          name: 'Ponte Borbonico',
          icon: '🌉',
          description: "The Ponte Borbonico di Lama Monachile, also known as the Bourbon Bridge, is a historic landmark in Polignano a Mare, Italy. Constructed in the early 19th century during the reign of King Ferdinand II of Bourbon, the bridge was part of a new route connecting Bari to Lecce. Spanning a deep ravine, the bridge stands approximately 15 meters high and offers panoramic views of the Adriatic Sea and the town’s whitewashed buildings. Below the bridge lies Lama Monachile, one of Puglia’s most beautiful beaches, accessible via a staircase that leads down to the cove. Today, the Ponte Borbonico is a popular spot for visitors, especially at sunset, providing a picturesque setting for photographs and a glimpse into the region’s rich history.",
          imageUrl: 'https://www.polignanoamare.eu/files/foto-due-ponti.webp',
          mapUrl: 'https://maps.app.goo.gl/P77TokjpLxgxeGR49'
      },
    {
      name: 'Cala Paura',
      icon: '⛱️',
      description: "Cala Paura is a charming pebble beach located in Polignano a Mare, Italy. Nestled between rocky cliffs, it offers clear, calm waters ideal for swimming and snorkeling. The beach is surrounded by picturesque white and beige sands, stretching approximately 150 meters. Visitors can enjoy amenities such as sun loungers and umbrellas, with lifeguards on duty during peak season. The area is also known for its submerged grottoes, providing opportunities for exploration. Cala Paura’s proximity to the town center makes it a convenient spot for both locals and tourists seeking relaxation by the sea. The beach’s natural beauty and tranquil atmosphere contribute to its popularity as a must-visit destination in Puglia.",
        imageUrl: 'https://www.secretsand.com/wp-content/uploads/2020/05/cala-paura.jpg',
      mapUrl: 'https://maps.app.goo.gl/vm2ZHjvkVnCgUoRw6'
    },
    {
      name: 'Abbazia San Vito',
      icon: '⛪',
      description: "The Abbey of San Vito, located approximately two kilometers from Polignano a Mare, Italy, is a historic Benedictine monastery established in the 10th century. Situated along the Adriatic coast, the abbey is renowned for its picturesque setting adjacent to a small fishing village. Architecturally, the abbey showcases a blend of Baroque and Romanesque styles. The main façade features a portico leading to a 17th-century staircase and panoramic loggia, while the church itself, built on the remnants of an ancient Roman tower, presents a Romanesque design with three naves. The transept is crowned by a small circular dome, and the interior houses a triptych depicting Saints Vito, Modesto, and Crescenza. Although the abbey remains privately owned and is not regularly open to the public, visitors can admire its exterior and the surrounding landscape. The adjacent beach, Cala San Vito, is accessible via a walkway and offers a serene spot for relaxation. The Abbey of San Vito stands as a testament to the region’s rich history and architectural heritage, making it a noteworthy site for those exploring the Apulian coastline.",
        imageUrl: 'https://www.associazionedongiacomotantardini.it/wp-content/uploads/2018/06/san-vito-polignano-1.jpg',
      mapUrl: 'https://maps.app.goo.gl/DmpFqRAUxAGUY1XD6'
    },
    {
        name: "Piazza dell'Orologio",
        icon: '🕰️',
        description: "Piazza dell’Orologio, officially known as Piazza Vittorio Emanuele II, is a central square in Polignano a Mare, Italy. Dominated by the historic Palazzo dell’Orologio, the square is a hub of local life, featuring various bars and artisan shops. Its strategic location makes it an ideal starting point for exploring the town’s picturesque alleys and experiencing its authentic atmosphere.",
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/27/12_Piazza_Vittorio_Emanuele_II%2C_o_Piazza_dell’Orologio_%28Polignano_a_Mare%29.jpg',
        mapUrl: 'https://maps.app.goo.gl/Cpi7BtbnWktNW5eRA'
    },
      {
          name: 'Chiesa Madre',
          icon: '🏺',
          description: "The Chiesa Matrice di Santa Maria Assunta, located in Piazza Vittorio Emanuele II in Polignano a Mare, Italy, is a historic church consecrated in 1295. It is believed to have been built on the remains of a pagan temple. The church features a blend of architectural styles, with the base of its bell tower dating back to the 1500s, completed in later periods. Inside, the church houses significant artworks, including a nativity scene by Stefano da Putignano. Serving as a central place of worship, the Chiesa Matrice di Santa Maria Assunta stands as a testament to Polignano a Mare’s rich religious and cultural heritage.",
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Polignano_a_Mare_-_Chiesa_matrice_di_Santa_Maria_Assunta_-_2023-09-29_17-14-45_001.JPG',
          mapUrl: 'https://maps.app.goo.gl/41Vgf8S7FvH4qeYn8'
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
      // Prima impostiamo il filtro per 0km
      await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/index.php?md=Gateway&az=setDintorni&val=0')}`);
      
      // Aspettiamo un momento per assicurarci che il filtro sia applicato
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Poi prendiamo i risultati filtrati
      const response = await fetch(`/api/proxy?url=${encodeURIComponent('https://iltaccodibacco.it/polignano-a-mare/')}`);
      
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
        const location = $(element).find('.evento-data a').text().trim() || 'Polignano a Mare';
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
                    city: 'Polignano a Mare',
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
    const intervalId = setInterval(fetchEvents, 10 * 60 * 1000);
    
    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto' });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeColor.setAttribute('content', isDarkMode ? '#3662e1' : '#3662e1');
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

      <button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
      >
        <ArrowLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </button>

      <NextCityButton nextCityPath="/cities/monopoli" />

      <div
        className="bg-blue-600 dark:bg-blue-900 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
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
            Polignano a Mare
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            A breathtaking seaside town in southern Italy, famous for its dramatic cliffs, crystal-clear waters, and charming historic center. Known as the "Pearl of the Adriatic," it's a must-visit destination for stunning views and authentic Italian experiences.
          </p>
            <Button
                onClick={handleExploreClick}
                variant="outline"
                className="shimmer bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
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
            className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6"
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
            className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 text-center"
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

export default PoliganoAMare;
